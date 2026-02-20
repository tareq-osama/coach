"use client";

import {
  UserIcon,
  UsersIcon,
  BoltIcon,
  HeartIcon,
  Squares2X2Icon,
  ClipboardDocumentListIcon,
  CalendarDaysIcon,
  CakeIcon,
  DocumentTextIcon,
  CameraIcon,
  ChartBarIcon,
  Cog6ToothIcon,
  InboxIcon,
  ArrowRightOnRectangleIcon,
  ChevronRightIcon,
} from "@heroicons/react/24/solid";

export const iconClass = "h-5 w-5 shrink-0";
export const iconClassSm = "h-4 w-4 shrink-0";

/** Icon components keyed for sidebar and EmptyState. */
export const SIDEBAR_ICON_COMPONENTS = {
  person: UserIcon,
  users: UsersIcon,
  dumbbell: BoltIcon,
  body: HeartIcon,
  layers: Squares2X2Icon,
  clipboard: ClipboardDocumentListIcon,
  calendar: CalendarDaysIcon,
  apple: CakeIcon,
  document: DocumentTextIcon,
  camera: CameraIcon,
  form: DocumentTextIcon,
  chart: ChartBarIcon,
  inbox: InboxIcon,
  cog: Cog6ToothIcon,
};

/** Pre-rendered icon elements for layout sidebar (with size classes). */
export function getSidebarIcons() {
  const icons = {};
  for (const [key, Icon] of Object.entries(SIDEBAR_ICON_COMPONENTS)) {
    if (key === "person") {
      icons[key] = <Icon className={iconClassSm} />;
    } else {
      icons[key] = <Icon className={iconClass} />;
    }
  }
  icons.logout = <ArrowRightOnRectangleIcon className={iconClass} />;
  icons.chevronRight = <ChevronRightIcon className="h-4 w-4 shrink-0" />;
  return icons;
}
