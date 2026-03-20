import Link from "next/link";
import Image from "next/image";
import { EyeIcon } from "@/components/icons";
import { formatStatus, formatViews } from "@/lib/format";
import type { Manga } from "@/lib/types";

export function MangaCard({ manga }: { manga: Manga }) {
  const chapter = manga.latest_chapter?.number ?? manga.chapters_count ?? 0;
  const statusLabel = formatStatus(manga.status);
  const hasCover = Boolean(manga.cover);

  return (
    <Link
      href={`/manga/${manga.slug}`}
      className="block overflow-hidden rounded-[1.6rem] border border-[var(--line)] bg-[var(--surface)] shadow-[0_18px_40px_rgba(0,0,0,0.12)] transition hover:-translate-y-1 hover:shadow-[0_18px_40px_rgba(0,0,0,0.18)]"
    >
      <div className="relative aspect-[0.78] overflow-hidden rounded-b-[1.2rem] bg-neutral-900">
        {hasCover ? (
          <Image
            src={manga.cover}
            alt={manga.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 50vw, 240px"
          />
        ) : (
          <div className="flex h-full items-center justify-center bg-[radial-gradient(circle_at_top,_rgba(255,219,122,0.22),_rgba(22,24,24,0.95))] px-4 text-center text-xs font-semibold uppercase tracking-[0.24em] text-[var(--gold)]">
            {manga.title}
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />

        <div className="absolute left-3 top-3 rounded-xl bg-blue-500/90 px-2.5 py-1 text-[0.68rem] font-semibold text-white">
          Ep {chapter}
        </div>

        <div className="absolute bottom-3 left-3 rounded-xl bg-[var(--green)] px-3 py-1.5 text-[0.68rem] font-bold text-white">
          {statusLabel}
        </div>
      </div>

      <div className="space-y-2 px-3.5 pb-4 pt-3.5">
        <h3 className="line-clamp-2 min-h-[2.75rem] text-sm font-semibold leading-5 text-[var(--foreground)]">
          {manga.title}
        </h3>

        <div className="flex items-center justify-between text-[0.7rem] text-[var(--muted)]">
          <div className="flex items-center gap-1.5">
            <EyeIcon className="h-3.5 w-3.5 text-[var(--gold)]" />
            <span>{formatViews(manga.views)} views</span>
          </div>
          <span>{manga.favorites_count ?? 0} fav</span>
        </div>
      </div>
    </Link>
  );
}
