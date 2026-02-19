import { NextResponse } from "next/server";

const CORVEX_COLLECTIONS_URL =
  "https://corvex-cms.vercel.app/api/cms/collections";

export async function GET() {
  const apiKey = process.env.CORVEX_API_KEY;
  if (!apiKey) {
    return NextResponse.json(
      { error: "CORVEX_API_KEY is not configured" },
      { status: 500 }
    );
  }

  try {
    const response = await fetch(CORVEX_COLLECTIONS_URL, {
      headers: { "x-api-key": apiKey },
    });

    if (!response.ok) {
      const text = await response.text();
      return NextResponse.json(
        { error: `Corvex API error: ${response.status}`, details: text },
        { status: response.status }
      );
    }

    const json = await response.json();
    return NextResponse.json(json);
  } catch (err) {
    return NextResponse.json(
      { error: "Failed to fetch CMS collections", details: err.message },
      { status: 500 }
    );
  }
}
