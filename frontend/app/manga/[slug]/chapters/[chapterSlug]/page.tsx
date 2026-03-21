"use client";

import Image from "next/image";
import Link from "next/link";
import { use, useEffect, useState } from "react";
import { ArrowLeftIcon, ArrowRightIcon } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";
import { hasStoredSession } from "@/lib/auth";
import type { ApiResponse, ReaderPayload } from "@/lib/types";

type ReaderPageProps = {
  params: Promise<{ slug: string; chapterSlug: string }>;
};

export default function ReaderPage({ params }: ReaderPageProps) {
  const { slug, chapterSlug } = use(params);
  const [reader, setReader] = useState<ReaderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadReader() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<ReaderPayload>>(`/manga/${slug}/chapters/${chapterSlug}`);
        setReader(response.data.data);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    void loadReader();
  }, [chapterSlug, showToast, slug]);

  useEffect(() => {
    async function saveHistory() {
      if (!reader || !hasStoredSession()) {
        return;
      }

      try {
        await api.post("/history", {
          manga_id: reader.manga.id,
          last_chapter: reader.chapter.id,
        });
      } catch {
        // Reader should remain usable even if history write fails.
      }
    }

    void saveHistory();
  }, [reader]);

  if (loading) {
    return <div className="h-64 animate-pulse rounded-[2rem] bg-white/6" />;
  }

  if (error || !reader) {
    return <EmptyState title="Chapter gagal dimuat" description={error ?? "Chapter tidak ditemukan."} />;
  }

  const previousHref = reader.navigation.previous
    ? `/manga/${slug}/chapters/${reader.navigation.previous.slug}`
    : null;
  const nextHref = reader.navigation.next
    ? `/manga/${slug}/chapters/${reader.navigation.next.slug}`
    : null;

  return (
    <section className="space-y-5">
      <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold)]">Reader</p>
            <h1 className="mt-2 text-xl font-bold text-[var(--foreground)]">{reader.chapter.title}</h1>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {reader.manga.title} • Chapter {reader.chapter.number} • {reader.chapter.pages_count ?? 0} halaman
            </p>
          </div>
          <Link href={`/manga/${slug}`}>
            <Button variant="secondary">Kembali ke Detail</Button>
          </Link>
        </div>
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        {previousHref ? (
          <Link href={previousHref} className="flex-1">
            <Button variant="secondary" className="w-full">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Chapter Sebelumnya
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" className="w-full flex-1" disabled>
            Tidak ada chapter sebelumnya
          </Button>
        )}

        {nextHref ? (
          <Link href={nextHref} className="flex-1">
            <Button className="w-full">
              Chapter Berikutnya
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" className="w-full flex-1" disabled>
            Tidak ada chapter berikutnya
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {reader.chapter.pages?.map((page) => (
          <div
            key={page.id}
            className="overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)]"
          >
            <div className="border-b border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
              Page {page.page_number}
            </div>
            <div className="relative aspect-[2/3] w-full bg-black">
              <Image
                src={page.image_url}
                alt={`${reader.chapter.title} page ${page.page_number}`}
                fill
                className="object-contain"
                sizes="100vw"
                priority={page.page_number <= 2}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="flex items-center justify-between gap-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
        {previousHref ? (
          <Link href={previousHref} className="flex-1">
            <Button variant="secondary" className="w-full">
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Prev
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" className="w-full flex-1" disabled>
            Prev
          </Button>
        )}

        {nextHref ? (
          <Link href={nextHref} className="flex-1">
            <Button className="w-full">
              Next
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </Link>
        ) : (
          <Button variant="ghost" className="w-full flex-1" disabled>
            Next
          </Button>
        )}
      </div>
    </section>
  );
}
