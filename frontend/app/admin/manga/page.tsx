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
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [mangaList, setMangaList] = useState<Manga[]>([]);
  const [loading, setLoading] = useState(true);
  const [submittingManga, setSubmittingManga] = useState(false);
  const [submittingChapter, setSubmittingChapter] = useState(false);
  const [mangaForm, setMangaForm] = useState({
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
  });
  const [chapterForm, setChapterForm] = useState({
    mangaId: "",
    title: "",
    number: "",
    slug: "",
    published_at: "",
    is_locked: false,
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
        banner: mangaForm.banner,
        status: mangaForm.status,
        views: Number(mangaForm.views || 0),
        description: mangaForm.description,
        author: mangaForm.author,
        artist: mangaForm.artist,
        type: mangaForm.type,
        genres: mangaForm.genres
          .split(",")
          .map((item) => item.trim())
          .filter(Boolean),
        release_year: mangaForm.release_year ? Number(mangaForm.release_year) : null,
        country: mangaForm.country,
        is_featured: mangaForm.is_featured,
        is_published: mangaForm.is_published,
      });

      showToast("Manga baru berhasil dibuat.");
      setMangaForm({
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
      });
      setCoverFile(null);
      setBannerFile(null);
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
        slug: chapterForm.slug || undefined,
        published_at: chapterForm.published_at || undefined,
        is_locked: chapterForm.is_locked,
      });

      showToast("Chapter berhasil ditambahkan.");
      setChapterForm({
        mangaId: chapterForm.mangaId,
        title: "",
        number: "",
        slug: "",
        published_at: "",
        is_locked: false,
      });
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
          <CoverUploadField value={mangaForm.banner} onSelect={setBannerFile} label="Banner Manga" />

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
            <input
              value={mangaForm.banner}
              onChange={(event) => setMangaForm((current) => ({ ...current, banner: event.target.value }))}
              placeholder="URL banner manga"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <textarea
              value={mangaForm.description}
              onChange={(event) => setMangaForm((current) => ({ ...current, description: event.target.value }))}
              placeholder="Deskripsi singkat manga"
              rows={4}
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <div className="grid grid-cols-2 gap-3">
              <input
                value={mangaForm.author}
                onChange={(event) => setMangaForm((current) => ({ ...current, author: event.target.value }))}
                placeholder="Author"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              <input
                value={mangaForm.artist}
                onChange={(event) => setMangaForm((current) => ({ ...current, artist: event.target.value }))}
                placeholder="Artist / Studio"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <select
                value={mangaForm.type}
                onChange={(event) => setMangaForm((current) => ({ ...current, type: event.target.value }))}
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none"
              >
                <option value="Donghua">Donghua</option>
                <option value="Manga">Manga</option>
                <option value="Manhwa">Manhwa</option>
                <option value="Manhua">Manhua</option>
              </select>
              <input
                value={mangaForm.country}
                onChange={(event) => setMangaForm((current) => ({ ...current, country: event.target.value }))}
                placeholder="Country"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
            </div>
            <input
              value={mangaForm.genres}
              onChange={(event) => setMangaForm((current) => ({ ...current, genres: event.target.value }))}
              placeholder="Genres, pisahkan dengan koma"
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
            <div className="grid grid-cols-2 gap-3">
              <input
                value={mangaForm.release_year}
                onChange={(event) => setMangaForm((current) => ({ ...current, release_year: event.target.value }))}
                placeholder="Release year"
                type="number"
                className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
              />
              <div className="grid grid-cols-2 gap-3">
                <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/4 px-3 py-3 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={mangaForm.is_featured}
                    onChange={(event) =>
                      setMangaForm((current) => ({ ...current, is_featured: event.target.checked }))
                    }
                  />
                  Featured
                </label>
                <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/4 px-3 py-3 text-sm text-[var(--foreground)]">
                  <input
                    type="checkbox"
                    checked={mangaForm.is_published}
                    onChange={(event) =>
                      setMangaForm((current) => ({ ...current, is_published: event.target.checked }))
                    }
                  />
                  Published
                </label>
              </div>
            </div>
            <Button className="w-full" disabled={submittingManga || !mangaForm.cover}>
              {submittingManga ? "Menyimpan manga..." : "Upload Manga"}
            </Button>
            {coverFile || bannerFile ? (
              <p className="text-xs leading-5 text-[var(--gold)]">
                Preview lokal aktif:
                {coverFile ? ` cover ${coverFile.name}` : ""}
                {bannerFile ? `${coverFile ? "," : ""} banner ${bannerFile.name}` : ""}
              </p>
            ) : null}
            <p className="text-xs leading-5 text-[var(--muted)]">
              Sekarang admin bisa isi metadata utama seperti author, artist, type, genre, banner, featured, dan published langsung dari panel ini.
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
              onChange={(event) =>
                setChapterForm((current) => ({
                  ...current,
                  title: event.target.value,
                  slug:
                    current.slug ||
                    event.target.value
                      .toLowerCase()
                      .trim()
                      .replace(/[^a-z0-9]+/g, "-")
                      .replace(/^-+|-+$/g, ""),
                }))
              }
              placeholder="Judul chapter"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={chapterForm.slug}
              onChange={(event) => setChapterForm((current) => ({ ...current, slug: event.target.value }))}
              placeholder="Slug chapter"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={chapterForm.published_at}
              onChange={(event) =>
                setChapterForm((current) => ({ ...current, published_at: event.target.value }))
              }
              placeholder="Published at"
              type="datetime-local"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <input
              value={chapterForm.number}
              onChange={(event) => setChapterForm((current) => ({ ...current, number: event.target.value }))}
              placeholder="Nomor chapter"
              type="number"
              className="w-full rounded-2xl border border-[var(--line)] bg-white/4 px-4 py-3 text-sm text-[var(--foreground)] outline-none placeholder:text-[var(--muted)]"
            />
            <label className="flex items-center gap-2 rounded-2xl border border-[var(--line)] bg-white/4 px-3 py-3 text-sm text-[var(--foreground)]">
              <input
                type="checkbox"
                checked={chapterForm.is_locked}
                onChange={(event) =>
                  setChapterForm((current) => ({ ...current, is_locked: event.target.checked }))
                }
              />
              Chapter locked
            </label>
            <Button className="w-full" variant="secondary" disabled={submittingChapter}>
              {submittingChapter ? "Menyimpan chapter..." : "Upload Chapter"}
            </Button>
            {selectedManga ? (
              <div className="rounded-2xl border border-[var(--line)] bg-white/3 p-3 text-xs leading-5 text-[var(--muted)]">
                <p>
                  Target saat ini: <span className="font-semibold text-[var(--foreground)]">{selectedManga.title}</span>
                </p>
                <p>
                  {selectedManga.type ?? "-"} • {(selectedManga.genres ?? []).join(", ") || "Tanpa genre"}
                </p>
              </div>
            ) : null}
          </form>

          <div className="rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] p-4">
            <h3 className="text-lg font-semibold text-[var(--foreground)]">Manga Tersedia</h3>
            <p className="mt-1 text-sm text-[var(--muted)]">
              {loading ? "Memuat daftar manga..." : `${mangaList.length} manga siap dipilih untuk upload chapter.`}
            </p>
            {!loading && mangaList.length ? (
              <div className="mt-4 space-y-2">
                {mangaList.slice(0, 4).map((manga) => (
                  <div
                    key={manga.id}
                    className="rounded-2xl border border-[var(--line)] bg-white/3 px-3 py-3 text-xs leading-5 text-[var(--muted)]"
                  >
                    <p className="font-semibold text-[var(--foreground)]">{manga.title}</p>
                    <p>
                      {manga.type ?? "-"} • {(manga.genres ?? []).join(", ") || "Tanpa genre"}
                    </p>
                  </div>
                ))}
              </div>
            ) : null}
          </div>
        </div>
      </div>
    </section>
  );
}
