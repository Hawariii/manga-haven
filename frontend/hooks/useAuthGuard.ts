"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken } from "@/lib/auth";

export function useAuthGuard() {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = typeof window !== "undefined" && Boolean(getStoredToken());

  useEffect(() => {
    if (!isAuthenticated) {
      router.replace(`/profile?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAuthenticated, pathname, router]);

  return { isChecking: !isAuthenticated };
}
