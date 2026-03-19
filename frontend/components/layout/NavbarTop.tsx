"use client";

import { MenuIcon, SearchIcon } from "@/components/icons";
import { useToast } from "@/components/providers/ToastProvider";

export function NavbarTop() {
  const { showToast } = useToast();

  return (
    <header className="glass-panel fixed inset-x-0 top-0 z-40 mx-auto flex max-w-md items-center justify-between rounded-b-[1.75rem] px-5 py-4">
      <div className="flex items-center gap-3">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-[radial-gradient(circle_at_top,_rgba(255,228,128,0.35),_rgba(255,194,77,0.08))] ring-1 ring-yellow-300/20">
          <span className="text-lg font-black text-[var(--gold-strong)]">M</span>
        </div>
        <div>
          <p className="text-[0.65rem] uppercase tracking-[0.3em] text-[var(--muted)]">Manga</p>
          <h1 className="text-base font-bold tracking-[0.12em] text-white">HAVEN</h1>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => showToast("Pencarian akan kita sambung ke backend setelah UI utama beres.")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
          aria-label="Search"
        >
          <SearchIcon className="h-5 w-5" />
        </button>
        <button
          onClick={() => showToast("Menu tambahan belum diaktifkan.")}
          className="flex h-11 w-11 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
          aria-label="Menu"
        >
          <MenuIcon className="h-5 w-5" />
        </button>
      </div>
    </header>
  );
}
