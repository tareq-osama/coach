/**
 * Server-only Appwrite client (API routes, Server Components, server actions).
 * Uses API key for admin access; do not import this in Client Components.
 * @see https://appwrite.io/docs/server/databases
 * @see https://appwrite.io/docs/products/storage/quick-start
 */
import { Client, Databases, Storage } from "node-appwrite";

const serverClient = new Client()
  .setEndpoint(String(process.env.NEXT_PUBLIC_APPWRITE_ENDPOINT ?? "").trim())
  .setProject(String(process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID ?? "").trim())
  .setKey(String(process.env.APPWRITE_API_KEY ?? "").trim());

export const serverDatabases = new Databases(serverClient);
export const serverStorage = new Storage(serverClient);

/** Main storage bucket ID for progress photos and other app files. */
export const STORAGE_BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ?? "6996a35600167a808e08";
