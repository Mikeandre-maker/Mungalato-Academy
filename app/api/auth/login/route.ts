import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function POST(req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  if (!url || !key) {
    return NextResponse.json({ message: "Sign-in is not configured. Add SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." }, { status: 503 });
  }

  let body: Record<string, unknown>;
  try {
    const value: unknown = await req.json();
    if (!value || typeof value !== "object" || Array.isArray(value)) throw new Error("Invalid");
    body = value as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Enter your email and password." }, { status: 400 });
  }

  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || !password) {
    return NextResponse.json({ message: "Enter a valid email address and password." }, { status: 400 });
  }

  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/token?grant_type=password`, {
      method: "POST",
      headers: { apikey: key, Authorization: `Bearer ${key}`, "Content-Type": "application/json", Accept: "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok || !result || typeof result !== "object") {
      const details = result && typeof result === "object" ? result as Record<string, unknown> : {};
      const description = typeof details.msg === "string"
        ? details.msg
        : typeof details.message === "string"
          ? details.message
          : typeof details.error_description === "string"
            ? details.error_description
            : typeof details.error === "string"
              ? details.error
              : "";
      const errorCode = typeof details.error_code === "string"
        ? details.error_code
        : typeof details.code === "string"
          ? details.code
          : "";
      // Log only Supabase's status and error text; never log credentials or session tokens.
      console.error("Supabase sign-in failed", { status: response.status, code: errorCode || undefined, message: description });
      if (response.status === 429) {
        return NextResponse.json({ message: "Too many sign-in attempts. Please wait a few minutes and try again." }, { status: 429 });
      }
      if (/confirm|not confirmed|unverified/i.test(`${description} ${errorCode}`)) {
        return NextResponse.json({ message: "Please confirm your email address before signing in." }, { status: 401 });
      }
      if (/rate.?limit|too many requests/i.test(`${description} ${errorCode}`)) {
        return NextResponse.json({ message: "Too many sign-in attempts. Please wait a few minutes and try again." }, { status: 429 });
      }
      if (response.status >= 500) {
        return NextResponse.json({ message: "The sign-in service is temporarily unavailable. Please try again shortly." }, { status: 502 });
      }
      return NextResponse.json({ message: "Email or password is incorrect. Check both and try again." }, { status: 401 });
    }
    const session = result as Record<string, unknown>;
    if (typeof session.access_token !== "string" || typeof session.refresh_token !== "string") {
      return NextResponse.json({ message: "Supabase did not return a valid session. Please try again." }, { status: 502 });
    }
    const user = session.user && typeof session.user === "object" ? session.user as Record<string, unknown> : {};
    const responseOut = NextResponse.json({
      user: {
        id: typeof user.id === "string" ? user.id : "",
        email: typeof user.email === "string" ? user.email : email,
        fullName: user.user_metadata && typeof user.user_metadata === "object" && typeof (user.user_metadata as Record<string, unknown>).full_name === "string" ? (user.user_metadata as Record<string, unknown>).full_name : "",
        country: user.user_metadata && typeof user.user_metadata === "object" && typeof (user.user_metadata as Record<string, unknown>).country === "string" ? (user.user_metadata as Record<string, unknown>).country : "",
        role: user.user_metadata && typeof user.user_metadata === "object" && typeof (user.user_metadata as Record<string, unknown>).participant_role === "string" ? (user.user_metadata as Record<string, unknown>).participant_role : "Founder",
      },
    });
    const secure = process.env.NODE_ENV === "production";
    responseOut.cookies.set("va_access_token", session.access_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: typeof session.expires_in === "number" ? session.expires_in : 3600 });
    responseOut.cookies.set("va_refresh_token", session.refresh_token, { httpOnly: true, secure, sameSite: "lax", path: "/", maxAge: 60 * 60 * 24 * 30 });
    return responseOut;
  } catch {
    return NextResponse.json({ message: "Could not reach the sign-in service. Please try again." }, { status: 502 });
  }
}
