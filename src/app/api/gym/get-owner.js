/**
 * Resolve the current coach (owner) ID from the request for DB scope.
 * owner_id is the coach's team ID (from session + team memberships with owner/coach role).
 * @param {Request} request
 * @returns {Promise<string|null>} team ID or null
 */
import { getSessionWithTeams, getCoachTeamId } from "@/lib/session-teams";

export async function getOwnerIdFromRequest(request) {
  const { memberships } = await getSessionWithTeams(request);
  return getCoachTeamId(memberships);
}
