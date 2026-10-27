import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/welcome", "/login", "/register", "/pilot"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/pilot"];

export function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const hasSession = Boolean(request.cookies.get("va_access_token")?.value);

  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)) {
    return NextResponse.next();
  }

  if (pathname.startsWith("/api/")) {
    if (PUBLIC_API_PREFIXES.some((path) => pathname === path || pathname.startsWith(path + "/"))) return NextResponse.next();
    if (pathname.startsWith("/api/auth/me")) return NextResponse.next();
    if (!hasSession) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    return NextResponse.next();
  }

  if (PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"))) {
    if (hasSession && (pathname === "/welcome" || pathname === "/login" || pathname === "/register")) {
      return NextResponse.redirect(new URL("/", request.url));
    }
    return NextResponse.next();
  }

  if (!hasSession) return NextResponse.redirect(new URL("/welcome", request.url));
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
