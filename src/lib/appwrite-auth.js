/**
 * Appwrite Auth helpers (client-side only).
 * Uses the same client as appwrite.js; call from browser only.
 */
import { Account } from "appwrite";
import { client } from "@/lib/appwrite";

const account = new Account(client);

export async function getAccount() {
  try {
    return await account.get();
  } catch {
    return null;
  }
}

export async function createEmailPasswordSession(email, password) {
  await account.createEmailPasswordSession(email, password);
  return getAccount();
}

export async function createAccount(email, password, name = "") {
  const { ID } = await import("appwrite");
  await account.create(ID.unique(), email, password, name || undefined);
  return createEmailPasswordSession(email, password);
}

export async function deleteSession() {
  try {
    await account.deleteSession("current");
  } catch (_) {
    // ignore
  }
}

export async function updateName(name) {
  await account.updateName(name || "");
  return getAccount();
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
