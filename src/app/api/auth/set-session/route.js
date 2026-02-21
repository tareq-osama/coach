/**
 * POST /api/auth/set-session  — relay Appwrite localStorage session to a server-readable cookie.
 * DELETE /api/auth/set-session — clear that cookie on logout.
 *
 * Needed because the Appwrite Web SDK falls back to localStorage on localhost (no custom domain).
 * The server-side code reads a_session_<projectId> from cookies; this route bridges the gap.
 */
import { NextResponse } from "next/server";

const PROJECT_ID = process.env.NEXT_PUBLIC_APPWRITE_PROJECT_ID?.trim() ?? "";
const COOKIE_NAME = `a_session_${PROJECT_ID}`;
const ONE_YEAR = 60 * 60 * 24 * 365;

export async function POST(request) {
  let body;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid body" }, { status: 400 });
  }

  const { session } = body ?? {};
  if (!session || typeof session !== "string" || session.length > 4096) {
    return NextResponse.json({ error: "Invalid session" }, { status: 400 });
  }

  const res = NextResponse.json({ ok: true });
  res.cookies.set(COOKIE_NAME, session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: ONE_YEAR,
  });
  return res;
}

export async function DELETE() {
  const res = NextResponse.json({ ok: true });
  res.cookies.delete(COOKIE_NAME);
  return res;
}
