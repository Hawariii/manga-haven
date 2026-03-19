"use client";

import { NavbarBottom } from "@/components/layout/NavbarBottom";
import { NavbarTop } from "@/components/layout/NavbarTop";
import { ShellUiProvider } from "@/components/providers/ShellUiProvider";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellUiProvider>
      <div className="app-frame">
        <NavbarTop />
        <main className="content-safe px-4">{children}</main>
        <NavbarBottom />
      </div>
    </ShellUiProvider>
  );
}
