"use client";

import type { User } from "@/lib/types";

const USER_KEY = "manga_haven_user";

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
}

export function clearStoredUser() {
  window.localStorage.removeItem(USER_KEY);
}

export function clearSession() {
  clearStoredUser();
}

export function hasStoredSession() {
  return Boolean(getStoredUser());
}

export function isStoredAdmin() {
  return getStoredUser()?.role === "admin";
}
