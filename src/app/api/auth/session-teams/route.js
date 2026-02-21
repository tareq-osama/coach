import { NextResponse } from "next/server";
import { getSessionWithTeams } from "@/lib/session-teams";

/**
 * GET /api/auth/session-teams
 * Returns current user and memberships (with roles) from session cookie.
 * Used by server-side code via getSessionWithTeams(request) directly;
 * this route allows middleware or client to fetch session+teams if needed.
 */
export async function GET(request) {
  try {
    const { user, memberships } = await getSessionWithTeams(request);
    if (!user) {
      return NextResponse.json({ user: null, memberships: [] });
    }
    return NextResponse.json({
      user: {
        $id: user.$id,
        email: user.email,
        name: user.name,
        prefs: user.prefs,
      },
      memberships: memberships.map((m) => ({
        $id: m.$id,
        teamId: m.teamId,
        teamName: m.teamName,
        roles: m.roles ?? [],
        userId: m.userId,
      })),
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Session resolution failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
