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
    <aside className="desktop-sidebar hidden lg:flex lg:min-h-[calc(100vh-2rem)] lg:w-[18rem] lg:flex-col lg:rounded-[2rem] lg:border lg:border-[var(--line)] lg:p-6 lg:shadow-[var(--page-shadow)]">
      <div className="mb-8 flex items-center gap-4">
        <div className="flex h-14 w-14 items-center justify-center rounded-[1.4rem] bg-[radial-gradient(circle_at_top,_rgba(255,228,128,0.35),_rgba(255,194,77,0.08))] ring-1 ring-yellow-300/20">
          <span className="text-xl font-black text-[var(--gold-strong)]">M</span>
        </div>
        <div>
          <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--muted)]">Manga Haven</p>
          <h2 className="mt-1 text-xl font-bold text-[var(--foreground)]">
            Desktop {theme === "dark" ? "Night" : "Paper"}
          </h2>
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

      <div className="mt-auto space-y-4">
        <div className="rounded-[1.5rem] border border-[var(--line)] bg-white/4 p-4">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Workspace</p>
          <h3 className="mt-2 text-lg font-semibold text-[var(--foreground)]">Desktop Ready</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Layout desktop sekarang punya rail kiri permanen, kanvas lebar, dan navigasi yang nggak lagi terasa seperti viewport mobile yang diperbesar.
          </p>
        </div>
      </div>
    </aside>
  );
}

export function AppShell({ children }: { children: React.ReactNode }) {
  return (
    <ShellUiProvider>
      <div className="min-h-screen px-0 lg:px-4 lg:py-4">
        <NavbarTop />
        <div className="desktop-shell lg:grid lg:grid-cols-[18rem_minmax(0,1fr)] lg:gap-6">
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
