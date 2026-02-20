"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardBody,
  Spinner,
  Button,
  Input,
  Textarea,
  Select,
  SelectItem,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Image,
  NumberInput,
} from "@heroui/react";
import { useGymList } from "../use-gym-list";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";
import EmptyState from "../components/EmptyState";

const COLLECTION_KEY = "workout-modules";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

export default function WorkoutModulesPage() {
  const { data: modules, loading, error, refetch } = useGymList(COLLECTION_KEY);
  const { data: workoutPlans } = useGymList("workout-plans");
  const { user } = useAuth();
  const planMap = Object.fromEntries((workoutPlans ?? []).map((p) => [p.$id, p.name]));

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [form, setForm] = useState({ name: "", description: "", workout_plan_id: "", sort_order: 0, thumbnail: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", workout_plan_id: "", sort_order: 0, thumbnail: "" });
    setFormError(null);
    onFormOpen();
  }

  function openEdit(item) {
    setEditingId(item.$id);
    setForm({
      name: item.name ?? "",
      description: item.description ?? "",
      workout_plan_id: item.workout_plan_id ?? "",
      sort_order: typeof item.sort_order === "number" ? item.sort_order : 0,
      thumbnail: item.thumbnail ?? "",
    });
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
      const body = {
        name: form.name.trim(),
        description: form.description?.trim() ?? "",
        workout_plan_id: form.workout_plan_id || undefined,
        sort_order: typeof form.sort_order === "number" ? form.sort_order : 0,
        thumbnail: form.thumbnail?.trim() ?? "",
      };
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
        <p className="text-default-500">Loading workout modules…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading workout modules</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Workout Modules</h1>
          <p className="mt-2 text-default-500">Sections within a workout plan (e.g. Day 1, Day 2).</p>
        </div>
        <Button color="primary" onPress={openCreate}>
          Add module
        </Button>
      </div>

      <Card className="mt-6">
        {modules.length === 0 ? (
          <CardBody>
            <EmptyState pathname="/app/workout-modules" message="No workout modules yet. Add one to get started." className="py-12" />
          </CardBody>
        ) : (
          <ul className="divide-y divide-default-200">
            {modules.map((m) => (
              <li key={m.$id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-100">
                  <Image
                    alt=""
                    classNames={{ wrapper: "h-full w-full" }}
                    className="h-full w-full object-cover"
                    src={imageUrl(m.thumbnail) || PLACEHOLDER_IMG}
                    width={40}
                    height={40}
                  />
                </div>
                <div className="min-w-0 flex-1">
                  <Link href={`/app/workout-modules/${m.$id}`} className="font-medium text-foreground hover:underline">
                    {m.name}
                  </Link>
                  {m.description && (
                    <p className="mt-0.5 line-clamp-1 text-sm text-default-500">{m.description}</p>
                  )}
                  {m.workout_plan_id && (
                    <p className="mt-1 text-xs text-default-400">
                      Plan: {planMap[m.workout_plan_id] ?? m.workout_plan_id}
                      {typeof m.sort_order === "number" && ` · Order: ${m.sort_order}`}
                    </p>
                  )}
                </div>
                <div className="flex shrink-0 gap-2">
                  <Button as={Link} href={`/app/workout-modules/${m.$id}`} size="sm" variant="flat">
                    View / Edit
                  </Button>
                  <Button size="sm" color="danger" variant="flat" onPress={() => openDelete(m)}>
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
            <ModalHeader>{editingId ? "Edit workout module" : "Add workout module"}</ModalHeader>
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
                placeholder="e.g. Day 1 - Upper"
                isRequired
              />
              <Textarea
                label="Description"
                value={form.description}
                onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Optional"
              />
              <Select
                label="Workout plan"
                placeholder="Select plan"
                selectedKeys={form.workout_plan_id ? [form.workout_plan_id] : []}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] ?? "";
                  setForm((f) => ({ ...f, workout_plan_id: v }));
                }}
              >
                {(workoutPlans ?? []).map((p) => (
                  <SelectItem key={p.$id} textValue={p.name}>
                    {p.name}
                  </SelectItem>
                ))}
              </Select>
              <NumberInput
                label="Sort order"
                value={form.sort_order}
                onValueChange={(v) => setForm((f) => ({ ...f, sort_order: v ?? 0 }))}
                minValue={0}
              />
              <Input
                label="Thumbnail URL"
                value={form.thumbnail}
                onValueChange={(v) => setForm((f) => ({ ...f, thumbnail: v }))}
                placeholder="https://…"
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
          <ModalHeader>Delete workout module</ModalHeader>
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
