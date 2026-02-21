"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Card, CardBody, CardHeader, Button, Input, Spinner } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { createAccount } from "@/lib/appwrite-auth";

export default function RegisterPage() {
  const router = useRouter();
  const { user, loading: authLoading, refresh } = useAuth();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!authLoading && user) router.replace("/app");
  }, [user, authLoading, router]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await createAccount(email.trim(), password, name.trim());
      await refresh(); // update auth context so /app layout sees the user
      router.replace("/app");
    } catch (err) {
      setError(err?.message ?? "Registration failed. Try a different email or stronger password.");
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
          <h1 className="text-2xl font-semibold text-foreground">Pulse®</h1>
          <p className="text-sm text-default-500">Create your account</p>
        </CardHeader>
        <CardBody className="gap-4 px-6 pb-6 pt-4">
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="rounded-lg bg-danger-50 px-3 py-2 text-sm text-danger-700 dark:bg-danger-100 dark:text-danger-800">
                {error}
              </div>
            )}
            <Input
              type="text"
              label="Name"
              placeholder="Your name"
              value={name}
              onValueChange={setName}
              autoComplete="name"
            />
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
              autoComplete="new-password"
              description="At least 8 characters"
            />
            <Button type="submit" color="primary" className="w-full" isLoading={loading} isDisabled={loading}>
              Create account
            </Button>
          </form>
          <p className="text-center text-sm text-default-500">
            Already have an account?{" "}
            <Link href="/login" className="font-medium text-primary hover:underline">
              Sign in
            </Link>
          </p>
        </CardBody>
      </Card>
    </div>
  );
}
