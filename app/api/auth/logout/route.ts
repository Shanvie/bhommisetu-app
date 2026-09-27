import { NextResponse } from "next/server";

export async function POST() {
  const response = NextResponse.json({ ok: true, message: "Logged out successfully" });
  response.headers.set(
    "Set-Cookie",
    "bhoomisetu_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  return response;
}

export async function GET(request: Request) {
  const url = new URL("/login", request.url);
  const response = NextResponse.redirect(url);
  response.headers.set(
    "Set-Cookie",
    "bhoomisetu_session=; Path=/; HttpOnly; SameSite=Lax; Max-Age=0; expires=Thu, 01 Jan 1970 00:00:00 GMT",
  );
  return response;
}
