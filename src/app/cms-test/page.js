"use client";

import { useState, useEffect } from "react";

function formatDate(iso) {
  if (!iso) return "—";
  try {
    return new Date(iso).toLocaleString("en-US", {
      dateStyle: "short",
      timeStyle: "short",
    });
  } catch {
    return iso;
  }
}

export default function CmsTestPage() {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRaw, setShowRaw] = useState(false);

  useEffect(() => {
    async function fetchCollections() {
      try {
        const response = await fetch("/api/cms/collections");
        const json = await response.json();

        if (!response.ok) {
          throw new Error(json.error || json.details || "Request failed");
        }

        const raw = json.data ?? json;
        setData(Array.isArray(raw) ? raw : [raw]);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }

    fetchCollections();
  }, []);

  return (
    <main className="min-h-screen p-8 bg-[#FAFAFB]">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-light text-[#2D2D31] mb-2">
          Corvex CMS – Test Page
        </h1>
        <p className="text-[#56565C] mb-6">
          Dummy page to test fetching CMS collections using{" "}
          <code className="rounded bg-[#EDEDF0] px-1">CORVEX_API_KEY</code>.
        </p>

        {loading && (
          <div className="flex items-center gap-2 text-[#56565C]">
            <span className="inline-block h-4 w-4 animate-spin rounded-full border-2 border-[#FD366E] border-t-transparent" />
            Loading collections…
          </div>
        )}

        {error && (
          <div className="rounded-md border border-red-200 bg-red-50 p-4 text-red-800">
            <strong>Error:</strong> {error}
          </div>
        )}

        {!loading && !error && data !== null && (
          <>
            <div className="mb-4 flex items-center justify-between">
              <h2 className="text-lg font-medium text-[#2D2D31]">
                Collections ({data.length})
              </h2>
              <button
                type="button"
                onClick={() => setShowRaw((v) => !v)}
                className="rounded bg-[#EDEDF0] px-2 py-1 text-sm text-[#56565C] hover:bg-[#E6E6E6]"
              >
                {showRaw ? "Hide" : "Show"} raw JSON
              </button>
            </div>

            <ul className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {data.map((col) => (
                <li
                  key={col.id}
                  className="rounded-md border border-[#EDEDF0] bg-white p-4 shadow-[0px_2px_12px_0px_hsla(0,0%,0%,0.03)]"
                >
                  <div className="mb-2 flex items-center gap-2">
                    <span className="text-xs font-medium text-[#97979B]">
                      #{col.id}
                    </span>
                    <span className="rounded bg-[#10B98114] px-1.5 py-0.5 text-xs text-[#0A714F]">
                      {col.collection_type ?? "custom"}
                    </span>
                  </div>
                  <h3 className="font-medium text-[#2D2D31]">
                    {col.name || "Unnamed"}
                  </h3>
                  {(col.slug || col.description) && (
                    <p className="mt-1 text-sm text-[#56565C] line-clamp-2">
                      {col.slug ? (
                        <code className="text-xs">{col.slug}</code>
                      ) : null}
                      {col.slug && col.description ? " · " : null}
                      {col.description ?? null}
                    </p>
                  )}
                  <p className="mt-2 text-xs text-[#97979B]">
                    Updated {formatDate(col.updated_at)}
                  </p>
                </li>
              ))}
            </ul>

            {showRaw && (
              <div className="mt-6 rounded-md border border-[#EDEDF0] bg-white p-4">
                <h3 className="text-sm font-medium text-[#2D2D31] mb-2">
                  Raw response
                </h3>
                <pre className="overflow-auto rounded bg-[#FAFAFB] p-4 text-sm font-[Fira_Code] text-[#56565C]">
                  {JSON.stringify(data, null, 2)}
                </pre>
              </div>
            )}
          </>
        )}
      </div>
    </main>
  );
}
