"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { NavbarBottom } from "@/components/layout/NavbarBottom";
import { NavbarTop } from "@/components/layout/NavbarTop";
import { ShellUiProvider } from "@/components/providers/ShellUiProvider";
import { HeartIcon, HistoryIcon, HomeIcon, TrophyIcon, UserIcon } from "@/components/icons";
import { useTheme } from "@/components/providers/ThemeProvider";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/top-manga", label: "Top Manga", icon: TrophyIcon },
  { href: "/favorite", label: "Favorite", icon: HeartIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

function DesktopSidebar() {
  const pathname = usePathname();
  const { theme } = useTheme();

  return (
    <aside className="desktop-sidebar hidden lg:sticky lg:top-28 lg:flex lg:w-[14.5rem] lg:flex-col lg:self-start lg:rounded-[2rem] lg:border lg:border-[var(--line)] lg:p-5 lg:shadow-[var(--page-shadow)]">
      <div className="mb-5">
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--muted)]">Manga Haven</p>
          <h2 className="mt-2 text-lg font-bold text-[var(--foreground)]">
            Desktop {theme === "dark" ? "Night" : "Paper"}
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Navigasi cepat untuk layar lebar tanpa nuansa viewport mobile.
          </p>
        </div>
      </div>

      <nav className="space-y-2">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex items-center gap-3 rounded-[1.25rem] px-4 py-3 text-sm transition ${
                active
                  ? "bg-[var(--surface-3)] text-[var(--gold)]"
                  : "text-[var(--foreground)] hover:bg-[var(--surface-2)]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </nav>

      <div className="mt-5 rounded-[1.5rem] border border-[var(--line)] bg-white/4 p-4">
        <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Workspace</p>
        <h3 className="mt-2 text-base font-semibold text-[var(--foreground)]">Clean Layout</h3>
        <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
          Sidebar dipadatkan supaya fokus tetap ke library, bukan ke ruang kosong.
        </p>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellUiProvider>
      <div className="min-h-screen px-0 lg:px-5 lg:py-5">
        <NavbarTop />
        <div className="desktop-shell lg:grid lg:grid-cols-[14.5rem_minmax(0,1fr)] lg:gap-5">
          <DesktopSidebar />
          <div className="app-frame">
            <main className="content-safe px-4 lg:px-6">{children}</main>
            <NavbarBottom />
          </div>
        </div>
      </div>
    </ShellUiProvider>
  );
}
