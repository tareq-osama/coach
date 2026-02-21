"use client";

import { useEffect } from "react";

function applyTheme(theme) {
  if (!theme || typeof theme !== "object") return;
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const colors = isDark ? theme.dark?.colors : theme.light?.colors;
  const primary = colors?.primary?.DEFAULT ?? theme.primary;
  const focus = colors?.focus ?? theme.focus;
  if (primary) root.style.setProperty("--gym-primary", primary);
  if (focus) root.style.setProperty("--gym-focus", focus);
  if (isDark && theme.dark?.colors?.sidebar) {
    const s = theme.dark.colors.sidebar;
    if (s.DEFAULT) root.style.setProperty("--gym-sidebar-bg", s.DEFAULT);
    if (s["200"]) root.style.setProperty("--gym-sidebar-border", s["200"]);
    if (s.foreground) {
      root.style.setProperty("--gym-sidebar-text", s.foreground);
      root.style.setProperty("--gym-sidebar-text-muted", s["500"] ?? s.foreground);
    }
    root.style.setProperty("--gym-sidebar-hover", "rgba(255, 255, 255, 0.06)");
    root.style.setProperty("--gym-sidebar-active-bg", "rgba(255, 255, 255, 0.1)");
  }
}

export default function ThemeInjector() {
  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/theme");
        const data = await res.json();
        if (!cancelled && data && typeof data === "object") applyTheme(data);
      } catch (_) {}
    })();
    const onUpdate = (e) => {
      if (e?.detail && typeof e.detail === "object") applyTheme(e.detail);
    };
    window.addEventListener("pulse-theme-updated", onUpdate);
    return () => {
      cancelled = true;
      window.removeEventListener("pulse-theme-updated", onUpdate);
    };
  }, []);

  return null;
}
