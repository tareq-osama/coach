"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardBody,
  Button,
  Input,
  Spinner,
  Image,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
} from "@heroui/react";
import { useGymDocument } from "../../use-gym-document";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";

const COLLECTION_KEY = "meal-categories";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

export default function MealCategoryDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { data: doc, loading, error, refetch } = useGymDocument(COLLECTION_KEY, id);
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", thumbnail: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteError, setDeleteError] = useState(null);

  useEffect(() => {
    if (doc) setForm({ name: doc.name ?? "", thumbnail: doc.thumbnail ?? "" });
  }, [doc]);

  async function handleSave(e) {
    e.preventDefault();
    setSaveError(null);
    if (!form.name?.trim()) {
      setSaveError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch(`/api/gym/${COLLECTION_KEY}/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify({ name: form.name.trim(), thumbnail: form.thumbnail.trim() }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      refetch();
    } catch (err) {
      setSaveError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/gym/${COLLECTION_KEY}/${id}`, {
        method: "DELETE",
        headers: gymApiHeaders(user),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Delete failed");
      }
      router.push("/app/meal-categories");
      router.refresh();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !doc) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading…</p>
      </div>
    );
  }

  if (error || !doc) {
    return (
      <div>
        <Button as={Link} href="/app/meal-categories" variant="light" size="sm">
          ← Meal categories
        </Button>
        <Card className="mt-4 border-danger-200 bg-danger-50 dark:bg-danger-50/10">
          <CardBody>
            <p className="text-danger-700 dark:text-danger-400">{error ?? "Not found."}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div>
      <div className="mb-6 flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <Button as={Link} href="/app/meal-categories" variant="light" size="sm">
            ← Meal categories
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">{doc.name || "Meal category"}</h1>
        </div>
        <Button color="danger" variant="flat" onPress={onDeleteOpen}>
          Delete
        </Button>
      </div>

      <Card>
        <CardBody className="gap-6">
          <form onSubmit={handleSave} className="flex flex-col gap-6">
            {saveError && (
              <p className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                {saveError}
              </p>
            )}
            <div className="grid gap-6 sm:grid-cols-2">
              <div className="flex flex-col gap-2">
                <label className="text-sm font-medium text-default-600">Thumbnail</label>
                <div className="h-32 w-32 overflow-hidden rounded-lg bg-default-100">
                  <Image
                    alt=""
                    className="h-full w-full object-cover"
                    src={imageUrl(form.thumbnail) || PLACEHOLDER_IMG}
                    width={128}
                    height={128}
                  />
                </div>
              </div>
              <div className="flex flex-1 flex-col gap-4">
                <Input
                  label="Name"
                  value={form.name}
                  onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
                  placeholder="e.g. Breakfast"
                  isRequired
                />
                <Input
                  label="Thumbnail URL"
                  value={form.thumbnail}
                  onValueChange={(v) => setForm((f) => ({ ...f, thumbnail: v }))}
                  placeholder="https://…"
                />
              </div>
            </div>
            <div className="flex gap-2">
              <Button type="submit" color="primary" isLoading={saving}>
                Save changes
              </Button>
              <Button as={Link} href="/app/meal-categories" variant="flat">
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete meal category</ModalHeader>
          <ModalBody>
            {deleteError && (
              <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                {deleteError}
              </p>
            )}
            <p>
              Delete <strong>{doc.name}</strong>? This cannot be undone.
            </p>
          </ModalBody>
          <ModalFooter>
            <Button variant="light" onPress={onDeleteClose}>
              Cancel
            </Button>
            <Button color="danger" onPress={handleDelete} isLoading={saving}>
              Delete
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
