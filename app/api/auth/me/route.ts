import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

export async function GET(req: NextRequest) {
  const url = process.env.SUPABASE_URL;
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.cookies.get("va_access_token")?.value;
  if (!url || !key) return NextResponse.json({ message: "Profile service is not configured." }, { status: 503 });
  if (!token) return NextResponse.json({ message: "Please sign in to view your profile." }, { status: 401 });
  try {
    const response = await fetch(`${url.replace(/\/+$/, "")}/auth/v1/user`, {
      headers: { apikey: key, Authorization: `Bearer ${token}` },
      cache: "no-store",
    });
    const user = await response.json().catch(() => null);
    if (!response.ok || !user || typeof user !== "object") {
      const out = NextResponse.json({ message: "Your session has expired. Please sign in again." }, { status: 401 });
      out.cookies.delete("va_access_token");
      out.cookies.delete("va_refresh_token");
      return out;
    }
    const data = user as Record<string, unknown>;
    const metadata = data.user_metadata && typeof data.user_metadata === "object" ? data.user_metadata as Record<string, unknown> : {};
    return NextResponse.json({ user: {
      id: typeof data.id === "string" ? data.id : "",
      email: typeof data.email === "string" ? data.email : "",
      fullName: typeof metadata.full_name === "string" ? metadata.full_name : "",
      country: typeof metadata.country === "string" ? metadata.country : "",
      role: typeof metadata.participant_role === "string" ? metadata.participant_role : "Founder",
      createdAt: typeof data.created_at === "string" ? data.created_at : "",
    }});
  } catch {
    return NextResponse.json({ message: "Could not load your profile. Please try again." }, { status: 502 });
  }
}
