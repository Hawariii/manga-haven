"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from "react";
import { CloseIcon, HeartIcon, HistoryIcon, HomeIcon, TrophyIcon, UserIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { SearchBar } from "@/components/search/SearchBar";

type ShellUiContextType = {
  openSearch: () => void;
  openMenu: () => void;
  closePanels: () => void;
};

const ShellUiContext = createContext<ShellUiContextType | null>(null);

export function ShellUiProvider({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const [searchOpen, setSearchOpen] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const [keyword, setKeyword] = useState("");
  const inputWrapRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    if (!searchOpen) {
      return;
    }

    const input = inputWrapRef.current?.querySelector("input");
    input?.focus();
  }, [searchOpen]);

  function closePanels() {
    setSearchOpen(false);
    setMenuOpen(false);
  }

  function handleSearchSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const value = keyword.trim();
    const target = value ? `/?q=${encodeURIComponent(value)}` : "/";
    router.push(target);
    closePanels();
  }

  const value = useMemo(
    () => ({
      openSearch() {
        setMenuOpen(false);
        setSearchOpen(true);
      },
      openMenu() {
        setSearchOpen(false);
        setMenuOpen(true);
      },
      closePanels,
    }),
    [],
  );

  const menuItems = [
    { href: "/", label: "Beranda", icon: HomeIcon },
    { href: "/history", label: "History", icon: HistoryIcon },
    { href: "/top-manga", label: "Top Manga", icon: TrophyIcon },
    { href: "/favorite", label: "Favorite", icon: HeartIcon },
    { href: "/profile", label: "Profile", icon: UserIcon },
  ];

  return (
    <ShellUiContext.Provider value={value}>
      {children}

      {(searchOpen || menuOpen) ? (
        <div
          className="fixed inset-0 z-50 bg-black/72 backdrop-blur-sm"
          onClick={closePanels}
        />
      ) : null}

      <div
        className={`fixed inset-x-0 top-0 z-[60] mx-auto max-w-md px-4 pt-20 transition ${
          searchOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0"
        }`}
      >
        <div
          className="glass-panel rounded-[1.8rem] p-4 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold)]">Search</p>
              <h3 className="text-lg font-semibold text-white">Cari manga</h3>
            </div>
            <button
              onClick={closePanels}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
              aria-label="Close search"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <form onSubmit={handleSearchSubmit} className="space-y-3">
            <div ref={inputWrapRef}>
              <SearchBar
                value={keyword}
                onChange={setKeyword}
                placeholder="Cari judul atau slug manga..."
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <Button type="submit" className="w-full">
                Cari
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="w-full"
                onClick={() => {
                  setKeyword("");
                  router.push("/");
                  closePanels();
                }}
              >
                Reset
              </Button>
            </div>
          </form>
        </div>
      </div>

      <div
        className={`fixed inset-y-0 right-0 z-[60] w-full max-w-sm transition ${
          menuOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        <aside
          className="glass-panel ml-auto flex h-full w-[86%] flex-col border-l border-[var(--line)] px-5 pb-6 pt-20 shadow-2xl"
          onClick={(event) => event.stopPropagation()}
        >
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold)]">Menu</p>
              <h3 className="text-lg font-semibold text-white">Navigasi cepat</h3>
            </div>
            <button
              onClick={closePanels}
              className="flex h-10 w-10 items-center justify-center rounded-2xl border border-[var(--line)] bg-white/4 text-[var(--gold)]"
              aria-label="Close menu"
            >
              <CloseIcon className="h-5 w-5" />
            </button>
          </div>

          <div className="space-y-2">
            {menuItems.map(({ href, label, icon: Icon }) => {
              const active = pathname === href;

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={closePanels}
                  className={`flex items-center gap-3 rounded-2xl px-4 py-3 text-sm transition ${
                    active ? "bg-white/7 text-[var(--gold)]" : "text-white"
                  }`}
                >
                  <Icon className="h-5 w-5" />
                  <span>{label}</span>
                </Link>
              );
            })}
          </div>

          <div className="mt-auto rounded-[1.6rem] border border-[var(--line)] bg-white/4 p-4">
            <p className="text-sm font-semibold text-white">Guest bisa baca manga publik</p>
            <p className="mt-2 text-xs leading-5 text-[var(--muted)]">
              Untuk favorite dan history, login lewat halaman profile.
            </p>
            <Link href="/profile" className="mt-4 block">
              <Button className="w-full" variant="secondary" onClick={closePanels}>
                Buka Profile
              </Button>
            </Link>
          </div>
        </aside>
      </div>
    </ShellUiContext.Provider>
  );
}

export function useShellUi() {
  const context = useContext(ShellUiContext);

  if (!context) {
    throw new Error("useShellUi must be used within ShellUiProvider");
  }

  return context;
}
