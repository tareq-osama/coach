"use client";

import { useState, useRef } from "react";
import { Avatar, Button, Image, Spinner } from "@heroui/react";
import { imageUrl } from "@/lib/image-url";

const DEFAULT_ACCEPT = "image/jpeg,image/png,image/gif,image/webp";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

const UploadIcon = () => (
  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const ReplaceIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
    <path d="M3 3v5h5" />
    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
    <path d="M16 21h5v-5" />
  </svg>
);

const RemoveIcon = () => (
  <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 6h18" />
    <path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" />
    <path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" />
    <line x1="10" y1="11" x2="10" y2="17" />
    <line x1="14" y1="11" x2="14" y2="17" />
  </svg>
);

/**
 * Reusable image uploader using R2 via /api/upload (proxy URLs).
 * - value: current image URL
 * - onValueChange: (url) => void
 * - prefix: R2 key prefix (e.g. "members", "thumbnails")
 * - variant: "avatar" (circle + hover overlay) | "field" (preview + upload input)
 * - acceptImagesOnly: use default image MIME types (future: add more extension toggles)
 */
export default function ImageUploader({
  value,
  onValueChange,
  prefix = "gym",
  variant = "field",
  acceptImagesOnly = true,
  label,
  avatarSize = "lg", // "sm" | "md" | "lg" for avatar variant
  fallbackName,
  className = "",
}) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [hover, setHover] = useState(false);
  const inputRef = useRef(null);

  const accept = acceptImagesOnly ? DEFAULT_ACCEPT : "image/*";

  async function handleFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploadError("");
    setUploading(true);
    try {
      const formData = new FormData();
      formData.append("file", file);
      formData.append("prefix", prefix);
      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details || "Upload failed");
      if (data.url) onValueChange(data.url);
    } catch (err) {
      setUploadError(err.message);
    } finally {
      setUploading(false);
      if (inputRef.current) inputRef.current.value = "";
    }
  }

  function handleRemove() {
    onValueChange("");
    setUploadError("");
  }

  if (variant === "avatar") {
    const sizeClasses = {
      sm: "w-16 h-16",
      md: "w-20 h-20",
      lg: "w-24 h-24",
    };
    const sizeClass = sizeClasses[avatarSize] || sizeClasses.lg;
    const displayUrl = imageUrl(value) || undefined;

    return (
      <div
        className={`relative inline-block ${sizeClass} ${className}`}
        onMouseEnter={() => setHover(true)}
        onMouseLeave={() => setHover(false)}
      >
        <input
          ref={inputRef}
          type="file"
          accept={accept}
          className="hidden"
          onChange={handleFileChange}
        />
        <Avatar
          src={displayUrl}
          name={fallbackName || "?"}
          className={`${sizeClass} ring-4 ring-background transition-opacity ${hover ? "opacity-80" : ""}`}
          showFallback
        />
        {hover && (
          <div className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-full bg-black/50 ring-4 ring-background">
            {uploading ? (
              <Spinner size="sm" color="primary" classNames={{ circle1: "border-b-primary-foreground", circle2: "border-primary-foreground" }} />
            ) : displayUrl ? (
              <div className="flex items-center gap-1.5">
                <Button
                  isIconOnly
                  size="sm"
                  color="primary"
                  variant="flat"
                  aria-label="Replace photo"
                  onPress={() => inputRef.current?.click()}
                  className="min-w-8 min-h-8"
                >
                  <ReplaceIcon />
                </Button>
                <Button
                  isIconOnly
                  size="sm"
                  color="danger"
                  variant="flat"
                  aria-label="Remove photo"
                  onPress={handleRemove}
                  className="min-w-8 min-h-8"
                >
                  <RemoveIcon />
                </Button>
              </div>
            ) : (
              <Button
                size="sm"
                color="primary"
                variant="flat"
                className="min-w-0 text-xs"
                onPress={() => inputRef.current?.click()}
                startContent={<UploadIcon />}
              >
                Upload
              </Button>
            )}
          </div>
        )}
        {uploadError && (
          <p className="mt-1 max-w-48 text-xs text-danger-500">{uploadError}</p>
        )}
      </div>
    );
  }

  // Field variant: preview + optional URL input + upload button (like ThumbnailUpload)
  return (
    <div className={`flex flex-col gap-2 ${className}`}>
      {label && (
        <label className="text-sm font-medium text-default-600">{label}</label>
      )}
      <div className="flex flex-wrap items-end gap-4">
        <div className="h-20 w-20 shrink-0 overflow-hidden rounded-lg bg-default-100">
          <Image
            alt=""
            className="h-full w-full object-cover"
            src={imageUrl(value) || PLACEHOLDER_IMG}
            width={80}
            height={80}
          />
        </div>
        <div className="min-w-0 flex-1 space-y-2">
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept={accept}
              className="hidden"
              onChange={handleFileChange}
            />
            <Button
              size="sm"
              variant="flat"
              onPress={() => inputRef.current?.click()}
              isLoading={uploading}
              isDisabled={uploading}
            >
              {uploading ? "Uploading…" : "Upload image"}
            </Button>
            {value && (
              <Button size="sm" variant="light" color="danger" onPress={handleRemove}>
                Remove
              </Button>
            )}
          </div>
          {uploadError && (
            <p className="text-xs text-danger-500">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
