/**
 * One-time migration: for each distinct owner_id (user ID) in coach-scoped collections,
 * create a Team, add that user as owner, update all documents' owner_id to the new team ID,
 * and set document-level permissions. Run verify-server-create-membership-owner.mjs first.
 *
 * Run: node --env-file=.env.local scripts/migrate-owner-id-to-teams.mjs [--dry-run]
 */
import { Client, Databases, Teams, ID, Permission, Role } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();
const dbId = (process.env.APPWRITE_GYM_DATABASE_ID || "gym_coach").trim();
const dryRun = process.argv.includes("--dry-run");

const COACH_SCOPED_COLLECTIONS = [
  "members",
  "workout_plans",
  "meal_plans",
  "sessions",
  "meal_logs",
  "progress_photos",
];

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing env. Use: node --env-file=.env.local scripts/migrate-owner-id-to-teams.mjs [--dry-run]");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const databases = new Databases(client);
const teamsApi = new Teams(client);

async function getDistinctOwnerIds() {
  const ownerIds = new Set();
  for (const collId of COACH_SCOPED_COLLECTIONS) {
    try {
      const { documents } = await databases.listDocuments(dbId, collId, ["limit(500)"]);
      for (const doc of documents) {
        const oid = doc.owner_id;
        if (oid && typeof oid === "string") ownerIds.add(oid.trim());
      }
    } catch (e) {
      console.warn("List", collId, e?.message);
    }
  }
  return [...ownerIds];
}

async function migrate() {
  const ownerIds = await getDistinctOwnerIds();
  console.log("Distinct owner_id (user IDs) to migrate:", ownerIds.length, ownerIds);

  for (const userId of ownerIds) {
    if (dryRun) {
      console.log("[dry-run] Would create team and migrate owner_id:", userId);
      continue;
    }

    const teamId = ID.unique();
    const teamName = `Coach ${userId.slice(0, 8)}`;

    try {
      await teamsApi.create(teamId, teamName);
    } catch (e) {
      console.error("Create team for", userId, e?.message);
      continue;
    }

    try {
      await teamsApi.createMembership(
        teamId,
        ["owner"],
        undefined,
        userId,
        undefined,
        "http://localhost:3000",
        ""
      );
    } catch (e) {
      console.error("CreateMembership(owner) for", userId, e?.message);
      await teamsApi.delete(teamId).catch(() => {});
      continue;
    }

    const permissions = [Permission.read(Role.team(teamId)), Permission.update(Role.team(teamId)), Permission.delete(Role.team(teamId))];

    for (const collId of COACH_SCOPED_COLLECTIONS) {
      try {
        const { documents } = await databases.listDocuments(dbId, collId, ["limit(500)"]);
        for (const doc of documents) {
          if (doc.owner_id !== userId) continue;
          await databases.updateDocument(dbId, collId, doc.$id, { owner_id: teamId }, permissions);
        }
      } catch (e) {
        console.warn("Update", collId, "for", userId, e?.message);
      }
    }

    console.log("Migrated", userId, "-> team", teamId);
  }

  console.log("Migration done. Do NOT remove collection-level read(\"any\") until you have verified all documents have document permissions.");
}

migrate().catch((e) => {
  console.error(e);
  process.exit(1);
});
