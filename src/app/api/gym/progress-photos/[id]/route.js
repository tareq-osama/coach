import { NextResponse } from "next/server";
import { serverDatabases, serverStorage, STORAGE_BUCKET_ID } from "@/lib/appwrite-server";
import { DB_ID } from "@/lib/gym-api";

const COLLECTION_ID = "progress_photos";

export async function DELETE(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const id = params?.id;
  if (!id) {
    return NextResponse.json({ error: "Missing document id" }, { status: 400 });
  }
  try {
    const doc = await serverDatabases.getDocument(DB_ID, COLLECTION_ID, id);
    const fileId = doc?.file_id;
    if (fileId) {
      try {
        await serverStorage.deleteFile(STORAGE_BUCKET_ID, fileId);
      } catch (e) {
        // continue to delete document even if file already gone
      }
    }
    await serverDatabases.deleteDocument(DB_ID, COLLECTION_ID, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete progress photo", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
