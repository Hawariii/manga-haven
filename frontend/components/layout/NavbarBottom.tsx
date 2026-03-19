"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { HeartIcon, HistoryIcon, HomeIcon, TrophyIcon, UserIcon } from "@/components/icons";

const navItems = [
  { href: "/", label: "Home", icon: HomeIcon },
  { href: "/history", label: "History", icon: HistoryIcon },
  { href: "/top-manga", label: "Top Manga", icon: TrophyIcon },
  { href: "/favorite", label: "Favorite", icon: HeartIcon },
  { href: "/profile", label: "Profile", icon: UserIcon },
];

export function NavbarBottom() {
  const pathname = usePathname();

  return (
    <nav className="glass-panel fixed inset-x-0 bottom-0 z-40 mx-auto max-w-md rounded-t-[1.75rem] px-2 pb-[max(0.75rem,env(safe-area-inset-bottom))] pt-2">
      <div className="grid grid-cols-5 gap-1">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;

          return (
            <Link
              key={href}
              href={href}
              className={`flex flex-col items-center gap-1 rounded-2xl px-2 py-3 text-[0.68rem] transition ${
                active ? "bg-white/6 text-[var(--gold)]" : "text-[var(--muted)]"
              }`}
            >
              <Icon className="h-5 w-5" />
              <span>{label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
