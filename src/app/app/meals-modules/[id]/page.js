"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardBody,
  Button,
  Input,
  Textarea,
  Spinner,
  Image,
  NumberInput,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Autocomplete,
  AutocompleteItem,
} from "@heroui/react";
import { useGymDocument } from "../../use-gym-document";
import { useGymList } from "../../use-gym-list";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import { imageUrl } from "@/lib/image-url";

const COLLECTION_KEY = "meals-modules";
const PLACEHOLDER_IMG = "https://heroui.com/images/hero-card-complete.jpeg";

export default function MealModuleDetailPage() {
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { data: doc, loading, error, refetch } = useGymDocument(COLLECTION_KEY, id);
  const { data: junctionDocs, refetch: refetchJunction } = useGymList("meal-module-meals", {
    queryParams: id ? { meal_module_id: id } : undefined,
  });
  const { data: allMeals } = useGymList("meals");
  const { user } = useAuth();
  const [form, setForm] = useState({ name: "", description: "", thumbnail: "" });
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteError, setDeleteError] = useState(null);
  const [assignedMeals, setAssignedMeals] = useState([]);
  const [savingMeals, setSavingMeals] = useState(false);
  const [mealsError, setMealsError] = useState(null);

  useEffect(() => {
    if (doc) {
      setForm({
        name: doc.name ?? "",
        description: doc.description ?? "",
        thumbnail: doc.thumbnail ?? "",
      });
    }
  }, [doc]);

  useEffect(() => {
    if (!junctionDocs?.length) {
      setAssignedMeals([]);
      return;
    }
    const sorted = [...junctionDocs].sort(
      (a, b) => (a.sort_order ?? 999) - (b.sort_order ?? 999)
    );
    setAssignedMeals(
      sorted.map((d) => ({
        $id: d.$id,
        meal_id: d.meal_id,
        servings: d.servings ?? undefined,
        sort_order: d.sort_order ?? 0,
      }))
    );
  }, [junctionDocs]);

  const mealById = useMemo(() => {
    const map = {};
    (allMeals ?? []).forEach((m) => (map[m.$id] = m));
    return map;
  }, [allMeals]);

  const availableMeals = useMemo(() => {
    const assignedIds = new Set(assignedMeals.map((a) => a.meal_id));
    return (allMeals ?? []).filter((m) => !assignedIds.has(m.$id));
  }, [allMeals, assignedMeals]);

  async function saveAssignedMeals() {
    setMealsError(null);
    setSavingMeals(true);
    try {
      const headers = gymApiHeaders(user);
      for (const row of assignedMeals.filter((r) => r.$id)) {
        await fetch(`/api/gym/meal-module-meals/${row.$id}`, {
          method: "DELETE",
          headers,
        });
      }
      for (let i = 0; i < assignedMeals.length; i++) {
        const row = assignedMeals[i];
        await fetch("/api/gym/meal-module-meals", {
          method: "POST",
          headers: { "Content-Type": "application/json", ...headers },
          body: JSON.stringify({
            meal_module_id: id,
            meal_id: row.meal_id,
            servings: row.servings,
            sort_order: i,
          }),
        });
      }
      refetchJunction();
    } catch (err) {
      setMealsError(err.message);
    } finally {
      setSavingMeals(false);
    }
  }

  function addMeal(mealId) {
    if (assignedMeals.some((a) => a.meal_id === mealId)) return;
    setAssignedMeals((prev) => [
      ...prev,
      { meal_id: mealId, servings: undefined, sort_order: prev.length },
    ]);
  }

  function removeMeal(index) {
    setAssignedMeals((prev) => prev.filter((_, i) => i !== index));
  }

  function moveMeal(index, delta) {
    const next = [...assignedMeals];
    const to = index + delta;
    if (to < 0 || to >= next.length) return;
    [next[index], next[to]] = [next[to], next[index]];
    setAssignedMeals(next);
  }

  function setServings(index, value) {
    setAssignedMeals((prev) =>
      prev.map((row, i) => (i === index ? { ...row, servings: value } : row))
    );
  }

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
        body: JSON.stringify({
          name: form.name.trim(),
          description: form.description?.trim() ?? "",
          thumbnail: form.thumbnail?.trim() ?? "",
        }),
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
      router.push("/app/meals-modules");
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
        <Button as={Link} href="/app/meals-modules" variant="light" size="sm">
          ← Meals modules
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
          <Button as={Link} href="/app/meals-modules" variant="light" size="sm">
            ← Meals modules
          </Button>
          <h1 className="text-2xl font-semibold text-foreground">{doc.name || "Meal module"}</h1>
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
                  placeholder="e.g. Week 1"
                  isRequired
                />
                <Textarea
                  label="Description"
                  value={form.description}
                  onValueChange={(v) => setForm((f) => ({ ...f, description: v }))}
                  placeholder="Optional"
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
              <Button as={Link} href="/app/meals-modules" variant="flat">
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Card className="mt-6">
        <CardBody className="gap-4">
          <h2 className="text-lg font-semibold">Assigned meals</h2>
          {mealsError && (
            <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
              {mealsError}
            </p>
          )}
          <div className="flex flex-wrap items-end gap-2">
            <Autocomplete
              label="Add meal"
              placeholder="Search meals…"
              defaultItems={availableMeals}
              onSelectionChange={(key) => key != null && addMeal(key)}
              selectedKey={null}
              className="min-w-[200px]"
            >
              {(m) => (
                <AutocompleteItem key={m.$id} textValue={m.name}>
                  {m.name}
                </AutocompleteItem>
              )}
            </Autocomplete>
          </div>
          <ul className="flex flex-col gap-2">
            {assignedMeals.map((row, index) => (
              <li
                key={`${row.meal_id}-${index}`}
                className="flex flex-wrap items-center gap-2 rounded-lg border border-default-200 bg-default-50/50 p-2 dark:bg-default-100/10"
              >
                <span className="order-1 min-w-0 flex-1 font-medium">
                  {mealById[row.meal_id]?.name ?? row.meal_id}
                </span>
                <NumberInput
                  size="sm"
                  className="max-w-[80px]"
                  placeholder="Servings"
                  value={row.servings ?? ""}
                  onValueChange={(v) => setServings(index, v === "" ? undefined : Number(v))}
                  minValue={0}
                />
                <div className="flex gap-1">
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    isDisabled={index === 0}
                    onPress={() => moveMeal(index, -1)}
                    aria-label="Move up"
                  >
                    ↑
                  </Button>
                  <Button
                    size="sm"
                    variant="flat"
                    isIconOnly
                    isDisabled={index === assignedMeals.length - 1}
                    onPress={() => moveMeal(index, 1)}
                    aria-label="Move down"
                  >
                    ↓
                  </Button>
                  <Button
                    size="sm"
                    color="danger"
                    variant="flat"
                    isIconOnly
                    onPress={() => removeMeal(index)}
                    aria-label="Remove"
                  >
                    ×
                  </Button>
                </div>
              </li>
            ))}
          </ul>
          {assignedMeals.length > 0 && (
            <Button
              color="primary"
              variant="flat"
              isLoading={savingMeals}
              onPress={saveAssignedMeals}
            >
              Save assigned meals
            </Button>
          )}
        </CardBody>
      </Card>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete meal module</ModalHeader>
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
