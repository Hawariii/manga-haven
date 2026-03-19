"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { MangaCard } from "@/components/manga/MangaCard";
import { MangaCardSkeleton } from "@/components/manga/MangaCardSkeleton";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse, Manga } from "@/lib/types";

type SortMode = "views" | "favorites";

export default function TopMangaPage() {
  const [items, setItems] = useState<Manga[]>([]);
  const [sort, setSort] = useState<SortMode>("views");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

  useEffect(() => {
    async function loadTopManga() {
      setLoading(true);
      setError(null);

      try {
        const response = await api.get<ApiResponse<{ data: Manga[] }>>("/top-manga", {
          params: { sort, limit: 10 },
        });
        setItems(response.data.data.data ?? []);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    void loadTopManga();
  }, [showToast, sort]);

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Top Manga"
        title="Peringkat Paling Panas"
        description="Switch ranking berdasarkan total views atau jumlah favorite user."
      />

      <div className="flex gap-2">
        <Button
          className="flex-1"
          variant={sort === "views" ? "primary" : "secondary"}
          onClick={() => setSort("views")}
        >
          Berdasarkan Views
        </Button>
        <Button
          className="flex-1"
          variant={sort === "favorites" ? "primary" : "secondary"}
          onClick={() => setSort("favorites")}
        >
          Berdasarkan Favorite
        </Button>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MangaCardSkeleton key={index} />
          ))}
        </div>
      ) : error ? (
        <EmptyState title="Top manga gagal dimuat" description={error} />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((manga) => (
            <MangaCard key={manga.id} manga={manga} />
          ))}
        </div>
      )}
    </section>
  );
}
