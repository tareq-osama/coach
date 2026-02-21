"use client";

import { useState, useEffect, useCallback } from "react";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Spinner,
  Tabs,
  Tab,
  Accordion,
  AccordionItem,
} from "@heroui/react";
import { ArrowPathIcon, CheckIcon, ClipboardDocumentIcon } from "@heroicons/react/24/solid";
import {
  DEFAULT_THEME,
  deepMergeTheme,
  SCALE_GRADES,
  SCALE_COLOR_KEYS,
  CONTENT_KEYS,
  SEMANTIC_SIMPLE,
} from "./theme-defaults";
import ThemeColorRow from "./ThemeColorRow";

function setByPath(obj, path, value) {
  const root = { ...obj };
  let cur = root;
  for (let i = 0; i < path.length - 1; i++) {
    const p = path[i];
    const next = path[i + 1];
    cur[p] = Array.isArray(cur[p]) ? [...cur[p]] : { ...(cur[p] ?? {}) };
    cur = cur[p];
  }
  cur[path[path.length - 1]] = value;
  return root;
}

const SCALE_LABELS = {
  default: "Default / neutral",
  primary: "Primary",
  secondary: "Secondary",
  success: "Success",
  warning: "Warning",
  danger: "Danger",
};

export default function ThemingPage() {
  const [theme, setTheme] = useState(() => deepMergeTheme(DEFAULT_THEME, {}));
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const res = await fetch("/api/admin/theme");
        const data = await res.json();
        if (!cancelled && data && typeof data === "object") {
          setTheme(deepMergeTheme(DEFAULT_THEME, data));
        }
      } catch (_) {
        if (!cancelled) setTheme(deepMergeTheme(DEFAULT_THEME, {}));
      } finally {
        if (!cancelled) setLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, []);

  const update = useCallback((mode, path, value) => {
    setTheme((t) => setByPath(t, [mode, "colors", ...path], value));
  }, []);

  // Instant preview: apply current theme to app when theme state changes
  useEffect(() => {
    if (typeof window === "undefined") return;
    window.dispatchEvent(new CustomEvent("pulse-theme-updated", { detail: theme }));
  }, [theme]);

  /** Format current theme as the object to paste into tailwind.config.js (heroui themes) */
  const getThemeConfigSnippet = useCallback(() => {
    const themesBlock = {
      light: theme.light,
      dark: theme.dark,
    };
    return `themes: ${JSON.stringify(themesBlock, null, 2).replace(/^/m, "      ")}`;
  }, [theme]);

  const handleCopyConfig = useCallback(async () => {
    const snippet = getThemeConfigSnippet();
    try {
      await navigator.clipboard.writeText(snippet);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (_) {}
  }, [getThemeConfigSnippet]);

  const handleSave = async () => {
    setSaving(true);
    setSaved(false);
    try {
      const res = await fetch("/api/admin/theme", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(theme),
      });
      if (!res.ok) throw new Error(await res.text());
      setSaved(true);
      if (typeof window !== "undefined") {
        window.dispatchEvent(new CustomEvent("pulse-theme-updated", { detail: theme }));
      }
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = () => {
    setTheme(deepMergeTheme(DEFAULT_THEME, {}));
  };

  if (loading) {
    return (
      <div className="flex min-h-[200px] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  const renderScaleColor = (mode, scaleKey) => {
    const scale = theme[mode]?.colors?.[scaleKey];
    if (!scale || typeof scale !== "object") return null;
    return (
      <Card key={scaleKey} className="border border-default-200">
        <CardHeader className="pb-2">
          <span className="text-sm font-medium capitalize text-foreground">
            {SCALE_LABELS[scaleKey] ?? scaleKey}
          </span>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SCALE_GRADES.map((grade) => (
              <ThemeColorRow
                key={grade}
                label={grade}
                value={scale[grade]}
                onChange={(v) => update(mode, [scaleKey, grade], v)}
              />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  const renderSemantic = (mode) => {
    const colors = theme[mode]?.colors ?? {};
    return (
      <div className="space-y-4">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {SEMANTIC_SIMPLE.map((key) => {
            const v = colors[key];
            if (v == null || typeof v === "object") return null;
            return (
              <ThemeColorRow
                key={key}
                label={key}
                value={v}
                onChange={(val) => update(mode, [key], val)}
              />
            );
          })}
        </div>
        <div>
          <p className="mb-2 text-xs font-medium text-default-500">Content (DEFAULT + foreground)</p>
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {CONTENT_KEYS.map((key) => {
              const content = colors[key];
              if (!content || typeof content !== "object") return null;
              return (
                <Card key={key} className="border border-default-200">
                  <CardBody className="gap-2 p-3">
                    <span className="text-xs font-medium text-default-600">{key}</span>
                    <ThemeColorRow
                      label="DEFAULT"
                      value={content.DEFAULT}
                      onChange={(v) => update(mode, [key, "DEFAULT"], v)}
                    />
                    <ThemeColorRow
                      label="foreground"
                      value={content.foreground}
                      onChange={(v) => update(mode, [key, "foreground"], v)}
                    />
                  </CardBody>
                </Card>
              );
            })}
          </div>
        </div>
      </div>
    );
  };

  const renderSidebar = (mode) => {
    const sidebar = theme[mode]?.colors?.sidebar;
    if (!sidebar || mode !== "dark") return null;
    return (
      <Card className="border border-default-200">
        <CardHeader className="pb-2">
          <span className="text-sm font-medium text-foreground">Sidebar palette</span>
          <span className="text-xs text-default-500">(Dark mode only)</span>
        </CardHeader>
        <CardBody className="pt-0">
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {SCALE_GRADES.map((grade) => (
              <ThemeColorRow
                key={grade}
                label={grade}
                value={sidebar[grade]}
                onChange={(v) => update("dark", ["sidebar", grade], v)}
              />
            ))}
          </div>
        </CardBody>
      </Card>
    );
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-foreground">Theme colors</h2>
            <p className="text-sm text-default-500">
              All theme variables in a hierarchy. Light and dark modes, scale grades, and semantic tokens.
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button
              variant="flat"
              size="sm"
              onPress={handleCopyConfig}
              startContent={copied ? <CheckIcon className="h-4 w-4" /> : <ClipboardDocumentIcon className="h-4 w-4" />}
            >
              {copied ? "Copied!" : "Copy for tailwind.config.js"}
            </Button>
            <Button
              variant="flat"
              size="sm"
              onPress={handleReset}
              startContent={<ArrowPathIcon className="h-4 w-4" />}
            >
              Reset to default
            </Button>
            <Button
              color="primary"
              size="sm"
              onPress={handleSave}
              isLoading={saving}
              startContent={saved ? <CheckIcon className="h-4 w-4" /> : null}
            >
              {saved ? "Saved" : "Save changes"}
            </Button>
          </div>
        </CardHeader>
      </Card>

      <Tabs aria-label="Theme mode" variant="underlined">
        <Tab key="light" id="light" title="Light mode">
          <div className="py-4">
            <Accordion selectionMode="multiple" defaultExpandedKeys={["scale", "semantic"]}>
              <AccordionItem key="scale" aria-label="Scale colors" title="Scale colors">
                <div className="flex flex-col gap-4 pb-2">
                  {SCALE_COLOR_KEYS.map((key) => renderScaleColor("light", key))}
                </div>
              </AccordionItem>
              <AccordionItem key="semantic" aria-label="Semantic" title="Semantic (background, foreground, focus, content)">
                {renderSemantic("light")}
              </AccordionItem>
            </Accordion>
          </div>
        </Tab>
        <Tab key="dark" id="dark" title="Dark mode">
          <div className="py-4">
            <Accordion selectionMode="multiple" defaultExpandedKeys={["scale", "semantic", "sidebar"]}>
              <AccordionItem key="scale" aria-label="Scale colors" title="Scale colors">
                <div className="flex flex-col gap-4 pb-2">
                  {SCALE_COLOR_KEYS.map((key) => renderScaleColor("dark", key))}
                </div>
              </AccordionItem>
              <AccordionItem key="semantic" aria-label="Semantic" title="Semantic (background, foreground, focus, content)">
                {renderSemantic("dark")}
              </AccordionItem>
              <AccordionItem key="sidebar" aria-label="Sidebar" title="Sidebar palette">
                <div className="pb-2">{renderSidebar("dark")}</div>
              </AccordionItem>
            </Accordion>
          </div>
        </Tab>
      </Tabs>
    </div>
  );
}
