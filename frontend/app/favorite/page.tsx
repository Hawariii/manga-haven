"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { MangaCard } from "@/components/manga/MangaCard";
import { MangaCardSkeleton } from "@/components/manga/MangaCardSkeleton";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { api, getApiErrorMessage } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import type { ApiResponse, FavoriteItem, PaginatedData } from "@/lib/types";

export default function FavoritePage() {
  const [items, setItems] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { isChecking } = useAuthGuard();

  useEffect(() => {
    async function loadFavorites() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<PaginatedData<FavoriteItem>>>("/favorites");
        setItems(response.data.data.data ?? []);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    void loadFavorites();
  }, [showToast]);

  if (isChecking) {
    return <div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />;
  }

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="Favorite"
        title="Daftar Simpanan"
        description="Semua manga yang ditandai user sebagai favorit akan muncul di sini."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
          {Array.from({ length: 4 }).map((_, index) => (
            <MangaCardSkeleton key={index} />
          ))}
        </div>
      ) : !getStoredToken() ? (
        <EmptyState
          title="Belum login"
          description="Favorite list membutuhkan token Sanctum agar bisa memuat data user."
        />
      ) : error ? (
        <EmptyState title="Favorite gagal dimuat" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="Belum ada manga favorit"
          description="Saat user menyimpan manga favorit, daftar itu akan tampil di halaman ini."
        />
      ) : (
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) =>
            item.manga ? <MangaCard key={item.id} manga={item.manga} /> : null,
          )}
        </div>
      )}
    </section>
  );
}
