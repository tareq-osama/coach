"use client";

import { useState, useRef } from "react";
import { Input, Button, Image, Spinner } from "@heroui/react";
import { imageUrl } from "@/lib/image-url";

const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

/**
 * Thumbnail field: optional image upload to R2 + URL input.
 * - value: current thumbnail URL
 * - onValueChange: (url) => void
 * - label: optional label
 * - prefix: optional R2 key prefix (default "thumbnails")
 */
export default function ThumbnailUpload({ value, onValueChange, label = "Thumbnail URL", prefix = "thumbnails" }) {
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const inputRef = useRef(null);

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

  return (
    <div className="flex flex-col gap-2">
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
          <Input
            value={value || ""}
            onValueChange={onValueChange}
            placeholder="https://… or upload below"
            size="sm"
          />
          <div className="flex items-center gap-2">
            <input
              ref={inputRef}
              type="file"
              accept="image/jpeg,image/png,image/gif,image/webp"
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
          </div>
          {uploadError && (
            <p className="text-xs text-danger-500">{uploadError}</p>
          )}
        </div>
      </div>
    </div>
  );
}
