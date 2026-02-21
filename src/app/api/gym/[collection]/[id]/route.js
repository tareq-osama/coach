import { NextResponse } from "next/server";
import { COLLECTIONS, OWNER_SCOPED_KEYS, DB_ID } from "@/lib/gym-api";
import { serverDatabases } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../../get-owner";

export async function GET(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const collectionKey = params?.collection;
  const id = params?.id;
  if (!collectionKey || !COLLECTIONS[collectionKey] || !id) {
    return NextResponse.json({ error: "Collection and document ID required" }, { status: 400 });
  }
  try {
    const doc = await serverDatabases.getDocument(DB_ID, COLLECTIONS[collectionKey], id);
    const ownerId = await getOwnerIdFromRequest(request);
    if (ownerId && OWNER_SCOPED_KEYS.has(collectionKey) && doc.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get document", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const collectionKey = params?.collection;
  const id = params?.id;
  if (!collectionKey || !COLLECTIONS[collectionKey] || !id) {
    return NextResponse.json({ error: "Collection and document ID required" }, { status: 400 });
  }
  const isOwnerScoped = OWNER_SCOPED_KEYS.has(collectionKey);
  const ownerId = await getOwnerIdFromRequest(request);
  if (isOwnerScoped && !ownerId) {
    return NextResponse.json({ error: "X-User-Id header required" }, { status: 400 });
  }
  try {
    const existing = await serverDatabases.getDocument(DB_ID, COLLECTIONS[collectionKey], id);
    if (isOwnerScoped && existing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const data = typeof body === "object" && body !== null ? body : {};
    const doc = await serverDatabases.updateDocument(DB_ID, COLLECTIONS[collectionKey], id, data);
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update document", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const collectionKey = params?.collection;
  const id = params?.id;
  if (!collectionKey || !COLLECTIONS[collectionKey] || !id) {
    return NextResponse.json({ error: "Collection and document ID required" }, { status: 400 });
  }
  const isOwnerScoped = OWNER_SCOPED_KEYS.has(collectionKey);
  const ownerId = await getOwnerIdFromRequest(request);
  if (isOwnerScoped && !ownerId) {
    return NextResponse.json({ error: "X-User-Id header required" }, { status: 400 });
  }
  try {
    const existing = await serverDatabases.getDocument(DB_ID, COLLECTIONS[collectionKey], id);
    if (isOwnerScoped && existing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await serverDatabases.deleteDocument(DB_ID, COLLECTIONS[collectionKey], id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete document", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
