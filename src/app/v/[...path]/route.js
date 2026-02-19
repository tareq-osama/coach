import { NextResponse } from "next/server";
import { getR2PublicUrl } from "@/lib/r2";

/**
 * Proxy R2 images under /v/ so links use the app domain instead of exposing R2 public URL.
 * GET /v/members/xxx.jpeg → fetches from R2 and streams the image with correct headers.
 */
export async function GET(request, { params }) {
  const pathSegments = params?.path;
  if (!pathSegments?.length) {
    return NextResponse.json({ error: "Path required" }, { status: 400 });
  }

  const key = pathSegments.join("/");
  const publicUrl = getR2PublicUrl(key);
  if (!publicUrl) {
    return NextResponse.json(
      { error: "R2 not configured or invalid path" },
      { status: 503 }
    );
  }

  try {
    const res = await fetch(publicUrl, {
      method: "GET",
      cache: "force-cache",
      next: { revalidate: 86400 },
    });

    if (!res.ok) {
      if (res.status === 404) {
        return NextResponse.json({ error: "Not found" }, { status: 404 });
      }
      return NextResponse.json(
        { error: "Upstream error", status: res.status },
        { status: res.status }
      );
    }

    const contentType =
      res.headers.get("content-type") ||
      (key.endsWith(".png")
        ? "image/png"
        : key.endsWith(".gif")
          ? "image/gif"
          : key.endsWith(".webp")
            ? "image/webp"
            : "image/jpeg");

    const body = await res.arrayBuffer();
    return new NextResponse(body, {
      status: 200,
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=31536000, immutable",
      },
    });
  } catch (err) {
    return NextResponse.json(
      { error: "Proxy failed", details: err?.message ?? String(err) },
      { status: 502 }
    );
  }
}
