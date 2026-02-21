/**
 * Full theme structure matching tailwind.config.js / HeroUI.
 * Used as default and for deep merge with saved overrides.
 */
export const SCALE_GRADES = ["50", "100", "200", "300", "400", "500", "600", "700", "800", "900", "DEFAULT", "foreground"];
export const SCALE_COLOR_KEYS = ["default", "primary", "secondary", "success", "warning", "danger"];
export const CONTENT_KEYS = ["content1", "content2", "content3", "content4"];
export const SEMANTIC_SIMPLE = ["background", "foreground", "focus", "overlay"];

export const DEFAULT_THEME = {
  light: {
    colors: {
      default: {
        50: "#fafafa", 100: "#f2f2f3", 200: "#ebebec", 300: "#e3e3e6", 400: "#dcdcdf",
        500: "#d4d4d8", 600: "#afafb2", 700: "#8a8a8c", 800: "#656567", 900: "#404041",
        foreground: "#000", DEFAULT: "#d4d4d8",
      },
      primary: {
        50: "#dfedfd", 100: "#b3d4fa", 200: "#86bbf7", 300: "#59a1f4", 400: "#2d88f1",
        500: "#006fee", 600: "#005cc4", 700: "#00489b", 800: "#003571", 900: "#002147",
        foreground: "#fff", DEFAULT: "#006fee",
      },
      secondary: {
        50: "#eee4f8", 100: "#d7bfef", 200: "#bf99e5", 300: "#a773db", 400: "#904ed2",
        500: "#7828c8", 600: "#6321a5", 700: "#4e1a82", 800: "#39135f", 900: "#240c3c",
        foreground: "#fff", DEFAULT: "#7828c8",
      },
      success: {
        50: "#e2f8ec", 100: "#b9efd1", 200: "#91e5b5", 300: "#68dc9a", 400: "#40d27f",
        500: "#17c964", 600: "#13a653", 700: "#0f8341", 800: "#0b5f30", 900: "#073c1e",
        foreground: "#000", DEFAULT: "#17c964",
      },
      warning: {
        50: "#fef4e4", 100: "#fce4bd", 200: "#fad497", 300: "#f9c571", 400: "#f7b54a",
        500: "#f5a524", 600: "#ca881e", 700: "#9f6b17", 800: "#744e11", 900: "#4a320b",
        foreground: "#000", DEFAULT: "#f5a524",
      },
      danger: {
        50: "#fee1eb", 100: "#fbb8cf", 200: "#f98eb3", 300: "#f76598", 400: "#f53b7c",
        500: "#f31260", 600: "#c80f4f", 700: "#9e0c3e", 800: "#73092e", 900: "#49051d",
        foreground: "#000", DEFAULT: "#f31260",
      },
      background: "#ffffff",
      foreground: "#000000",
      content1: { DEFAULT: "#ffffff", foreground: "#000" },
      content2: { DEFAULT: "#f4f4f5", foreground: "#000" },
      content3: { DEFAULT: "#e4e4e7", foreground: "#000" },
      content4: { DEFAULT: "#d4d4d8", foreground: "#000" },
      focus: "#00eb95",
      overlay: "#ffffff",
    },
  },
  dark: {
    colors: {
      default: {
        50: "#040709", 100: "#080e11", 200: "#0c141a", 300: "#101b22", 400: "#14222b",
        500: "#434e55", 600: "#727a80", 700: "#a1a7aa", 800: "#d0d3d5", 900: "#ffffff",
        foreground: "#fff", DEFAULT: "#14222b",
      },
      primary: {
        50: "#002147", 100: "#003571", 200: "#00489b", 300: "#005cc4", 400: "#006fee",
        500: "#2d88f1", 600: "#59a1f4", 700: "#86bbf7", 800: "#b3d4fa", 900: "#dfedfd",
        foreground: "#fff", DEFAULT: "#006fee",
      },
      secondary: {
        50: "#240c3c", 100: "#39135f", 200: "#4e1a82", 300: "#6321a5", 400: "#7828c8",
        500: "#904ed2", 600: "#a773db", 700: "#bf99e5", 800: "#d7bfef", 900: "#eee4f8",
        foreground: "#fff", DEFAULT: "#7828c8",
      },
      success: {
        50: "#073c1e", 100: "#0b5f30", 200: "#0f8341", 300: "#13a653", 400: "#17c964",
        500: "#40d27f", 600: "#68dc9a", 700: "#91e5b5", 800: "#b9efd1", 900: "#e2f8ec",
        foreground: "#000", DEFAULT: "#17c964",
      },
      warning: {
        50: "#4a320b", 100: "#744e11", 200: "#9f6b17", 300: "#ca881e", 400: "#f5a524",
        500: "#f7b54a", 600: "#f9c571", 700: "#fad497", 800: "#fce4bd", 900: "#fef4e4",
        foreground: "#000", DEFAULT: "#f5a524",
      },
      danger: {
        50: "#49051d", 100: "#73092e", 200: "#9e0c3e", 300: "#c80f4f", 400: "#f31260",
        500: "#f53b7c", 600: "#f76598", 700: "#f98eb3", 800: "#fbb8cf", 900: "#fee1eb",
        foreground: "#000", DEFAULT: "#f31260",
      },
      background: "#000000",
      foreground: "#ffffff",
      content1: { DEFAULT: "#18181b", foreground: "#fff" },
      content2: { DEFAULT: "#27272a", foreground: "#fff" },
      content3: { DEFAULT: "#3f3f46", foreground: "#fff" },
      content4: { DEFAULT: "#52525b", foreground: "#fff" },
      focus: "#00eb95",
      overlay: "#000000",
      sidebar: {
        50: "#000d21", 100: "#0a1630", 200: "#0f2847", 300: "#142840", 400: "#1a3a5c",
        500: "#94a3b8", 600: "#cbd5e1", 700: "#e2e8f0", 800: "#e2e8f0", 900: "#f8fafc",
        foreground: "#e2e8f0", DEFAULT: "#000d21",
      },
    },
  },
};

/** Deep merge: defaults first, then overrides (saved theme). */
export function deepMergeTheme(defaults, overrides) {
  if (!overrides || typeof overrides !== "object") return JSON.parse(JSON.stringify(defaults));
  const out = JSON.parse(JSON.stringify(defaults));
  function assign(target, source) {
    for (const k of Object.keys(source ?? {})) {
      const v = source[k];
      if (v != null && typeof v === "object" && !Array.isArray(v) && (v.DEFAULT !== undefined || v.foreground !== undefined || Object.keys(v).every((g) => ["50","100","200","300","400","500","600","700","800","900","DEFAULT","foreground"].includes(g)))) {
        if (target[k] == null) target[k] = {};
        assign(target[k], v);
      } else {
        target[k] = typeof v === "object" && v != null && !Array.isArray(v) ? JSON.parse(JSON.stringify(v)) : v;
      }
    }
  }
  if (overrides.light?.colors) assign(out.light.colors, overrides.light.colors);
  if (overrides.dark?.colors) assign(out.dark.colors, overrides.dark.colors);
  return out;
}
