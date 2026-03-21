"use client";

import Image from "next/image";
import { use, useEffect, useState } from "react";
import { EyeIcon, HeartIcon } from "@/components/icons";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";
import { hasStoredSession } from "@/lib/auth";
import { formatStatus, formatViews } from "@/lib/format";
import type { ApiResponse, Manga } from "@/lib/types";

type MangaDetailPageProps = {
  params: Promise<{ slug: string }>;
};

export default function MangaDetailPage({ params }: MangaDetailPageProps) {
  const { slug } = use(params);
  const [manga, setManga] = useState<Manga | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    if (!slug) {
      return;
    }

    async function loadDetail() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<Manga>>(`/manga/${slug}`);
        setManga(response.data.data);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    void loadDetail();
  }, [showToast, slug]);

  async function handleFavorite() {
    if (!manga) {
      return;
    }

    if (!hasStoredSession()) {
      showToast("Login dulu untuk menambahkan favorite.", "error");
      return;
    }

    try {
      await api.post("/favorites", { manga_id: manga.id });
      showToast("Manga berhasil ditambahkan ke favorite.");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    }
  }

  async function handleSaveHistory(chapterId: number) {
    if (!manga || !hasStoredSession()) {
      showToast("Login dulu untuk menyimpan history.", "error");
      return;
    }

    try {
      await api.post("/history", { manga_id: manga.id, last_chapter: chapterId });
      showToast("History terakhir baca berhasil disimpan.");
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    }
  }

  if (loading) {
    return (
      <section className="space-y-4">
        <div className="aspect-[1.25] animate-pulse rounded-[2rem] bg-white/6" />
        <div className="h-6 w-2/3 animate-pulse rounded-full bg-white/6" />
        <div className="h-4 w-full animate-pulse rounded-full bg-white/6" />
      </section>
    );
  }

  if (error || !manga) {
    return <EmptyState title="Manga tidak ditemukan" description={error ?? "Slug tidak valid."} />;
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.05fr)_22rem]">
        <div className="relative aspect-[1.1] overflow-hidden rounded-[2rem] border border-[var(--line)] bg-[var(--surface)] xl:aspect-auto xl:min-h-[28rem]">
          {manga.cover ? (
            <Image
              src={manga.cover}
              alt={manga.title}
              fill
              className="object-cover"
              sizes="100vw"
            />
          ) : null}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/30 to-transparent" />
          <div className="absolute inset-x-0 bottom-0 p-5 lg:p-7">
            <p className="text-[0.68rem] uppercase tracking-[0.32em] text-[var(--gold)]">Detail</p>
            <h1 className="mt-2 max-w-[36rem] text-2xl font-bold text-white lg:text-4xl">{manga.title}</h1>
            <div className="mt-3 flex flex-wrap gap-2">
              {manga.type ? (
                <span className="rounded-full border border-white/10 bg-black/35 px-3 py-1 text-[0.68rem] font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">
                  {manga.type}
                </span>
              ) : null}
              {manga.genres?.map((genre) => (
                <span
                  key={genre}
                  className="rounded-full border border-white/10 bg-black/30 px-3 py-1 text-[0.68rem] font-semibold text-white"
                >
                  {genre}
                </span>
              ))}
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-3 text-sm text-[var(--muted)]">
              <span className="rounded-full bg-[var(--green)] px-3 py-1 text-xs font-semibold text-white">
                {formatStatus(manga.status)}
              </span>
              <span className="flex items-center gap-1">
                <EyeIcon className="h-4 w-4 text-[var(--gold)]" />
                {formatViews(manga.views)} views
              </span>
            </div>
          </div>
        </div>

        <div className="space-y-4 rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Actions</p>
          <div className="rounded-2xl border border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
            <p>
              <span className="font-semibold text-[var(--foreground)]">Author:</span> {manga.author ?? "-"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Artist:</span> {manga.artist ?? "-"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Country:</span> {manga.country ?? "-"}
            </p>
            <p>
              <span className="font-semibold text-[var(--foreground)]">Year:</span> {manga.release_year ?? "-"}
            </p>
          </div>
          <Button onClick={() => void handleFavorite()} className="w-full">
            <HeartIcon className="mr-2 h-4 w-4" />
            Favorite
          </Button>
          <Button variant="secondary" className="w-full">
            Slug: {manga.slug}
          </Button>
          <p className="text-sm leading-6 text-[var(--muted)]">
            Simpan manga ke favorit atau tandai chapter terakhir untuk history baca.
          </p>
        </div>
      </div>

      <SectionHeading
        eyebrow="Chapters"
        title="Daftar Chapter"
        description={manga.description || "Rute halaman ini sudah SEO-friendly karena memakai slug manga."}
      />

      <div className="space-y-3">
        {manga.chapters?.map((chapter) => (
          <button
            key={chapter.id}
            onClick={() => void handleSaveHistory(chapter.id)}
            className="flex w-full items-center justify-between rounded-[1.4rem] border border-[var(--line)] bg-[var(--surface)] px-4 py-4 text-left"
          >
            <div>
              <p className="text-sm font-semibold text-[var(--foreground)]">{chapter.title}</p>
              <div className="mt-1 flex flex-wrap items-center gap-2 text-xs text-[var(--muted)]">
                <span className="uppercase tracking-[0.24em]">Chapter {chapter.number}</span>
                {chapter.published_at ? <span>{new Date(chapter.published_at).toLocaleDateString("id-ID")}</span> : null}
                {chapter.is_locked ? (
                  <span className="rounded-full border border-red-400/20 bg-red-500/10 px-2 py-0.5 text-[0.62rem] font-semibold uppercase tracking-[0.14em] text-red-200">
                    Locked
                  </span>
                ) : null}
              </div>
            </div>
            <span className="text-xs font-semibold text-[var(--gold)]">Simpan</span>
          </button>
        ))}
      </div>
    </section>
  );
}
