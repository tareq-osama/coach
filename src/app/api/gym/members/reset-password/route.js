/**
 * POST /api/gym/members/reset-password
 * Coach resets a member's portal password (generates new temp password).
 * Body: { memberId }. Returns { tempPassword }.
 * Member must belong to the coach and have user_id (portal account).
 */
import { NextResponse } from "next/server";
import { serverDatabases, serverUsers } from "@/lib/appwrite-server";
import { getOwnerIdFromRequest } from "../../get-owner";
import { generateTempPassword } from "@/lib/client-credentials";

const DB_ID = (process.env.APPWRITE_GYM_DATABASE_ID ?? "gym_coach").trim();
const COLLECTION_ID = "members";

export async function POST(request) {
  if (!process.env.APPWRITE_API_KEY?.trim()) {
    return NextResponse.json({ error: "APPWRITE_API_KEY is not configured" }, { status: 500 });
  }

  const ownerId = await getOwnerIdFromRequest(request);
  if (!ownerId) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  const memberId = typeof body?.memberId === "string" ? body.memberId.trim() : "";
  if (!memberId) {
    return NextResponse.json({ error: "memberId is required" }, { status: 400 });
  }

  try {
    const doc = await serverDatabases.getDocument(DB_ID, COLLECTION_ID, memberId);
    if (doc.owner_id !== ownerId) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const userId = doc.user_id;
    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "Member has no portal account. Link a portal account first." },
        { status: 400 }
      );
    }

    const tempPassword = generateTempPassword();
    await serverUsers.updatePassword(userId, tempPassword);

    return NextResponse.json({ tempPassword });
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to reset password", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
