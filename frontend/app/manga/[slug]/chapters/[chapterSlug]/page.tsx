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

type ReaderMode = "single" | "strip";

const READER_MODE_KEY = "manga_haven_reader_mode";
const READER_HIDE_UI_KEY = "manga_haven_reader_hide_ui";

export default function ReaderPage({ params }: ReaderPageProps) {
  const { slug, chapterSlug } = use(params);
  const [reader, setReader] = useState<ReaderPayload | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [readerMode, setReaderMode] = useState<ReaderMode>("strip");
  const [hideUi, setHideUi] = useState(false);
  const [pageIndex, setPageIndex] = useState(0);
  const { showToast } = useToast();

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const savedMode = window.localStorage.getItem(READER_MODE_KEY);
    const savedHideUi = window.localStorage.getItem(READER_HIDE_UI_KEY);

    if (savedMode === "single" || savedMode === "strip") {
      setReaderMode(savedMode);
    }

    if (savedHideUi === "1") {
      setHideUi(true);
    }
  }, []);

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
    setPageIndex(0);
  }, [chapterSlug]);

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

  const pages = reader.chapter.pages ?? [];
  const currentPage = pages[pageIndex] ?? null;

  const previousHref = reader.navigation.previous
    ? `/manga/${slug}/chapters/${reader.navigation.previous.slug}`
    : null;
  const nextHref = reader.navigation.next
    ? `/manga/${slug}/chapters/${reader.navigation.next.slug}`
    : null;

  function updateReaderMode(mode: ReaderMode) {
    setReaderMode(mode);
    if (typeof window !== "undefined") {
      window.localStorage.setItem(READER_MODE_KEY, mode);
    }
  }

  function toggleHideUi() {
    const nextValue = !hideUi;
    setHideUi(nextValue);

    if (typeof window !== "undefined") {
      window.localStorage.setItem(READER_HIDE_UI_KEY, nextValue ? "1" : "0");
    }
  }

  return (
    <section className="space-y-5">
      {!hideUi ? (
        <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-[0.68rem] uppercase tracking-[0.28em] text-[var(--gold)]">Reader</p>
              <h1 className="mt-2 text-xl font-bold text-[var(--foreground)]">{reader.chapter.title}</h1>
              <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
                {reader.manga.title} • Chapter {reader.chapter.number} • {reader.chapter.pages_count ?? 0} halaman
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              <Button
                variant={readerMode === "single" ? "primary" : "secondary"}
                onClick={() => updateReaderMode("single")}
              >
                Single Page
              </Button>
              <Button
                variant={readerMode === "strip" ? "primary" : "secondary"}
                onClick={() => updateReaderMode("strip")}
              >
                Long Strip
              </Button>
              <Button variant="ghost" onClick={toggleHideUi}>
                Hide UI
              </Button>
              <Link href={`/manga/${slug}`}>
                <Button variant="secondary">Kembali ke Detail</Button>
              </Link>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex justify-end">
          <Button variant="ghost" onClick={toggleHideUi}>
            Show UI
          </Button>
        </div>
      )}

      {!hideUi ? (
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

          {readerMode === "single" ? (
            <div className="min-w-32 rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-center text-sm text-[var(--muted)]">
              Page {pageIndex + 1} / {pages.length || 0}
            </div>
          ) : null}

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
      ) : null}

      {readerMode === "single" ? (
        <div className="space-y-4">
          {currentPage ? (
            <button
              type="button"
              onClick={toggleHideUi}
              className="block w-full overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] text-left"
            >
              {!hideUi ? (
                <div className="border-b border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Page {currentPage.page_number}
                </div>
              ) : null}
              <div className="relative aspect-[2/3] w-full bg-black">
                <Image
                  src={currentPage.image_url}
                  alt={`${reader.chapter.title} page ${currentPage.page_number}`}
                  fill
                  className="object-contain"
                  sizes="100vw"
                  priority
                />
              </div>
            </button>
          ) : (
            <EmptyState title="Belum ada halaman" description="Chapter ini belum punya page reader." />
          )}

          <div className="flex items-center gap-3">
            <Button
              variant="secondary"
              className="flex-1"
              disabled={pageIndex <= 0}
              onClick={() => setPageIndex((current) => Math.max(current - 1, 0))}
            >
              <ArrowLeftIcon className="mr-2 h-4 w-4" />
              Page Sebelumnya
            </Button>
            <Button
              className="flex-1"
              disabled={pageIndex >= pages.length - 1}
              onClick={() => setPageIndex((current) => Math.min(current + 1, pages.length - 1))}
            >
              Page Berikutnya
              <ArrowRightIcon className="ml-2 h-4 w-4" />
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">
          {pages.map((page) => (
            <button
              key={page.id}
              type="button"
              onClick={toggleHideUi}
              className="block w-full overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] text-left"
            >
              {!hideUi ? (
                <div className="border-b border-[var(--line)] px-4 py-3 text-xs font-semibold uppercase tracking-[0.22em] text-[var(--muted)]">
                  Page {page.page_number}
                </div>
              ) : null}
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
            </button>
          ))}
        </div>
      )}

      {!hideUi ? (
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
      ) : null}
    </section>
  );
}
