"use client";

import { useState } from "react";
import { Card, CardBody, CardHeader, Button, Input, Image } from "@heroui/react";
import { useGymList } from "../../use-gym-list";
import { getFilePreviewUrl } from "@/lib/appwrite-storage";

export default function ProgressPhotosSection({ memberId }) {
  const { data: photos, loading, refetch } = useGymList("progress-photos");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");
  const [photoDate, setPhotoDate] = useState("");
  const [file, setFile] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  const memberPhotos = (photos ?? []).filter((p) => p.member_id === memberId);

  async function handleUpload(e) {
    e.preventDefault();
    setUploadError("");
    if (!photoDate || !file) {
      setUploadError("Select date and photo.");
      return;
    }
    setUploading(true);
    try {
      const formData = new FormData();
      formData.set("member_id", memberId);
      formData.set("photo_date", photoDate);
      formData.set("file", file);
      const res = await fetch("/api/gym/progress-photos", { method: "POST", body: formData });
      const json = await res.json();
      if (json.error) throw new Error(json.details || json.error);
      setPhotoDate("");
      setFile(null);
      refetch();
    } catch (err) {
      setUploadError(err?.message ?? "Upload failed.");
    } finally {
      setUploading(false);
    }
  }

  async function handleDelete(id) {
    setDeletingId(id);
    try {
      const res = await fetch(`/api/gym/progress-photos/${id}`, { method: "DELETE" });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        throw new Error(json.details || json.error || "Delete failed");
      }
      refetch();
    } catch (err) {
      setUploadError(err?.message ?? "Delete failed.");
    } finally {
      setDeletingId(null);
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between gap-2 pb-2">
        <h2 className="text-lg font-medium text-foreground">Progress Photos</h2>
      </CardHeader>
      <CardBody className="pt-0 gap-4">
        <form onSubmit={handleUpload} className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-end">
          {uploadError && (
            <div className="w-full rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-100 dark:text-danger-800">
              {uploadError}
            </div>
          )}
          <Input
            type="date"
            label="Photo date"
            value={photoDate}
            onValueChange={setPhotoDate}
            isRequired
            size="sm"
            className="max-w-[180px]"
          />
          <Input
            type="file"
            accept="image/*"
            label="Photo"
            size="sm"
            onChange={(e) => setFile(e.target.files?.[0] ?? null)}
            classNames={{ input: "file:mr-2 file:py-1 file:rounded file:border-0 file:bg-primary file:text-primary-foreground file:text-xs" }}
          />
          <Button type="submit" color="primary" size="sm" isLoading={uploading} isDisabled={!photoDate || !file}>
            Upload
          </Button>
        </form>

        {loading ? (
          <p className="text-sm text-default-500">Loading photos…</p>
        ) : memberPhotos.length === 0 ? (
          <p className="text-sm text-default-500">No progress photos yet. Upload one above.</p>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {memberPhotos.map((p) => {
              const src = getFilePreviewUrl(p.file_id, 300, 300) ?? getFilePreviewUrl(p.file_id);
              return (
                <Card key={p.$id} className="overflow-hidden">
                  <CardBody className="p-0">
                    <div className="relative aspect-square bg-default-100">
                      {src ? (
                        <Image
                          src={src}
                          alt={p.name || "Progress photo"}
                          className="h-full w-full object-cover"
                          radius="none"
                        />
                      ) : (
                        <div className="flex h-full items-center justify-center text-default-400 text-sm">
                          No preview
                        </div>
                      )}
                    </div>
                    <div className="flex items-center justify-between gap-2 px-2 py-2">
                      <span className="text-tiny text-default-500">
                        {p.photo_date ? new Date(p.photo_date).toLocaleDateString() : "—"}
                      </span>
                      <Button
                        size="sm"
                        color="danger"
                        variant="flat"
                        isLoading={deletingId === p.$id}
                        onPress={() => handleDelete(p.$id)}
                      >
                        Delete
                      </Button>
                    </div>
                  </CardBody>
                </Card>
              );
            })}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
