"use client";

import Image from "next/image";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/Button";

type CoverUploadFieldProps = {
  label?: string;
  description?: string;
  emptyText?: string;
  inputId?: string;
  value?: string;
  onSelect?: (file: File | null) => void;
};

export function CoverUploadField({
  label = "Cover Manga",
  description = "Preview lokal aktif sebelum endpoint upload backend disambungkan.",
  emptyText = "Preview gambar akan muncul di sini sebelum upload ke backend.",
  inputId = "cover-upload",
  value,
  onSelect,
}: CoverUploadFieldProps) {
  const [localPreviewUrl, setLocalPreviewUrl] = useState<string | null>(null);
  const previewUrl = localPreviewUrl ?? value ?? null;

  useEffect(() => {
    return () => {
      if (localPreviewUrl?.startsWith("blob:")) {
        URL.revokeObjectURL(localPreviewUrl);
      }
    };
  }, [localPreviewUrl]);

  function handleFileChange(file: File | null) {
    onSelect?.(file);

    if (!file) {
      setLocalPreviewUrl(null);
      return;
    }

    const objectUrl = URL.createObjectURL(file);
    setLocalPreviewUrl(objectUrl);
  }

  return (
    <div className="space-y-4 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
      <div className="space-y-1">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">{label}</p>
        <p className="text-xs leading-5 text-[var(--muted)]">{description}</p>
      </div>

      <div className="relative aspect-[0.78] overflow-hidden rounded-[1.25rem] bg-black/40">
        {previewUrl ? (
          <Image
            src={previewUrl}
            alt={`${label} preview`}
            fill
            unoptimized
            className="object-cover"
            sizes="280px"
          />
        ) : (
          <div className="flex h-full items-center justify-center px-6 text-center text-sm leading-6 text-[var(--muted)]">
            {emptyText}
          </div>
        )}
      </div>

      <div className="space-y-2">
        <input
          type="file"
          accept="image/*"
          onChange={(event) => handleFileChange(event.target.files?.[0] ?? null)}
          className="hidden"
          id={inputId}
        />
        <label htmlFor={inputId} className="block">
          <Button className="w-full" type="button">
            Pilih Gambar
          </Button>
        </label>
      </div>
    </div>
  );
}
