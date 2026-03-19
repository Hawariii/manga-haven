"use client";

import { useState } from "react";
import { CoverUploadField } from "@/components/admin/CoverUploadField";
import { SectionHeading } from "@/components/SectionHeading";
import { Button } from "@/components/ui/Button";
import { useAuthGuard } from "@/hooks/useAuthGuard";

export default function AdminMangaPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const { isChecking } = useAuthGuard();

  if (isChecking) {
    return <div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />;
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Admin"
        title="Upload Manga Cover"
        description="Struktur upload admin sudah disiapkan, termasuk preview file sebelum dikirim ke backend."
      />

      <CoverUploadField onSelect={setCoverFile} />

      <div className="space-y-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        <input
          placeholder="Judul manga"
          className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
        />
        <input
          placeholder="Slug manga"
          className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-white outline-none placeholder:text-[var(--muted)]"
        />
        <Button className="w-full" variant="secondary" disabled={!coverFile}>
          Simpan Draft Admin
        </Button>
      </div>
    </section>
  );
}
