"use client";

import { getNavItemByPath } from "../nav-config";
import { SIDEBAR_ICON_COMPONENTS } from "../sidebar-icons";

/**
 * Reusable empty state: icon + title from sidebar nav, minimal inbox-style layout.
 * Use on list/table pages when there are no items.
 *
 * @param {string} pathname - Current route (e.g. "/app/inbox") to resolve icon + label
 * @param {string} [message] - Override default "No {label} yet" (e.g. "No messages yet")
 * @param {string} [title] - Override label as title (for non-nav contexts)
 * @param {React.ComponentType} [icon] - Override icon component (for non-nav contexts)
 * @param {string} [className] - Extra classes on the outer wrapper
 */
export default function EmptyState({ pathname, message, title, icon: IconOverride, className = "" }) {
  const navItem = pathname ? getNavItemByPath(pathname) : null;
  const label = title ?? navItem?.label ?? "Items";
  const iconKey = navItem?.iconKey ?? "document";
  const IconComponent = IconOverride ?? SIDEBAR_ICON_COMPONENTS[iconKey] ?? SIDEBAR_ICON_COMPONENTS.document;
  const defaultMessage = `No ${label.toLowerCase()} yet`;
  const displayMessage = message ?? defaultMessage;

  return (
    <div className={`flex flex-col items-center justify-center gap-3 text-center ${className}`.trim()}>
      <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-default-100">
        <IconComponent className="h-8 w-8 text-default-400" />
      </div>
      <p className="text-sm text-default-400">{displayMessage}</p>
    </div>
  );
}
