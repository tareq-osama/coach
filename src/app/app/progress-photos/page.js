"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

/**
 * Progress photos are managed per member. Redirect to members list.
 */
export default function ProgressPhotosPage() {
  const router = useRouter();
  useEffect(() => {
    router.replace("/app/members");
  }, [router]);
  return null;
}
