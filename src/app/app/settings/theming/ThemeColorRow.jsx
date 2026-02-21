"use client";

import { useCallback, useState, useEffect } from "react";
import { Input } from "@heroui/react";

// Sync text from parent value when it changes (e.g. reset)
function useSyncValue(value) {
  const [text, setText] = useState(value ?? "");
  useEffect(() => {
    setText(value ?? "");
  }, [value]);
  return [text, setText];
}

/** Normalize to hex for native color input; accept rgba by showing hex or raw. */
function toHexForInput(value) {
  if (!value || typeof value !== "string") return "#000000";
  const v = value.trim();
  if (/^#[0-9A-Fa-f]{6}$/.test(v)) return v;
  if (/^#[0-9A-Fa-f]{3}$/.test(v)) return v.length === 4 ? `#${v[1]}${v[1]}${v[2]}${v[2]}${v[3]}${v[3]}` : v;
  const rgb = v.match(/^rgba?\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)/);
  if (rgb) {
    const r = Number(rgb[1]).toString(16).padStart(2, "0");
    const g = Number(rgb[2]).toString(16).padStart(2, "0");
    const b = Number(rgb[3]).toString(16).padStart(2, "0");
    return `#${r}${g}${b}`;
  }
  return v.startsWith("#") ? v : `#${v.replace(/^#/, "")}`;
}

export default function ThemeColorRow({ label, value, onChange, size = "sm" }) {
  const [text, setText] = useSyncValue(value);
  const hexForPicker = toHexForInput(value ?? "#000000");

  const handleColorChange = useCallback(
    (e) => {
      const hex = e.target.value;
      const currentHex = toHexForInput(value ?? "#000000");
      if (hex === currentHex) return;
      setText(hex);
      onChange(hex);
    },
    [value, onChange]
  );

  const handleTextChange = useCallback(
    (v) => {
      setText(v);
      if (/^#[0-9A-Fa-f]{6}$/.test(v) || /^#[0-9A-Fa-f]{3}$/.test(v) || /^rgba?\(/.test(v)) {
        onChange(v);
      }
    },
    [onChange]
  );

  return (
    <div className="flex flex-wrap items-center gap-2">
      <span className="w-16 shrink-0 text-sm text-default-600">{label}</span>
      <input
        type="color"
        value={hexForPicker}
        onChange={handleColorChange}
        className="h-9 w-9 shrink-0 cursor-pointer rounded-md border border-default-200 bg-transparent p-0.5 dark:border-default-100"
        aria-label={`${label} color`}
      />
      <Input
        size={size}
        value={text}
        onValueChange={handleTextChange}
        onBlur={() => setText(value ?? "")}
        placeholder="#000000"
        classNames={{ input: "font-mono text-sm", inputWrapper: "min-h-8" }}
        className="min-w-[120px] max-w-[140px]"
        aria-label={`${label} hex`}
      />
    </div>
  );
}
