import { NextResponse } from "next/server";
import { serverDatabases } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../../get-owner";

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
    const ownerId = await getOwnerIdFromRequest(request);
    if (ownerId && doc.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to get member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function PATCH(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  const ownerId = await getOwnerIdFromRequest(request);
  if (!ownerId) {
    return NextResponse.json({ error: "X-User-Id header required" }, { status: 400 });
  }
  try {
    const existing = await serverDatabases.getDocument(DB_ID, COLLECTION_ID, id);
    if (existing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    const {
      name,
      email,
      phone,
      notes,
      thumbnail,
      join_date,
      status,
      goals,
      weight_kg,
      height_cm,
      chest_cm,
      waist_cm,
      hips_cm,
      arms_cm,
      thighs_cm,
    } = body;
    const data = {};
    if (name !== undefined) data.name = name;
    if (email !== undefined) data.email = email;
    if (phone !== undefined) data.phone = phone;
    if (notes !== undefined) data.notes = notes;
    if (thumbnail !== undefined) data.thumbnail = thumbnail;
    if (join_date !== undefined) data.join_date = join_date;
    if (status !== undefined) data.status = status;
    if (goals !== undefined) data.goals = goals;
    if (weight_kg !== undefined) data.weight_kg = weight_kg;
    if (height_cm !== undefined) data.height_cm = height_cm;
    if (chest_cm !== undefined) data.chest_cm = chest_cm;
    if (waist_cm !== undefined) data.waist_cm = waist_cm;
    if (hips_cm !== undefined) data.hips_cm = hips_cm;
    if (arms_cm !== undefined) data.arms_cm = arms_cm;
    if (thighs_cm !== undefined) data.thighs_cm = thighs_cm;
    const doc = await serverDatabases.updateDocument(DB_ID, COLLECTION_ID, id, data);
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to update member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function DELETE(request, { params }) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }
  const id = params?.id;
  if (!id) return NextResponse.json({ error: "Member ID required" }, { status: 400 });
  const ownerId = await getOwnerIdFromRequest(request);
  if (!ownerId) {
    return NextResponse.json({ error: "X-User-Id header required" }, { status: 400 });
  }
  try {
    const existing = await serverDatabases.getDocument(DB_ID, COLLECTION_ID, id);
    if (existing.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    await serverDatabases.deleteDocument(DB_ID, COLLECTION_ID, id);
    return new NextResponse(null, { status: 204 });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to delete member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
