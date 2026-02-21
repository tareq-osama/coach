import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionWithTeams, hasClientRole } from "@/lib/session-teams";

/**
 * Portal dashboard layout: requires auth and at least one team with role "client".
 * Applied to /portal (dashboard) only; /portal/login does not use this layout.
 */
export default async function PortalDashboardLayout({ children }) {
  const cookieStore = await cookies();
  const { user, memberships } = await getSessionWithTeams(cookieStore);

  if (!user) {
    redirect("/portal/login");
  }

  if (!hasClientRole(memberships)) {
    redirect("/login?message=use-coach-app");
  }

  return <>{children}</>;
}
