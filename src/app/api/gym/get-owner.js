/**
 * Get the current coach (owner) user ID from the request.
 * Client should send X-User-Id header with the authenticated user's $id from useAuth().
 * @param {Request} request
 * @returns {string|null} owner ID or null if not provided
 */
export function getOwnerIdFromRequest(request) {
  const header = request.headers.get("x-user-id");
  if (header && typeof header === "string") {
    const id = header.trim();
    if (id.length > 0) return id;
  }
  return null;
}
