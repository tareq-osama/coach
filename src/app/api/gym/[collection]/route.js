import { NextResponse } from "next/server";
import { listGymDocuments, COLLECTIONS } from "@/lib/gym-api";

export async function GET(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const collectionKey = params?.collection;
  if (!collectionKey || !COLLECTIONS[collectionKey]) {
    return NextResponse.json(
      { error: "Unknown collection", valid: Object.keys(COLLECTIONS) },
      { status: 400 }
    );
  }
  try {
    const { documents, total } = await listGymDocuments(collectionKey);
    return NextResponse.json({ documents, total });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list documents", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
