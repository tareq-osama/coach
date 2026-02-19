/**
 * Server-only Appwrite client (API routes, Server Components, server actions).
 * Uses API key for admin access; do not import this in Client Components.
 * @see https://appwrite.io/docs/server/databases
 */
import { Client, Databases } from "appwrite";

const serverClient = new Client()
  .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "").trim())
  .setProject(String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "").trim())
  .setDevKey(String(process.env.APPWRITE_API_KEY ?? "").trim());

export const serverDatabases = new Databases(serverClient);
