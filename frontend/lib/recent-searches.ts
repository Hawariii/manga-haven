"use client";

const RECENT_SEARCHES_KEY = "manga_haven_recent_searches";
const MAX_RECENT_SEARCHES = 6;

export function getRecentSearches() {
  if (typeof window === "undefined") {
    return [];
  }

  try {
    const raw = window.localStorage.getItem(RECENT_SEARCHES_KEY);
    return raw ? (JSON.parse(raw) as string[]) : [];
  } catch {
    return [];
  }
}

export function saveRecentSearch(keyword: string) {
  if (typeof window === "undefined") {
    return;
  }

  const trimmed = keyword.trim();

  if (!trimmed) {
    return;
  }

  const next = [trimmed, ...getRecentSearches().filter((item) => item !== trimmed)].slice(
    0,
    MAX_RECENT_SEARCHES,
  );

  window.localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(next));
}

export function clearRecentSearches() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(RECENT_SEARCHES_KEY);
}
