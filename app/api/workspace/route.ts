import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";
const TABLE = "user_workspaces";

async function getAuthenticatedUser(req: NextRequest) {
  const url = process.env.SUPABASE_URL?.replace(/\/+$/, "");
  const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  const token = req.cookies.get("va_access_token")?.value;
  if (!url || !key || !token) return null;
  const response = await fetch(`${url}/auth/v1/user`, {
    headers: { apikey: key, Authorization: `Bearer ${token}` },
    cache: "no-store",
  });
  if (!response.ok) return null;
  const user = await response.json().catch(() => null);
  return user && typeof user.id === "string" ? { id: user.id, url, key, token } : null;
}

export async function GET(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return NextResponse.json({ message: "Your session has expired. Please log in again." }, { status: 401 });
  try {
    const response = await fetch(`${auth.url}/rest/v1/${TABLE}?user_id=eq.${encodeURIComponent(auth.id)}&select=state,updated_at&limit=1`, {
      headers: { apikey: auth.key, Authorization: `Bearer ${auth.token}` },
      cache: "no-store",
    });
    const rows = await response.json().catch(() => null);
    if (!response.ok) {
      console.error("Supabase workspace load failed", response.status, rows);
      return NextResponse.json({ message: "Could not load saved progress. Check that the Supabase workspace schema has been applied." }, { status: 502 });
    }
    const row = Array.isArray(rows) ? rows[0] : null;
    return NextResponse.json({ state: row?.state ?? null, updatedAt: row?.updated_at ?? null });
  } catch {
    return NextResponse.json({ message: "Could not reach the database. Please try again." }, { status: 502 });
  }
}

export async function PUT(req: NextRequest) {
  const auth = await getAuthenticatedUser(req);
  if (!auth) return NextResponse.json({ message: "Your session has expired. Please log in again." }, { status: 401 });
  let body: unknown;
  try { body = await req.json(); } catch { return NextResponse.json({ message: "Invalid workspace data." }, { status: 400 }); }
  if (!body || typeof body !== "object" || Array.isArray(body) || !("state" in body)) {
    return NextResponse.json({ message: "Workspace state is required." }, { status: 400 });
  }
  const state = (body as { state: unknown }).state;
  const encoded = JSON.stringify(state);
  if (encoded.length > 150_000) return NextResponse.json({ message: "Workspace data is too large to save." }, { status: 413 });
  try {
    const response = await fetch(`${auth.url}/rest/v1/${TABLE}?on_conflict=user_id`, {
      method: "POST",
      headers: {
        apikey: auth.key,
        Authorization: `Bearer ${auth.token}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=minimal",
      },
      body: JSON.stringify({ user_id: auth.id, state, updated_at: new Date().toISOString() }),
      cache: "no-store",
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.error("Supabase workspace save failed", response.status, detail.slice(0, 500));
      return NextResponse.json({ message: "Could not save progress. Check that the Supabase workspace schema has been applied." }, { status: 502 });
    }
    return NextResponse.json({ saved: true });
  } catch {
    return NextResponse.json({ message: "Could not reach the database. Please try again." }, { status: 502 });
  }
}
