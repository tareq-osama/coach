"use client";

import { useEffect, useState } from "react";

/**
 * Fetches a list from /api/gym/[collection]. Returns { data, loading, error }.
 */
export function useGymList(collectionKey) {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!collectionKey) {
      setLoading(false);
      return;
    }
    setLoading(true);
    setError(null);
    fetch(`/api/gym/${collectionKey}`)
      .then((res) => res.json())
      .then((json) => {
        if (json.error) throw new Error(json.details || json.error);
        setData(json.documents ?? []);
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [collectionKey]);

  return { data, loading, error };
}
