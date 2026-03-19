"use client";

import { useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import { getStoredToken, isStoredAdmin } from "@/lib/auth";

type UseAuthGuardOptions = {
  adminOnly?: boolean;
  redirectTo?: string;
};

export function useAuthGuard(options: UseAuthGuardOptions = {}) {
  const pathname = usePathname();
  const router = useRouter();
  const isAuthenticated = typeof window !== "undefined" && Boolean(getStoredToken());
  const isAdmin = typeof window !== "undefined" && isStoredAdmin();
  const requiresAdmin = options.adminOnly ?? false;
  const redirectTo = options.redirectTo ?? (requiresAdmin ? "/admin/login" : "/profile");

  useEffect(() => {
    if (!isAuthenticated || (requiresAdmin && !isAdmin)) {
      router.replace(`${redirectTo}?next=${encodeURIComponent(pathname)}`);
    }
  }, [isAdmin, isAuthenticated, pathname, redirectTo, requiresAdmin, router]);

  return { isChecking: !isAuthenticated || (requiresAdmin && !isAdmin) };
}
