/**
 * POST /api/gym/members/invite
 * Coach invites a client: create/link Appwrite user, add to coach's team as client, create/update members doc.
 * Body: { email, name?, phone?, memberId? } — memberId = existing members doc to update (link portal account).
 * Returns { member, tempPassword? } — tempPassword only when a new user was created (share with client for portal login).
 */
import { NextResponse } from "next/server";
import { Query, ID, Permission, Role } from "node-appwrite";
import { serverDatabases, serverUsers, serverTeams } from "@/lib/appwrite-server";
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

  const email = typeof body?.email === "string" ? body.email.trim() : "";
  if (!email) {
    return NextResponse.json({ error: "email is required" }, { status: 400 });
  }

  const name = typeof body?.name === "string" ? body.name.trim().slice(0, 128) : "";
  const phone = typeof body?.phone === "string" ? body.phone.trim() : "";
  const existingMemberId = typeof body?.memberId === "string" ? body.memberId.trim() : null;

  let userId = null;
  let userWasCreated = false;

  try {
    const { users } = await serverUsers.list({ queries: [Query.equal("email", email), Query.limit(1)] });
    if (users && users.length > 0) {
      userId = users[0].$id;
    }
  } catch {
    // ignore
  }

  let tempPasswordForResponse = null;
  if (!userId) {
    tempPasswordForResponse = generateTempPassword();
    try {
      const user = await serverUsers.create(ID.unique(), email, undefined, tempPasswordForResponse, name);
      userId = user.$id;
      userWasCreated = true;
    } catch (err) {
      return NextResponse.json(
        { error: "Failed to create user", details: err?.message ?? String(err) },
        { status: 500 }
      );
    }
  }

  let membershipCreated = false;
  try {
    await serverTeams.createMembership(ownerId, ["client"], undefined, userId, undefined, undefined, name || undefined);
    membershipCreated = true;
  } catch (err) {
    if (userWasCreated && userId) {
      try {
        await serverUsers.delete(userId);
      } catch (_) {}
    }
    return NextResponse.json(
      { error: "Failed to add to team", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }

  const permissions = [
    Permission.read(Role.team(ownerId)),
    Permission.update(Role.team(ownerId)),
    Permission.delete(Role.team(ownerId)),
  ];

  let memberDoc;
  try {
    if (existingMemberId) {
      const updateData = { user_id: userId };
      if (name !== undefined) updateData.name = name;
      if (email) updateData.email = email;
      if (phone !== undefined) updateData.phone = phone;
      memberDoc = await serverDatabases.updateDocument(
        DB_ID,
        COLLECTION_ID,
        existingMemberId,
        updateData,
        permissions
      );
    } else {
      const { documents: existing } = await serverDatabases.listDocuments(DB_ID, COLLECTION_ID, [
        Query.equal("owner_id", ownerId),
        Query.equal("email", email),
        Query.limit(1),
      ]);
      if (existing && existing.length > 0) {
        const updateData = { user_id: userId };
        if (name !== undefined) updateData.name = name;
        if (phone !== undefined) updateData.phone = phone;
        memberDoc = await serverDatabases.updateDocument(
          DB_ID,
          COLLECTION_ID,
          existing[0].$id,
          updateData,
          permissions
        );
      } else {
        memberDoc = await serverDatabases.createDocument(
          DB_ID,
          COLLECTION_ID,
          ID.unique(),
          {
            name: name || "",
            email,
            phone: phone || "",
            notes: "",
            thumbnail: "",
            owner_id: ownerId,
            user_id: userId,
          },
          permissions
        );
      }
    }
  } catch (err) {
    if (membershipCreated) {
      try {
        const { memberships } = await serverTeams.listMemberships(ownerId);
        const mem = memberships?.find((m) => m.userId === userId);
        if (mem?.$id) await serverTeams.deleteMembership(ownerId, mem.$id);
      } catch (_) {}
    }
    if (userWasCreated && userId) {
      try {
        await serverUsers.delete(userId);
      } catch (_) {}
    }
    return NextResponse.json(
      { error: "Failed to create or update member", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }

  const payload = { member: memberDoc };
  if (userWasCreated && tempPasswordForResponse) {
    payload.tempPassword = tempPasswordForResponse;
  }
  return NextResponse.json(payload, { status: existingMemberId ? 200 : 201 });
}
