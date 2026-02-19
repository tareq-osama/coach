"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button, Spinner, Divider, ScrollShadow } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import "./app.css";

const iconClass = "h-5 w-5 shrink-0";

const icons = {
  users: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
    </svg>
  ),
  dumbbell: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 6v12h4V6H4zm6 0v12h4V6h-4zm6 0v12h4V6h-4zM4 6h4m12 0h4M8 6V4m8 2V4" />
    </svg>
  ),
  body: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
    </svg>
  ),
  layers: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
    </svg>
  ),
  clipboard: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" />
    </svg>
  ),
  calendar: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  apple: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 15.546c-.523 0-1.046.151-1.5.454a2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.704 2.704 0 00-3 0 2.704 2.704 0 01-3 0 2.701 2.701 0 00-1.5-.454M9 6v2m3-2v2m3-2v2M9 3h.01M12 3h.01M15 3h.01M21 21v-7a2 2 0 00-2-2H5a2 2 0 00-2 2v7h18zm-3-9v-2a2 2 0 00-2-2H8a2 2 0 00-2 2v2h12z" />
    </svg>
  ),
  document: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  camera: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0zM19 11v6" />
    </svg>
  ),
  form: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
    </svg>
  ),
  chart: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
    </svg>
  ),
  cog: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
  ),
  logout: (
    <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
    </svg>
  ),
};

const navSections = [
  {
    title: "Overview",
    links: [{ href: "/app", label: "Overview", icon: icons.chart }],
  },
  {
    title: "Training",
    links: [
      { href: "/app/members", label: "Members", icon: icons.users },
      { href: "/app/exercises", label: "Exercises", icon: icons.dumbbell },
      { href: "/app/muscle-groups", label: "Muscle Groups", icon: icons.body },
      { href: "/app/workout-modules", label: "Workout Modules", icon: icons.layers },
      { href: "/app/workout-plans", label: "Workout Plans", icon: icons.clipboard },
      { href: "/app/sessions", label: "Sessions", icon: icons.calendar },
    ],
  },
  {
    title: "Nutrition",
    links: [
      { href: "/app/meals", label: "Meals", icon: icons.apple },
      { href: "/app/meal-categories", label: "Meal Categories", icon: icons.body },
      { href: "/app/meals-modules", label: "Meals Modules", icon: icons.layers },
      { href: "/app/meal-plans", label: "Meal Plans", icon: icons.clipboard },
      { href: "/app/meal-logs", label: "Meal Logs", icon: icons.document },
    ],
  },
  {
    title: "Tracking",
    links: [
      { href: "/app/forms", label: "Forms", icon: icons.form },
      { href: "/app/reports", label: "Reports", icon: icons.chart },
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
      <div className="flex min-h-screen items-center justify-center bg-default-100 dark:bg-default-50">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <div className="gym-app flex min-h-screen bg-default-100 dark:bg-default-50">
      {/* Topbar: same background as sidebar */}
      <header className="fixed top-0 left-0 right-0 z-50 flex h-14 shrink-0 items-center justify-between border-b border-default-200 bg-default-200 px-4 dark:bg-default-100">
        <div className="flex items-center gap-2">
          <Button
            isIconOnly
            aria-label="Toggle menu"
            variant="light"
            className="gym-sidebar-toggle lg:hidden"
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
          <Button
            as={Link}
            href="/app"
            variant="light"
            className="gym-topbar-brand h-auto px-2 py-1.5 text-base font-semibold text-foreground hover:bg-default-100"
            onPress={() => setSidebarOpen(false)}
          >
            Gym Coach
          </Button>
        </div>
        <div className="flex items-center gap-2">
          <Button
            as={Link}
            href="/app"
            variant="light"
            size="sm"
            className="hidden sm:inline-flex"
          >
            Coach Profile
          </Button>
          <Button
            variant="light"
            size="sm"
            className="gap-1.5"
            startContent={icons.logout}
            onPress={handleLogout}
          >
            Sign out
          </Button>
        </div>
      </header>

      <aside
        className={`gym-sidebar fixed left-0 top-14 z-40 flex h-[calc(100vh-3.5rem)] w-64 flex-col transform overflow-hidden border-r border-default-200 bg-default-200 dark:bg-default-100 transition-transform duration-200 lg:translate-x-0 pt-2 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollShadow
            hideScrollBar
            size={60}
            className="gym-sidebar-scroll min-h-0 flex-1 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 px-3 pb-4 pt-1">
              {navSections.map((section) => (
                <div key={section.title} className="gym-sidebar-section">
                  <p className="gym-sidebar-header mb-1.5 px-3 py-0 text-xs font-semibold tracking-wider text-default-600">
                    {section.title}
                  </p>
                  <ul className="space-y-1">
                    {section.links.map((item) => (
                      <li key={item.href}>
                        <Button
                          as={Link}
                          href={item.href}
                          variant="light"
                          className={`gym-sidebar-link h-auto min-h-8 w-full justify-start gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-foreground/80 hover:bg-default-100 hover:text-foreground ${
                            pathname === item.href ? "gym-sidebar-link-active bg-primary text-primary-foreground hover:bg-primary-600 hover:text-primary-foreground" : ""
                          }`}
                          startContent={<span className="gym-sidebar-icon opacity-50">{item.icon}</span>}
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
          <div className="shrink-0 p-3">
            {mounted && (
              <Button
                variant="light"
                size="sm"
                className="gym-sidebar-link h-auto w-full justify-start px-3 py-1.5 text-left text-sm text-foreground hover:bg-default-100"
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
          </div>
        </div>
      </aside>

      <main className="gym-main min-h-screen flex-1 pt-20 lg:pl-64">
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
