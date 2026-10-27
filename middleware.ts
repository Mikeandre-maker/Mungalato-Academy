import { NextRequest, NextResponse } from "next/server";

const PUBLIC_PATHS = ["/welcome", "/login", "/register", "/pilot"];
const PUBLIC_API_PREFIXES = ["/api/auth/login", "/api/auth/register", "/api/auth/logout", "/api/pilot"];

function isPublicPath(pathname: string) {
  return PUBLIC_PATHS.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

function isPublicApi(pathname: string) {
  return PUBLIC_API_PREFIXES.some((path) => pathname === path || pathname.startsWith(path + "/"));
}

async function validSession(token: string) {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) return false;
  try {
    const response = await fetch(`${url}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    return response.ok;
  } catch {
    return false;
  }
}

function clearSession(response: NextResponse) {
  response.cookies.set("va_access_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  response.cookies.set("va_refresh_token", "", { httpOnly: true, secure: process.env.NODE_ENV === "production", sameSite: "lax", path: "/", maxAge: 0 });
  return response;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;
  if (pathname.startsWith("/_next/") || pathname === "/favicon.ico" || pathname.match(/\.(?:svg|png|jpg|jpeg|gif|webp|ico|css|js)$/)) {
    return NextResponse.next();
  }

  if (isPublicApi(pathname) || pathname.startsWith("/api/auth/me")) return NextResponse.next();

  const token = request.cookies.get("va_access_token")?.value;
  const publicPage = isPublicPath(pathname);

  if (!token) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Please sign in to continue." }, { status: 401 });
    if (publicPage) return NextResponse.next();
    return NextResponse.redirect(new URL("/welcome", request.url));
  }

  const valid = await validSession(token);
  if (!valid) {
    if (pathname.startsWith("/api/")) return NextResponse.json({ error: "Your session has expired. Please sign in again." }, { status: 401 });
    if (publicPage && pathname !== "/welcome" && pathname !== "/login" && pathname !== "/register") return clearSession(NextResponse.next());
    if (publicPage) return clearSession(NextResponse.next());
    return clearSession(NextResponse.redirect(new URL("/welcome", request.url)));
  }

  if (publicPage && (pathname === "/welcome" || pathname === "/login" || pathname === "/register")) {
    return NextResponse.redirect(new URL("/", request.url));
  }
  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico).*)"],
};
