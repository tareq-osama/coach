/**
 * Root portal layout; no auth here so /portal/login is accessible.
 * Auth is enforced in (dashboard)/layout.js for /portal (dashboard) only.
 */
export default function PortalLayout({ children }) {
  return <div className="min-h-screen bg-default-50">{children}</div>;
}
