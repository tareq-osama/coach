"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Input, Textarea, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { gymApiHeaders } from "@/lib/gym-client";

export default function NewMemberPage() {
  const router = useRouter();
  const { user } = useAuth();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });
  const [tempPassword, setTempPassword] = useState(null);
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setTempPassword(null);
    if (!user?.$id) {
      setError("You must be signed in to add a member.");
      return;
    }
    if (!form.email?.trim()) {
      setError("Email is required to invite a member (for portal login).");
      return;
    }
    setSaving(true);
    try {
      const res = await fetch("/api/gym/members/invite", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json", ...gymApiHeaders(user) },
        body: JSON.stringify({
          email: form.email.trim(),
          name: form.name.trim() || undefined,
          phone: form.phone.trim() || undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      if (data.tempPassword) {
        setTempPassword(data.tempPassword);
        onPasswordOpen();
      } else {
        router.push("/app/members");
        router.refresh();
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
  }

  function handleClosePasswordModal() {
    onPasswordClose();
    router.push("/app/members");
    router.refresh();
  }

  return (
    <div>
      <div className="mb-6 flex items-center gap-4">
        <Button as={Link} href="/app/members" variant="light" size="sm">
          ← Members
        </Button>
        <h1 className="text-2xl font-semibold text-foreground">Add member</h1>
      </div>
      <Card className="max-w-xl">
        <CardHeader className="flex gap-3">
          <p className="text-default-500">Create a new Member profile.</p>
        </CardHeader>
        <CardBody>
          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="rounded-lg bg-danger-50 dark:bg-danger-50/20 p-3 text-sm text-danger-700 dark:text-danger-400">
                {error}
              </div>
            )}
            <Input
              label="Name"
              id="name"
              placeholder="Member name"
              value={form.name}
              onValueChange={(v) => setForm((f) => ({ ...f, name: v }))}
            />
            <Input
              label="Email"
              id="email"
              type="email"
              placeholder="email@example.com"
              value={form.email}
              onValueChange={(v) => setForm((f) => ({ ...f, email: v }))}
            />
            <Input
              label="Phone"
              id="phone"
              type="tel"
              placeholder="+1 234 567 8900"
              value={form.phone}
              onValueChange={(v) => setForm((f) => ({ ...f, phone: v }))}
            />
            <Textarea
              label="Notes"
              id="notes"
              placeholder="Optional notes"
              value={form.notes}
              onValueChange={(v) => setForm((f) => ({ ...f, notes: v }))}
              minRows={3}
            />
            <p className="text-sm text-default-500">
              Member will get portal access. If they don&apos;t have an account, a temporary password will be shown after saving — share it with them for first login.
            </p>
            <div className="flex gap-3 pt-2">
              <Button type="submit" color="primary" isLoading={saving} isDisabled={saving}>
                {saving ? "Adding…" : "Add member"}
              </Button>
              <Button as={Link} href="/app/members" variant="bordered">
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>

      <Modal isOpen={isPasswordOpen} onClose={handleClosePasswordModal}>
        <ModalContent>
          <ModalHeader>Portal login for {form.email}</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              A new account was created. Share this temporary password with the member so they can sign in at the portal. They can change it after first login.
            </p>
            <div className="rounded-lg bg-default-100 p-3 font-mono text-sm break-all select-all">
              {tempPassword}
            </div>
          </ModalBody>
          <ModalFooter>
            <Button color="primary" onPress={handleClosePasswordModal}>
              Done
            </Button>
          </ModalFooter>
        </ModalContent>
      </Modal>
    </div>
  );
}
