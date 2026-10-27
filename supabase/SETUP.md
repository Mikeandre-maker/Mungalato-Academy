# Supabase setup for Venture Arena

## 1. Create the database tables

1. Open your Supabase project.
2. Go to **SQL Editor** and create a new query.
3. Copy the complete contents of `supabase/schema.sql` from this repository.
4. Run it. It creates the profile, venture, judge-history, and per-user workspace tables and enables row-level security.

The script is designed to be rerun safely. Do not create a public table for passwords. Supabase Auth stores password hashes and manages credential verification.

## 2. Supabase Auth

In **Authentication → URL Configuration**, set the Site URL to your deployed Vercel URL. Add that same URL to the allowed redirect URLs if your confirmation flow uses it.

If email confirmation is enabled, a new user must confirm the email before logging in. The registration page tells users to confirm and then sign in.

## 3. Vercel environment variables

In Vercel → Project → Settings → Environment Variables, configure:

- `SUPABASE_URL`: the Project URL shown in Supabase Project Settings → API.
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: the project's publishable/anon key expected by this code.
- `OPENAI_API_KEY`: a secret OpenAI API key for AI judges.
- `OPENAI_MODEL`: optional; defaults to `gpt-4o-mini` in the judge route.

Never put the OpenAI secret key in a `NEXT_PUBLIC_*` variable or commit it to GitHub. Redeploy Vercel after changing environment variables.

## 4. Access flow and saved data

Unauthenticated visitors are sent to `/welcome`. They can choose `/register` or `/login`. The middleware validates the Supabase access token before allowing platform pages and protected API routes.

The app saves each signed-in user's simulation state and judge conversation to `public.user_workspaces`, keyed by their authenticated Supabase user ID. Row-level security prevents users from reading or changing another user's workspace. If the database schema has not been run, workspace saves will fail until it is applied.

## 5. Verify the live deployment

1. Open the deployed site in a private/incognito browser window. It should show the welcome page.
2. Create an account, confirm email if required, and log in.
3. Change the venture name or simulation values and wait for the status to show **Progress saved**.
4. Refresh the page and confirm the values return.
5. Send a question in the Investment Den. If the judge fails, check the browser's displayed error and Vercel Function logs for `/api/judge`. Confirm `OPENAI_API_KEY` and API usage are available.
