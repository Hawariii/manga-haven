"use client";

import { useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { api, getApiErrorMessage } from "@/lib/api";
import { setStoredUser } from "@/lib/auth";
import type { ApiResponse, User } from "@/lib/types";

export default function AuthCallbackPage() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    async function finalizeLogin() {
      try {
        const response = await api.get<ApiResponse<{ user: User }>>("/user");
        setStoredUser(response.data.data.user);
        router.replace(searchParams.get("next") || "/profile");
      } catch (error) {
        router.replace(`/login?social=google-error&reason=${encodeURIComponent(getApiErrorMessage(error))}`);
      }
    }

    void finalizeLogin();
  }, [router, searchParams]);

  return <div className="h-40 animate-pulse rounded-[2rem] bg-white/6" />;
}
