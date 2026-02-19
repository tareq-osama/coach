/**
 * Use proxy image URLs from the app domain (/v/...) instead of exposing R2 public URLs.
 * - New uploads already return /v/key or absolute proxy URL.
 * - This helper rewrites any existing R2 public URLs to /v/ so old records still work.
 */

const R2_PUBLIC_HOST_RE = /^https:\/\/pub-[a-f0-9]+\.r2\.dev$/i;

/**
 * Returns the URL to use for displaying an image (proxy path when possible).
 * @param {string | null | undefined} url - Stored URL (R2 public or /v/... or other)
 * @returns {string} URL safe for img src (relative /v/ path or unchanged)
 */
export function imageUrl(url) {
  if (url == null || url === "") return "";
  const s = String(url).trim();
  if (!s) return "";

  try {
    if (s.startsWith("/")) return s;
    const u = new URL(s);
    if (u.hostname.endsWith(".r2.dev") || R2_PUBLIC_HOST_RE.test(u.origin)) {
      const pathname = u.pathname.replace(/^\//, "");
      return pathname ? `/v/${pathname}` : s;
    }
  } catch (_) {}
  return s;
}
