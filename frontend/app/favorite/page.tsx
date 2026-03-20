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
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6">
          <SectionHeading
            eyebrow="Favorite"
            title="Daftar Simpanan"
            description="Semua manga yang ditandai user sebagai favorit akan muncul di sini."
          />
        </div>
        <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Saved List</p>
          <p className="mt-3 text-4xl font-bold text-[var(--foreground)]">{items.length}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Total manga yang saat ini masuk ke daftar favorit user.
          </p>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
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
        <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 2xl:grid-cols-4">
          {items.map((item) =>
            item.manga ? <MangaCard key={item.id} manga={item.manga} /> : null,
          )}
        </div>
      )}
    </section>
  );
}
