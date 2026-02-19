"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";
import { HeroUIProvider, ToastProvider } from "@heroui/react";
import { AuthProvider } from "./auth-context";

export function Providers({ children }) {
  return (
    <NextThemesProvider attribute="class" defaultTheme="system" enableSystem>
      <HeroUIProvider>
        <ToastProvider />
        <AuthProvider>{children}</AuthProvider>
      </HeroUIProvider>
    </NextThemesProvider>
  );
}
