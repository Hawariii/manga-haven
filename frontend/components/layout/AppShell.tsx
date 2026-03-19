"use client";

import { NavbarBottom } from "@/components/layout/NavbarBottom";
import { NavbarTop } from "@/components/layout/NavbarTop";

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="app-frame">
      <NavbarTop />
      <main className="content-safe px-4">{children}</main>
      <NavbarBottom />
    </div>
  );
}
