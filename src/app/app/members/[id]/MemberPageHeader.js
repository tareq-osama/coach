"use client";

import Link from "next/link";
import {
  Avatar,
  Badge,
  Breadcrumbs,
  BreadcrumbItem,
  Button,
  Input,
  Divider,
} from "@heroui/react";
import { imageUrl } from "@/lib/image-url";
import ImageUploader from "../../components/ImageUploader";

const HomeIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
    <polyline points="9 22 9 12 15 12 15 22" />
  </svg>
);

const CheckIcon = () => (
  <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" aria-hidden>
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const SearchIcon = () => (
  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="shrink-0" aria-hidden>
    <circle cx="11" cy="11" r="8" />
    <path d="m21 21-4.35-4.35" />
  </svg>
);

const DEFAULT_AVATAR = "https://i.pravatar.cc/300?u=";

/**
 * Member profile header: banner, overlapping avatar with badge, breadcrumbs, name/email, action buttons, search, divider.
 * HeroUI only; no external icon libs.
 */
export default function MemberPageHeader({
  avatarSrc,
  onAvatarChange,
  name,
  email,
  memberId,
  breadcrumbs = [],
  primaryLabel = "Save",
  secondaryLabel = "Delete",
  tertiaryLabel = "Back",
  tertiaryHref = "/app/members",
  onPrimary,
  onSecondary,
  onTertiary,
  onSearch,
  isPrimaryLoading = false,
  showSearch = true,
}) {
  const avatarUrl = imageUrl(avatarSrc) || (memberId ? `${DEFAULT_AVATAR}${memberId}` : undefined);

  return (
    <div className="w-full rounded-2xl overflow-visible">
      {/* Banner */}
      <div className="w-full h-44 rounded-t-xl bg-linear-to-r from-primary-100 to-secondary-100 dark:from-primary-500/20 dark:to-secondary-500/20" />

      <div className="px-6 pb-5">
        {/* Avatar (overlaps banner); editable when onAvatarChange provided */}
        <div className="-mt-12 mb-3 w-fit">
          <Badge
            content={<CheckIcon />}
            color="primary"
            placement="bottom-right"
            shape="circle"
            classNames={{
              badge: "w-6 h-6 border-2 border-background bottom-1 right-1 flex items-center justify-center",
            }}
          >
            {onAvatarChange ? (
              <ImageUploader
                variant="avatar"
                value={avatarSrc}
                onValueChange={onAvatarChange}
                prefix="members"
                avatarSize="lg"
                fallbackName={name || "?"}
              />
            ) : (
              <Avatar
                src={avatarUrl}
                name={name || "?"}
                className="w-24 h-24 ring-4 ring-background"
                showFallback
              />
            )}
          </Badge>
        </div>

        {/* Breadcrumbs */}
        <Breadcrumbs className="mb-3" size="sm">
          <BreadcrumbItem startContent={<HomeIcon />} href="/app" as={Link}>
            App
          </BreadcrumbItem>
          {breadcrumbs.slice(0, -1).map((crumb) => (
            <BreadcrumbItem key={crumb}>{crumb}</BreadcrumbItem>
          ))}
          {breadcrumbs.length > 0 && (
            <BreadcrumbItem
              classNames={{
                item: "bg-default-100 font-semibold px-3 py-0.5 rounded-md text-sm",
              }}
            >
              {breadcrumbs[breadcrumbs.length - 1]}
            </BreadcrumbItem>
          )}
        </Breadcrumbs>

        {/* Name + Actions row */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex flex-col gap-0.5">
            {name != null && (
              <h1 className="text-2xl font-bold leading-tight text-foreground">{name || "Unnamed member"}</h1>
            )}
            {email != null && email !== "" && (
              <p className="text-default-400 text-sm">{email}</p>
            )}
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {tertiaryLabel && (
              tertiaryHref ? (
                <Button variant="light" size="sm" as={Link} href={tertiaryHref}>
                  {tertiaryLabel}
                </Button>
              ) : (
                <Button variant="light" size="sm" onPress={onTertiary}>
                  {tertiaryLabel}
                </Button>
              )
            )}
            {secondaryLabel && onSecondary && (
              <Button variant="bordered" size="sm" color="danger" onPress={onSecondary}>
                {secondaryLabel}
              </Button>
            )}
            {primaryLabel && onPrimary && (
              <Button color="primary" size="sm" onPress={onPrimary} isLoading={isPrimaryLoading}>
                {primaryLabel}
              </Button>
            )}
            {showSearch && onSearch && (
              <Input
                classNames={{
                  base: "w-40 sm:w-48",
                  inputWrapper: "h-9",
                }}
                placeholder="Search"
                size="sm"
                startContent={<SearchIcon />}
                endContent={
                  <kbd className="pointer-events-none hidden sm:inline-flex text-xs border border-default-300 rounded px-1 py-0.5 font-mono text-default-500">
                    ⌘K
                  </kbd>
                }
                onValueChange={onSearch}
              />
            )}
          </div>
        </div>

        <Divider className="mt-5" />
      </div>
    </div>
  );
}
