import { NextResponse } from "next/server";
import { ID, Permission, Role } from "node-appwrite";
import { serverDatabases, serverStorage, STORAGE_BUCKET_ID } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../get-owner";
import { listGymDocuments } from "@/lib/gym-api";
import { DB_ID } from "@/lib/gym-api";

const COLLECTION_ID = "progress_photos";

export async function GET(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  try {
    const ownerId = await getOwnerIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const memberId = searchParams.get("member_id");
    const options = { ownerId };
    if (memberId != null && memberId !== "") {
      options.filters = [{ attribute: "member_id", value: String(memberId).trim() }];
    }
    const { documents } = await listGymDocuments("progress-photos", options);
    return NextResponse.json({ documents });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list progress photos", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const ownerId = await getOwnerIdFromRequest(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
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
        owner_id: ownerId,
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
