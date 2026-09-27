import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const protectedPaths = [
  "/dashboard",
  "/documents",
  "/verification",
  "/land-records",
  "/map",
  "/search",
  "/reports",
  "/notifications",
  "/users",
  "/settings",
  "/audit-logs",
];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const isProtected = protectedPaths.some((path) => pathname === path || pathname.startsWith(`${path}/`));
  const session = request.cookies.get("bhoomisetu_session")?.value;

  if (isProtected && !session) {
    const loginUrl = new URL("/login", request.url);
    return NextResponse.redirect(loginUrl);
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    "/dashboard/:path*",
    "/documents/:path*",
    "/verification/:path*",
    "/land-records/:path*",
    "/map/:path*",
    "/search/:path*",
    "/reports/:path*",
    "/notifications/:path*",
    "/users/:path*",
    "/settings/:path*",
    "/audit-logs/:path*",
  ],
};
