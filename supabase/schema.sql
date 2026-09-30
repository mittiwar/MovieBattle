-- Frame Fan Poll MVP. Run this once in the Supabase SQL Editor.
create extension if not exists pgcrypto;

create table if not exists public.polls (
  id uuid primary key default gen_random_uuid(),
  question text not null check (char_length(question) between 8 and 140),
  closes_at timestamptz not null,
  is_active boolean not null default true,
  created_at timestamptz not null default now()
);

create table if not exists public.poll_options (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  name text not null check (char_length(name) between 1 and 80),
  subtitle text,
  image_url text,
  sort_order integer not null default 0,
  unique (poll_id, id)
);

create table if not exists public.votes (
  id uuid primary key default gen_random_uuid(),
  poll_id uuid not null references public.polls(id) on delete cascade,
  option_id uuid not null,
  user_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamptz not null default now(),
  constraint votes_option_belongs_to_poll foreign key (poll_id, option_id)
    references public.poll_options(poll_id, id) on delete cascade,
  constraint one_vote_per_user_per_poll unique (poll_id, user_id)
);

create index if not exists poll_options_poll_sort_idx on public.poll_options(poll_id, sort_order);
create index if not exists votes_poll_id_idx on public.votes(poll_id);

alter table public.polls enable row level security;
alter table public.poll_options enable row level security;
alter table public.votes enable row level security;

create or replace function public.is_frame_admin()
returns boolean language sql stable security invoker
set search_path = '' as $$
  select coalesce((auth.jwt() -> 'app_metadata' ->> 'role') = 'admin', false)
$$;

drop policy if exists "Public can read active polls" on public.polls;
create policy "Public can read active polls" on public.polls for select to anon, authenticated
  using (is_active = true or public.is_frame_admin());
drop policy if exists "Admins manage polls" on public.polls;
create policy "Admins manage polls" on public.polls for all to authenticated
  using (public.is_frame_admin()) with check (public.is_frame_admin());

drop policy if exists "Public can read options for active polls" on public.poll_options;
create policy "Public can read options for active polls" on public.poll_options for select to anon, authenticated
  using (exists (select 1 from public.polls p where p.id = poll_id and (p.is_active or public.is_frame_admin())));
drop policy if exists "Admins manage poll options" on public.poll_options;
create policy "Admins manage poll options" on public.poll_options for all to authenticated
  using (public.is_frame_admin()) with check (public.is_frame_admin());

drop policy if exists "Users can read their own vote" on public.votes;
create policy "Users can read their own vote" on public.votes for select to authenticated
  using (user_id = (select auth.uid()));
-- No client INSERT/UPDATE/DELETE policy: cast_vote() owns the only voting path.

create or replace function public.cast_vote(p_poll_id uuid, p_option_id uuid)
returns void language plpgsql security definer
set search_path = '' as $$
declare
  v_user_id uuid := auth.uid();
begin
  if v_user_id is null then raise exception 'Sign in before voting.' using errcode = '42501'; end if;
  if not exists (select 1 from public.polls p where p.id = p_poll_id and p.is_active and p.closes_at > now()) then
    raise exception 'This poll is closed.' using errcode = '22023';
  end if;
  if not exists (select 1 from public.poll_options o where o.id = p_option_id and o.poll_id = p_poll_id) then
    raise exception 'That nominee is not part of this poll.' using errcode = '22023';
  end if;
  -- Unique constraint handles simultaneous requests for the same user's poll vote.
  insert into public.votes (poll_id, option_id, user_id) values (p_poll_id, p_option_id, v_user_id);
end;
$$;

create or replace function public.poll_results(p_poll_id uuid)
returns table(option_id uuid, vote_count bigint, percent integer)
language sql stable security definer
set search_path = '' as $$
  with counts as (
    select o.id as option_id, count(v.id)::bigint as vote_count
    from public.poll_options o left join public.votes v on v.option_id = o.id and v.poll_id = o.poll_id
    where o.poll_id = p_poll_id group by o.id
  ), totals as (select coalesce(sum(c.vote_count), 0)::numeric as total from counts c)
  select c.option_id, c.vote_count,
    case when t.total = 0 then 0 else round((c.vote_count * 100.0 / t.total))::integer end
  from counts c cross join totals t;
$$;

create or replace function public.create_poll(p_question text, p_closes_at timestamptz, p_options jsonb)
returns uuid language plpgsql security definer
set search_path = '' as $$
declare
  v_poll_id uuid;
  v_count integer;
begin
  if auth.uid() is null or not public.is_frame_admin() then raise exception 'Admin access required.' using errcode = '42501'; end if;
  if p_closes_at <= now() or p_closes_at > now() + interval '3 months' then
    raise exception 'Poll close time must be within the next three months.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_options) <> 'array' then raise exception 'Options must be a list.' using errcode = '22023'; end if;
  select count(*) into v_count from jsonb_array_elements(p_options);
  if v_count < 2 or v_count > 20 then raise exception 'Polls need between 2 and 20 nominees.' using errcode = '22023'; end if;
  update public.polls set is_active = false where is_active = true;
  insert into public.polls(question, closes_at) values (p_question, p_closes_at) returning id into v_poll_id;
  insert into public.poll_options(poll_id, name, subtitle, image_url, sort_order)
  select v_poll_id, x.name, x.subtitle, x.image_url, coalesce(x.sort_order, 0)
  from jsonb_to_recordset(p_options) as x(name text, subtitle text, image_url text, sort_order integer);
  return v_poll_id;
end;
$$;

revoke all on function public.cast_vote(uuid, uuid) from public;
revoke all on function public.poll_results(uuid) from public;
revoke all on function public.create_poll(text, timestamptz, jsonb) from public;
grant execute on function public.cast_vote(uuid, uuid) to authenticated;
grant execute on function public.poll_results(uuid) to anon, authenticated;
grant execute on function public.create_poll(text, timestamptz, jsonb) to authenticated;
grant select on public.polls, public.poll_options to anon, authenticated;
revoke all on public.votes from anon, authenticated;
grant select on public.votes to authenticated;

-- Initial 90-day poll. The app fetches current nominee photos from Wikipedia's public page summary API.
insert into public.polls (question, closes_at, is_active)
select 'Who is your all-time hero?', now() + interval '3 months', true
where not exists (select 1 from public.polls where is_active = true);

insert into public.poll_options(poll_id, name, subtitle, sort_order)
select p.id, o.name, o.subtitle, o.sort_order
from public.polls p
cross join (values
  ('Shah Rukh Khan', 'The King of Romance', 0),
  ('Salman Khan', 'The Bhaijaan of Bollywood', 1),
  ('Amitabh Bachchan', 'The Shahenshah of Indian cinema', 2),
  ('Rajinikanth', 'The one and only Superstar', 3),
  ('Aamir Khan', 'The perfectionist', 4),
  ('Hrithik Roshan', 'Bollywood’s Greek God', 5)
) as o(name, subtitle, sort_order)
where p.is_active and p.question = 'Who is your all-time hero?'
  and not exists (select 1 from public.poll_options existing where existing.poll_id = p.id);

-- Admin setup: Supabase Dashboard → Authentication → Users → select your account → Edit app metadata.
-- Set { "role": "admin" } in app_metadata (never user_metadata, which the user can edit).
