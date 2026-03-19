"use client";

import type { User } from "@/lib/types";

const TOKEN_KEY = "manga_haven_token";
const USER_KEY = "manga_haven_user";
const COOKIE_KEY = "manga_haven_token";
const ROLE_COOKIE_KEY = "manga_haven_role";

export function getStoredToken() {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(TOKEN_KEY);
}

export function setStoredToken(token: string) {
  window.localStorage.setItem(TOKEN_KEY, token);
  document.cookie = `${COOKIE_KEY}=${token}; path=/; max-age=2592000; samesite=lax`;
}

export function clearStoredToken() {
  window.localStorage.removeItem(TOKEN_KEY);
  document.cookie = `${COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function getStoredUser() {
  if (typeof window === "undefined") {
    return null;
  }

  const raw = window.localStorage.getItem(USER_KEY);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw) as User;
  } catch {
    return null;
  }
}

export function setStoredUser(user: User) {
  window.localStorage.setItem(USER_KEY, JSON.stringify(user));
  document.cookie = `${ROLE_COOKIE_KEY}=${user.role}; path=/; max-age=2592000; samesite=lax`;
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_KEY);
  document.cookie = `${ROLE_COOKIE_KEY}=; path=/; max-age=0; samesite=lax`;
}

export function clearSession() {
  clearStoredToken();
  clearStoredUser();
}

export function isStoredAdmin() {
  return getStoredUser()?.role === "admin";
}
