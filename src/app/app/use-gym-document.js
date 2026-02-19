"use client";

import { useCallback, useEffect, useState } from "react";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";

/**
 * Fetches a single document from /api/gym/[collection]/[id].
 * Returns { data, loading, error, refetch }.
 */
export function useGymDocument(collectionKey, id) {
  const { user } = useAuth();
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const refetch = useCallback(() => {
    if (!collectionKey || !id) {
      setData(null);
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    const url = `/api/gym/${collectionKey}/${id}`;
    fetch(url, { headers: gymApiHeaders(user) })
      .then(async (res) => {
        const text = await res.text();
        if (!res.ok) {
          try {
            const json = JSON.parse(text);
            throw new Error(json.details || json.error || `HTTP ${res.status}`);
          } catch (e) {
            if (e instanceof SyntaxError || text.trimStart().startsWith("<")) {
              throw new Error(`API error: server returned ${res.status}.`);
            }
            throw e;
          }
        }
        try {
          return JSON.parse(text);
        } catch (e) {
          if (text.trimStart().startsWith("<")) throw new Error("Invalid response from API");
          throw new Error("Invalid JSON from API");
        }
      })
      .then((json) => {
        if (json.error) throw new Error(json.details || json.error);
        setData(json);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [collectionKey, id, user?.$id]);

  useEffect(() => {
    refetch();
  }, [refetch]);

  return { data, loading, error, refetch };
}
