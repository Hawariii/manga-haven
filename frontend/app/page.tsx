"use client";

import { Suspense, useCallback, useEffect, useRef, useState } from "react";
import { useSearchParams } from "next/navigation";
import { MangaCard } from "@/components/manga/MangaCard";
import { MangaCardSkeleton } from "@/components/manga/MangaCardSkeleton";
import { EmptyState } from "@/components/EmptyState";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { SearchBar } from "@/components/search/SearchBar";
import { Button } from "@/components/ui/Button";
import { useDebouncedValue } from "@/hooks/useDebouncedValue";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse, Manga, PaginatedData } from "@/lib/types";

function HomePageContent() {
  const [items, setItems] = useState<Manga[]>([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const sentinelRef = useRef<HTMLDivElement | null>(null);
  const searchParams = useSearchParams();
  const debouncedQuery = useDebouncedValue(query, 450);

  useEffect(() => {
    const incomingQuery = searchParams.get("q") ?? "";
    setQuery(incomingQuery);
  }, [searchParams]);

  const loadManga = useCallback(async (nextPage: number) => {
    const isInitial = nextPage === 1;
    setError(null);

    if (isInitial) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await api.get<ApiResponse<PaginatedData<Manga>>>("/manga", {
        params: { page: nextPage, per_page: 8, q: debouncedQuery || undefined },
      });

      const payload = response.data.data;
      const newItems = payload.data ?? [];

      setItems((current) => (isInitial ? newItems : [...current, ...newItems]));
      setPage(payload.meta?.current_page ?? nextPage);
      setHasMore(Boolean(payload.links?.next));
    } catch (err) {
      const message = getApiErrorMessage(err);
      setError(message);
      showToast(message, "error");
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  }, [debouncedQuery, showToast]);

  useEffect(() => {
    setItems([]);
    setHasMore(true);
    setPage(1);
    void loadManga(1);
  }, [loadManga]);

  useEffect(() => {
    if (!hasMore || loading || loadingMore || !sentinelRef.current) {
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        if (entries[0]?.isIntersecting) {
          void loadManga(page + 1);
        }
      },
      { rootMargin: "120px" },
    );

    observer.observe(sentinelRef.current);

    return () => observer.disconnect();
  }, [hasMore, loading, loadingMore, loadManga, page]);

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1.4fr)_minmax(19rem,0.72fr)]">
        <div className="gold-glow overflow-hidden rounded-[2rem] border border-yellow-300/10 bg-[linear-gradient(135deg,var(--hero-start),var(--hero-end)_45%)] p-5 lg:p-7">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[var(--gold)]">
            Discover
          </p>
          <h2 className="mt-3 max-w-[22rem] text-[1.8rem] font-bold leading-9 text-[var(--foreground)] lg:max-w-[38rem] lg:text-[3.3rem] lg:leading-[1.02]">
            Donghua dan manga trending dalam satu layar.
          </h2>
          <p className="mt-4 max-w-[33rem] text-sm leading-6 text-[var(--muted)] lg:text-base">
            Fokus mobile, cepat, dan enak dibaca. Di desktop, layout sekarang lebih padat, lebih lebar, dan lebih terasa seperti produk web sungguhan.
          </p>
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/5 p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--gold)]">Responsive</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">Mobile dan desktop pakai komposisi layout yang berbeda.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/5 p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--gold)]">Search</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">Search bar dan overlay tetap sinkron ke query URL.</p>
            </div>
            <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/5 p-4">
              <p className="text-[0.68rem] uppercase tracking-[0.2em] text-[var(--gold)]">Theme</p>
              <p className="mt-2 text-sm leading-6 text-[var(--foreground)]">Dark dan light mode aktif global dari shell.</p>
            </div>
          </div>
        </div>

        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-1">
          <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Library</p>
            <p className="mt-3 text-4xl font-bold text-[var(--foreground)]">{items.length}</p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              item tampil berdasarkan hasil search dan pagination yang aktif saat ini.
            </p>
          </div>
          <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5">
            <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Status</p>
            <p className="mt-3 text-lg font-semibold text-[var(--foreground)]">
              {query ? "Search Active" : "Browse Mode"}
            </p>
            <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
              {query
                ? `Menampilkan hasil untuk kata kunci "${query}".`
                : "Menampilkan daftar update terbaru tanpa filter pencarian."}
            </p>
          </div>
        </div>
      </div>

      <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(18rem,25rem)] lg:items-end">
          <SectionHeading
            eyebrow="Beranda"
            title="Update Terbaru"
            description="Grid responsif dengan status tayang, chapter terbaru, total view, dan hasil search yang langsung sinkron ke backend."
          />
          <SearchBar
            value={query}
            onChange={setQuery}
            placeholder="Cari manga favoritmu..."
          />
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {Array.from({ length: 6 }).map((_, index) => (
            <MangaCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <div className="space-y-4">
          <EmptyState
            title="Data manga belum bisa dimuat"
            description={error}
          />
          <Button className="w-full" onClick={() => void loadManga(1)}>
            Coba Lagi
          </Button>
        </div>
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada manga"
          description={
            debouncedQuery
              ? "Tidak ada hasil yang cocok dengan kata kunci yang kamu cari."
              : "Begitu backend sudah terisi data, card manga akan tampil di sini."
          }
        />
      ) : (
        <>
          <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
            {items.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {loadingMore && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
              <MangaCardSkeleton />
              <MangaCardSkeleton />
            </div>
          )}

          {hasMore ? (
            <div ref={sentinelRef} className="py-2">
              <Button
                variant="secondary"
                className="w-full"
                onClick={() => void loadManga(page + 1)}
              >
                Muat Lagi
              </Button>
            </div>
          ) : (
            <p className="pb-2 text-center text-xs uppercase tracking-[0.28em] text-[var(--muted)]">
              Semua data sudah tampil
            </p>
          )}
        </>
      )}
    </section>
  );
}

export default function HomePage() {
  return (
    <Suspense fallback={<div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />}>
      <HomePageContent />
    </Suspense>
  );
}
