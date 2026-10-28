-- Venture Arena Supabase schema
-- Run in Supabase SQL Editor. Supabase Auth stores credentials in auth.users;
-- public.profiles stores the founder profile and is linked by user id.

create extension if not exists pgcrypto;

create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  full_name text not null default '',
  email text,
  country text not null default '',
  role text not null default 'Founder'
    check (role in ('Founder', 'Aspiring founder', 'Student', 'Educator', 'Investor')),
  accepted_terms boolean not null default false,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, full_name, email, country, role, accepted_terms)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'full_name', ''),
    new.email,
    coalesce(new.raw_user_meta_data ->> 'country', ''),
    coalesce(new.raw_user_meta_data ->> 'participant_role', 'Founder'),
    coalesce((new.raw_user_meta_data ->> 'accepted_terms')::boolean, false)
  )
  on conflict (id) do update set
    full_name = excluded.full_name,
    email = excluded.email,
    country = excluded.country,
    role = excluded.role,
    accepted_terms = excluded.accepted_terms,
    updated_at = now();
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

create table if not exists public.ventures (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  industry text,
  customer_problem text,
  solution text,
  business_model text,
  stage text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

create table if not exists public.judge_sessions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  venture_id uuid references public.ventures(id) on delete set null,
  judge_name text not null,
  mode text not null default 'chat' check (mode in ('chat', 'evaluate')),
  score integer check (score between 0 and 100),
  feedback text,
  created_at timestamptz not null default now()
);

create table if not exists public.judge_messages (
  id uuid primary key default gen_random_uuid(),
  session_id uuid not null references public.judge_sessions(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  speaker text not null check (speaker in ('founder', 'judge')),
  message text not null,
  created_at timestamptz not null default now()
);

create table if not exists public.pilot_applications (
  id uuid primary key default gen_random_uuid(),
  organisation_name text not null,
  organisation_type text not null,
  contact_name text not null,
  email text not null,
  phone text,
  country text not null,
  cohort_size text not null,
  goals text not null,
  status text not null default 'new' check (status in ('new', 'reviewing', 'accepted', 'declined')),
  created_at timestamptz not null default now()
);

alter table public.profiles enable row level security;
alter table public.ventures enable row level security;
alter table public.judge_sessions enable row level security;
alter table public.judge_messages enable row level security;
alter table public.pilot_applications enable row level security;

drop policy if exists "Users can read own profile" on public.profiles;
create policy "Users can read own profile" on public.profiles
  for select to authenticated using ((select auth.uid()) = id);
drop policy if exists "Users can update own profile" on public.profiles;
create policy "Users can update own profile" on public.profiles
  for update to authenticated using ((select auth.uid()) = id)
  with check ((select auth.uid()) = id);

drop policy if exists "Users manage own ventures" on public.ventures;
create policy "Users manage own ventures" on public.ventures
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own judge sessions" on public.judge_sessions;
create policy "Users manage own judge sessions" on public.judge_sessions
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users manage own judge messages" on public.judge_messages;
create policy "Users manage own judge messages" on public.judge_messages
  for all to authenticated using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

-- Pilot submissions are intentionally not public-readable. Add a trusted
-- server-side submission route before enabling public inserts to this table.


-- Per-user saved workspace (simulation state and judge conversation history).
-- Credentials are managed by Supabase Auth; this table stores app progress only.
create table if not exists public.user_workspaces (
  user_id uuid primary key references auth.users(id) on delete cascade,
  state jsonb not null default '{}'::jsonb,
  updated_at timestamptz not null default now()
);

alter table public.user_workspaces enable row level security;

drop policy if exists "Users can read their own workspace" on public.user_workspaces;
create policy "Users can read their own workspace"
  on public.user_workspaces for select to authenticated
  using ((select auth.uid()) = user_id);

drop policy if exists "Users can insert their own workspace" on public.user_workspaces;
create policy "Users can insert their own workspace"
  on public.user_workspaces for insert to authenticated
  with check ((select auth.uid()) = user_id);

drop policy if exists "Users can update their own workspace" on public.user_workspaces;
create policy "Users can update their own workspace"
  on public.user_workspaces for update to authenticated
  using ((select auth.uid()) = user_id)
  with check ((select auth.uid()) = user_id);

grant select, insert, update on public.user_workspaces to authenticated;
