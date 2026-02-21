import { NextResponse } from "next/server";
import { Query, ID } from "node-appwrite";
import { serverDatabases } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../get-owner";

const DB_ID = (process.env.APPWRITE_GYM_DATABASE_ID ?? "gym_coach").trim();
const COLLECTION_ID = "members";

export async function GET(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  try {
    const ownerId = await getOwnerIdFromRequest(request);
    const queries = [Query.limit(100), Query.orderDesc("$createdAt")];
    if (ownerId) queries.push(Query.equal("owner_id", ownerId));
    const { documents, total } = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID, queries);
    return NextResponse.json({ documents, total });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list members", details: err?.message ?? String(err) },
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
    return NextResponse.json({ error: "X-User-Id header required to create members" }, { status: 400 });
  }
  try {
    const body = await request.json();
    const { name, email, phone, notes, thumbnail } = body;
    const doc = await serverDatabases.createDocument(DB_ID, COLLECTION_ID, ID.unique(), {
      name: name ?? "",
      email: email ?? "",
      phone: phone ?? "",
      notes: notes ?? "",
      thumbnail: thumbnail ?? "",
      owner_id: ownerId,
    });
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
