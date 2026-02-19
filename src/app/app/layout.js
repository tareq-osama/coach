"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button, Spinner, Divider, ScrollShadow } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import "./app.css";

const navSections = [
  {
    title: "Training",
    links: [
      { href: "/app/members", label: "Members" },
      { href: "/app/exercises", label: "Exercises" },
      { href: "/app/muscle-groups", label: "Muscle Groups" },
      { href: "/app/workout-modules", label: "Workout Modules" },
      { href: "/app/workout-plans", label: "Workout Plans" },
      { href: "/app/sessions", label: "Sessions" },
    ],
  },
  {
    title: "Nutrition",
    links: [
      { href: "/app/meals", label: "Meals" },
      { href: "/app/meals-modules", label: "Meals Modules" },
      { href: "/app/meal-plans", label: "Meal Plans" },
      { href: "/app/meal-logs", label: "Meal Logs" },
    ],
  },
  {
    title: "Tracking",
    links: [
      { href: "/app/progress-photos", label: "Progress Photos" },
      { href: "/app/forms", label: "Forms" },
      { href: "/app/reports", label: "Reports" },
    ],
  },
  {
    title: "Settings",
    links: [
      { href: "/app/page-setup", label: "Page Setup" },
      { href: "/app/settings", label: "Settings" },
    ],
  },
];

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { setTheme, resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace("/login");
    }
  }, [user, loading, router]);

  async function handleLogout() {
    await logout();
    router.replace("/login");
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-default-100">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="gym-app flex min-h-screen bg-default-100">
      {/* Sidebar overlay (mobile) */}
      <Button
        isIconOnly
        aria-label="Toggle menu"
        variant="flat"
        className="gym-sidebar-toggle fixed left-4 top-4 z-50 lg:hidden bg-content2 text-foreground border border-default-200"
        onPress={() => setSidebarOpen((o) => !o)}
      >
        {sidebarOpen ? (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        ) : (
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
          </svg>
        )}
      </Button>

      <aside
        className={`gym-sidebar fixed inset-y-0 left-0 z-40 flex w-64 flex-col transform overflow-hidden border-r border-default-200 bg-content2 transition-transform duration-200 lg:translate-x-0 pt-14 lg:pt-4 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex flex-1 flex-col min-h-0">
          <div className="shrink-0 p-4">
            <Button
              as={Link}
              href="/app"
              variant="light"
              className="gym-sidebar-brand h-auto justify-start px-3 py-2 text-lg font-semibold text-foreground hover:bg-default-100"
              onPress={() => setSidebarOpen(false)}
            >
              Gym Coach
            </Button>
          </div>
          <ScrollShadow
            hideScrollBar
            size={60}
            className="gym-sidebar-scroll flex-1 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 px-3 pb-4 pt-1">
              {navSections.map((section) => (
                <div key={section.title} className="gym-sidebar-section">
                  <p className="gym-sidebar-header mb-1.5 px-3 py-0 text-xs font-semibold uppercase tracking-wider text-default-500">
                    {section.title}
                  </p>
                  <ul className="space-y-0.5">
                    {section.links.map((item) => (
                      <li key={item.href}>
                        <Button
                          as={Link}
                          href={item.href}
                          variant="light"
                          className={`gym-sidebar-link h-auto min-h-9 justify-start rounded-lg px-3 py-2.5 text-left text-sm text-foreground hover:bg-default-100 ${
                            pathname === item.href ? "gym-sidebar-link-active bg-primary text-primary-foreground hover:bg-primary-600" : ""
                          }`}
                          onPress={() => setSidebarOpen(false)}
                        >
                          {item.label}
                        </Button>
                      </li>
                    ))}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollShadow>
          <Divider className="bg-default-200 shrink-0" />
          <div className="shrink-0 p-3 space-y-2">
            {mounted && (
              <Button
                variant="light"
                size="sm"
                className="gym-sidebar-link h-auto w-full justify-start px-3 py-2 text-left text-sm text-foreground hover:bg-default-100"
                onPress={() => setTheme(resolvedTheme === "dark" ? "light" : "dark")}
                startContent={
                  resolvedTheme === "dark" ? (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" /></svg>
                  )
                }
              >
                {resolvedTheme === "dark" ? "Light mode" : "Dark mode"}
              </Button>
            )}
            <p className="gym-sidebar-user truncate px-3 py-1.5 text-sm text-default-500" title={user?.email}>
              {user?.name || user?.email}
            </p>
            <Button
              variant="light"
              className="gym-sidebar-logout h-auto w-full justify-start px-3 py-2.5 text-left text-sm text-foreground hover:bg-default-100"
              onPress={handleLogout}
            >
              Sign out
            </Button>
          </div>
        </div>
      </aside>

      <main className="gym-main min-h-screen flex-1 pt-14 lg:pt-6 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4 pb-8">{children}</div>
      </main>

      {sidebarOpen && (
        <div
          className="fixed inset-0 z-30 bg-black/50 lg:hidden"
          aria-hidden
          onClick={() => setSidebarOpen(false)}
        />
      )}
    </div>
  );
}
