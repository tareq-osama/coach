/**
 * Appwrite Auth helpers (client-side only).
 * Uses the same client as appwrite.js; call from browser only.
 */
import { Account } from "appwrite";
import { client } from "@/lib/appwrite";

const account = new Account(client);

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() ?? "";

/**
 * Relay the Appwrite session from localStorage to a server-side cookie.
 * The Appwrite Web SDK falls back to localStorage on localhost (no custom domain),
 * but the server reads cookies. This bridges the gap.
 * No-op in production where Appwrite sets real cookies natively.
 */
async function syncSessionCookie() {
  const cookieFallback =
    typeof window !== "undefined"
      ? window.localStorage.getItem("cookieFallback")
      : null;
  if (!cookieFallback) return; // real cookies in use — no sync needed
  let cookies;
  try {
    cookies = JSON.parse(cookieFallback);
  } catch {
    return;
  }
  const sessionValue = cookies[`a_session_${PROJECT_ID}`];
  if (!sessionValue) return;
  const res = await fetch("/api/auth/set-session", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ session: sessionValue }),
    credentials: "include",
  });
  if (!res.ok) throw new Error("Session sync failed. Please try again.");
}

/** Call after login or when restoring session so the server sees the cookie (localhost localStorage fallback). */
export async function syncSessionCookieIfNeeded() {
  return syncSessionCookie();
}

export async function getAccount() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function createEmailPasswordSession(email, password) {
  await account.createEmailPasswordSession(email, password);
  await syncSessionCookie();
  return getAccount();
}

export async function createAccount(email, password, name = "") {
  const { ID } = await import("appwrite");
  await account.create(ID.unique(), email, password, name || undefined);
  return createEmailPasswordSession(email, password);
}

/**
 * Clear the server-side session cookie (used when Appwrite falls back to localStorage on localhost).
 */
async function clearSessionCookie() {
  try {
    await fetch("/api/auth/set-session", {
      method: "DELETE",
      credentials: "include",
    });
  } catch (_) {
    // ignore
  }
}

export async function deleteSession() {
  try {
    await account.deleteSession("current");
  } catch (_) {
    // ignore
  }
  await clearSessionCookie();
}

export async function updateName(name) {
  await account.updateName(name || "");
  return getAccount();
}

/**
 * Update the current user's password (must be logged in).
 * @param {string} newPassword - New password (8–256 chars)
 * @param {string} oldPassword - Current password for verification
 */
export async function updatePassword(newPassword, oldPassword) {
  await account.updatePassword(newPassword, oldPassword);
}

export async function getPrefs() {
  try {
    return await account.getPrefs();
  } catch {
    return {};
  }
}

export async function updatePrefs(prefs) {
  await account.updatePrefs(prefs);
  return getAccount();
}

export { account };
