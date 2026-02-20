"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Spinner,
  Button,
  Input,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
} from "@heroui/react";
import { useGymList } from "../use-gym-list";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";
import EmptyState from "../components/EmptyState";

const COLLECTION_KEY = "meal-categories";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

export default function MealCategoriesPage() {
  const { data: categories, loading, error, refetch } = useGymList(COLLECTION_KEY);
  const { user } = useAuth();
  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [form, setForm] = useState({ name: "", thumbnail: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", thumbnail: "" });
    setFormError(null);
    onFormOpen();
  }

  function openEdit(item) {
    setEditingId(item.$id);
    setForm({ name: item.name ?? "", thumbnail: item.thumbnail ?? "" });
    setFormError(null);
    onFormOpen();
  }

  function openDelete(item) {
    setDeleteTarget(item);
    setDeleteError(null);
    onDeleteOpen();
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setFormError(null);
    if (!form.name?.trim()) {
      setFormError("Name is required.");
      return;
    }
    setSaving(true);
    try {
      const url = editingId
        ? `/api/gym/${COLLECTION_KEY}/${editingId}`
        : `/api/gym/${COLLECTION_KEY}`;
      const method = editingId ? "PATCH" : "POST";
      const body = editingId ? { name: form.name.trim(), thumbnail: form.thumbnail.trim() } : form;
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      onFormClose();
      refetch();
    } catch (err) {
      setFormError(err.message);
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete() {
    if (!deleteTarget) return;
    setDeleteError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/gym/${COLLECTION_KEY}/${deleteTarget.$id}`, {
        method: "DELETE",
        headers: gymApiHeaders(user),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Delete failed");
      }
      onDeleteClose();
      setDeleteTarget(null);
      refetch();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading meal categories…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading meal categories</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Meal Categories</h1>
          <p className="mt-2 text-default-500">e.g. Breakfast, Lunch, Dinner, Pre-workout, Post-workout, Supplements.</p>
        </div>
        <Button color="primary" onPress={openCreate}>
          Add category
        </Button>
      </div>

      <Card className="mt-6">
        {categories.length === 0 ? (
          <CardBody>
            <EmptyState pathname="/app/meal-categories" message="No meal categories yet. Add one to get started." className="py-12" />
          </CardBody>
        ) : (
          <ul className="divide-y divide-default-200">
            {categories.map((c) => (
              <li key={c.$id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-100">
                  <Image
                    alt=""
                    classNames={{ wrapper: "h-full w-full" }}
                    className="h-full w-full object-cover"
                    src={imageUrl(c.thumbnail) || PLACEHOLDER_IMG}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/app/meal-categories/${c.$id}`} className="font-medium text-foreground hover:underline">
                    {c.name}
                  </Link>
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button as={Link} href={`/app/meal-categories/${c.$id}`} size="sm" variant="flat">
                    View / Edit
                  </Button>
                  <Button size="sm" color="danger" variant="flat" onPress={() => openDelete(c)}>
                    Delete
                  </Button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      <Modal isOpen={isFormOpen} onClose={onFormClose}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{editingId ? "Edit meal category" : "Add meal category"}</ModalHeader>
            <ModalBody className="gap-4">
              {formError && (
                <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                  {formError}
                </p>
              )}
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
                description="Image URL. Optional."
              />
            </ModalBody>
            <ModalFooter>
              <Button variant="light" onPress={onFormClose}>
                Cancel
              </Button>
              <Button color="primary" type="submit" isLoading={saving}>
                {editingId ? "Save" : "Add"}
              </Button>
            </ModalFooter>
          </form>
        </ModalContent>
      </Modal>

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
              Delete <strong>{deleteTarget?.name}</strong>? This cannot be undone.
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
