/**
 * Server-side session and team membership resolution.
 * Use account.get() + users.listMemberships(userId) so we get memberships with roles.
 * Do not import in Client Components.
 */
import { cache } from "react";
import { Client, Account } from "node-appwrite";
import { serverUsers } from "@/lib/appwrite-server";

const PROJECT_ID = String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "").trim();
const SESSION_COOKIE_NAME = `a_session_${PROJECT_ID}`;

/**
 * Get cookies from request (Route Handler) or from next/headers cookies() (Server Component).
 * @param {Request | { get: (name: string) => { value?: string } | undefined }} requestOrCookies - Request or cookies() return value
 * @returns {{ value?: string } | undefined}
 */
function getSessionCookie(requestOrCookies) {
  const cookies = typeof requestOrCookies?.cookies?.get === "function"
    ? requestOrCookies.cookies
    : requestOrCookies;
  return cookies?.get?.(SESSION_COOKIE_NAME);
}

/**
 * Build a session-authenticated Appwrite client for the request (for Teams, etc.).
 * Use when a route needs to perform actions as the logged-in user (e.g. teams.create).
 * @param {Request | { get: (name: string) => { value?: string } | undefined }} requestOrCookies
 * @returns {Promise<{ client: import("node-appwrite").Client, user: import("node-appwrite").Models.User, memberships: import("node-appwrite").Models.Membership[] } | { client: null, user: null, memberships: [] }>}
 */
export async function getSessionClient(requestOrCookies) {
  const cookie = getSessionCookie(requestOrCookies);
  const sessionValue = cookie?.value?.trim();
  if (!sessionValue) {
    return { client: null, user: null, memberships: [] };
  }

  const client = new Client()
    .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "").trim())
    .setProject(PROJECT_ID)
    .setSession(sessionValue);

  const account = new Account(client);
  let user;
  try {
    user = await account.get();
  } catch {
    return { client: null, user: null, memberships: [] };
  }
  if (!user?.$id) {
    return { client: null, user: null, memberships: [] };
  }

  let memberships = [];
  try {
    const list = await serverUsers.listMemberships(user.$id);
    memberships = list?.memberships ?? [];
  } catch {
    // ignore
  }

  return { client, user, memberships };
}

/**
 * Returns { user, memberships } for the current request. Uses account.get() with session cookie
 * and serverUsers.listMemberships(userId) to get memberships with roles (teamId, roles, etc.).
 * Wrapped in React cache() so layout + nested Server Components dedupe within one request.
 * @param {Request | { get: (name: string) => { value?: string } | undefined }} requestOrCookies
 * @returns {Promise<{ user: import("node-appwrite").Models.User | null, memberships: import("node-appwrite").Models.Membership[] }>}
 */
export const getSessionWithTeams = cache(async (requestOrCookies) => {
  const cookie = getSessionCookie(requestOrCookies);
  const sessionValue = cookie?.value?.trim();
  if (!sessionValue) {
    return { user: null, memberships: [] };
  }

  const client = new Client()
    .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "").trim())
    .setProject(PROJECT_ID)
    .setSession(sessionValue);

  const account = new Account(client);

  let user;
  try {
    user = await account.get();
  } catch {
    return { user: null, memberships: [] };
  }

  if (!user?.$id) {
    return { user: null, memberships: [] };
  }

  let memberships = [];
  try {
    const list = await serverUsers.listMemberships(user.$id);
    memberships = list?.memberships ?? [];
  } catch {
    // User exists but listMemberships failed (e.g. no API key or permission)
  }

  return { user, memberships };
});

/**
 * Get the first team ID where the user has owner or coach role (for coach app owner_id).
 * @param {import("node-appwrite").Models.Membership[]} memberships
 * @returns {string | null}
 */
export function getCoachTeamId(memberships) {
  if (!Array.isArray(memberships)) return null;
  const m = memberships.find(
    (mem) => mem.roles && (mem.roles.includes("owner") || mem.roles.includes("coach"))
  );
  return m?.teamId ?? null;
}

/**
 * Check if user has role "client" in any team (for portal access).
 * @param {import("node-appwrite").Models.Membership[]} memberships
 * @returns {boolean}
 */
export function hasClientRole(memberships) {
  if (!Array.isArray(memberships)) return false;
  return memberships.some((mem) => mem.roles && mem.roles.includes("client"));
}

/**
 * Get team IDs where the user has role "client" (for portal member queries).
 * @param {import("node-appwrite").Models.Membership[]} memberships
 * @returns {string[]}
 */
export function getClientTeamIds(memberships) {
  if (!Array.isArray(memberships)) return [];
  return memberships
    .filter((mem) => mem.roles && mem.roles.includes("client"))
    .map((mem) => mem.teamId)
    .filter(Boolean);
}

/** Team ID for Pulse app admins (settings, theming, etc.) */
export const PULSE_ADMIN_TEAM_ID = "pulse-admin";

/**
 * Check if user is in the Pulse Admins team (can access Settings, theme, etc.).
 * @param {import("node-appwrite").Models.Membership[]} memberships
 * @returns {boolean}
 */
export function hasPulseAdmin(memberships) {
  if (!Array.isArray(memberships)) return false;
  return memberships.some((mem) => mem.teamId === PULSE_ADMIN_TEAM_ID);
}
