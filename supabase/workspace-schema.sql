-- Run this script in Supabase SQL Editor after the existing schema.sql.
-- Credentials remain in Supabase Auth; this table stores application progress only.
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
