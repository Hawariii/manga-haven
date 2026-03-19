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
      <div className="gold-glow overflow-hidden rounded-[2rem] border border-yellow-300/10 bg-[linear-gradient(135deg,_rgba(255,218,97,0.16),_rgba(11,12,12,0.96)_45%)] p-5">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.34em] text-[var(--gold)]">
          Discover
        </p>
        <h2 className="mt-3 max-w-[14rem] text-[1.8rem] font-bold leading-9 text-white">
          Donghua dan manga trending dalam satu layar.
        </h2>
        <p className="mt-3 max-w-[18rem] text-sm leading-6 text-[var(--muted)]">
          Fokus mobile, cepat, dan enak dibaca. Scroll terus buat lihat rilisan terbaru.
        </p>
      </div>

      <SectionHeading
        eyebrow="Beranda"
        title="Update Terbaru"
        description="Grid 2 kolom dengan status tayang, chapter terbaru, dan total view."
      />

      <SearchBar
        value={query}
        onChange={setQuery}
        placeholder="Cari manga favoritmu..."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
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
          <div className="grid grid-cols-2 gap-4">
            {items.map((manga) => (
              <MangaCard key={manga.id} manga={manga} />
            ))}
          </div>

          {loadingMore && (
            <div className="grid grid-cols-2 gap-4">
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
