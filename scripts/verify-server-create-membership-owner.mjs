/**
 * Day-one verification: can the server SDK add a user as "owner" via createMembership?
 * Run: node --env-file=.env.local scripts/verify-server-create-membership-owner.mjs [userId]
 * If this succeeds, the migration script can use createMembership(..., ['owner']).
 * If it throws, migration must use session impersonation (create session per user, then teams.create() with that session).
 */
import { Client, Teams, ID } from "node-appwrite";

const endpoint = process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT?.trim();
const projectId = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim();
const apiKey = process.env.APPWRITE_API_KEY?.trim();
const userId = process.argv[2]?.trim();

if (!endpoint || !projectId || !apiKey) {
  console.error("Missing env: NEXT_PUBLIC_APPWRITE_ENDPOINT, NEXT_PUBLIC_APPWRITE_PROJECT_ID, APPWRITE_API_KEY");
  process.exit(1);
}
if (!userId) {
  console.error("Usage: node --env-file=.env.local scripts/verify-server-create-membership-owner.mjs <userId>");
  console.error("Use an existing coach user ID (e.g. from members.owner_id or Appwrite Console).");
  process.exit(1);
}

const client = new Client().setEndpoint(endpoint).setProject(projectId).setKey(apiKey);
const teams = new Teams(client);

async function main() {
  console.log("Creating team with server SDK...");
  const team = await teams.create(ID.unique(), "Migration verification team");
  console.log("Team created:", team.$id);

  console.log("Adding user as owner via teams.createMembership(teamId, ['owner'], undefined, userId, ...)...");
  try {
    await teams.createMembership(team.$id, ["owner"], undefined, userId, undefined, "http://localhost:3000", "");
    console.log("SUCCESS: Server SDK can assign role 'owner' via createMembership. Migration can use this path.");
  } catch (err) {
    console.error("FAILED:", err?.message ?? err);
    console.error("Migration must use session impersonation: create a session for each coach and call teams.create() with that session so the creator becomes owner.");
    process.exit(1);
  }

  console.log("Cleaning up: deleting test team...");
  await teams.delete(team.$id);
  console.log("Done.");
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
