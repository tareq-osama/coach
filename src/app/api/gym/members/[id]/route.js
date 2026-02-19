import { NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";

const DB_ID = (process.env.APPWRITE_GYM_DATABASE_ID ?? "gym_coach").trim();
const COLLECTION_ID = "members";

export async function GET(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  try {
    const doc = await serverDatabases.getDocument(DB_ID, COLLECTION_ID, id);
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
