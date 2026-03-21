"use client";

import axios from "axios";
import { clearSession, getStoredToken } from "@/lib/auth";

export const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_BASE_URL,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

api.interceptors.request.use((config) => {
  const token = getStoredToken();

  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      clearSession();
    }

    return Promise.reject(error);
  },
);

export function getApiErrorMessage(error: unknown) {
  if (axios.isAxiosError(error)) {
    const validationErrors = error.response?.data?.errors;

    if (validationErrors && typeof validationErrors === "object") {
      const firstMessage = Object.values(validationErrors)
        .flat()
        .find((value) => typeof value === "string");

      if (typeof firstMessage === "string" && firstMessage.length > 0) {
        return firstMessage;
      }
    }

    return (
      error.response?.data?.message ||
      error.message ||
      "Terjadi kesalahan saat menghubungi server."
    );
  }

  return "Terjadi kesalahan yang tidak diketahui.";
}
