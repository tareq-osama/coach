import { NextResponse } from "next/server";
import { ID } from "node-appwrite";
import { listGymDocuments, COLLECTIONS, OWNER_SCOPED_KEYS, DB_ID } from "@/lib/gym-api";
import { serverDatabases } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../get-owner";

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
    const ownerId = await getOwnerIdFromRequest(request);
    const { searchParams } = new URL(request.url);
    const filters = [];
    let orderBy = null;
    let orderAsc = false;
    let limit = 100;
    if (collectionKey === "workout-plan-modules") {
      const v = searchParams.get("workout_plan_id");
      if (v) filters.push({ attribute: "workout_plan_id", value: v });
      const w = searchParams.get("workout_module_id");
      if (w) filters.push({ attribute: "workout_module_id", value: w });
      if (filters.length) orderBy = "sort_order";
      orderAsc = true;
      limit = 500;
    } else if (collectionKey === "meal-plan-modules") {
      const v = searchParams.get("meal_plan_id");
      if (v) filters.push({ attribute: "meal_plan_id", value: v });
      const w = searchParams.get("meal_module_id");
      if (w) filters.push({ attribute: "meal_module_id", value: w });
      if (filters.length) orderBy = "sort_order";
      orderAsc = true;
      limit = 500;
    } else if (collectionKey === "module-exercises") {
      const v = searchParams.get("workout_module_id");
      if (v) {
        filters.push({ attribute: "workout_module_id", value: v });
        orderBy = "sort_order";
        orderAsc = true;
        limit = 500;
      }
    } else if (collectionKey === "meal-module-meals") {
      const v = searchParams.get("meal_module_id");
      if (v) {
        filters.push({ attribute: "meal_module_id", value: v });
        orderBy = "sort_order";
        orderAsc = true;
        limit = 500;
      }
    }
    const { documents, total } = await listGymDocuments(collectionKey, {
      ownerId,
      filters,
      ...(orderBy ? { orderBy, orderAsc, limit } : {}),
    });
    return NextResponse.json({ documents, total });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to list documents", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}

export async function POST(request, { params }) {
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
  const isOwnerScoped = OWNER_SCOPED_KEYS.has(collectionKey);
  const ownerId = await getOwnerIdFromRequest(request);
  if (isOwnerScoped && !ownerId) {
    return NextResponse.json(
      { error: "X-User-Id header required for this collection" },
      { status: 400 }
    );
  }
  try {
    const body = await request.json();
    const data = typeof body === "object" && body !== null ? { ...body } : {};
    if (isOwnerScoped) data.owner_id = ownerId;
    const collectionId = COLLECTIONS[collectionKey];
    const doc = await serverDatabases.createDocument(
      DB_ID,
      collectionId,
      ID.unique(),
      data
    );
    return NextResponse.json(doc);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to create document", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
