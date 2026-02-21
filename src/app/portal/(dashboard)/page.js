"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Card, CardBody, CardHeader, Button, Spinner, Input, Modal, ModalContent, ModalHeader, ModalBody, ModalFooter, useDisclosure } from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { updatePassword } from "@/lib/appwrite-auth";

export default function PortalDashboardPage() {
  const router = useRouter();
  const { logout } = useAuth();
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);
  const { isOpen: isPasswordOpen, onOpen: onPasswordOpen, onClose: onPasswordClose } = useDisclosure();

  async function handleSignOut() {
    await logout();
    router.replace("/portal/login");
  }

  function openChangePassword() {
    setCurrentPassword("");
    setNewPassword("");
    setConfirmPassword("");
    setPasswordError("");
    setPasswordSuccess(false);
    onPasswordOpen();
  }

  async function handleChangePassword(e) {
    if (typeof e?.preventDefault === "function") e.preventDefault();
    setPasswordError("");
    if (!currentPassword.trim()) {
      setPasswordError("Enter your current (temporary) password.");
      return;
    }
    if (!newPassword.trim() || newPassword.length < 8) {
      setPasswordError("New password must be at least 8 characters.");
      return;
    }
    if (newPassword !== confirmPassword) {
      setPasswordError("New password and confirmation do not match.");
      return;
    }
    setChangingPassword(true);
    try {
      await updatePassword(newPassword, currentPassword);
      setPasswordSuccess(true);
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err) {
      setPasswordError(err?.message ?? "Failed to update password. Check your current password.");
    } finally {
      setChangingPassword(false);
    }
  }

  useEffect(() => {
    let cancelled = false;
    async function fetchMembers() {
      try {
        const res = await fetch("/api/portal/members", { credentials: "include" });
        const data = await res.json();
        if (cancelled) return;
        if (!res.ok) {
          setError(data.error || "Failed to load");
          return;
        }
        setMembers(Array.isArray(data.members) ? data.members : []);
      } catch (err) {
        if (!cancelled) setError(err?.message ?? "Failed to load");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchMembers();
    return () => { cancelled = true; };
  }, []);

  if (loading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <Spinner size="lg" color="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto max-w-2xl px-4 py-8">
        <Card className="border-danger-200 bg-danger-50/50 dark:border-danger-800 dark:bg-danger-950/30">
          <CardBody>
            <p className="text-danger-700 dark:text-danger-400">{error}</p>
            <Button color="primary" variant="flat" className="mt-3" onPress={() => window.location.reload()}>
              Retry
            </Button>
          </CardBody>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto max-w-4xl px-4 py-8">
      <header className="mb-8 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-semibold text-foreground">Member portal</h1>
        <div className="flex items-center gap-2">
          <Button variant="flat" size="sm" onPress={openChangePassword}>
            Change password
          </Button>
          <Button variant="flat" size="sm" onPress={handleSignOut}>
            Sign out
          </Button>
        </div>
      </header>

      {/* Change password modal */}
      <Modal isOpen={isPasswordOpen} onClose={onPasswordClose}>
        <ModalContent>
          <ModalHeader>Change password</ModalHeader>
          <ModalBody>
            <p className="text-sm text-default-600">
              Enter your current (temporary) password, then choose a new password. You can use the new password to sign in next time.
            </p>
            {passwordSuccess ? (
              <p className="rounded-lg bg-success-50 p-3 text-sm text-success-700 dark:text-success-400">
                Password updated. You can close this and sign in with your new password next time.
              </p>
            ) : (
              <form onSubmit={handleChangePassword} className="flex flex-col gap-3 mt-2">
                {passwordError && (
                  <p className="rounded-lg bg-danger-50 p-2 text-sm text-danger-600 dark:text-danger-400">{passwordError}</p>
                )}
                <Input
                  type="password"
                  label="Current (temporary) password"
                  placeholder="Enter the password your coach gave you"
                  value={currentPassword}
                  onValueChange={setCurrentPassword}
                  autoComplete="current-password"
                  isRequired
                />
                <Input
                  type="password"
                  label="New password"
                  placeholder="At least 8 characters"
                  value={newPassword}
                  onValueChange={setNewPassword}
                  autoComplete="new-password"
                  isRequired
                  minLength={8}
                />
                <Input
                  type="password"
                  label="Confirm new password"
                  placeholder="Re-enter new password"
                  value={confirmPassword}
                  onValueChange={setConfirmPassword}
                  autoComplete="new-password"
                  isRequired
                />
              </form>
            )}
          </ModalBody>
          <ModalFooter>
            {passwordSuccess ? (
              <Button color="primary" onPress={onPasswordClose}>Done</Button>
            ) : (
              <>
                <Button variant="light" onPress={onPasswordClose}>Cancel</Button>
                <Button color="primary" onPress={handleChangePassword} isLoading={changingPassword} isDisabled={changingPassword}>
                  Update password
                </Button>
              </>
            )}
          </ModalFooter>
        </ModalContent>
      </Modal>

      {members.length === 0 ? (
        <Card>
          <CardBody>
            <p className="text-default-600">
              No member profile linked yet. If your coach has invited you, make sure you signed in with the correct email.
              Ask your coach to link your portal account if you don’t see your profile.
            </p>
          </CardBody>
        </Card>
      ) : (
        <div className="space-y-4">
          {members.map((member) => (
            <Card key={member.$id} shadow="sm" className="border-none">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <h2 className="text-lg font-medium text-foreground">{member.name || "Member"}</h2>
              </CardHeader>
              <CardBody className="gap-2 pt-0">
                {member.email && (
                  <p className="text-sm text-default-600">
                    <span className="font-medium text-foreground">Email:</span> {member.email}
                  </p>
                )}
                {member.notes && (
                  <p className="text-sm text-default-600">
                    <span className="font-medium text-foreground">Notes:</span> {member.notes}
                  </p>
                )}
                {member.join_date && (
                  <p className="text-sm text-default-600">
                    <span className="font-medium text-foreground">Join date:</span> {member.join_date}
                  </p>
                )}
                <p className="text-xs text-default-400 mt-2">
                  Your coach can assign workout and meal plans here. Check back for updates.
                </p>
              </CardBody>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
