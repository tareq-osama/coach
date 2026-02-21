/**
 * GET/PATCH /api/admin/theme
 * App theme overrides. GET: public. PATCH: pulse-admin only.
 */
import { NextResponse } from "next/server";
import { getSessionWithTeams, hasPulseAdmin } from "@/lib/session-teams";
import { serverDatabases } from "@/lib/appwrite-server";

const DB_ID = "gym_coach";
const COLLECTION_ID = "app_settings";
const THEME_DOC_ID = "theme";
const DEFAULT_THEME = {};

export async function GET() {
  try {
    const doc = await serverDatabases
      .getDocument(DB_ID, COLLECTION_ID, THEME_DOC_ID)
      .catch(() => null);
    const value = doc?.value?.trim();
    const theme = value ? JSON.parse(value) : DEFAULT_THEME;
    return NextResponse.json(theme);
  } catch {
    return NextResponse.json(DEFAULT_THEME);
  }
}

export async function PATCH(request) {
  try {
    const { user, memberships } = await getSessionWithTeams(request);
    if (!user || !hasPulseAdmin(memberships)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 });
    }
    const body = await request.json();
    if (!body || typeof body !== "object") {
      return NextResponse.json({ error: "Invalid body" }, { status: 400 });
    }
    const value = JSON.stringify(body);
    try {
      await serverDatabases.updateDocument(DB_ID, COLLECTION_ID, THEME_DOC_ID, { value });
    } catch (updateErr) {
      if (updateErr?.code === 404) {
        await serverDatabases.createDocument(DB_ID, COLLECTION_ID, THEME_DOC_ID, { value });
      } else {
        throw updateErr;
      }
    }
    return NextResponse.json(body);
  } catch (err) {
    console.error("PATCH /api/admin/theme", err?.message ?? err);
    return NextResponse.json(
      { error: "Failed to save theme", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
