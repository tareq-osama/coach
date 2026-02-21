"use client";

import { useEffect } from "react";

const PREFIX = "heroui";

/** Hex to "H S% L%" for HeroUI CSS vars */
function hexToHsl(hex) {
  if (!hex || typeof hex !== "string") return null;
  let s = hex.replace(/^#/, "");
  if (s.length === 3) s = s[0] + s[0] + s[1] + s[1] + s[2] + s[2];
  if (s.length !== 6) return null;
  const r = parseInt(s.slice(0, 2), 16) / 255;
  const g = parseInt(s.slice(2, 4), 16) / 255;
  const b = parseInt(s.slice(4, 6), 16) / 255;
  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  let h = 0;
  let s2 = 0;
  const l = (max + min) / 2;
  if (max !== min) {
    const d = max - min;
    s2 = l > 0.5 ? d / (2 - max - min) : d / (max + min);
    switch (max) {
      case r: h = ((g - b) / d + (g < b ? 6 : 0)) / 6; break;
      case g: h = ((b - r) / d + 2) / 6; break;
      default: h = ((r - g) / d + 4) / 6; break;
    }
  }
  h = Math.round(h * 360);
  const sPct = Math.round(s2 * 100);
  const lPct = Math.round(l * 100);
  return `${h} ${sPct}% ${lPct}%`;
}

/** Flatten colors like HeroUI: "primary-50", "primary" (from DEFAULT), "content1-foreground", etc. */
function flattenThemeColors(colors) {
  const out = {};
  function step(obj, prefix) {
    for (const key of Object.keys(obj ?? {})) {
      const v = obj[key];
      const flatKey = prefix ? `${prefix}-${key}` : key;
      if (v != null && typeof v === "object" && !Array.isArray(v) && (v.DEFAULT !== undefined || v.foreground !== undefined || ["50","100","200","300","400","500","600","700","800","900"].some((g) => v[g] !== undefined))) {
        step(v, flatKey);
      } else if (typeof v === "string") {
        out[flatKey] = v;
      }
    }
  }
  step(colors, "");
  const normalized = {};
  for (const k of Object.keys(out)) {
    const newKey = k.endsWith("-DEFAULT") ? k.replace(/-DEFAULT$/, "") : k;
    normalized[newKey] = out[k];
  }
  return normalized;
}

function buildOverridesCss(theme) {
  if (!theme?.light?.colors && !theme?.dark?.colors) return "";
  const lines = [];
  const cache = {};
  function toHsl(hex) {
    if (!cache[hex]) cache[hex] = hexToHsl(hex);
    return cache[hex];
  }
  if (theme.light?.colors) {
    const flat = flattenThemeColors(theme.light.colors);
    lines.push(":root {");
    for (const [name, value] of Object.entries(flat)) {
      const hsl = toHsl(value);
      if (hsl) lines.push(`  --${PREFIX}-${name}: ${hsl};`);
    }
    lines.push("}");
  }
  if (theme.dark?.colors) {
    const flat = flattenThemeColors(theme.dark.colors);
    lines.push(".dark {");
    for (const [name, value] of Object.entries(flat)) {
      const hsl = toHsl(value);
      if (hsl) lines.push(`  --${PREFIX}-${name}: ${hsl};`);
    }
    lines.push("}");
  }
  return lines.join("\n");
}

function applyTheme(theme) {
  if (!theme || typeof theme !== "object") return;
  const root = document.documentElement;
  const isDark = root.classList.contains("dark");
  const colors = isDark ? theme.dark?.colors : theme.light?.colors;
  const primary = colors?.primary?.DEFAULT ?? theme.primary;
  const focus = colors?.focus ?? theme.focus;
  if (primary) root.style.setProperty("--gym-primary", primary);
  if (focus) root.style.setProperty("--gym-focus", focus);
  if (theme.backgroundImageUrl && theme.backgroundImageUrl.trim()) {
    root.style.setProperty("--gym-main-bg-image", `url(${theme.backgroundImageUrl.trim()})`);
  } else {
    root.style.removeProperty("--gym-main-bg-image");
  }
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
  const css = buildOverridesCss(theme);
  let el = document.getElementById("pulse-theme-overrides");
  if (css) {
    if (!el) {
      el = document.createElement("style");
      el.id = "pulse-theme-overrides";
      document.head.appendChild(el);
    }
    el.textContent = css;
  } else if (el) {
    el.textContent = "";
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
