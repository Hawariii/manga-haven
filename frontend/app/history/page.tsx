"use client";

import { useEffect, useState } from "react";
import { EmptyState } from "@/components/EmptyState";
import { MangaCard } from "@/components/manga/MangaCard";
import { MangaCardSkeleton } from "@/components/manga/MangaCardSkeleton";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { api, getApiErrorMessage } from "@/lib/api";
import { getStoredToken } from "@/lib/auth";
import type { ApiResponse, HistoryItem, PaginatedData } from "@/lib/types";

export default function HistoryPage() {
  const [items, setItems] = useState<HistoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { showToast } = useToast();

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

  return (
    <section className="space-y-5">
      <SectionHeading
        eyebrow="History"
        title="Terakhir Dibaca"
        description="Resume manga yang terakhir kamu buka beserta chapter terakhirnya."
      />

      {loading ? (
        <div className="grid grid-cols-2 gap-4">
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
        <div className="grid grid-cols-2 gap-4">
          {items.map((item) =>
            item.manga ? <MangaCard key={item.id} manga={item.manga} /> : null,
          )}
        </div>
      )}
    </section>
  );
}
