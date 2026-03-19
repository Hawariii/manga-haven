export type Chapter = {
  id: number;
  manga_id: number;
  title: string;
  number: number;
};

export type Manga = {
  id: number;
  title: string;
  slug: string;
  cover: string;
  views: number;
  status: string;
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
