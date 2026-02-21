"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useTheme } from "next-themes";
import { Button, Spinner, Divider, ScrollShadow, Avatar, Popover, PopoverTrigger, PopoverContent } from "@heroui/react";
import { SunIcon, MoonIcon, ComputerDesktopIcon } from "@heroicons/react/24/solid";
import { useAuth } from "@/app/auth-context";
import { imageUrl } from "@/lib/image-url";
import { NAV_SECTIONS } from "./nav-config";
import { getSidebarIcons } from "./sidebar-icons";
import CoachSettingsDialog from "./components/CoachSettingsDialog";
import "./app.css";

const icons = getSidebarIcons();
const navSections = NAV_SECTIONS.map((section) => ({
  ...section,
  links: section.links.map((link) => ({ ...link, icon: icons[link.iconKey] })),
}));

const NAV_ITEM_COLORS_KEY = "gym-nav-item-colors";
const NAV_COLOR_KEYS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "10", "11", "12", "13", "14", "15", "16"];

/** Default color key (1–12) per nav href; user can override via context menu. */
const DEFAULT_NAV_ITEM_COLORS = {
  "/app": "1",
  "/app/members": "2",
  "/app/exercises": "4",
  "/app/muscle-groups": "6",
  "/app/workout-modules": "5",
  "/app/workout-plans": "2",
  "/app/sessions": "7",
  "/app/meals": "3",
  "/app/meal-categories": "8",
  "/app/meals-modules": "2",
  "/app/meal-plans": "11",
  "/app/meal-logs": "7",
  "/app/forms": "4",
  "/app/reports": "1",
  "/app/inbox": "3",
};

export default function AppLayout({ children }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, setTheme, resolvedTheme } = useTheme();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [settingsOpen, setSettingsOpen] = useState(false);
  const [popoverOpen, setPopoverOpen] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [navItemColors, setNavItemColors] = useState({});
  const [contextMenuFor, setContextMenuFor] = useState(null); // item.href when color popover is open
  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!mounted) return;
    try {
      const raw = localStorage.getItem(NAV_ITEM_COLORS_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        if (parsed && typeof parsed === "object") setNavItemColors(parsed);
      }
    } catch (_) {}
  }, [mounted]);

  const setNavItemColor = (href, colorKey) => {
    setNavItemColors((prev) => {
      const next = { ...prev, [href]: colorKey };
      try {
        localStorage.setItem(NAV_ITEM_COLORS_KEY, JSON.stringify(next));
      } catch (_) {}
      return next;
    });
  };

  const getIconColorKey = (href) => {
    const stored = navItemColors[href];
    const key = NAV_COLOR_KEYS.includes(stored) ? stored : DEFAULT_NAV_ITEM_COLORS[href] ?? "1";
    return key;
  };

  const selectedTheme = mounted ? (theme ?? "system") : "system";

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
    <div className="gym-app flex min-h-screen overflow-x-hidden bg-default-100 dark:bg-default-50">
      {/* Mobile hamburger — floating, only on small screens */}
      <Button
        isIconOnly
        aria-label="Open menu"
        variant="flat"
        className="fixed left-4 top-4 z-50 lg:hidden"
        onPress={() => setSidebarOpen(true)}
      >
        <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </Button>

      <CoachSettingsDialog
        isOpen={settingsOpen}
        onOpenChange={setSettingsOpen}
        onSaved={() => {}}
      />

      <aside
        className={`gym-sidebar fixed left-0 top-0 z-40 flex h-screen w-64 flex-col transform overflow-hidden border-r border-default-200 bg-default-200 dark:bg-default-100 transition-transform duration-200 lg:translate-x-0 ${
          sidebarOpen ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        {/* Logo + mobile close */}
        <div className="flex h-14 shrink-0 items-center justify-between border-b border-default-200 px-4">
          <Button
            as={Link}
            href="/app"
            variant="light"
            className="h-auto px-2 py-1.5 text-base font-semibold text-foreground hover:bg-default-100"
            onPress={() => setSidebarOpen(false)}
          >
            Pulse®
          </Button>
          <Button
            isIconOnly
            aria-label="Close menu"
            variant="light"
            className="lg:hidden"
            onPress={() => setSidebarOpen(false)}
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </Button>
        </div>

        <div className="flex min-h-0 flex-1 flex-col">
          <ScrollShadow
            hideScrollBar
            size={60}
            className="gym-sidebar-scroll min-h-0 flex-1 overflow-y-auto"
          >
            <nav className="flex flex-col gap-6 px-3 pb-4 pt-2">
              {navSections.map((section, idx) => (
                <div key={section.title ?? idx} className="gym-sidebar-section">
                  {section.title && (
                    <p className="gym-sidebar-header mb-1.5 px-3 py-0 text-xs font-semibold tracking-wider text-default-600">
                      {section.title}
                    </p>
                  )}
                  <ul className="space-y-1">
                    {section.links.map((item) => {
                      const isActive = pathname === item.href;
                      const colorKey = getIconColorKey(item.href);
                      const isPopoverOpen = contextMenuFor === item.href;
                      return (
                        <li key={item.href} className="flex items-center w-full">
                          <Popover
                            isOpen={isPopoverOpen}
                            onOpenChange={(open) => !open && setContextMenuFor(null)}
                            placement="right-start"
                            showArrow
                          >
                            <PopoverTrigger>
                              <div
                                className="w-full"
                                onContextMenu={(e) => {
                                  e.preventDefault();
                                  setContextMenuFor(item.href);
                                }}
                              >
                                <Button
                                  as={Link}
                                  href={item.href}
                                  variant="light"
                                  className={`gym-sidebar-link w-full min-w-0 h-auto min-h-8 justify-start gap-2 rounded-lg px-3 py-1.5 text-left text-sm text-foreground/80 hover:bg-default-100 hover:text-foreground ${
                                    isActive ? "gym-sidebar-link-active text-foreground" : ""
                                  }`}
                                  style={
                                    isActive
                                      ? {
                                          ["--active-nav-color"]: `var(--gym-nav-color-${colorKey})`,
                                          backgroundColor: `color-mix(in srgb, var(--gym-nav-color-${colorKey}) 14%, transparent)`,
                                        }
                                      : undefined
                                  }
                                  startContent={
                                    <span className="gym-sidebar-icon shrink-0 [&_svg]:size-[18px]">
                                      {item.icon}
                                    </span>
                                  }
                                  onPress={() => setSidebarOpen(false)}
                                >
                                  {item.label}
                                </Button>
                              </div>
                            </PopoverTrigger>
                            <PopoverContent className="p-1.5 w-auto">
                              <div className="grid grid-cols-4 gap-1">
                                {NAV_COLOR_KEYS.map((key) => (
                                  <button
                                    key={key}
                                    type="button"
                                    onClick={() => {
                                      setNavItemColor(item.href, key);
                                      setContextMenuFor(null);
                                    }}
                                    className={`h-[18px] w-[18px] rounded-md border border-transparent transition-transform hover:scale-110 focus:outline-none focus:ring-1 focus:ring-primary focus:ring-offset-1 ${colorKey === key ? "border-primary ring-1 ring-primary ring-offset-1" : ""}`}
                                    style={{ backgroundColor: `var(--gym-nav-color-${key})` }}
                                    aria-label={`Color ${key}`}
                                  />
                                ))}
                              </div>
                            </PopoverContent>
                          </Popover>
                        </li>
                      );
                    })}
                  </ul>
                </div>
              ))}
            </nav>
          </ScrollShadow>
        </div>
        <div className="shrink-0 border-t border-default-200 p-3">
          <Popover placement="right-start" isOpen={popoverOpen} onOpenChange={setPopoverOpen} showArrow>
            <PopoverTrigger>
              <Button
                variant="light"
                className="w-full justify-start gap-2 rounded-lg px-3 py-2 min-h-0 h-auto"
                aria-label="Coach menu"
                startContent={
                  <Avatar
                    src={user?.prefs?.avatarUrl ? imageUrl(user.prefs.avatarUrl) : undefined}
                    name={user?.name || user?.email}
                    className="w-8 h-8 shrink-0"
                    showFallback
                  />
                }
              >
                <div className="flex flex-col items-start min-w-0">
                  <span className="text-sm font-medium text-foreground truncate w-full text-left">{user?.name || "Coach"}</span>
                  <span className="text-xs text-default-500">Coach</span>
                </div>
              </Button>
            </PopoverTrigger>
            <PopoverContent className="py-2 px-1 w-[220px]">
              <div className="flex flex-col gap-2.5 w-full min-w-0">
                <div className="flex items-center gap-2.5 px-3 pt-0.5 pb-1">
                  <div className="flex flex-col min-w-0">
                    <span className="text-sm font-medium text-foreground truncate">{user?.name || "Coach"}</span>
                    <span className="text-xs text-default-600 rounded-full py-0.5 w-fit">Coach</span>
                  </div>
                </div>
                <div className="min-h-8 flex items-center px-3 py-0">
                  <p className="text-sm font-normal text-foreground truncate w-full">
                    {user?.email}
                  </p>
                </div>
                <Button
                  variant="light"
                  size="sm"
                  className="justify-between w-full"
                  endContent={icons.person}
                  onPress={() => {
                    setPopoverOpen(false);
                    setSettingsOpen(true);
                  }}
                >
                  Account
                </Button>
                <Button
                  variant="light"
                  size="sm"
                  color="danger"
                  className="justify-between w-full"
                  endContent={icons.logout}
                  onPress={() => {
                    setPopoverOpen(false);
                    handleLogout();
                  }}
                >
                  Sign out
                </Button>
                {mounted && (
                  <div className="min-h-8 flex items-center justify-between gap-3 px-3 py-0 w-full">
                    <span className="text-sm font-normal text-foreground shrink-0">Theme</span>
                    <div className="flex rounded-md bg-default-100 dark:bg-default-100 p-0.5 gap-0.5 shrink-0">
                      <Button
                        isIconOnly
                        size="sm"
                        variant={selectedTheme === "light" ? "solid" : "light"}
                        color={selectedTheme === "light" ? "primary" : "default"}
                        aria-label="Light mode"
                        className="min-w-6 min-h-6 w-6 h-6 [&_svg]:h-4 [&_svg]:w-4"
                        onPress={() => setTheme("light")}
                      >
                        <SunIcon />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant={selectedTheme === "dark" ? "solid" : "light"}
                        color={selectedTheme === "dark" ? "primary" : "default"}
                        aria-label="Dark mode"
                        className="min-w-6 min-h-6 w-6 h-6 [&_svg]:h-4 [&_svg]:w-4"
                        onPress={() => setTheme("dark")}
                      >
                        <MoonIcon />
                      </Button>
                      <Button
                        isIconOnly
                        size="sm"
                        variant={selectedTheme === "system" ? "solid" : "light"}
                        color={selectedTheme === "system" ? "primary" : "default"}
                        aria-label="System theme"
                        className="min-w-6 min-h-6 w-6 h-6 [&_svg]:h-4 [&_svg]:w-4"
                        onPress={() => setTheme("system")}
                      >
                        <ComputerDesktopIcon />
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>
        </div>
      </aside>

      <main className="gym-main min-h-screen flex-1 min-w-0 py-8 lg:pl-64">
        <div className="mx-auto max-w-6xl px-4">{children}</div>
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
