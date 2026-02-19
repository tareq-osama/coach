"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Input, Textarea } from "@heroui/react";

export default function NewMemberPage() {
  const router = useRouter();
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState(null);
  const [form, setForm] = useState({ name: "", email: "", phone: "", notes: "" });

  async function handleSubmit(e) {
    e.preventDefault();
    setError(null);
    setSaving(true);
    try {
      const res = await fetch("/api/gym/members", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.details || data.error);
      router.push("/app/members");
      router.refresh();
    } catch (err) {
      setError(err.message);
    } finally {
      setSaving(false);
    }
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
          <p className="text-default-500">Create a new client profile.</p>
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
              placeholder="Client name"
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
            <div className="flex gap-3 pt-2">
              <Button type="submit" color="primary" isLoading={saving} isDisabled={saving}>
                {saving ? "Saving…" : "Save member"}
              </Button>
              <Button as={Link} href="/app/members" variant="bordered">
                Cancel
              </Button>
            </div>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
