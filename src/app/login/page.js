"use client";

import { Suspense, useState, useEffect, useMemo } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { createEmailPasswordSession } from "@/lib/appwrite-auth";

const AUTH_LOAD_TIMEOUT_MS = 3000;

function LoginPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user, loading: authLoading, refresh } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [loadTimeout, setLoadTimeout] = useState(false);
  const messageUseCoachApp = useMemo(() => searchParams.get("message") === "use-coach-app", [searchParams]);

  useEffect(() => {
    if (!authLoading && user) router.replace("/app");
  }, [user, authLoading, router]);

  useEffect(() => {
    const t = setTimeout(() => setLoadTimeout(true), AUTH_LOAD_TIMEOUT_MS);
    return () => clearTimeout(t);
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createEmailPasswordSession(email.trim(), password);
      await refresh(); // update auth context so /app layout sees the user
      router.replace("/app");
    } catch (err) {
      setError(err?.message ?? "Login failed. Check email and password.");
    } finally {
      setLoading(false);
    }
  }

  if (user) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-default-100">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }
  if (authLoading && !loadTimeout) {
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
          <h1 className="text-2xl font-semibold text-foreground">Pulse®</h1>
          <p className="text-sm text-default-500">Sign in to your account</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 pb-6 pt-4">
          {messageUseCoachApp && (
            <div className="rounded-lg bg-primary-50 px-3 py-2 text-sm text-primary-700 dark:bg-primary-100 dark:text-primary-800">
              Use the coach app to sign in. If you’re a member, sign in at the{" "}
              <Link href="/portal/login" className="font-medium underline">member portal</Link>.
            </div>
          )}
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
            Don&apos;t have an account?{" "}
            <Link href="/register" className="font-medium text-primary hover:underline">
              Register
            </Link>
            {" · "}
            <Link href="/portal/login" className="font-medium text-primary hover:underline">
              Member portal
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center bg-default-100">
          <Spinner size="lg" color="primary" />
        </div>
      }
    >
      <LoginPageContent />
    </Suspense>
  );
}
