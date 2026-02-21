import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import Link from "next/link";
import { getSessionWithTeams, hasPulseAdmin } from "@/lib/session-teams";
import SettingsNav from "./SettingsNav";

export default async function SettingsLayout({ children }) {
  const cookieStore = await cookies();
  const { user, memberships } = await getSessionWithTeams(cookieStore);

  if (!user) {
    redirect("/login");
  }

  if (!hasPulseAdmin(memberships)) {
    redirect("/app");
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Settings</h1>
          <p className="mt-1 text-sm text-default-500">Admin-only app configuration</p>
        </div>
        <Link
          href="/app"
          className="text-sm text-primary hover:underline"
        >
          ← Back to app
        </Link>
      </div>
      <SettingsNav />
      <div className="min-w-0">{children}</div>
    </div>
  );
}
