"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { createEmailPasswordSession } from "@/lib/appwrite-auth";

export default function PortalLoginPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) {
      // Redirect to portal; layout will re-check roles server-side and redirect to /login if no client role
      router.replace("/portal");
    }
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createEmailPasswordSession(email.trim(), password);
      await refresh();
      router.replace("/portal");
    } catch (err) {
      setError(err?.message ?? "Login failed. Check email and password.");
    } finally {
      setLoading(false);
    }
  }

  if (authLoading || user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-default-100">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-default-100 px-4 py-12">
      <Card className="w-full max-w-md">
        <CardHeader className="flex flex-col gap-1 px-6 pt-6 pb-0">
          <h1 className="text-2xl font-semibold text-foreground">Member portal</h1>
          <p className="text-sm text-default-500">Sign in to view your plans and progress</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 pb-6 pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-100 dark:text-danger-800">
                {error}
              </div>
            )}
            <Input
              type="email"
              label="Email"
              placeholder="you@example.com"
              value={email}
              onValueChange={setEmail}
              isRequired
              autoComplete="email"
            />
            <Input
              type="password"
              label="Password"
              placeholder="••••••••"
              value={password}
              onValueChange={setPassword}
              isRequired
              autoComplete="current-password"
            />
            <Button type="submit" color="primary" className="w-full" isLoading={loading} isDisabled={loading}>
              Sign in
            </Button>
          </form>
          <p className="text-center text-sm text-default-500">
            Are you a coach?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in to coach app
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
