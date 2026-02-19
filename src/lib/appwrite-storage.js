/**
 * Client-side Appwrite Storage helpers for viewing files.
 * Use for progress photos and other bucket files.
 * @see https://appwrite.io/docs/references/cloud/client-web/storage
 */
import { Storage } from "appwrite";
import { client } from "@/lib/appwrite";

const BUCKET_ID =
  process.env.NEXT_PUBLIC_APPWRITE_STORAGE_BUCKET_ID ?? "6996a35600167a808e08";

const storage = new Storage(client);

/**
 * Returns the URL to view a file (e.g. for <img src={...} />).
 * Uses the current user session if the bucket requires auth.
 */
export function getFileViewUrl(fileId) {
  if (!fileId) return null;
  try {
    return storage.getFileView(BUCKET_ID, fileId).toString();
  } catch {
    return null;
  }
}

/**
 * Returns the URL for a resized preview image (images only).
 */
export function getFilePreviewUrl(fileId, width = 200, height = 200) {
  if (!fileId) return null;
  try {
    return storage.getFilePreview(BUCKET_ID, fileId, width, height).toString();
  } catch {
    return getFileViewUrl(fileId);
  }
}

export { storage, BUCKET_ID };
