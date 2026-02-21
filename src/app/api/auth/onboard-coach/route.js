/**
 * POST /api/auth/onboard-coach
 * Creates a team for the current user (session) so they become a coach. Creator is automatically owner.
 * Body: { name?: string } — team name (defaults to "My Gym").
 */
import { NextResponse } from "next/server";
import { Teams, ID } from "node-appwrite";
import { getSessionClient, getCoachTeamId } from "@/lib/session-teams";

export async function POST(request) {
  const { client, user, memberships } = await getSessionClient(request);

  if (!client || !user?.$id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const existingTeamId = getCoachTeamId(memberships);
  if (existingTeamId) {
    return NextResponse.json({ alreadyOnboarded: true, teamId: existingTeamId }, { status: 200 });
  }

  let body = {};
  try {
    body = await request.json();
  } catch {
    // optional body
  }
  const name = typeof body?.name === "string" && body.name.trim() ? body.name.trim().slice(0, 128) : "My Gym";

  const teams = new Teams(client);
  try {
    const team = await teams.create(ID.unique(), name, ["coach", "client"]);
    return NextResponse.json({ teamId: team.$id, name: team.name }, { status: 201 });
  } catch (err) {
    console.error("onboard-coach teams.create", err?.message ?? err);
    return NextResponse.json(
      { error: err?.message ?? "Failed to create team" },
      { status: 500 }
    );
  }
}
