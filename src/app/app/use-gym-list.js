"use client";

import { useCallback, useEffect, useState } from "react";

/**
 * Fetches a list from /api/gym/[collection]. Returns { data, loading, error, refetch }.
 */
export function useGymList(collectionKey) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!collectionKey) return;
    setLoading(true);
    setError(null);
    const url = `/api/gym/${collectionKey}`;
    fetch(url)
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          try {
            const json = JSON.parse(text);
            throw new Error(json.details || json.error || `HTTP ${res.status}`);
          } catch (e) {
            if (e instanceof SyntaxError || text.trimStart().startsWith("<")) {
              throw new Error(`API error: server returned ${res.status}. Check that ${url} is available.`);
            }
            throw e;
          }
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          if (text.trimStart().startsWith("<")) {
            throw new Error(`API returned HTML instead of JSON. Check that ${url} is available.`);
          }
          throw new Error("Invalid JSON from API");
        }
      })
      .then((json) => {
        if (json.error) throw new Error(json.details || json.error);
        setData(json.documents ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [collectionKey]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
