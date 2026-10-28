-- Venture Arena: enforce a 50 verified-user pilot cap.
-- Pending/unverified accounts do not consume a place. The trigger serializes
-- verification attempts so concurrent confirmations cannot exceed the cap.

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
    and p.participant_role in ('Founder', 'Aspiring founder', 'Student', 'Educator', 'Investor');
$$;

revoke all on function public.venture_arena_pilot_has_space() from public;
grant execute on function public.venture_arena_pilot_has_space() to anon, authenticated;

create or replace function public.enforce_venture_arena_pilot_limit()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
declare
  verified_count bigint;
begin
  if new.email_confirmed_at is null
     or old.email_confirmed_at is not null
     or new.email_confirmed_at is not distinct from old.email_confirmed_at then
    return new;
  end if;

  -- Serialize confirmation transactions to avoid two users taking the last place.
  perform pg_advisory_xact_lock(81026, 50);

  select count(*)
    into verified_count
    from auth.users as u
    join public.profiles as p on p.id = u.id
   where u.email_confirmed_at is not null
     and u.id <> new.id
     and p.participant_role in ('Founder', 'Aspiring founder', 'Student', 'Educator', 'Investor');

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
  for each row execute function public.enforce_venture_arena_pilot_limit();
