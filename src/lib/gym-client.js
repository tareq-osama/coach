/**
 * Client-side helpers for gym API. Use with useAuth().user to send owner context.
 */

/**
 * Returns headers to send with gym API requests so the server can scope by owner.
 * @param {{ $id?: string } | null} user - Current user from useAuth().user
 * @returns {Record<string, string>}
 */
export function gymApiHeaders(user) {
  if (user?.$id) return { "X-User-Id": user.$id };
  return {};
}
