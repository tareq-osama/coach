import { NextResponse } from "next/server";
import { ID, Permission, Role } from "node-appwrite";
import { serverDatabases, serverStorage, STORAGE_BUCKET_ID } from "@/lib/appwrite-server";
import { DB_ID } from "@/lib/gym-api";

const COLLECTION_ID = "progress_photos";

export async function POST(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  try {
    const formData = await request.formData();
    const memberId = formData.get("member_id");
    const photoDate = formData.get("photo_date");
    const name = formData.get("name") ?? "";
    const file = formData.get("file");

    if (!memberId || !photoDate || !file || typeof file === "string") {
      return NextResponse.json(
        { error: "Missing required fields: member_id, photo_date, file" },
        { status: 400 }
      );
    }

    const fileId = ID.unique();
    await serverStorage.createFile(
      STORAGE_BUCKET_ID,
      fileId,
      file,
      [Permission.read(Role.any())]
    );

    const doc = await serverDatabases.createDocument(
      DB_ID,
      COLLECTION_ID,
      ID.unique(),
      {
        member_id: String(memberId).trim(),
        photo_date: photoDate,
        file_id: fileId,
        name: String(name).trim(),
      }
    );
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to upload progress photo", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
