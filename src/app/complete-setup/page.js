"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Input } from "@heroui/react";

export default function CompleteSetupPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSetup(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/auth/onboard-coach", {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: name.trim() || undefined }),
      });
      if (!res.ok) {
        const data = await res.json().catch(() => ({}));
        throw new Error(data?.error ?? "Setup failed.");
      }
      router.replace("/app");
      router.refresh();
    } catch (err) {
      setError(err?.message ?? "Something went wrong.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-default-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-0">
          <h1 className="text-xl font-semibold text-foreground">Complete coach setup</h1>
          <p className="text-sm text-default-500">Create your team to start using the coach app.</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 pb-6 pt-4">
          <form onSubmit={handleSetup} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-100 dark:text-danger-800">
                {error}
              </div>
            )}
            <Input
              type="text"
              label="Team name"
              placeholder="e.g. My Gym"
              value={name}
              onValueChange={setName}
              autoComplete="organization"
            />
            <Button
              type="submit"
              color="primary"
              className="w-full"
              isLoading={loading}
              isDisabled={loading}
            >
              Create team
            </Button>
          </form>
        </CardBody>
      </Card>
    </div>
  );
}
