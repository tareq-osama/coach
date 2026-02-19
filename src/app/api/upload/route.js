import { NextResponse } from "next/server";
import { uploadToR2 } from "@/lib/r2";

const MAX_SIZE = 5 * 1024 * 1024; // 5 MB
const ALLOWED_TYPES = [
  "image/jpeg",
  "image/png",
  "image/gif",
  "image/webp",
];

function safeKey(prefix, name) {
  const slug = name.replace(/[^a-zA-Z0-9._-]/g, "_").slice(0, 80);
  const timestamp = Date.now();
  return prefix ? `${prefix.replace(/[^a-zA-Z0-9_-]/g, "")}/${timestamp}-${slug}` : `${timestamp}-${slug}`;
}

export async function POST(request) {
  try {
    const formData = await request.formData();
    const file = formData.get("file");
    const prefix = (formData.get("prefix") || "gym").toString().trim();

    if (!file || typeof file === "string") {
      return NextResponse.json({ error: "Missing file" }, { status: 400 });
    }

    const { size, type, name } = file;
    if (size > MAX_SIZE) {
      return NextResponse.json(
        { error: `File too large. Max ${MAX_SIZE / 1024 / 1024} MB.` },
        { status: 400 }
      );
    }
    if (type && !ALLOWED_TYPES.includes(type)) {
      return NextResponse.json(
        { error: "Invalid type. Allowed: image/jpeg, image/png, image/gif, image/webp" },
        { status: 400 }
      );
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const key = safeKey(prefix, name || "upload");
    await uploadToR2(key, buffer, type || "image/jpeg");

    const base = process.env.NEXT_PUBLIC_APP_URL?.trim()?.replace(/\/$/, "") || "";
    const proxyPath = `/v/${key}`;
    const url = base ? `${base}${proxyPath}` : proxyPath;

    return NextResponse.json({ url, key });
  } catch (err) {
    if (err.message === "R2 is not configured") {
      return NextResponse.json(
        { error: "Upload not configured. Set R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, and optionally R2_PUBLIC_URL." },
        { status: 503 }
      );
    }
    return NextResponse.json(
      { error: "Upload failed", details: err?.message ?? String(err) },
      { status: 500 }
    );
  }
}
