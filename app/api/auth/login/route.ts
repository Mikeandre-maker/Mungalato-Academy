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
      headers: { apikey: key, "Content-Type": "application/json" },
      body: JSON.stringify({ email, password }),
      cache: "no-store",
    });
    const result: unknown = await response.json().catch(() => null);
    if (!response.ok || !result || typeof result !== "object") {
      const details = result && typeof result === "object" ? result as Record<string, unknown> : {};
      const description = typeof details.msg === "string" ? details.msg : typeof details.message === "string" ? details.message : "";
      const message = /confirm/i.test(description) ? "Please confirm your email address before signing in." : "Email or password is incorrect. If you just registered, confirm your email first.";
      return NextResponse.json({ message }, { status: response.status === 429 ? 429 : 401 });
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
