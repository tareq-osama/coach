"use client";

import { useState } from "react";
import Link from "next/link";
import {
  Card,
  CardHeader,
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
  Tabs,
  Tab,
} from "@heroui/react";
import { useGymList } from "../use-gym-list";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";
import EmptyState from "../components/EmptyState";

const ListIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
  </svg>
);

const GridIcon = () => (
  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
  </svg>
);

const tabs = [
  { id: "list", label: "List", title: "List" },
  { id: "grid", label: "Grid", title: "Grid" },
];

const COLLECTION_KEY = "exercises";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

export default function ExercisesPage() {
  const { data: exercises, loading, error, refetch } = useGymList(COLLECTION_KEY);
  const { data: muscleGroups } = useGymList("muscle-groups");
  const { user } = useAuth();
  const groupMap = Object.fromEntries((muscleGroups ?? []).map((g) => [g.$id, g.name]));

  const { isOpen: isFormOpen, onOpen: onFormOpen, onClose: onFormClose } = useDisclosure();
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [form, setForm] = useState({ name: "", description: "", muscle_group_id: "", thumbnail: "" });
  const [editingId, setEditingId] = useState(null);
  const [deleteTarget, setDeleteTarget] = useState(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState(null);
  const [deleteError, setDeleteError] = useState(null);

  function openCreate() {
    setEditingId(null);
    setForm({ name: "", description: "", muscle_group_id: "", thumbnail: "" });
    setFormError(null);
    onFormOpen();
  }

  function openEdit(item) {
    setEditingId(item.$id);
    setForm({
      name: item.name ?? "",
      description: item.description ?? "",
      muscle_group_id: item.muscle_group_id ?? "",
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
        muscle_group_id: form.muscle_group_id || undefined,
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
        <p className="text-default-500">Loading exercises…</p>
      </div>
    );
  }

  if (error) {
    return (
      <Card className="border-danger-200 bg-danger-50/20">
        <CardBody>
          <p className="font-medium text-danger-700">Error loading exercises</p>
          <p className="mt-1 text-sm text-danger-600">{error}</p>
        </CardBody>
      </Card>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Exercises</h1>
          <p className="mt-2 text-default-500">Exercise library.</p>
        </div>
        <Button color="primary" onPress={openCreate}>
          Add exercise
        </Button>
      </div>

      <div className="mt-6 flex w-full flex-col">
        <Tabs aria-label="View" items={tabs}>
          {(item) => (
            <Tab
              key={item.id}
              title={
                <span className="flex items-center gap-2">
                  {item.id === "list" ? <ListIcon /> : <GridIcon />}
                  {item.label}
                </span>
              }
            >
              <div className="mt-4">
                {item.id === "list" ? (
                  exercises.length === 0 ? (
                    <EmptyState pathname="/app/exercises" className="py-12" />
                  ) : (
                    <ul className="divide-y divide-default-200">
                      {exercises.map((ex) => (
                        <li key={ex.$id} className="flex items-center gap-4 px-4 py-3 sm:px-6">
                          <div className="h-10 w-10 shrink-0 overflow-hidden rounded-lg bg-default-100">
                            <Image
                              alt=""
                              classNames={{ wrapper: "h-full w-full" }}
                              className="h-full w-full object-cover"
                              src={imageUrl(ex.thumbnail || ex.image_url) || PLACEHOLDER_IMG}
                              width={40}
                              height={40}
                            />
                          </div>
                          <div className="min-w-0 flex-1">
                            <Link href={`/app/exercises/${ex.$id}`} className="font-medium text-foreground hover:underline">
                              {ex.name}
                            </Link>
                            {ex.description && (
                              <p className="mt-0.5 text-sm text-default-500 line-clamp-1">{ex.description}</p>
                            )}
                            {ex.muscle_group_id && (
                              <p className="mt-1 text-xs text-default-400">
                                {groupMap[ex.muscle_group_id] ?? ex.muscle_group_id}
                              </p>
                            )}
                          </div>
                          <div className="flex shrink-0 gap-2">
                            <Button as={Link} href={`/app/exercises/${ex.$id}`} size="sm" variant="flat">
                              View / Edit
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onPress={() => openDelete(ex)}>
                              Delete
                            </Button>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                ) : exercises.length === 0 ? (
                  <EmptyState pathname="/app/exercises" className="py-12" />
                ) : (
                  <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
                    {exercises.map((ex) => (
                      <Card key={ex.$id} className="py-4">
                        <CardHeader className="flex-col items-start px-4 pb-0 pt-2">
                          <p className="text-tiny font-bold uppercase text-default-500">
                            {ex.muscle_group_id ? groupMap[ex.muscle_group_id] ?? "Exercise" : "Exercise"}
                          </p>
                          <h4 className="font-bold text-large text-foreground">{ex.name}</h4>
                        </CardHeader>
                        <CardBody className="overflow-visible py-2">
                          <Image
                            alt={ex.name}
                            className="rounded-xl object-cover"
                            src={imageUrl(ex.thumbnail || ex.image_url) || PLACEHOLDER_IMG}
                            width={270}
                          />
                          <div className="mt-2 flex gap-2">
                            <Button as={Link} href={`/app/exercises/${ex.$id}`} size="sm" variant="flat">
                              View / Edit
                            </Button>
                            <Button size="sm" color="danger" variant="flat" onPress={() => openDelete(ex)}>
                              Delete
                            </Button>
                          </div>
                        </CardBody>
                      </Card>
                    ))}
                  </div>
                )}
              </div>
            </Tab>
          )}
        </Tabs>
      </div>

      <Modal isOpen={isFormOpen} onClose={onFormClose}>
        <ModalContent>
          <form onSubmit={handleSubmit}>
            <ModalHeader>{editingId ? "Edit exercise" : "Add exercise"}</ModalHeader>
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
                placeholder="e.g. Bench Press"
                isRequired
              />
              <Textarea
                label="Description"
                value={form.description}
                onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                placeholder="Optional instructions"
              />
              <Select
                label="Muscle group"
                placeholder="Select"
                selectedKeys={form.muscle_group_id ? [form.muscle_group_id] : []}
                onSelectionChange={(keys) => {
                  const v = Array.from(keys)[0] ?? "";
                  setForm((f) => ({ ...f, muscle_group_id: v }));
                }}
              >
                {(muscleGroups ?? []).map((g) => (
                  <SelectItem key={g.$id} textValue={g.name}>
                    {g.name}
                  </SelectItem>
                ))}
              </Select>
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
          <ModalHeader>Delete exercise</ModalHeader>
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
