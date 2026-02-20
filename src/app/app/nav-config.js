/**
 * Single source of truth for sidebar nav: href, label, iconKey.
 * Layout and EmptyState use this to get icon + title per route.
 */
export const NAV_SECTIONS = [
  {
    title: null,
    links: [
      { href: "/app", label: "Overview", iconKey: "chart" },
      { href: "/app/inbox", label: "Inbox", iconKey: "inbox" },
    ],
  },
  {
    title: "Training",
    links: [
      { href: "/app/members", label: "Members", iconKey: "users" },
      { href: "/app/exercises", label: "Exercises", iconKey: "dumbbell" },
      { href: "/app/muscle-groups", label: "Muscle Groups", iconKey: "body" },
      { href: "/app/workout-modules", label: "Workout Modules", iconKey: "layers" },
      { href: "/app/workout-plans", label: "Workout Plans", iconKey: "clipboard" },
      { href: "/app/sessions", label: "Sessions", iconKey: "calendar" },
    ],
  },
  {
    title: "Nutrition",
    links: [
      { href: "/app/meals", label: "Meals", iconKey: "apple" },
      { href: "/app/meal-categories", label: "Meal Categories", iconKey: "body" },
      { href: "/app/meals-modules", label: "Meals Modules", iconKey: "layers" },
      { href: "/app/meal-plans", label: "Meal Plans", iconKey: "clipboard" },
      { href: "/app/meal-logs", label: "Meal Logs", iconKey: "document" },
    ],
  },
  {
    title: "Tracking",
    links: [
      { href: "/app/forms", label: "Forms", iconKey: "form" },
      { href: "/app/reports", label: "Reports", iconKey: "chart" },
    ],
  },
];

const allLinks = NAV_SECTIONS.flatMap((s) => s.links);

/**
 * Get nav item (label + iconKey) for a pathname. Used by EmptyState and layout.
 * @param {string} pathname - e.g. "/app/inbox"
 * @returns {{ label: string, iconKey: string } | null}
 */
export function getNavItemByPath(pathname) {
  const link = allLinks.find((l) => l.href === pathname);
  return link ? { label: link.label, iconKey: link.iconKey } : null;
}
