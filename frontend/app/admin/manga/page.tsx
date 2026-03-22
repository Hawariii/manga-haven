"use client";

import { useCallback, useDeferredValue, useEffect, useMemo, useState } from "react";
import { CoverUploadField } from "@/components/admin/CoverUploadField";
import { SectionHeading } from "@/components/SectionHeading";
import { useToast } from "@/components/providers/ToastProvider";
import { Button } from "@/components/ui/Button";
import { useAuthGuard } from "@/hooks/useAuthGuard";
import { api, getApiErrorMessage } from "@/lib/api";
import type { ApiResponse, Chapter, ChapterPage, Manga, PaginatedData } from "@/lib/types";

function FieldLabel({
  title,
  hint,
}: {
  title: string;
  hint?: string;
}) {
  return (
    <div className="space-y-1">
      <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[var(--gold)]">{title}</p>
      {hint ? <p className="text-xs leading-5 text-[var(--muted)]">{hint}</p> : null}
    </div>
  );
}

function AdminPanelCard({
  title,
  eyebrow,
  description,
  children,
}: {
  title: string;
  eyebrow: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="rounded-[1.8rem] border border-[var(--line)] bg-[var(--surface)] p-5 shadow-[0_16px_40px_rgba(0,0,0,0.12)]">
      <div className="mb-5 space-y-2">
        <p className="text-[0.68rem] font-semibold uppercase tracking-[0.26em] text-[var(--gold)]">{eyebrow}</p>
        <h3 className="text-lg font-semibold text-[var(--foreground)]">{title}</h3>
        {description ? <p className="text-sm leading-6 text-[var(--muted)]">{description}</p> : null}
      </div>
      {children}
    </div>
  );
}

const inputClassName =
  "w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]";

const defaultMangaForm = {
  title: "",
  slug: "",
  cover: "",
  banner: "",
  status: "Ongoing",
  views: "0",
  description: "",
  author: "",
  artist: "",
  type: "Donghua",
  genres: "",
  release_year: "",
  country: "China",
  is_featured: true,
  is_published: true,
};

const defaultChapterForm = {
  mangaId: "",
  title: "",
  number: "",
  slug: "",
  published_at: "",
  is_locked: false,
};

export default function AdminMangaPage() {
  const [, setCoverFile] = useState<File | null>(null);
  const [, setBannerFile] = useState<File | null>(null);
  const [pageFiles, setPageFiles] = useState<File[]>([]);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingManga, setSubmittingManga] = useState(false);
  const [submittingChapter, setSubmittingChapter] = useState(false);
  const [uploadingPages, setUploadingPages] = useState(false);
  const [deletingMangaId, setDeletingMangaId] = useState<number | null>(null);
  const [deletingChapterId, setDeletingChapterId] = useState<number | null>(null);
  const [deletingPageId, setDeletingPageId] = useState<number | null>(null);
  const [editingMangaId, setEditingMangaId] = useState<number | null>(null);
  const [editingChapterId, setEditingChapterId] = useState<number | null>(null);
  const [selectedChapterId, setSelectedChapterId] = useState<number | null>(null);
  const [mangaForm, setMangaForm] = useState(defaultMangaForm);
  const [chapterForm, setChapterForm] = useState(defaultChapterForm);
  const [filters, setFilters] = useState({
    q: "",
    status: "",
    type: "",
    published: "",
  });
  const deferredQuery = useDeferredValue(filters.q);
  const { isChecking } = useAuthGuard({ adminOnly: true });
  const { showToast } = useToast();

  const totalChapters = useMemo(
    () => mangaList.reduce((sum, manga) => sum + (manga.chapters?.length ?? 0), 0),
    [mangaList],
  );

  const totalPages = useMemo(
    () =>
      mangaList.reduce(
        (sum, manga) => sum + (manga.chapters?.reduce((chapterSum, chapter) => chapterSum + (chapter.pages_count ?? 0), 0) ?? 0),
        0,
      ),
    [mangaList],
  );

  const selectedManga = useMemo(
    () => mangaList.find((item) => item.id === Number(chapterForm.mangaId)) ?? null,
    [chapterForm.mangaId, mangaList],
  );

  const selectedChapter = useMemo(
    () => selectedManga?.chapters?.find((item) => item.id === selectedChapterId) ?? null,
    [selectedChapterId, selectedManga],
  );

  const syncSlug = useCallback((title: string) => {
    return title
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "");
  }, []);

  const resetMangaEditor = useCallback(() => {
    setEditingMangaId(null);
    setMangaForm(defaultMangaForm);
    setCoverFile(null);
    setBannerFile(null);
  }, []);

  const resetChapterEditor = useCallback((nextMangaId = "") => {
    setEditingChapterId(null);
    setSelectedChapterId(null);
    setPageFiles([]);
    setChapterForm({
      ...defaultChapterForm,
      mangaId: nextMangaId,
    });
  }, []);

  const loadMangaList = useCallback(async () => {
    try {
      setLoading(true);
      const response = await api.get<ApiResponse<PaginatedData<Manga>>>("/manga", {
        params: {
          admin_all: 1,
          per_page: 50,
          q: deferredQuery || undefined,
          status: filters.status || undefined,
          type: filters.type || undefined,
          published: filters.published || undefined,
        },
      });

      setMangaList(response.data.data.data ?? []);
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setLoading(false);
    }
  }, [deferredQuery, filters.published, filters.status, filters.type, showToast]);

  useEffect(() => {
    void loadMangaList();
  }, [loadMangaList]);

  useEffect(() => {
    if (!selectedManga) {
      setSelectedChapterId(null);
      return;
    }

    if (selectedChapterId && !selectedManga.chapters?.some((chapter) => chapter.id === selectedChapterId)) {
      setSelectedChapterId(null);
    }
  }, [selectedChapterId, selectedManga]);

  function startEditManga(manga: Manga) {
    setEditingMangaId(manga.id);
    setMangaForm({
      title: manga.title,
      slug: manga.slug,
      cover: manga.cover,
      banner: manga.banner ?? "",
      status: manga.status,
      views: String(manga.views ?? 0),
      description: manga.description ?? "",
      author: manga.author ?? "",
      artist: manga.artist ?? "",
      type: manga.type ?? "Donghua",
      genres: (manga.genres ?? []).join(", "),
      release_year: manga.release_year ? String(manga.release_year) : "",
      country: manga.country ?? "China",
      is_featured: Boolean(manga.is_featured),
      is_published: Boolean(manga.is_published),
    });
    setCoverFile(null);
    setBannerFile(null);
  }

  function startChapterDraftForManga(manga: Manga) {
    resetChapterEditor(String(manga.id));
  }

  function startEditChapter(manga: Manga, chapter: Chapter) {
    setEditingChapterId(chapter.id);
    setSelectedChapterId(chapter.id);
    setPageFiles([]);
    setChapterForm({
      mangaId: String(manga.id),
      title: chapter.title,
      number: String(chapter.number),
      slug: chapter.slug ?? "",
      published_at: chapter.published_at ? chapter.published_at.slice(0, 16) : "",
      is_locked: Boolean(chapter.is_locked),
    });
  }

  function selectChapterForPages(manga: Manga, chapter: Chapter) {
    setChapterForm((current) => ({ ...current, mangaId: String(manga.id) }));
    setSelectedChapterId(chapter.id);
  }

  async function handleCreateOrUpdateManga(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSubmittingManga(true);

    const payload = {
      title: mangaForm.title,
      slug: mangaForm.slug,
      cover: mangaForm.cover,
      banner: mangaForm.banner || null,
      status: mangaForm.status,
      views: Number(mangaForm.views || 0),
      description: mangaForm.description || null,
      author: mangaForm.author || null,
      artist: mangaForm.artist || null,
      type: mangaForm.type || null,
      genres: mangaForm.genres
        .split(",")
        .map((item) => item.trim())
        .filter(Boolean),
      release_year: mangaForm.release_year ? Number(mangaForm.release_year) : null,
      country: mangaForm.country || null,
      is_featured: mangaForm.is_featured,
      is_published: mangaForm.is_published,
    };

    try {
      if (editingMangaId) {
        await api.patch(`/manga/${editingMangaId}`, payload);
        showToast("Manga berhasil diperbarui.");
      } else {
        await api.post("/manga", payload);
        showToast("Manga baru berhasil dibuat.");
      }

      resetMangaEditor();
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSubmittingManga(false);
    }
  }

  async function handleCreateOrUpdateChapter(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!chapterForm.mangaId) {
      showToast("Pilih manga target dulu.", "error");
      return;
    }

    setSubmittingChapter(true);

    const payload = {
      title: chapterForm.title,
      number: Number(chapterForm.number),
      slug: chapterForm.slug || undefined,
      published_at: chapterForm.published_at || undefined,
      is_locked: chapterForm.is_locked,
    };

    try {
      if (editingChapterId) {
        await api.patch(`/chapters/${editingChapterId}`, payload);
        showToast("Chapter berhasil diperbarui.");
      } else {
        await api.post(`/manga/${chapterForm.mangaId}/chapters`, payload);
        showToast("Chapter berhasil ditambahkan.");
      }

      const currentMangaId = chapterForm.mangaId;
      resetChapterEditor(currentMangaId);
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setSubmittingChapter(false);
    }
  }

  async function handleDeleteManga(id: number) {
    if (typeof window !== "undefined" && !window.confirm("Hapus manga ini beserta chapter terkait?")) {
      return;
    }

    try {
      setDeletingMangaId(id);
      await api.delete(`/manga/${id}`);
      showToast("Manga berhasil dihapus.");

      if (editingMangaId === id) {
        resetMangaEditor();
      }

      if (Number(chapterForm.mangaId) === id) {
        resetChapterEditor();
      }

      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setDeletingMangaId(null);
    }
  }

  async function handleDeleteChapter(chapter: Chapter) {
    if (typeof window !== "undefined" && !window.confirm("Hapus chapter ini beserta seluruh halaman bacanya?")) {
      return;
    }

    try {
      setDeletingChapterId(chapter.id);
      await api.delete(`/chapters/${chapter.id}`);
      showToast("Chapter berhasil dihapus.");

      if (editingChapterId === chapter.id) {
        resetChapterEditor(chapterForm.mangaId);
      }

      if (selectedChapterId === chapter.id) {
        setSelectedChapterId(null);
        setPageFiles([]);
      }

      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setDeletingChapterId(null);
    }
  }

  async function handleUploadPages() {
    if (!selectedChapter) {
      showToast("Pilih chapter target dulu.", "error");
      return;
    }

    if (!pageFiles.length) {
      showToast("Pilih minimal satu gambar page.", "error");
      return;
    }

    const formData = new FormData();
    pageFiles.forEach((file) => formData.append("pages[]", file));

    try {
      setUploadingPages(true);
      await api.post(`/chapters/${selectedChapter.id}/pages`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      showToast("Page chapter berhasil diupload.");
      setPageFiles([]);
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setUploadingPages(false);
    }
  }

  async function handleDeletePage(page: ChapterPage) {
    if (typeof window !== "undefined" && !window.confirm(`Hapus page ${page.page_number}?`)) {
      return;
    }

    try {
      setDeletingPageId(page.id);
      await api.delete(`/chapter-pages/${page.id}`);
      showToast("Page chapter berhasil dihapus.");
      await loadMangaList();
    } catch (err) {
      showToast(getApiErrorMessage(err), "error");
    } finally {
      setDeletingPageId(null);
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
          title="Admin Manga Workspace"
          description="Satu workspace untuk maintain library, edit metadata, kelola chapter, dan upload halaman reader tanpa pindah halaman."
        />
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">Library</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{mangaList.length}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">manga tampil sesuai filter admin aktif.</p>
        </div>
        <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">Chapters</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{totalChapters}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">chapter terindeks untuk edit dan upload reader.</p>
        </div>
        <div className="rounded-[1.7rem] border border-[var(--line)] bg-[var(--surface)] p-5">
          <p className="text-[0.68rem] font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">Reader Pages</p>
          <p className="mt-2 text-3xl font-bold text-[var(--foreground)]">{totalPages}</p>
          <p className="mt-2 text-sm text-[var(--muted)]">halaman gambar sudah tersimpan di chapter.</p>
        </div>
      </div>

      <div className="grid gap-5 xl:grid-cols-[minmax(0,1.12fr)_minmax(24rem,0.88fr)]">
        <div className="space-y-5">
          <AdminPanelCard
            eyebrow="Manga"
            title={editingMangaId ? "Edit Manga" : "Draft Manga Baru"}
            description="Kelola metadata inti, publishing state, dan asset URL cover/banner."
          >
            <form onSubmit={handleCreateOrUpdateManga} className="space-y-5">
              <div className="grid gap-4 lg:grid-cols-2">
                <CoverUploadField
                  label="Cover Portrait"
                  description="Preview lokal untuk validasi visual. URL final tetap diisi pada field cover."
                  emptyText="Preview cover portrait akan muncul di sini."
                  inputId="manga-cover-upload"
                  value={mangaForm.cover}
                  onSelect={setCoverFile}
                />
                <CoverUploadField
                  label="Banner Landscape"
                  description="Preview lokal untuk hero/banner. URL final tetap diisi pada field banner."
                  emptyText="Preview banner landscape akan muncul di sini."
                  inputId="manga-banner-upload"
                  value={mangaForm.banner}
                  onSelect={setBannerFile}
                />
              </div>

              <div className="grid gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <FieldLabel title="Judul" hint="Slug ikut tergenerate selama belum diubah manual." />
                  <input
                    value={mangaForm.title}
                    onChange={(event) =>
                      setMangaForm((current) => ({
                        ...current,
                        title: event.target.value,
                        slug:
                          current.slug === "" || current.slug === syncSlug(current.title)
                            ? syncSlug(event.target.value)
                            : current.slug,
                      }))
                    }
                    placeholder="Judul manga"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Slug" />
                  <input
                    value={mangaForm.slug}
                    onChange={(event) => setMangaForm((current) => ({ ...current, slug: event.target.value }))}
                    placeholder="slug-manga"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Status" />
                  <input
                    value={mangaForm.status}
                    onChange={(event) => setMangaForm((current) => ({ ...current, status: event.target.value }))}
                    placeholder="Ongoing / Completed"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Cover URL" />
                  <input
                    value={mangaForm.cover}
                    onChange={(event) => setMangaForm((current) => ({ ...current, cover: event.target.value }))}
                    placeholder="https://..."
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Banner URL" />
                  <input
                    value={mangaForm.banner}
                    onChange={(event) => setMangaForm((current) => ({ ...current, banner: event.target.value }))}
                    placeholder="https://..."
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 md:grid-cols-2">
                <div className="space-y-2 md:col-span-2">
                  <FieldLabel title="Deskripsi" />
                  <textarea
                    value={mangaForm.description}
                    onChange={(event) => setMangaForm((current) => ({ ...current, description: event.target.value }))}
                    rows={5}
                    placeholder="Deskripsi singkat manga"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Author" />
                  <input
                    value={mangaForm.author}
                    onChange={(event) => setMangaForm((current) => ({ ...current, author: event.target.value }))}
                    placeholder="Nama author"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Artist / Studio" />
                  <input
                    value={mangaForm.artist}
                    onChange={(event) => setMangaForm((current) => ({ ...current, artist: event.target.value }))}
                    placeholder="Studio / artist"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Type" />
                  <select
                    value={mangaForm.type}
                    onChange={(event) => setMangaForm((current) => ({ ...current, type: event.target.value }))}
                    className={inputClassName}
                  >
                    <option value="Donghua">Donghua</option>
                    <option value="Manga">Manga</option>
                    <option value="Manhwa">Manhwa</option>
                    <option value="Manhua">Manhua</option>
                  </select>
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Country" />
                  <input
                    value={mangaForm.country}
                    onChange={(event) => setMangaForm((current) => ({ ...current, country: event.target.value }))}
                    placeholder="Country"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2 md:col-span-2">
                  <FieldLabel title="Genres" hint="Pisahkan dengan koma." />
                  <input
                    value={mangaForm.genres}
                    onChange={(event) => setMangaForm((current) => ({ ...current, genres: event.target.value }))}
                    placeholder="Action, Fantasy, Adventure"
                    className={inputClassName}
                  />
                </div>
              </div>

              <div className="grid gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 md:grid-cols-2">
                <div className="space-y-2">
                  <FieldLabel title="Views Awal" />
                  <input
                    value={mangaForm.views}
                    onChange={(event) => setMangaForm((current) => ({ ...current, views: event.target.value }))}
                    placeholder="0"
                    type="number"
                    className={inputClassName}
                  />
                </div>
                <div className="space-y-2">
                  <FieldLabel title="Release Year" />
                  <input
                    value={mangaForm.release_year}
                    onChange={(event) => setMangaForm((current) => ({ ...current, release_year: event.target.value }))}
                    placeholder="2026"
                    type="number"
                    className={inputClassName}
                  />
                </div>
                <label className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)]">
                  <span>Featured Content</span>
                  <input
                    type="checkbox"
                    checked={mangaForm.is_featured}
                    onChange={(event) => setMangaForm((current) => ({ ...current, is_featured: event.target.checked }))}
                  />
                </label>
                <label className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)]">
                  <span>Published</span>
                  <input
                    type="checkbox"
                    checked={mangaForm.is_published}
                    onChange={(event) => setMangaForm((current) => ({ ...current, is_published: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button className="min-w-48" disabled={submittingManga || !mangaForm.title || !mangaForm.cover}>
                  {submittingManga ? "Menyimpan..." : editingMangaId ? "Update Manga" : "Simpan Draft Manga"}
                </Button>
                {editingMangaId ? (
                  <Button type="button" variant="secondary" onClick={resetMangaEditor}>
                    Batal Edit
                  </Button>
                ) : null}
              </div>
            </form>
          </AdminPanelCard>

          <AdminPanelCard
            eyebrow="Library"
            title="Manage Library"
            description="Search, filter, edit, delete, dan pilih chapter target langsung dari daftar library."
          >
            <div className="space-y-4">
              <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
                <input
                  value={filters.q}
                  onChange={(event) => setFilters((current) => ({ ...current, q: event.target.value }))}
                  placeholder="Cari judul / author / artist"
                  className={inputClassName}
                />
                <select
                  value={filters.status}
                  onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
                  className={inputClassName}
                >
                  <option value="">Semua status</option>
                  <option value="Ongoing">Ongoing</option>
                  <option value="Completed">Completed</option>
                  <option value="Sedang Tayang">Sedang Tayang</option>
                </select>
                <select
                  value={filters.type}
                  onChange={(event) => setFilters((current) => ({ ...current, type: event.target.value }))}
                  className={inputClassName}
                >
                  <option value="">Semua type</option>
                  <option value="Donghua">Donghua</option>
                  <option value="Manga">Manga</option>
                  <option value="Manhwa">Manhwa</option>
                  <option value="Manhua">Manhua</option>
                </select>
                <select
                  value={filters.published}
                  onChange={(event) => setFilters((current) => ({ ...current, published: event.target.value }))}
                  className={inputClassName}
                >
                  <option value="">Semua visibility</option>
                  <option value="1">Published</option>
                  <option value="0">Draft</option>
                </select>
              </div>

              <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.4rem] border border-[var(--line)] bg-white/3 px-4 py-3 text-sm text-[var(--muted)]">
                <p>
                  Menampilkan <span className="font-semibold text-[var(--foreground)]">{mangaList.length}</span> manga,
                  {" "}
                  <span className="font-semibold text-[var(--foreground)]">{totalChapters}</span> chapter, dan
                  {" "}
                  <span className="font-semibold text-[var(--foreground)]">{totalPages}</span> halaman reader.
                </p>
                <Button
                  type="button"
                  variant="ghost"
                  onClick={() => setFilters({ q: "", status: "", type: "", published: "" })}
                >
                  Reset Filter
                </Button>
              </div>

              <div className="grid gap-3">
                {loading ? (
                  <>
                    <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                    <div className="h-28 animate-pulse rounded-2xl bg-white/5" />
                  </>
                ) : mangaList.length ? (
                  mangaList.map((manga) => (
                    <div
                      key={manga.id}
                      className="rounded-2xl border border-[var(--line)] bg-white/3 px-4 py-4 text-sm leading-6 text-[var(--muted)]"
                    >
                      <div className="flex flex-wrap items-start justify-between gap-4">
                        <div className="space-y-1">
                          <p className="font-semibold text-[var(--foreground)]">{manga.title}</p>
                          <p>{manga.type ?? "-"} • {(manga.genres ?? []).join(", ") || "Tanpa genre"}</p>
                          <p>
                            {manga.status} • {manga.chapters_count ?? 0} chapter • {manga.is_published ? "Published" : "Draft"}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" onClick={() => startEditManga(manga)}>
                            Edit Manga
                          </Button>
                          <Button type="button" variant="secondary" onClick={() => startChapterDraftForManga(manga)}>
                            Chapter Baru
                          </Button>
                          <Button
                            type="button"
                            variant="danger"
                            disabled={deletingMangaId === manga.id}
                            onClick={() => void handleDeleteManga(manga.id)}
                          >
                            {deletingMangaId === manga.id ? "Menghapus..." : "Hapus"}
                          </Button>
                        </div>
                      </div>

                      {manga.chapters?.length ? (
                        <div className="mt-4 space-y-2">
                          {manga.chapters.map((chapter) => (
                            <div
                              key={chapter.id}
                              className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-black/10 px-3 py-3 text-xs leading-5"
                            >
                              <div>
                                <p className="font-semibold text-[var(--foreground)]">{chapter.title}</p>
                                <p>
                                  Ch {chapter.number} • {chapter.pages_count ?? 0} pages
                                  {chapter.is_locked ? " • Locked" : ""}
                                </p>
                              </div>

                              <div className="flex flex-wrap gap-2">
                                <Button type="button" variant="secondary" onClick={() => startEditChapter(manga, chapter)}>
                                  Edit
                                </Button>
                                <Button type="button" variant="secondary" onClick={() => selectChapterForPages(manga, chapter)}>
                                  Manage Pages
                                </Button>
                                <Button
                                  type="button"
                                  variant="danger"
                                  disabled={deletingChapterId === chapter.id}
                                  onClick={() => void handleDeleteChapter(chapter)}
                                >
                                  {deletingChapterId === chapter.id ? "Menghapus..." : "Hapus"}
                                </Button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div className="mt-4 rounded-2xl border border-dashed border-[var(--line)] bg-black/10 px-4 py-4 text-xs leading-6 text-[var(--muted)]">
                          Manga ini belum punya chapter.
                        </div>
                      )}
                    </div>
                  ))
                ) : (
                  <div className="rounded-2xl border border-dashed border-[var(--line)] bg-white/3 px-4 py-6 text-sm leading-6 text-[var(--muted)]">
                    Tidak ada hasil yang cocok dengan filter admin saat ini.
                  </div>
                )}
              </div>
            </div>
          </AdminPanelCard>
        </div>

        <div className="space-y-5">
          <AdminPanelCard
            eyebrow="Chapter"
            title={editingChapterId ? "Edit Chapter" : "Publish Chapter"}
            description="Pilih manga target, atur metadata chapter, lalu jadikan chapter itu target upload halaman."
          >
            <form onSubmit={handleCreateOrUpdateChapter} className="space-y-4">
              <div className="space-y-2">
                <FieldLabel title="Target Manga" />
                <select
                  value={chapterForm.mangaId}
                  onChange={(event) => {
                    const nextMangaId = event.target.value;
                    setChapterForm((current) => ({ ...current, mangaId: nextMangaId }));
                    setSelectedChapterId(null);
                  }}
                  className={inputClassName}
                >
                  <option value="">Pilih manga target</option>
                  {mangaList.map((manga) => (
                    <option key={manga.id} value={manga.id}>
                      {manga.title}
                    </option>
                  ))}
                </select>
              </div>

              {selectedManga ? (
                <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
                  <p className="font-semibold text-[var(--foreground)]">{selectedManga.title}</p>
                  <p>{selectedManga.type ?? "-"} • {(selectedManga.genres ?? []).join(", ") || "Tanpa genre"}</p>
                  <p>{selectedManga.chapters?.length ?? 0} chapter tersedia untuk dikelola.</p>
                </div>
              ) : null}

              <div className="grid gap-4 rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4">
                <div className="space-y-2">
                  <FieldLabel title="Judul Chapter" />
                  <input
                    value={chapterForm.title}
                    onChange={(event) =>
                      setChapterForm((current) => ({
                        ...current,
                        title: event.target.value,
                        slug:
                          current.slug === "" || current.slug === syncSlug(current.title)
                            ? syncSlug(event.target.value)
                            : current.slug,
                      }))
                    }
                    placeholder="Judul chapter"
                    className={inputClassName}
                  />
                </div>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="space-y-2">
                    <FieldLabel title="Nomor" />
                    <input
                      value={chapterForm.number}
                      onChange={(event) => setChapterForm((current) => ({ ...current, number: event.target.value }))}
                      placeholder="128"
                      type="number"
                      className={inputClassName}
                    />
                  </div>
                  <div className="space-y-2">
                    <FieldLabel title="Slug" />
                    <input
                      value={chapterForm.slug}
                      onChange={(event) => setChapterForm((current) => ({ ...current, slug: event.target.value }))}
                      placeholder="episode-128"
                      className={inputClassName}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <FieldLabel title="Publish Date" />
                  <input
                    value={chapterForm.published_at}
                    onChange={(event) => setChapterForm((current) => ({ ...current, published_at: event.target.value }))}
                    type="datetime-local"
                    className={inputClassName}
                  />
                </div>

                <label className="flex items-center justify-between rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)]">
                  <span>Lock chapter access</span>
                  <input
                    type="checkbox"
                    checked={chapterForm.is_locked}
                    onChange={(event) => setChapterForm((current) => ({ ...current, is_locked: event.target.checked }))}
                  />
                </label>
              </div>

              <div className="flex flex-wrap gap-3">
                <Button
                  className="min-w-44"
                  variant="secondary"
                  disabled={submittingChapter || !chapterForm.mangaId || !chapterForm.title || !chapterForm.number}
                >
                  {submittingChapter ? "Menyimpan..." : editingChapterId ? "Update Chapter" : "Publish Chapter"}
                </Button>
                {(editingChapterId || chapterForm.mangaId) ? (
                  <Button type="button" variant="ghost" onClick={() => resetChapterEditor(chapterForm.mangaId)}>
                    Reset Form
                  </Button>
                ) : null}
              </div>
            </form>
          </AdminPanelCard>

          <AdminPanelCard
            eyebrow="Pages"
            title="Upload Chapter Pages"
            description="Workflow reader end-to-end: pilih chapter, upload banyak gambar sekaligus, lalu hapus page bila salah urut."
          >
            <div className="space-y-4">
              {selectedChapter ? (
                <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
                  <p className="font-semibold text-[var(--foreground)]">{selectedChapter.title}</p>
                  <p>
                    Manga: {selectedManga?.title ?? "-"} • Chapter {selectedChapter.number}
                  </p>
                  <p>{selectedChapter.pages_count ?? 0} page tersimpan saat ini.</p>
                </div>
              ) : (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
                  Pilih chapter dari daftar library lewat tombol <span className="font-semibold text-[var(--foreground)]">Manage Pages</span>.
                </div>
              )}

              <div className="space-y-2">
                <FieldLabel title="Images" hint="Bisa pilih banyak file sekaligus. Sistem akan menambahkan page secara berurutan setelah page terakhir." />
                <input
                  type="file"
                  multiple
                  accept="image/*"
                  onChange={(event) => setPageFiles(Array.from(event.target.files ?? []))}
                  className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] file:mr-4 file:rounded-xl file:border-0 file:bg-[var(--gold)] file:px-3 file:py-2 file:text-sm file:font-semibold file:text-black"
                />
              </div>

              {pageFiles.length ? (
                <div className="rounded-[1.4rem] border border-[var(--line)] bg-white/3 p-4 text-xs leading-5 text-[var(--muted)]">
                  {pageFiles.length} file siap diupload: {pageFiles.slice(0, 4).map((file) => file.name).join(", ")}
                  {pageFiles.length > 4 ? " ..." : ""}
                </div>
              ) : null}

              <Button className="w-full" disabled={uploadingPages || !selectedChapter || !pageFiles.length} onClick={() => void handleUploadPages()}>
                {uploadingPages ? "Mengupload pages..." : "Upload Pages ke Chapter"}
              </Button>

              {selectedChapter?.pages?.length ? (
                <div className="space-y-2">
                  {selectedChapter.pages
                    .slice()
                    .sort((a, b) => a.page_number - b.page_number)
                    .map((page) => (
                      <div
                        key={page.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-[var(--line)] bg-white/3 px-4 py-3 text-xs leading-5 text-[var(--muted)]"
                      >
                        <div className="min-w-0">
                          <p className="font-semibold text-[var(--foreground)]">Page {page.page_number}</p>
                          <a
                            href={page.image_url}
                            target="_blank"
                            rel="noreferrer"
                            className="line-clamp-1 text-[var(--muted)] hover:text-[var(--foreground)]"
                          >
                            {page.image_url}
                          </a>
                        </div>
                        <Button
                          type="button"
                          variant="danger"
                          disabled={deletingPageId === page.id}
                          onClick={() => void handleDeletePage(page)}
                        >
                          {deletingPageId === page.id ? "Menghapus..." : "Delete"}
                        </Button>
                      </div>
                    ))}
                </div>
              ) : selectedChapter ? (
                <div className="rounded-[1.4rem] border border-dashed border-[var(--line)] bg-white/3 p-4 text-sm leading-6 text-[var(--muted)]">
                  Chapter ini belum punya halaman reader.
                </div>
              ) : null}
            </div>
          </AdminPanelCard>
        </div>
      </div>
    </section>
  );
}
