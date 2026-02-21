"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Button } from "@heroui/react";
import { SwatchIcon } from "@heroicons/react/24/solid";

const SETTINGS_LINKS = [
  { href: "/app/settings/theming", label: "Theming", icon: SwatchIcon },
];

export default function SettingsNav() {
  const pathname = usePathname();

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Settings sections">
      {SETTINGS_LINKS.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;
        return (
          <Button
            key={item.href}
            as={Link}
            href={item.href}
            variant={isActive ? "solid" : "flat"}
            color={isActive ? "primary" : "default"}
            size="sm"
            startContent={Icon ? <Icon className="h-4 w-4" /> : null}
            className="min-w-0"
          >
            {item.label}
          </Button>
        );
      })}
    </nav>
  );
}
