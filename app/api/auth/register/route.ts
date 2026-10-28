import { NextResponse, type NextRequest } from "next/server";

export const runtime = "nodejs";

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const PASSWORD_MIN_LENGTH = 8;
const PARTICIPANT_ROLES = ["Founder", "Aspiring founder", "Student", "Educator", "Investor"];

export async function POST(req: NextRequest) {
  const supabaseUrl = process.env.SUPABASE_URL;
  const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseKey) {
    return NextResponse.json(
      { message: "Registration is not configured yet. Add SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY in Vercel." },
      { status: 503 }
    );
  }

  let body: Record<string, unknown>;
  try {
    const parsed: unknown = await req.json();
    if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
      return NextResponse.json({ message: "Please submit valid registration details." }, { status: 400 });
    }
    body = parsed as Record<string, unknown>;
  } catch {
    return NextResponse.json({ message: "Please submit valid JSON registration details." }, { status: 400 });
  }

  const fullName = typeof body.fullName === "string" ? body.fullName.trim() : "";
  const email = typeof body.email === "string" ? body.email.trim().toLowerCase() : "";
  const password = typeof body.password === "string" ? body.password : "";
  const country = typeof body.country === "string" ? body.country.trim() : "";
  const role = typeof body.role === "string" ? body.role : "";
  const acceptedTerms = body.acceptedTerms === true;

  const fieldErrors: Record<string, string> = {};
  if (fullName.length < 2 || fullName.length > 120) fieldErrors.fullName = "Enter your full name.";
  if (email.length > 254 || !EMAIL_PATTERN.test(email)) fieldErrors.email = "Enter a valid email address.";
  if (password.length < PASSWORD_MIN_LENGTH || password.length > 128 ||
      !/[A-Za-z]/.test(password) || !/[0-9]/.test(password)) {
    fieldErrors.password = "Use at least 8 characters, including a letter and a number.";
  }
  if (!country || country.length > 80) fieldErrors.country = "Select your country.";
  if (!PARTICIPANT_ROLES.includes(role)) fieldErrors.role = "Select how you'll use Venture Arena.";
  if (!acceptedTerms) fieldErrors.acceptedTerms = "You need to accept the terms to continue.";

  if (Object.keys(fieldErrors).length) {
    return NextResponse.json({ message: "Please correct the highlighted fields.", fieldErrors }, { status: 400 });
  }

  try {
    const baseUrl = supabaseUrl.replace(/\/+$/, "");

    // The database RPC counts confirmed participants only. Pending accounts
    // intentionally do not reserve a place. Fail closed if the pilot-cap
    // migration has not been applied, rather than accidentally opening signup.
    const capacityResponse = await fetch(`${baseUrl}/rest/v1/rpc/venture_arena_pilot_has_space`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: "{}",
      cache: "no-store",
    });
    if (!capacityResponse.ok) {
      console.error("Venture Arena pilot capacity check failed", { status: capacityResponse.status });
      return NextResponse.json(
        { message: "Pilot registration is temporarily unavailable while capacity is configured. Please try again shortly." },
        { status: 503 }
      );
    }
    const hasSpace: unknown = await capacityResponse.json().catch(() => null);
    if (hasSpace !== true) {
      return NextResponse.json(
        { message: "The Venture Arena 50-person pilot is full. Registration is currently closed." },
        { status: 409 }
      );
    }

    const response = await fetch(`${baseUrl}/auth/v1/signup`, {
      method: "POST",
      headers: {
        apikey: supabaseKey,
        Authorization: `Bearer ${supabaseKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        data: {
          full_name: fullName,
          country,
          participant_role: role,
          accepted_terms: true,
          accepted_terms_at: new Date().toISOString(),
        },
      }),
      cache: "no-store",
    });

    const result: unknown = await response.json().catch(() => null);
    if (!response.ok) {
      const payload = result && typeof result === "object" ? result as Record<string, unknown> : {};
      const rawMessage = typeof payload.msg === "string"
        ? payload.msg
        : typeof payload.message === "string"
          ? payload.message
          : typeof payload.error_description === "string"
            ? payload.error_description
            : "";
      if (response.status === 422 || /already registered|already exists|user already/i.test(rawMessage)) {
        return NextResponse.json(
          { message: "An account with this email may already exist. Try signing in or resetting your password." },
          { status: 409 }
        );
      }
      console.error("Supabase signup failed", { status: response.status, code: typeof payload.code === "string" ? payload.code : undefined, message: rawMessage });
      if (response.status === 429 || /email rate limit exceeded|rate limit/i.test(rawMessage)) {
        return NextResponse.json(
          { message: "Supabase has temporarily limited confirmation emails. Your account may already exist; try logging in if you have confirmed it, or wait for the email limit to reset." },
          { status: 429 }
        );
      }
      return NextResponse.json(
        { message: "We couldn't create your account. Check your details and try again." },
        { status: response.status >= 500 ? 502 : response.status }
      );
    }

    const payload = result && typeof result === "object" ? result as Record<string, unknown> : {};
    const user = payload.user && typeof payload.user === "object"
      ? payload.user as Record<string, unknown>
      : payload;
    if (typeof user.id !== "string") {
      console.error("Supabase signup returned no user ID");
      return NextResponse.json({ message: "Account creation could not be confirmed. Please try again." }, { status: 502 });
    }

    return NextResponse.json({ userId: user.id, email }, { status: 201 });
  } catch (error) {
    console.error("Registration service unavailable", error instanceof Error ? error.message : "Unknown error");
    return NextResponse.json(
      { message: "Can't reach the registration service right now. Please try again." },
      { status: 502 }
    );
  }
}
