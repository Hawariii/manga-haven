"use client";

import { SearchIcon } from "@/components/icons";

type SearchBarProps = {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
};

export function SearchBar({
  value,
  onChange,
  placeholder = "Cari manga, slug, atau judul...",
}: SearchBarProps) {
  return (
    <label className="flex items-center gap-3 rounded-[1.45rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-3 shadow-[0_14px_40px_rgba(0,0,0,0.18)]">
      <SearchIcon className="h-5 w-5 text-[var(--gold)]" />
      <input
        value={value}
        onChange={(event) => onChange(event.target.value)}
        placeholder={placeholder}
        className="w-full bg-transparent text-sm text-white outline-none placeholder:text-[var(--muted)]"
      />
    </label>
  );
}
