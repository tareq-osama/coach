"use client";

import { useState, useEffect } from "react";
import {
  Modal,
  ModalContent,
  ModalBody,
  Button,
  Input,
  Select,
  SelectItem,
  ScrollShadow,
} from "@heroui/react";
import { useAuth } from "@/app/auth-context";
import { updateName, updatePrefs, getPrefs } from "@/lib/appwrite-auth";
import ImageUploader from "./ImageUploader";

const iconClass = "h-4 w-4 shrink-0";

const PersonIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
  </svg>
);

const GlobeIcon = () => (
  <svg className={iconClass} fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
  </svg>
);

const SaveIcon = () => (
  <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24" aria-hidden>
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V9a2 2 0 00-2-2h-3m-1 4l-3 3m0 0l-3-3m3 3V4" />
  </svg>
);

const LANGUAGES = [
  { value: "en", label: "English" },
  { value: "ar", label: "Arabic" },
  { value: "fr", label: "French" },
  { value: "es", label: "Spanish" },
  { value: "de", label: "German" },
];

const NAV_ITEMS = [
  { id: "account", label: "Account", icon: PersonIcon },
  { id: "preferences", label: "Preferences", icon: GlobeIcon },
];

export default function CoachSettingsDialog({ isOpen, onOpenChange, onSaved }) {
  const { user, refresh } = useAuth();
  const [section, setSection] = useState("account");
  const [fullName, setFullName] = useState("");
  const [language, setLanguage] = useState("en");
  const [avatarUrl, setAvatarUrl] = useState("");
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState("");
  const [prefs, setPrefs] = useState({});

  useEffect(() => {
    if (!isOpen || !user) return;
    setFullName(user.name ?? "");
    setSaveError("");
    getPrefs()
      .then((p) => {
        const prefsObj = p && typeof p === "object" ? p : {};
        setPrefs(prefsObj);
        setLanguage(prefsObj.language ?? "en");
        setAvatarUrl(prefsObj.avatarUrl ?? "");
      })
      .catch(() => {
        setPrefs({});
        setLanguage("en");
        setAvatarUrl("");
      });
  }, [isOpen, user?.$id]);

  async function handleSave() {
    if (!user?.$id) return;
    setSaving(true);
    setSaveError("");
    try {
      await updateName(fullName.trim());
      const merged = { ...prefs, language, avatarUrl: avatarUrl || undefined };
      await updatePrefs(merged);
      await refresh();
      onSaved?.();
      onOpenChange(false);
    } catch (err) {
      setSaveError(err?.message ?? "Failed to save");
    } finally {
      setSaving(false);
    }
  }

  const hasChanges =
    !!user &&
    (fullName !== (user.name ?? "") || language !== (prefs.language ?? "en") || avatarUrl !== (prefs.avatarUrl ?? ""));

  return (
    <Modal
      isOpen={isOpen}
      onOpenChange={onOpenChange}
      size="5xl"
      backdrop="blur"
      classNames={{
        base: "max-h-[90vh] !max-w-[min(1200px,calc(100vw-2rem))]",
        body: "p-0 overflow-hidden",
        backdrop: "backdrop-blur-md backdrop-saturate-150 bg-black/40",
      }}
    >
      <ModalContent className="border-0">
        <ModalBody className="flex flex-row gap-0 min-h-[60vh] p-0">
          {/* Left sidebar: "Settings" title + nav */}
          <aside className="w-52 shrink-0 flex flex-col bg-default-100 dark:bg-default-50 py-4 px-2">
            <h2 className="text-sm font-semibold text-foreground px-2.5 mb-3">Settings</h2>
            <nav>
              <ul className="space-y-0.5">
                {NAV_ITEMS.map((item) => (
                  <li key={item.id}>
                    <button
                      type="button"
                      onClick={() => setSection(item.id)}
                      className={`flex w-full items-center gap-2 rounded-lg px-2.5 py-2 text-left text-xs transition-colors ${
                        section === item.id
                          ? "bg-default-200 dark:bg-default-100 text-foreground font-medium"
                          : "text-default-600 hover:bg-default-200/80 dark:hover:bg-default-100/80 hover:text-foreground"
                      }`}
                    >
                      <item.icon />
                      {item.label}
                    </button>
                  </li>
                ))}
              </ul>
            </nav>
          </aside>

          {/* Right: content column with margin + rounded container for the form */}
          <div className="flex-1 flex flex-col min-h-0 bg-default-100 dark:bg-default-50 p-1.5">
            <div className="flex-1 flex flex-col min-h-0 rounded-2xl overflow-hidden bg-default-200 dark:bg-default-100">
            <ScrollShadow className="flex-1 min-h-0" classNames={{ base: "max-h-[calc(60vh-3.5rem)]" }}>
              <div className="p-5">
                {section === "account" && (
                <>
                  <p className="text-[11px] text-default-500 mb-3">Settings / Account</p>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground">Profile Information</h3>
                      <p className="text-xs text-default-500 mt-0.5">Update your personal details and profile picture.</p>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-foreground mb-1.5">Profile Picture</label>
                        <ImageUploader
                          value={avatarUrl}
                          onValueChange={setAvatarUrl}
                          prefix="coach"
                          variant="avatar"
                          avatarSize="lg"
                          fallbackName={fullName || user?.email}
                        />
                        <p className="text-[11px] text-default-500 mt-1.5">
                          Upload a new profile picture (PNG, JPG, SVG). Hover to change or remove.
                        </p>
                      </div>
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Full Name</label>
                      <Input
                        value={fullName}
                        onValueChange={setFullName}
                        placeholder="Your name"
                        size="sm"
                        classNames={{ inputWrapper: "bg-default-100 dark:bg-default-50 min-h-8", input: "text-sm" }}
                        aria-label="Full name"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-foreground mb-1.5">Email Address</label>
                      <Input
                        value={user?.email ?? ""}
                        isReadOnly
                        size="sm"
                        description="Email address cannot be changed."
                        classNames={{ inputWrapper: "bg-default-100 dark:bg-default-50 min-h-8", input: "text-sm", description: "text-[11px]" }}
                        aria-label="Email"
                      />
                    </div>
                  </div>
                </>
              )}

              {section === "preferences" && (
                <>
                  <p className="text-[11px] text-default-500 mb-3">Settings / Preferences</p>
                  <div className="space-y-6">
                    <div>
                      <h3 className="text-sm font-semibold text-foreground flex items-center gap-1.5">
                        <GlobeIcon />
                        Language & Region
                      </h3>
                      <p className="text-xs text-default-500 mt-0.5">Choose your preferred language and text direction.</p>
                      <div className="mt-3">
                        <label className="block text-xs font-medium text-foreground mb-1.5">Language</label>
                        <Select
                          selectedKeys={language ? [language] : []}
                          onSelectionChange={(keys) => {
                            const v = Array.from(keys)[0];
                            if (v) setLanguage(v);
                          }}
                          placeholder="Select language"
                          size="sm"
                          classNames={{ trigger: "bg-default-100 dark:bg-default-50 min-h-8", value: "text-sm" }}
                          aria-label="Language"
                        >
                          {LANGUAGES.map((opt) => (
                            <SelectItem key={opt.value} textValue={opt.label} className="text-sm">{opt.label}</SelectItem>
                          ))}
                        </Select>
                        <p className="text-[11px] text-default-500 mt-1.5">This will change the interface language and text direction.</p>
                      </div>
                    </div>
                  </div>
                </>
              )}
              </div>
            </ScrollShadow>
            <div className="shrink-0 flex items-center justify-end gap-2 px-5 py-3 bg-default-200 dark:bg-default-100">
              {saveError && <p className="text-xs text-danger mr-auto">{saveError}</p>}
              <Button size="sm" color="primary" onPress={handleSave} isLoading={saving} isDisabled={!hasChanges} startContent={!saving ? <SaveIcon /> : null} className="text-xs">
                Save
              </Button>
            </div>
            </div>
          </div>
        </ModalBody>
      </ModalContent>
    </Modal>
  );
}
