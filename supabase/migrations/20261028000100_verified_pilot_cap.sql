-- Venture Arena: cap verified participants at 50.
-- A participant counts only when their email is confirmed and their profile
-- participant_role is one of the listed values.
--
-- Both email confirmations and changes to qualifying profile roles use the
-- same advisory transaction lock.

create or replace function public.venture_arena_pilot_has_space()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select count(*) < 50
  from auth.users as u
  join public.profiles as p on p.id = u.id
  where u.email_confirmed_at is not null
    and p.participant_role in (
      'Founder',
      'Aspiring founder',
      'Student',
      'Educator',
      'Investor'
    );
$$;

revoke all on function public.venture_arena_pilot_has_space() from public;
grant execute on function public.venture_arena_pilot_has_space()
  to anon, authenticated;


-- Enforce the cap when a user becomes email-confirmed.
create or replace function public.enforce_venture_arena_pilot_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_count bigint;
begin
  if old.email_confirmed_at is not null
     or new.email_confirmed_at is null then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(81026, 50);

  select count(*)
    into verified_count
    from auth.users as u
    join public.profiles as p on p.id = u.id
   where u.email_confirmed_at is not null
     and u.id <> new.id
     and p.participant_role in (
       'Founder',
       'Aspiring founder',
       'Student',
       'Educator',
       'Investor'
     );

  if verified_count >= 50 then
    raise exception using
      errcode = 'P0001',
      message = 'VENTURE_ARENA_PILOT_FULL',
      detail = 'The Venture Arena pilot is limited to 50 verified participants.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_venture_arena_pilot_limit on auth.users;

create trigger enforce_venture_arena_pilot_limit
  before update of email_confirmed_at on auth.users
  for each row
  execute function public.enforce_venture_arena_pilot_limit();


-- Also enforce the cap when a verified user's profile becomes a qualifying role.
create or replace function public.enforce_venture_arena_pilot_limit_on_profile()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_count bigint;
  excluded_old_id uuid;
begin
  if tg_op = 'UPDATE' then
    if new.id is not distinct from old.id
       and new.participant_role is not distinct from old.participant_role then
      return new;
    end if;

    if new.id is distinct from old.id then
      excluded_old_id := old.id;
    end if;
  end if;

  if new.participant_role is null
     or new.participant_role not in (
       'Founder',
       'Aspiring founder',
       'Student',
       'Educator',
       'Investor'
     ) then
    return new;
  end if;

  perform pg_catalog.pg_advisory_xact_lock(81026, 50);

  if not exists (
    select 1
      from auth.users as u
     where u.id = new.id
       and u.email_confirmed_at is not null
  ) then
    return new;
  end if;

  select count(*)
    into verified_count
    from auth.users as u
    join public.profiles as p on p.id = u.id
   where u.email_confirmed_at is not null
     and u.id <> new.id
     and (excluded_old_id is null or u.id <> excluded_old_id)
     and p.participant_role in (
       'Founder',
       'Aspiring founder',
       'Student',
       'Educator',
       'Investor'
     );

  if verified_count >= 50 then
    raise exception using
      errcode = 'P0001',
      message = 'VENTURE_ARENA_PILOT_FULL',
      detail = 'The Venture Arena pilot is limited to 50 verified participants.';
  end if;

  return new;
end;
$$;

drop trigger if exists enforce_venture_arena_pilot_limit_on_profile
  on public.profiles;

create trigger enforce_venture_arena_pilot_limit_on_profile
  before insert or update on public.profiles
  for each row
  execute function public.enforce_venture_arena_pilot_limit_on_profile();


-- These functions are called by database triggers, not directly by clients.
revoke all on function public.enforce_venture_arena_pilot_limit()
  from public, anon, authenticated;

revoke all on function public.enforce_venture_arena_pilot_limit_on_profile()
  from public, anon, authenticated;
