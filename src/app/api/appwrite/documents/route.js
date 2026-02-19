/**
 * Example: list documents from an Appwrite collection (server-side).
 * Uses server client + Query per Appwrite docs.
 * Set APPWRITE_API_KEY in .env.local (server-only; never NEXT_PUBLIC_).
 */
import { NextResponse } from "next/server";
import { Query } from "appwrite";
import { serverDatabases } from "@/lib/appwrite-server";

const DATABASE_ID = process.env.APPWRITE_DATABASE_ID ?? "YOUR_DATABASE_ID";
const COLLECTION_ID = process.env.APPWRITE_COLLECTION_ID ?? "YOUR_COLLECTION_ID";

export async function GET(request) {
  if (!process.env.APPWRITE_API_KEY) {
    return NextResponse.json(
      { error: "APPWRITE_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const { searchParams } = new URL(request.url);
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "25", 10), 100);
    const offset = parseInt(searchParams.get("offset") ?? "0", 10);
    const status = searchParams.get("status"); // optional filter

    const queries = [
      Query.limit(limit),
      Query.offset(offset),
      Query.orderDesc("$createdAt"),
    ];
    if (status) queries.push(Query.equal("status", status));

    const { documents, total } = await serverDatabases.listDocuments(
      DATABASE_ID,
      COLLECTION_ID,
      queries
    );

    return NextResponse.json({ documents, total });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list documents", details: err.message },
      { status: 500 }
    );
  }
}
