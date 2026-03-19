import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/history", "/favorite", "/admin"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("manga_haven_token")?.value;
  const role = request.cookies.get("manga_haven_role")?.value;
  const { pathname } = request.nextUrl;

  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));
  const requiresAdmin = pathname.startsWith("/admin");

  if (requiresAuth && !token) {
    const redirectUrl = new URL(requiresAdmin ? "/admin/login" : "/profile", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  if (requiresAdmin && role !== "admin") {
    const redirectUrl = new URL("/admin/login", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/history/:path*", "/favorite/:path*", "/admin/manga/:path*"],
};
