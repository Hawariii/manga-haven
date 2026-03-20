"use client";

import { MenuIcon, MoonIcon, SearchIcon, SunIcon } from "@/components/icons";
import { useShellUi } from "@/components/providers/ShellUiProvider";
import { useTheme } from "@/components/providers/ThemeProvider";

export function NavbarTop() {
  const { openMenu, openSearch } = useShellUi();
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="fixed inset-x-0 top-0 z-40 px-4 pt-4 lg:px-8">
      <div className="desktop-shell">
        <div className="glass-panel mx-auto flex w-full items-center justify-between rounded-[1.75rem] px-5 py-4 lg:rounded-[1.9rem] lg:px-6">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,228,128,0.35),_rgba(255,194,77,0.08))] ring-1 ring-yellow-300/20">
          <span className="text-lg font-black text-[var(--gold-strong)]">M</span>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted)]">Manga</p>
          <h1 className="text-base font-bold tracking-[0.12em] text-[var(--foreground)]">HAVEN</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={toggleTheme}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
          aria-label="Toggle theme"
        >
          {theme === "dark" ? <SunIcon className="h-5 w-5" /> : <MoonIcon className="h-5 w-5" />}
        </button>
        <button
          onClick={openSearch}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          onClick={openMenu}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
          aria-label="Menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
        </div>
      </div>
    </header>
  );
}
