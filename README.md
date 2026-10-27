# Venture Arena

Venture Arena is an entrepreneurship development ecosystem empowering African founders to build, test, and scale businesses through interactive simulations, AI-powered mentorship, practical training, and performance tracking.

## Required environment variables

Configure these in **Vercel → Project → Settings → Environment Variables** for Development, Preview, and Production as appropriate:

- `OPENAI_API_KEY` — server-side OpenAI API key. Never use a `NEXT_PUBLIC_` prefix.
- `OPENAI_MODEL` — optional; defaults to `gpt-4o-mini`.
- `JUDGE_RATE_LIMIT_PER_HOUR` — optional; defaults to `30`.
- `SUPABASE_URL` — your Supabase project URL.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` — your Supabase publishable/anon key. This key is intended for browser-facing projects and is protected by database RLS policies. The application currently uses it from server routes.

Do **not** put a Supabase `service_role` key in frontend code or expose it with a `NEXT_PUBLIC_` prefix.

## Set up Supabase

1. Open your Supabase project.
2. Go to **SQL Editor → New query**.
3. Copy and run `supabase/schema.sql`.
4. Under **Authentication → URL Configuration**, set the Site URL to your deployed site, e.g. `https://venture-arena-113m.vercel.app`, and add that URL to the allowed redirect URLs if email confirmation is enabled.
5. Under **Authentication → Providers → Email**, choose the email-confirmation behavior you want for new registrations.

The schema creates:
- `profiles`, automatically populated from Supabase Auth when a user signs up;
- `ventures`, for a user's saved venture profiles;
- `judge_sessions` and `judge_messages`, for future/persisted judge-session records;
- `pilot_applications`, for institutional pilot submissions.

Row Level Security (RLS) is enabled on these tables. Review policies before adding any new public read/write access.

## AI judge behavior

The homepage's Founder Q&A sends user questions to `/api/judge`. The OpenAI key remains on the server. The API validates requests, limits input size, returns actionable errors, and applies a best-effort per-instance hourly rate limit. Serverless instances do not share in-memory rate-limit state; use a shared database/Redis limiter before opening the service to heavy public traffic.

## Local development

```bash
npm install
cp .env.example .env.local
# Fill .env.local with your real values (do not commit it)
npm run dev
```

Before deployment, run:

```bash
npm run typecheck
npm run lint
npm run build
```

If you change environment variables in Vercel, redeploy so the new values are available to the functions.

## Venture profile and video pitch practice

The home page now includes an additive venture profile form and video-pitch practice panel while keeping the existing Venture Arena dashboard, judge panel, Q&A, and scorecard in place.

- The venture profile is saved in the current browser's local storage and included in chat and pitch-review context. It is not yet synced to a user's Supabase account; account-linked persistence requires an authenticated Supabase session and should be enabled before treating this as cross-device storage.
- Video pitch practice accepts MP4/WebM/QuickTime files up to 100 MB. The video remains in the browser; the client samples up to three resized still frames and sends those frames plus the transcript to `/api/judge` for multimodal review. The model cannot hear the video's audio or reliably judge full-motion delivery, so the transcript is required.
- Judge difficulty is passed to the server and changes the AI's coaching style (easy, medium, hard).

Required server environment variables are documented in `.env.example`. Keep `OPENAI_API_KEY` server-side only.
