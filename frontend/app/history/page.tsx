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
import type { ApiResponse, HistoryItem, PaginatedData } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();
  const { isChecking } = useAuthGuard();

  useEffect(() => {
    async function loadHistory() {
      if (!getStoredToken()) {
        setLoading(false);
        return;
      }

      try {
        const response = await api.get<ApiResponse<PaginatedData<HistoryItem>>>("/history");
        setItems(response.data.data.data ?? []);
      } catch (err) {
        const message = getApiErrorMessage(err);
        setError(message);
        showToast(message, "error");
      } finally {
        setLoading(false);
      }
    }

    void loadHistory();
  }, [showToast]);

  if (isChecking) {
    return <div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />;
  }

  return (
    <section className="space-y-5">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_18rem]">
        <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6">
          <SectionHeading
            eyebrow="History"
            title="Terakhir Dibaca"
            description="Resume manga yang terakhir kamu buka beserta chapter terakhirnya."
          />
        </div>
        <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] uppercase tracking-[0.24em] text-[var(--gold)]">Reading Log</p>
          <p className="mt-3 text-4xl font-bold text-[var(--foreground)]">{items.length}</p>
          <p className="mt-2 text-sm leading-6 text-[var(--muted)]">
            Total manga yang tercatat sebagai riwayat baca user aktif.
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
          title="Belum ada sesi login"
          description="History akan muncul setelah token login Sanctum tersedia di browser."
        />
      ) : error ? (
        <EmptyState title="History gagal dimuat" description={error} />
      ) : items.length === 0 ? (
        <EmptyState
          title="History masih kosong"
          description="Saat user mulai membaca manga, riwayat terakhir akan tampil di halaman ini."
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
