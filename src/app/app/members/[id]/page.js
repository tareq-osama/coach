"use client";

import { useState, useEffect, useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import {
  Card,
  CardBody,
  CardHeader,
  Button,
  Input,
  Textarea,
  Spinner,
  Modal,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  useDisclosure,
  Tabs,
  Tab,
  Select,
  SelectItem,
  NumberInput,
  addToast,
} from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";
import ProgressPhotosSection from "./ProgressPhotosSection";
import MemberReportsSection from "./MemberReportsSection";
import MemberPageHeader from "./MemberPageHeader";

const STATUS_OPTIONS = [
  { value: "active", label: "Active" },
  { value: "inactive", label: "Inactive" },
  { value: "pending", label: "Pending" },
];

export default function MemberDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { user } = useAuth();
  const [member, setMember] = useState(null);
  const [form, setForm] = useState({
    name: "",
    email: "",
    phone: "",
    notes: "",
    thumbnail: "",
    join_date: "",
    status: "",
    goals: "",
    weight_kg: "",
    height_cm: "",
    chest_cm: "",
    waist_cm: "",
    hips_cm: "",
    arms_cm: "",
    thighs_cm: "",
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState(null);
  const { isOpen: isDeleteOpen, onOpen: onDeleteOpen, onClose: onDeleteClose } = useDisclosure();
  const [deleteError, setDeleteError] = useState(null);
  const [workoutPlanIds, setWorkoutPlanIds] = useState(new Set());
  const [mealPlanIds, setMealPlanIds] = useState(new Set());
  const [savingPlans, setSavingPlans] = useState(false);
  const [plansError, setPlansError] = useState(null);
  const [linkingPortal, setLinkingPortal] = useState(false);
  const [linkTempPassword, setLinkTempPassword] = useState(null);
  const { isOpen: isLinkOpen, onOpen: onLinkOpen, onClose: onLinkClose } = useDisclosure();
  const [resettingPassword, setResettingPassword] = useState(false);
  const [resetTempPassword, setResetTempPassword] = useState(null);
  const { isOpen: isResetOpen, onOpen: onResetOpen, onClose: onResetClose } = useDisclosure();

  const [workoutPlans, setWorkoutPlans] = useState([]);
  const [mealPlans, setMealPlans] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    if (!params.id) return;
    fetch(`/api/gym/members/${params.id}`, { headers: gymApiHeaders(user) })
      .then((res) => res.json())
      .then((data) => {
        if (data.error) throw new Error(data.details || data.error);
        setMember(data);
        const joinDate = data.join_date
          ? new Date(data.join_date).toISOString().slice(0, 10)
          : "";
        setForm({
          name: data.name ?? "",
          email: data.email ?? "",
          phone: data.phone ?? "",
          notes: data.notes ?? "",
          thumbnail: data.thumbnail ?? "",
          join_date: joinDate,
          status: data.status ?? "",
          goals: data.goals ?? "",
          weight_kg: data.weight_kg != null ? String(data.weight_kg) : "",
          height_cm: data.height_cm != null ? String(data.height_cm) : "",
          chest_cm: data.chest_cm != null ? String(data.chest_cm) : "",
          waist_cm: data.waist_cm != null ? String(data.waist_cm) : "",
          hips_cm: data.hips_cm != null ? String(data.hips_cm) : "",
          arms_cm: data.arms_cm != null ? String(data.arms_cm) : "",
          thighs_cm: data.thighs_cm != null ? String(data.thighs_cm) : "",
        });
      })
      .catch((err) => setError(err.message))
      .finally(() => setLoading(false));
  }, [params.id, user?.$id]);

  useEffect(() => {
    const headers = gymApiHeaders(user);
    Promise.all([
      fetch("/api/gym/workout-plans", { headers }).then((r) => r.json()),
      fetch("/api/gym/meal-plans", { headers }).then((r) => r.json()),
    ]).then(([wpRes, mpRes]) => {
      if (wpRes.documents) setWorkoutPlans(wpRes.documents);
      if (mpRes.documents) setMealPlans(mpRes.documents);
    });
  }, [user?.$id]);

  useEffect(() => {
    if (!member) return;
    const wpIds = new Set(
      (workoutPlans ?? []).filter((p) => p.member_id === member.$id).map((p) => p.$id)
    );
    const mpIds = new Set(
      (mealPlans ?? []).filter((p) => p.member_id === member.$id).map((p) => p.$id)
    );
    setWorkoutPlanIds(wpIds);
    setMealPlanIds(mpIds);
  }, [member?.$id, workoutPlans, mealPlans]);

  async function handleSave(e, options = {}) {
    if (e?.preventDefault) e.preventDefault();
    const managedByCaller = options.managedByCaller === true;
    setSaveError(null);
    if (!user?.$id) {
      setSaveError("You must be signed in to save.");
      return false;
    }
    if (!managedByCaller) setSaving(true);
    try {
      const joinDateIso =
        form.join_date && form.join_date.length >= 10
          ? new Date(form.join_date).toISOString()
          : undefined;
      const payload = {
        name: form.name.trim(),
        email: form.email?.trim() ?? "",
        phone: form.phone?.trim() ?? "",
        notes: form.notes?.trim() ?? "",
        thumbnail: form.thumbnail?.trim() ?? "",
        join_date: joinDateIso,
        status: form.status || undefined,
        goals: form.goals?.trim() ?? "",
        weight_kg: form.weight_kg === "" ? undefined : Number(form.weight_kg),
        height_cm: form.height_cm === "" ? undefined : Number(form.height_cm),
        chest_cm: form.chest_cm === "" ? undefined : Number(form.chest_cm),
        waist_cm: form.waist_cm === "" ? undefined : Number(form.waist_cm),
        hips_cm: form.hips_cm === "" ? undefined : Number(form.hips_cm),
        arms_cm: form.arms_cm === "" ? undefined : Number(form.arms_cm),
        thighs_cm: form.thighs_cm === "" ? undefined : Number(form.thighs_cm),
      };
      const res = await fetch(`/api/gym/members/${params.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      setMember((prev) => (prev ? { ...prev, ...data } : data));
      return true;
    } catch (err) {
      setSaveError(err.message);
      return false;
    } finally {
      if (!managedByCaller) setSaving(false);
    }
  }

  /** Single Save: member details + measurements, then plan assignments. */
  async function handleSaveAll() {
    setSaveError(null);
    setPlansError(null);
    if (!user?.$id) {
      setSaveError("You must be signed in to save.");
      return;
    }
    setSaving(true);
    try {
      const detailsSaved = await handleSave({ preventDefault: () => {} }, { managedByCaller: true });
      const plansSaved = await savePlanAssignments();
      if (detailsSaved && plansSaved) {
        addToast({
          title: "Saved",
          description: "Member details and plan assignments have been saved.",
          color: "success",
        });
      }
    } finally {
      setSaving(false);
    }
  }

  async function savePlanAssignments() {
    setPlansError(null);
    setSavingPlans(true);
    const headers = { "Content-Type": "application/json", ...gymApiHeaders(user) };
    try {
      for (const plan of workoutPlans) {
        const shouldAssign = workoutPlanIds.has(plan.$id);
        const currentlyAssigned = plan.member_id === member?.$id;
        if (shouldAssign !== currentlyAssigned) {
          await fetch(`/api/gym/workout-plans/${plan.$id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              member_id: shouldAssign ? member.$id : null,
            }),
          });
        }
      }
      for (const plan of mealPlans) {
        const shouldAssign = mealPlanIds.has(plan.$id);
        const currentlyAssigned = plan.member_id === member?.$id;
        if (shouldAssign !== currentlyAssigned) {
          await fetch(`/api/gym/meal-plans/${plan.$id}`, {
            method: "PATCH",
            headers,
            body: JSON.stringify({
              member_id: shouldAssign ? member.$id : null,
            }),
          });
        }
      }
      const [wpRes, mpRes] = await Promise.all([
        fetch("/api/gym/workout-plans", { headers: gymApiHeaders(user) }).then((r) => r.json()),
        fetch("/api/gym/meal-plans", { headers: gymApiHeaders(user) }).then((r) => r.json()),
      ]);
      if (wpRes.documents) setWorkoutPlans(wpRes.documents);
      if (mpRes.documents) setMealPlans(mpRes.documents);
      return true;
    } catch (err) {
      setPlansError(err.message);
      return false;
    } finally {
      setSavingPlans(false);
    }
  }

  async function handleLinkPortalAccount() {
    if (!member?.email?.trim()) {
      addToast({ title: "Email required", description: "Add an email to this member first.", color: "warning" });
      return;
    }
    setLinkingPortal(true);
    setLinkTempPassword(null);
    try {
      const res = await fetch("/api/gym/members/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify({
          email: member.email.trim(),
          name: member.name?.trim(),
          phone: member.phone?.trim(),
          memberId: member.$id,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      setMember((prev) => (prev ? { ...prev, user_id: data.member?.user_id ?? prev.user_id } : prev));
      if (data.tempPassword) {
        setLinkTempPassword(data.tempPassword);
        onLinkOpen();
      } else {
        addToast({ title: "Portal linked", description: "Member can sign in at the portal.", color: "success" });
      }
    } catch (err) {
      addToast({ title: "Link failed", description: err.message, color: "danger" });
    } finally {
      setLinkingPortal(false);
    }
  }

  async function handleResetPortalPassword() {
    if (!member?.$id || !member?.user_id) return;
    setResettingPassword(true);
    setResetTempPassword(null);
    try {
      const res = await fetch("/api/gym/members/reset-password", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify({ memberId: member.$id }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || data.details);
      setResetTempPassword(data.tempPassword ?? null);
      onResetOpen();
    } catch (err) {
      addToast({ title: "Reset failed", description: err.message, color: "danger" });
    } finally {
      setResettingPassword(false);
    }
  }

  async function handleDelete() {
    setDeleteError(null);
    setSaving(true);
    try {
      const res = await fetch(`/api/gym/members/${params.id}`, {
        method: "DELETE",
        headers: gymApiHeaders(user),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data.details || data.error || "Delete failed");
      }
      router.push("/app/members");
      router.refresh();
    } catch (err) {
      setDeleteError(err.message);
    } finally {
      setSaving(false);
    }
  }

  if (loading && !member) {
    return (
      <div className="flex flex-col items-center justify-center gap-4 py-12">
        <Spinner size="lg" color="primary" />
        <p className="text-default-500">Loading…</p>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div>
        <Button as={Link} href="/app/members" variant="light" size="sm">
          ← Members
        </Button>
        <Card className="mt-4 border-danger-200 bg-danger-50 dark:bg-danger-50/10">
          <CardBody>
            <p className="text-danger-700 dark:text-danger-400">{error ?? "Member not found."}</p>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <MemberPageHeader
        avatarSrc={form.thumbnail}
        onAvatarChange={(url) => setForm((f) => ({ ...f, thumbnail: url }))}
        name={member.name}
        email={member.email}
        memberId={member.$id}
        breadcrumbs={["Members", member.name || "Member"]}
        primaryLabel="Save"
        secondaryLabel={null}
        tertiaryLabel="Back"
        tertiaryHref="/app/members"
        onPrimary={handleSaveAll}
        onSecondary={onDeleteOpen}
        onSearch={(value) => setSearchQuery(value)}
        isPrimaryLoading={saving}
        showSearch={false}
      />

      <Tabs aria-label="Member sections" className="w-full">
        <Tab key="details" title="Details">
          <div className="space-y-4 pt-2">
            {/* Portal status */}
            <Card shadow="sm" className="border-none">
              <CardBody className="gap-3">
                <p className="text-sm font-medium text-foreground">Portal access</p>
                {member.user_id ? (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-success-600 dark:text-success-400">Portal account is active. Member can sign in at the portal.</p>
                    <Button
                      size="sm"
                      variant="flat"
                      color="default"
                      onPress={handleResetPortalPassword}
                      isDisabled={resettingPassword}
                      isLoading={resettingPassword}
                    >
                      Reset portal password
                    </Button>
                  </div>
                ) : (
                  <div className="flex flex-wrap items-center gap-3">
                    <p className="text-sm text-default-500">Not yet linked. Link this member to a portal account so they can sign in.</p>
                    <Button
                      size="sm"
                      color="primary"
                      variant="flat"
                      onPress={handleLinkPortalAccount}
                      isDisabled={linkingPortal || !member.email?.trim()}
                      isLoading={linkingPortal}
                    >
                      Link portal account
                    </Button>
                  </div>
                )}
              </CardBody>
            </Card>

            {/* Member details */}
            <Card shadow="sm" className="border-none">
              <CardBody className="gap-4">
                {saveError && (
                  <p className="rounded-lg bg-danger-50 p-3 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                    {saveError}
                  </p>
                )}
                <div className="grid gap-4 sm:grid-cols-2">
                  <Input
                    label="Name"
                    value={form.name}
                    onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
                    placeholder="Client name"
                  />
                  <Input
                    label="Email"
                    type="email"
                    value={form.email}
                    onValueChange={(v) => setForm((f) => ({ ...f, email: v }))}
                    placeholder="email@example.com"
                  />
                  <Input
                    label="Phone"
                    value={form.phone}
                    onValueChange={(v) => setForm((f) => ({ ...f, phone: v }))}
                    placeholder="+1234567890"
                  />
                  <Input
                    label="Join date"
                    type="date"
                    value={form.join_date}
                    onValueChange={(v) => setForm((f) => ({ ...f, join_date: v }))}
                    size="md"
                  />
                  <Select
                    label="Status"
                    placeholder="Select status"
                    selectedKeys={form.status ? [form.status] : []}
                    onSelectionChange={(keys) => {
                      const v = Array.from(keys)[0] ?? "";
                      setForm((f) => ({ ...f, status: v }));
                    }}
                    className="sm:col-span-2"
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <SelectItem key={o.value}>{o.label}</SelectItem>
                    ))}
                  </Select>
                  <Textarea
                    label="Goals"
                    value={form.goals}
                    onValueChange={(v) => setForm((f) => ({ ...f, goals: v }))}
                    placeholder="Member fitness goals and objectives"
                    minRows={3}
                    className="sm:col-span-2"
                  />
                  <Textarea
                    label="Notes"
                    value={form.notes}
                    onValueChange={(v) => setForm((f) => ({ ...f, notes: v }))}
                    placeholder="Additional notes"
                    className="sm:col-span-2"
                  />
                </div>
              </CardBody>
            </Card>

            {/* Body measurements */}
            <Card shadow="sm" className="border-none">
              <CardBody className="gap-4">
                <p className="text-sm text-default-500">
                  Record weight and body measurements for this member.
                </p>
                <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                  <NumberInput
                    label="Weight (kg)"
                    value={form.weight_kg}
                    onValueChange={(v) => setForm((f) => ({ ...f, weight_kg: v }))}
                    minValue={0}
                    step={0.1}
                  />
                  <NumberInput
                    label="Height (cm)"
                    value={form.height_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, height_cm: v }))}
                    minValue={0}
                  />
                  <NumberInput
                    label="Chest (cm)"
                    value={form.chest_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, chest_cm: v }))}
                    minValue={0}
                  />
                  <NumberInput
                    label="Waist (cm)"
                    value={form.waist_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, waist_cm: v }))}
                    minValue={0}
                  />
                  <NumberInput
                    label="Hips (cm)"
                    value={form.hips_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, hips_cm: v }))}
                    minValue={0}
                  />
                  <NumberInput
                    label="Arms (cm)"
                    value={form.arms_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, arms_cm: v }))}
                    minValue={0}
                  />
                  <NumberInput
                    label="Thighs (cm)"
                    value={form.thighs_cm}
                    onValueChange={(v) => setForm((f) => ({ ...f, thighs_cm: v }))}
                    minValue={0}
                  />
                </div>
              </CardBody>
            </Card>

            {/* Plan assignments */}
            <Card shadow="sm" className="border-none">
              <CardBody className="gap-4">
                {plansError && (
                  <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                    {plansError}
                  </p>
                )}
                <Select
                  label="Workout plans"
                  placeholder="Select one or many"
                  selectionMode="multiple"
                  selectedKeys={workoutPlanIds}
                  onSelectionChange={(keys) => setWorkoutPlanIds(new Set(keys))}
                  description="Assign workout plans to this member. They will see these in their portal."
                >
                  {(workoutPlans ?? []).map((p) => (
                    <SelectItem key={p.$id} textValue={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </Select>
                <Select
                  label="Meal plans"
                  placeholder="Select one or many"
                  selectionMode="multiple"
                  selectedKeys={mealPlanIds}
                  onSelectionChange={(keys) => setMealPlanIds(new Set(keys))}
                  description="Assign meal plans to this member. They will see these in their portal."
                >
                  {(mealPlans ?? []).map((p) => (
                    <SelectItem key={p.$id} textValue={p.name}>
                      {p.name}
                    </SelectItem>
                  ))}
                </Select>
                <p className="text-sm text-default-500">
                  Use the Save button in the header to persist plan assignments.
                </p>
              </CardBody>
            </Card>

            {/* Progress photos */}
            <ProgressPhotosSection memberId={member.$id} />
          </div>
        </Tab>

        <Tab key="reports" title="Reports">
          <div className="pt-2">
            <Card shadow="sm" className="border-none">
              <CardBody>
                <MemberReportsSection memberId={member.$id} memberName={member.name} />
              </CardBody>
            </Card>
          </div>
        </Tab>

        <Tab key="settings" title="Settings">
          <div className="pt-2">
            <Card shadow="sm" className="border-danger-200 bg-danger-50 dark:bg-danger-50/10">
              <CardBody className="gap-3">
                <p className="font-medium text-danger-700 dark:text-danger-400">Danger zone</p>
                <p className="text-sm text-danger-600 dark:text-danger-400">
                  Permanently delete <strong>{member.name || "this member"}</strong> and all associated data. This cannot be undone.
                </p>
                <div>
                  <Button color="danger" variant="flat" onPress={onDeleteOpen}>
                    Delete member
                  </Button>
                </div>
              </CardBody>
            </Card>
          </div>
        </Tab>
      </Tabs>

      <Modal isOpen={isDeleteOpen} onClose={onDeleteClose}>
        <ModalContent>
          <ModalHeader>Delete member</ModalHeader>
          <ModalBody>
            {deleteError && (
              <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:bg-danger-50/20 dark:text-danger-400">
                {deleteError}
              </p>
            )}
            <p>
              Delete <strong>{member.name || "this member"}</strong>? This cannot be undone.
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

      <Modal isOpen={isLinkOpen} onClose={onLinkClose}>
        <ModalContent>
          <ModalHeader>Portal login</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Share this temporary password with the member so they can sign in at the portal.
            </p>
            {linkTempPassword && (
              <div className="rounded-lg bg-default-100 p-3 font-mono text-sm break-all select-all mt-2">
                {linkTempPassword}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onLinkClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>

      <Modal isOpen={isResetOpen} onClose={onResetClose}>
        <ModalContent>
          <ModalHeader>New portal password</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Share this new temporary password with the member. They can use it to sign in at the portal and change it there.
            </p>
            {resetTempPassword && (
              <div className="rounded-lg bg-default-100 p-3 font-mono text-sm break-all select-all mt-2">
                {resetTempPassword}
              </div>
            )}
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={onResetClose}>Done</Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
