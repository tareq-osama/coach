"use client";

import Link from "next/link";
import {
  Card,
  CardHeader,
  CardBody,
  CardFooter,
  Button,
  Chip,
} from "@heroui/react";

const sections = [
  {
    key: "training",
    title: "Training",
    subtitle: "Members, exercises, plans & sessions",
    icon: "💪",
    links: [
      { href: "/app/members", label: "Members", desc: "Manage client profiles" },
      { href: "/app/exercises", label: "Exercises", desc: "Exercise library" },
      { href: "/app/muscle-groups", label: "Muscle Groups", desc: "Target muscle groups" },
      { href: "/app/workout-modules", label: "Workout Modules", desc: "Workout modules" },
      { href: "/app/workout-plans", label: "Workout Plans", desc: "Create and assign routines" },
      { href: "/app/sessions", label: "Sessions", desc: "Schedule and track sessions" },
    ],
  },
  {
    key: "nutrition",
    title: "Nutrition",
    subtitle: "Meals, plans & logs",
    icon: "🥗",
    links: [
      { href: "/app/meals", label: "Meals", desc: "Meal library" },
      { href: "/app/meals-modules", label: "Meals Modules", desc: "Meal modules" },
      { href: "/app/meal-plans", label: "Meal Plans", desc: "Create and assign meal plans" },
      { href: "/app/meal-logs", label: "Meal Logs", desc: "Log client meals" },
    ],
  },
  {
    key: "tracking",
    title: "Tracking",
    subtitle: "Photos, forms & reports",
    icon: "📊",
    links: [
      { href: "/app/progress-photos", label: "Progress Photos", desc: "Track progress" },
      { href: "/app/forms", label: "Forms", desc: "Custom forms" },
      { href: "/app/reports", label: "Reports", desc: "Analytics and progress" },
    ],
  },
  {
    key: "settings",
    title: "Settings",
    subtitle: "Configure your app",
    icon: "⚙️",
    links: [
      { href: "/app/page-setup", label: "Page Setup", desc: "Configure pages" },
      { href: "/app/settings", label: "Settings", desc: "App settings" },
    ],
  },
];

function QuickLinkCard({ href, label, desc }) {
  return (
    <Link href={href} className="block">
      <Card isPressable isHoverable className="h-full" shadow="sm" radius="md">
        <CardBody className="px-4 py-3">
          <p className="font-medium text-foreground text-sm">{label}</p>
          <p className="text-xs text-default-500 mt-0.5 line-clamp-1">{desc}</p>
        </CardBody>
      </Card>
    </Link>
  );
}

export default function AppHome() {
  return (
    <div className="space-y-8">
      {/* Welcome card */}
      <Card className="border border-default-200/50" shadow="sm" radius="lg">
        <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-semibold text-foreground">Dashboard</h1>
            <Chip size="sm" variant="flat" color="primary">
              Gym Coach
            </Chip>
          </div>
          <p className="text-default-500 text-sm font-normal">
            Welcome back. Use the cards below or the sidebar to manage members, exercises, workout plans, meals, and more.
          </p>
        </CardHeader>
        <CardBody className="px-6 py-2" />
        <CardFooter className="px-6 pb-6 pt-0 gap-2">
          <Button as={Link} href="/app/members" color="primary" size="sm">
            Members
          </Button>
          <Button as={Link} href="/app/exercises" variant="bordered" size="sm">
            Exercises
          </Button>
          <Button as={Link} href="/app/workout-plans" variant="bordered" size="sm">
            Workout Plans
          </Button>
        </CardFooter>
      </Card>

      {/* Section cards */}
      <div className="grid gap-6 sm:grid-cols-1 lg:grid-cols-2">
        {sections.map((section) => (
          <Card
            key={section.key}
            className="border border-default-200/50"
            shadow="sm"
            radius="lg"
          >
            <CardHeader className="flex flex-col items-start gap-1 px-6 pt-6 pb-2">
              <div className="flex items-center gap-2">
                <span className="text-xl" aria-hidden>{section.icon}</span>
                <h2 className="text-lg font-semibold text-foreground">{section.title}</h2>
              </div>
              <p className="text-default-500 text-sm">{section.subtitle}</p>
            </CardHeader>
            <CardBody className="px-6 py-3">
              <div className="grid gap-2 grid-cols-1 sm:grid-cols-2">
                {section.links.map((item) => (
                  <QuickLinkCard
                    key={item.href}
                    href={item.href}
                    label={item.label}
                    desc={item.desc}
                  />
                ))}
              </div>
            </CardBody>
          </Card>
        ))}
      </div>
    </div>
  );
}
