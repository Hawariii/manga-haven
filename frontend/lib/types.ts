export type Chapter = {
  id: number;
  manga_id: number;
  title: string;
  number: number;
  slug?: string | null;
  published_at?: string | null;
  is_locked?: boolean;
  created_by?: number | null;
  pages_count?: number;
  pages?: ChapterPage[];
};

export type ChapterPage = {
  id: number;
  chapter_id: number;
  page_number: number;
  image_url: string;
  width?: number | null;
  height?: number | null;
};

export type Manga = {
  id: number;
  title: string;
  slug: string;
  cover: string;
  banner?: string | null;
  views: number;
  status: string;
  description?: string | null;
  author?: string | null;
  artist?: string | null;
  type?: string | null;
  genres?: string[];
  release_year?: number | null;
  country?: string | null;
  is_featured?: boolean;
  is_published?: boolean;
  chapters_count?: number;
  favorites_count?: number;
  latest_chapter?: Chapter | null;
  chapters?: Chapter[];
};

export type HistoryItem = {
  id: number;
  manga_id: number;
  last_chapter: number;
  manga?: Manga;
  chapter?: Chapter | null;
  updated_at: string;
};

export type FavoriteItem = {
  id: number;
  manga_id: number;
  manga?: Manga;
  created_at: string;
};

export type User = {
  id: number;
  name: string;
  email: string;
  role: "user" | "admin";
  avatar?: string | null;
  email_verified_at?: string | null;
  is_email_verified?: boolean;
};

export type ReaderPayload = {
  manga: Pick<Manga, "id" | "title" | "slug" | "cover">;
  chapter: Chapter;
  navigation: {
    previous?: {
      id: number;
      slug: string;
      title: string;
      number: number;
    } | null;
    next?: {
      id: number;
      slug: string;
      title: string;
      number: number;
    } | null;
  };
};

export type ApiResponse<T> = {
  message: string;
  data: T;
};

export type PaginatedData<T> = {
  data: T[];
  links?: {
    first?: string | null;
    last?: string | null;
    next?: string | null;
    prev?: string | null;
  };
  meta?: {
    current_page: number;
    last_page: number;
    per_page: number;
    total: number;
  };
};
