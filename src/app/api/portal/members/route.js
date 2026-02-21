/**
 * GET /api/portal/members
 * Returns member document(s) for the current user (portal client).
 * User must have role "client" in at least one team; we query members by
 * owner_id in those teams and user_id = current user.
 */
import { NextResponse } from "next/server";
import { Query } from "node-appwrite";
import { serverDatabases } from "@/lib/appwrite-server";
import { getSessionWithTeams, getClientTeamIds } from "@/lib/session-teams";

const DB_ID = (process.env.APPWRITE_GYM_DATABASE_ID ?? "gym_coach").trim();
const COLLECTION_ID = "members";

export async function GET(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  try {
    const { user, memberships } = await getSessionWithTeams(request);
    if (!user?.$id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }
    const teamIds = getClientTeamIds(memberships);
    if (teamIds.length === 0) {
      return NextResponse.json({ members: [] });
    }

    const userId = user.$id;
    const queries = [
      Query.equal("user_id", userId),
      Query.limit(50),
    ];
    const allDocs = [];
    for (const teamId of teamIds) {
      const { documents } = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("owner_id", teamId),
        Query.equal("user_id", userId),
        Query.limit(50),
      ]);
      allDocs.push(...documents);
    }
    const members = allDocs;

    return NextResponse.json({ members });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list portal members", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
