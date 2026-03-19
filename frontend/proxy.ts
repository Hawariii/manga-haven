import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = ["/history", "/favorite", "/admin"];

export function proxy(request: NextRequest) {
  const token = request.cookies.get("manga_haven_token")?.value;
  const { pathname } = request.nextUrl;

  const requiresAuth = protectedPaths.some((path) => pathname.startsWith(path));

  if (requiresAuth && !token) {
    const redirectUrl = new URL("/profile", request.url);
    redirectUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(redirectUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/history/:path*", "/favorite/:path*", "/admin/:path*"],
};
