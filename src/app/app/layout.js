import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { getSessionWithTeams, getCoachTeamId } from "@/lib/session-teams";
import AppLayoutClient from "./AppLayoutClient";

export default async function AppLayout({ children }) {
  const cookieStore = await cookies();
  const { user, memberships } = await getSessionWithTeams(cookieStore);

  if (!user) {
    redirect("/login");
  }

  if (!getCoachTeamId(memberships)) {
    redirect("/complete-setup");
  }

  return <AppLayoutClient>{children}</AppLayoutClient>;
}
