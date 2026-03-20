"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { CoverUploadField } from "@/components/admin/CoverUploadField";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse, Manga, PaginatedData } from "@/lib/types";

export default function AdminMangaPage() {
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingManga, setSubmittingManga] = useState(false);
  const [submittingChapter, setSubmittingChapter] = useState(false);
  const [mangaForm, setMangaForm] = useState({
    title: "",
    slug: "",
    cover: "",
    status: "Ongoing",
    views: "0",
  });
  const [chapterForm, setChapterForm] = useState({
    mangaId: "",
    title: "",
    number: "",
  });
  const { isChecking } = useAuthGuard({ adminOnly: true });
  const { showToast } = useToast();

  const selectedManga = useMemo(
    () => mangaList.find((item) => item.id === Number(chapterForm.mangaId)) ?? null,
    [chapterForm.mangaId, mangaList],
  );

  const loadMangaList = useCallback(async () => {
    try {
      const response = await api.get<ApiResponse<PaginatedData<Manga>>>("/manga", {
        params: { per_page: 50 },
      });
      setMangaList(response.data.data.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    void loadMangaList();
  }, [loadMangaList]);

  function syncSlug(title: string) {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }

  async function handleCreateManga(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingManga(true);

    try {
      await api.post("/manga", {
        title: mangaForm.title,
        slug: mangaForm.slug,
        cover: mangaForm.cover,
        status: mangaForm.status,
        views: Number(mangaForm.views || 0),
      });

      showToast("Manga baru berhasil dibuat.");
      setMangaForm({
        title: "",
        slug: "",
        cover: "",
        status: "Ongoing",
        views: "0",
      });
      setCoverFile(null);
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSubmittingManga(false);
    }
  }

  async function handleCreateChapter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!chapterForm.mangaId) {
      showToast("Pilih manga target dulu.", "error");
      return;
    }

    setSubmittingChapter(true);

    try {
      await api.post(`/manga/${chapterForm.mangaId}/chapters`, {
        title: chapterForm.title,
        number: Number(chapterForm.number),
      });

      showToast("Chapter berhasil ditambahkan.");
      setChapterForm({ mangaId: chapterForm.mangaId, title: "", number: "" });
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSubmittingChapter(false);
    }
  }

  if (isChecking) {
    return <div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />;
  }

  return (
    <section className="space-y-5">
      <div className="rounded-[1.9rem] border border-[var(--line)] bg-[var(--surface)] p-5 lg:p-6">
        <SectionHeading
          eyebrow="Admin"
          title="Admin Manga Panel"
          description="Role admin bisa create manga baru dan upload chapter ke manga target."
        />
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_minmax(0,0.9fr)]">
        <form onSubmit={handleCreateManga} className="space-y-4">
          <CoverUploadField value={mangaForm.cover} onSelect={setCoverFile} />

          <div className="space-y-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
            <input
              value={mangaForm.title}
              onChange={(event) =>
                setMangaForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug: syncSlug(event.target.value),
                }))
              }
              placeholder="Judul manga"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={mangaForm.slug}
              onChange={(event) => setMangaForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="Slug manga"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={mangaForm.cover}
              onChange={(event) => setMangaForm((current) => ({ ...current, cover: event.target.value }))}
              placeholder="URL cover manga"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={mangaForm.status}
                onChange={(event) => setMangaForm((current) => ({ ...current, status: event.target.value }))}
                placeholder="Status"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              <input
                value={mangaForm.views}
                onChange={(event) => setMangaForm((current) => ({ ...current, views: event.target.value }))}
                placeholder="Views"
                type="number"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <Button className="w-full" disabled={submittingManga || !mangaForm.cover}>
              {submittingManga ? "Menyimpan manga..." : "Upload Manga"}
            </Button>
            {coverFile ? (
              <p className="text-xs leading-5 text-[var(--gold)]">
                Preview lokal aktif: {coverFile.name}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-[var(--muted)]">
              File cover lokal masih dipakai untuk preview. Penyimpanan file backend bisa disambung belakangan tanpa ubah flow admin.
            </p>
          </div>
        </form>

        <div className="space-y-5">
          <form
            onSubmit={handleCreateChapter}
            className="space-y-3 rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4"
          >
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Upload Chapter ke Manga Target</h3>
            <select
              value={chapterForm.mangaId}
              onChange={(event) => setChapterForm((current) => ({ ...current, mangaId: event.target.value }))}
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
            >
              <option value="">Pilih manga target</option>
              {mangaList.map((manga) => (
                <option key={manga.id} value={manga.id}>
                  {manga.title}
                </option>
              ))}
            </select>

            <input
              value={chapterForm.title}
              onChange={(event) => setChapterForm((current) => ({ ...current, title: event.target.value }))}
              placeholder="Judul chapter"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={chapterForm.number}
              onChange={(event) => setChapterForm((current) => ({ ...current, number: event.target.value }))}
              placeholder="Nomor chapter"
              type="number"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <Button className="w-full" variant="secondary" disabled={submittingChapter}>
              {submittingChapter ? "Menyimpan chapter..." : "Upload Chapter"}
            </Button>
            {selectedManga ? (
              <p className="text-xs leading-5 text-[var(--muted)]">
                Target saat ini: <span className="font-semibold text-[var(--foreground)]">{selectedManga.title}</span>
              </p>
            ) : null}
          </form>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Manga Tersedia</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {loading ? "Memuat daftar manga..." : `${mangaList.length} manga siap dipilih untuk upload chapter.`}
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
