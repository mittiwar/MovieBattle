-- Run once in the Supabase SQL Editor to open the first annual awards ballot.
alter table public.polls
  add column if not exists category text,
  add column if not exists award_year integer,
  add column if not exists results_at timestamptz;

create unique index if not exists polls_award_year_category_active_idx
  on public.polls (award_year, category)
  where is_active and category is not null;

create index if not exists votes_poll_option_idx on public.votes (poll_id, option_id);
create index if not exists votes_user_id_idx on public.votes (user_id);

-- The annual results RPC keeps award totals private until their reveal timestamp.
create or replace function public.poll_results(p_poll_id uuid)
returns table(option_id uuid, vote_count bigint, percent integer)
language sql stable security definer
set search_path = '' as $$
  with counts as (
    select o.id as option_id, count(v.id)::bigint as vote_count
    from public.poll_options o
    left join public.votes v on v.option_id = o.id and v.poll_id = o.poll_id
    where o.poll_id = p_poll_id
      and exists (
        select 1 from public.polls p
        where p.id = p_poll_id and (p.results_at is null or p.results_at <= now())
      )
    group by o.id
  ), totals as (select coalesce(sum(c.vote_count), 0)::numeric as total from counts c)
  select c.option_id, c.vote_count,
    case when t.total = 0 then 0 else round((c.vote_count * 100.0 / t.total))::integer end
  from counts c cross join totals t;
$$;

create or replace function public.create_award_poll(
  p_category text,
  p_award_year integer,
  p_question text,
  p_closes_at timestamptz,
  p_results_at timestamptz,
  p_options jsonb
)
returns uuid language plpgsql security definer
set search_path = '' as $$
declare
  v_poll_id uuid;
  v_count integer;
begin
  if auth.uid() is null or not public.is_frame_admin() then
    raise exception 'Admin access required.' using errcode = '42501';
  end if;
  if p_category not in ('best-picture', 'best-actor', 'best-actress', 'best-music') then
    raise exception 'Choose a supported awards category.' using errcode = '22023';
  end if;
  if char_length(p_question) not between 8 and 140 then
    raise exception 'Poll questions must contain 8 to 140 characters.' using errcode = '22023';
  end if;
  if p_closes_at <= now() or p_closes_at > now() + interval '12 months'
     or p_results_at is null or p_results_at < p_closes_at then
    raise exception 'Choose a future closing date and a results date on or after it.' using errcode = '22023';
  end if;
  if jsonb_typeof(p_options) <> 'array' then
    raise exception 'Options must be a list.' using errcode = '22023';
  end if;
  v_count := jsonb_array_length(p_options);
  if v_count < 2 or v_count > 50 then
    raise exception 'Award polls need between 2 and 50 nominees.' using errcode = '22023';
  end if;

  insert into public.polls (category, award_year, question, closes_at, results_at, is_active)
  values (p_category, p_award_year, p_question, p_closes_at, p_results_at, true)
  returning id into v_poll_id;

  insert into public.poll_options (poll_id, name, subtitle, image_url, sort_order)
  select v_poll_id, x.name, x.subtitle, x.image_url, coalesce(x.sort_order, 0)
  from jsonb_to_recordset(p_options) as x(name text, image_url text, subtitle text, sort_order integer);
  return v_poll_id;
end;
$$;

revoke all on function public.create_award_poll(text, integer, text, timestamptz, timestamptz, jsonb) from public;
revoke all on function public.create_award_poll(text, integer, text, timestamptz, timestamptz, jsonb) from anon;
grant execute on function public.create_award_poll(text, integer, text, timestamptz, timestamptz, jsonb) to authenticated;
revoke all on function public.cast_vote(uuid, uuid) from anon;
revoke all on function public.create_poll(text, timestamptz, jsonb) from anon;
grant execute on function public.poll_results(uuid) to anon, authenticated;

-- Retire the old one-off poll without touching its votes.
update public.polls set is_active = false where is_active and category is null;

insert into public.polls (category, award_year, question, closes_at, results_at, is_active)
select 'best-picture', 2026, 'Best Picture of 2026',
  '2026-12-31 00:00:00+05:30'::timestamptz,
  '2026-12-31 12:00:00+05:30'::timestamptz,
  true
where not exists (
  select 1 from public.polls where category = 'best-picture' and award_year = 2026 and is_active
);

insert into public.poll_options (poll_id, name, subtitle, sort_order)
select p.id, film.name, film.subtitle, film.sort_order
from public.polls p
cross join (values
  ('Ikkis', 'War drama · Released Jan 1', 0),
  ('Border 2', 'War drama · Released Jan 23', 1),
  ('Mardaani 3', 'Crime thriller · Released Jan 30', 2),
  ('Happy Patel: Khatarnak Jasoos', 'Comedy · Released Jan 16', 3),
  ('Rahu Ketu', 'Fantasy comedy · Released Jan 16', 4),
  ('Tu Yaa Main', 'Survival thriller · Released Feb 13', 5),
  ('Do Deewane Seher Mein', 'Romance · Released Feb 20', 6),
  ('O'' Romeo', 'Romantic thriller · Released Feb 13', 7),
  ('Assi', 'Courtroom drama · Released Feb 20', 8),
  ('Dhurandhar: The Revenge', 'Spy thriller · Released Mar 19', 9),
  ('Subedaar', 'Action drama · Released Mar 5', 10),
  ('Bhooth Bangla', 'Horror comedy · Released Apr 17', 11),
  ('Toaster', 'Dark comedy · Released Apr 15', 12),
  ('Ginny Weds Sunny 2', 'Romance · Released Apr 24', 13),
  ('Welcome to the Jungle', 'Comedy · Released Jun 26', 14),
  ('Cocktail 2', 'Romance · Released Jun 19', 15),
  ('Awarapan 2', 'Action drama · Released Aug 14', 16),
  ('Drishyam: The Conclusion', 'Mystery thriller · Released Oct 2', 17),
  ('King', 'Action thriller · Expected Dec 24', 18),
  ('Mahavatar', 'Mythological epic · Expected Dec 25', 19)
) as film(name, subtitle, sort_order)
where p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and not exists (select 1 from public.poll_options o where o.poll_id = p.id and o.name = film.name);

-- Add more categories with the create_award_poll function; each ballot stays active independently.

-- Keep archived ballots intact if a removed nominee already has votes.
do $$
declare
  v_poll_id uuid;
begin
  select p.id into v_poll_id
  from public.polls p
  where p.category = 'best-picture' and p.award_year = 2026 and p.is_active
    and exists (
      select 1 from public.votes v
      join public.poll_options o on o.id = v.option_id and o.poll_id = v.poll_id
      where v.poll_id = p.id and o.name not in (
        'Dhurandhar: The Revenge', 'Border 2', 'Hanuman Ansh', 'Mirzapur: The Movie', 'Bhooth Bangla',
        'Vishwanath & Sons', 'Awarapan 2', 'Welcome to the Jungle', 'Peddi', 'Alpha', 'Main Vaapas Aaunga',
        'O'' Romeo', 'Irumudi', 'Drishyam: The Conclusion', 'Drishyam 3', 'Udta Teer', 'DC', 'Bethlehem Kudumba Unit',
        'Ramayana: Rise of a Legend', 'Vaazha II: Biopic of a Billion Bros', 'Eetha', 'Maatrubhumi', 'King',
        'The Vvaan: Force of the Forrest', 'Ohh My Dog', 'Toxic'
      )
    )
  for update;

  if v_poll_id is not null then
    update public.polls set is_active = false where id = v_poll_id;
    insert into public.polls (category, award_year, question, closes_at, results_at, is_active)
    values ('best-picture', 2026, 'Best Picture of 2026',
      '2026-12-31 00:00:00+05:30'::timestamptz,
      '2026-12-31 12:00:00+05:30'::timestamptz, true);
  end if;
end $$;

-- Replace the initial picture shortlist while preserving matching votes.
do $$
begin
  if exists (
    select 1 from public.votes v
    join public.poll_options o on o.id = v.option_id
    join public.polls p on p.id = o.poll_id
    where p.category = 'best-picture' and p.award_year = 2026 and p.is_active
      and o.name not in (
        'Dhurandhar: The Revenge', 'Border 2', 'Hanuman Ansh', 'Mirzapur: The Movie', 'Bhooth Bangla',
        'Dhamaal 4', 'Awarapan 2', 'Welcome to the Jungle', 'Cocktail 2', 'Alpha', 'Main Vaapas Aaunga',
        'O'' Romeo', 'Mardaani 3', 'Drishyam: The Conclusion', 'Udta Teer',
        'Prahaar – The Ujjwal Nikam Story', 'Nayyi Navelli', 'Ramayana: Rise of a Legend', 'Yeh Prem Mol Liya',
        'Eetha', 'Maatrubhumi', 'King', 'The Vvaan: Force of the Forrest', 'Ohh My Dog', 'Toxic',
        'Vishwanath & Sons', 'Peddi', 'Irumudi', 'Drishyam 3', 'DC', 'Bethlehem Kudumba Unit', 'Vaazha II: Biopic of a Billion Bros'
      )
  ) then
    raise exception 'The old ballot already has votes for nominees being removed. Preserve those votes before replacing the shortlist.';
  end if;
end $$;

delete from public.poll_options o
using public.polls p
where o.poll_id = p.id and p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and o.name not in (
    'Dhurandhar: The Revenge', 'Border 2', 'Hanuman Ansh', 'Mirzapur: The Movie', 'Bhooth Bangla',
    'Dhamaal 4', 'Awarapan 2', 'Welcome to the Jungle', 'Cocktail 2', 'Alpha', 'Main Vaapas Aaunga',
    'O'' Romeo', 'Mardaani 3', 'Drishyam: The Conclusion', 'Udta Teer',
    'Prahaar – The Ujjwal Nikam Story', 'Nayyi Navelli', 'Ramayana: Rise of a Legend', 'Yeh Prem Mol Liya',
    'Eetha', 'Maatrubhumi', 'King', 'The Vvaan: Force of the Forrest', 'Ohh My Dog', 'Toxic',
    'Vishwanath & Sons', 'Peddi', 'Irumudi', 'Drishyam 3', 'DC', 'Bethlehem Kudumba Unit', 'Vaazha II: Biopic of a Billion Bros'
  );

with nominees(name, subtitle, image_url, sort_order) as (values
  ('Dhurandhar: The Revenge', 'Spy thriller · Released Mar 19', 'https://static.wixstatic.com/media/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png/v1/fill/w_2500%2Ch_3228%2Cal_c/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png', 0),
  ('Border 2', 'War drama · Released Jan 23', null, 1),
  ('Hanuman Ansh', 'Biography · Released Aug 7', null, 2),
  ('Mirzapur: The Movie', 'Crime thriller · Released Sep 4', 'https://images.justwatch.com/poster/341957980/s718/mirzapur-the-film.jpg', 3),
  ('Bhooth Bangla', 'Horror comedy · Released Apr 17', 'https://m.media-amazon.com/images/M/MV5BM2I0ZWM5ZDUtNzUwYy00YTVjLWIzZGQtZTU1NWFkOTZjNGY2XkEyXkFqcGc%40._V1_.jpg', 4),
  ('Dhamaal 4', 'Comedy · Released Jul 10', 'https://m.media-amazon.com/images/M/MV5BNTA1ZTIyZDYtZmQzZS00YmRkLThhMGQtNjM5Y2UwYzJhY2ZjXkEyXkFqcGc%40._V1_.jpg', 5),
  ('Awarapan 2', 'Action drama · Released Aug 14', 'https://cinemaseats.net/movies/awarapan-2/poster', 6),
  ('Welcome to the Jungle', 'Comedy · Released Jun 26', 'https://m.media-amazon.com/images/M/MV5BMTY5ODUxNDctZGJjNC00OTk0LWIzMzAtMWQ5NTAyMGZhY2NmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 7),
  ('Cocktail 2', 'Romance · Released Jun 19', null, 8),
  ('Alpha', 'Spy thriller · Released Jul 10', 'https://images.filmibeat.com/ph-big/2026/06/alpha-teaser-out-alia-bhatt-turns-into-yrf-spy-universes-fiercest-weapon-bobby-deol-reveals-mission1781095130_7.jpg', 9),
  ('Main Vaapas Aaunga', 'Romantic drama · Released Jun 12', null, 10),
  ('O'' Romeo', 'Romantic thriller · Released Feb 13', 'https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster--dark-mode.png/0/images/masterrepository/Fandango/244329/oromeo-1080x1600-Px.jpg', 11),
  ('Mardaani 3', 'Crime thriller · Released Jan 30', null, 12),
  ('Drishyam: The Conclusion', 'Mystery thriller · Released Oct 2', null, 13),
  ('Udta Teer', 'Spy comedy · Coming Oct 23', 'https://images.filmibeat.com/ph-big/2026/09/udta-teer1790233430_0.jpg', 14),
  ('Prahaar – The Ujjwal Nikam Story', 'Biographical drama · Released Aug 7', 'https://m.media-amazon.com/images/M/MV5BODc2MTM1YjgtZjIyOC00ZTA2LWJmMTUtOGJiMzQwNGUzMjZkXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 15),
  ('Nayyi Navelli', 'Hindi cinema · 2026', null, 16),
  ('Ramayana: Rise of a Legend', 'Mythological epic · Expected Diwali', null, 17),
  ('Yeh Prem Mol Liya', 'Romance · Expected Nov 27', null, 18),
  ('Eetha', 'Drama · Expected Dec 4', null, 19),
  ('Maatrubhumi', 'War drama · 2026 date TBA', 'https://images.filmibeat.com/ph-big/2026/07/maatrubhumi1784537269_0.jpg', 20),
  ('King', 'Action thriller · Expected Dec 24', 'https://assets.gadgets360cdn.com/pricee/assets/product/202511/King_Poster_1_1762929482.jpg', 21),
  ('The Vvaan: Force of the Forrest', 'Fantasy thriller · Released Sep 25', 'https://m.media-amazon.com/images/M/MV5BYmNkYWJhZTAtYjMxNC00MjM3LWIwOGMtM2E2NGRmN2Y3OThmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 22),
  ('Ohh My Dog', 'Family drama · Released Aug 7', 'https://images.filmibeat.com/ph-big/2026/07/ohh-my-dog1784799711_0.jpg', 23),
  ('Toxic', 'Action thriller · Released Aug 26', 'https://m.media-amazon.com/images/M/MV5BYTBiYWZkNGYtYWVkOC00NzVjLWE3ZTQtYzk3ZWM4OWRjODBiXkEyXkFqcGc%40._V1_.jpg', 24)
)
update public.poll_options o
set subtitle = n.subtitle, image_url = n.image_url, sort_order = n.sort_order
from nominees n, public.polls p
where o.poll_id = p.id and o.name = n.name
  and p.category = 'best-picture' and p.award_year = 2026 and p.is_active;

with nominees(name, subtitle, image_url, sort_order) as (values
  ('Dhurandhar: The Revenge', 'Spy thriller · Released Mar 19', 'https://static.wixstatic.com/media/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png/v1/fill/w_2500%2Ch_3228%2Cal_c/843c1f_f070fceda56b4da3b82c39d01b282338~mv2.png', 0),
  ('Border 2', 'War drama · Released Jan 23', null, 1),
  ('Hanuman Ansh', 'Biography · Released Aug 7', null, 2),
  ('Mirzapur: The Movie', 'Crime thriller · Released Sep 4', 'https://images.justwatch.com/poster/341957980/s718/mirzapur-the-film.jpg', 3),
  ('Bhooth Bangla', 'Horror comedy · Released Apr 17', 'https://m.media-amazon.com/images/M/MV5BM2I0ZWM5ZDUtNzUwYy00YTVjLWIzZGQtZTU1NWFkOTZjNGY2XkEyXkFqcGc%40._V1_.jpg', 4),
  ('Dhamaal 4', 'Comedy · Released Jul 10', 'https://m.media-amazon.com/images/M/MV5BNTA1ZTIyZDYtZmQzZS00YmRkLThhMGQtNjM5Y2UwYzJhY2ZjXkEyXkFqcGc%40._V1_.jpg', 5),
  ('Awarapan 2', 'Action drama · Released Aug 14', 'https://cinemaseats.net/movies/awarapan-2/poster', 6),
  ('Welcome to the Jungle', 'Comedy · Released Jun 26', 'https://m.media-amazon.com/images/M/MV5BMTY5ODUxNDctZGJjNC00OTk0LWIzMzAtMWQ5NTAyMGZhY2NmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 7),
  ('Cocktail 2', 'Romance · Released Jun 19', null, 8),
  ('Alpha', 'Spy thriller · Released Jul 10', 'https://images.filmibeat.com/ph-big/2026/06/alpha-teaser-out-alia-bhatt-turns-into-yrf-spy-universes-fiercest-weapon-bobby-deol-reveals-mission1781095130_7.jpg', 9),
  ('Main Vaapas Aaunga', 'Romantic drama · Released Jun 12', null, 10),
  ('O'' Romeo', 'Romantic thriller · Released Feb 13', 'https://images.fandango.com/ImageRenderer/0/0/redesign/static/img/default_poster--dark-mode.png/0/images/masterrepository/Fandango/244329/oromeo-1080x1600-Px.jpg', 11),
  ('Mardaani 3', 'Crime thriller · Released Jan 30', null, 12),
  ('Drishyam: The Conclusion', 'Mystery thriller · Released Oct 2', null, 13),
  ('Udta Teer', 'Spy comedy · Coming Oct 9', 'https://assets-in.bmscdn.com/discovery-catalog/events/et00495822-xteexnatev-landscape.jpg', 14),
  ('Prahaar – The Ujjwal Nikam Story', 'Biographical drama · Released Aug 7', 'https://m.media-amazon.com/images/M/MV5BODc2MTM1YjgtZjIyOC00ZTA2LWJmMTUtOGJiMzQwNGUzMjZkXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 15),
  ('Nayyi Navelli', 'Hindi cinema · 2026', null, 16),
  ('Ramayana: Rise of a Legend', 'Mythological epic · Expected Diwali', null, 17),
  ('Yeh Prem Mol Liya', 'Romance · Expected Nov 27', null, 18),
  ('Eetha', 'Drama · Expected Dec 4', null, 19),
  ('Maatrubhumi', 'War drama · 2026 date TBA', 'https://images.filmibeat.com/ph-big/2026/07/maatrubhumi1784537269_0.jpg', 20),
  ('King', 'Action thriller · Expected Dec 24', 'https://assets.gadgets360cdn.com/pricee/assets/product/202511/King_Poster_1_1762929482.jpg', 21),
  ('The Vvaan: Force of the Forrest', 'Fantasy thriller · Released Sep 25', 'https://m.media-amazon.com/images/M/MV5BYmNkYWJhZTAtYjMxNC00MjM3LWIwOGMtM2E2NGRmN2Y3OThmXkEyXkFqcGc%40._V1_FMjpg_UX1000_.jpg', 22),
  ('Ohh My Dog', 'Family drama · Released Aug 7', 'https://images.filmibeat.com/ph-big/2026/07/ohh-my-dog1784799711_0.jpg', 23),
  ('Toxic', 'Action thriller · Released Aug 26', 'https://m.media-amazon.com/images/M/MV5BYTBiYWZkNGYtYWVkOC00NzVjLWE3ZTQtYzk3ZWM4OWRjODBiXkEyXkFqcGc%40._V1_.jpg', 24)
)
insert into public.poll_options (poll_id, name, subtitle, image_url, sort_order)
select p.id, n.name, n.subtitle, n.image_url, n.sort_order
from public.polls p cross join nominees n
where p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and not exists (select 1 from public.poll_options o where o.poll_id = p.id and o.name = n.name);

-- Apply the refreshed nominees after the original seed has been reconciled.
delete from public.poll_options o
using public.polls p
where o.poll_id = p.id and p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and (o.name in ('Dhamaal 4', 'Cocktail 2', 'Mardaani 3', 'Nayyi Navelli', 'Yeh Prem Mol Liya')
    or o.name like 'Prahaar%');

delete from public.poll_options o
using public.polls p
where o.poll_id = p.id and p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and o.name = 'Drishyam: The Conclusion'
  and exists (
    select 1 from public.poll_options current_option
    where current_option.poll_id = o.poll_id and current_option.name = 'Drishyam 3'
  )
  and not exists (select 1 from public.votes v where v.poll_id = o.poll_id and v.option_id = o.id);

update public.poll_options o
set name = 'Drishyam 3', subtitle = 'Mystery thriller · Released Oct 2', sort_order = 13
from public.polls p
where o.poll_id = p.id and p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and o.name = 'Drishyam: The Conclusion';

with nominees(name, subtitle, sort_order) as (values
  ('Vishwanath & Sons', 'Family drama · Released Aug 14', 5),
  ('Peddi', 'Sports action drama · Released Jun 4', 8),
  ('Irumudi', 'Action drama · Released Aug 21', 12),
  ('DC', 'Tamil action drama · Lokesh Kanagaraj, Wamiqa Gabbi · Released Aug 7', 15),
  ('Bethlehem Kudumba Unit', 'Comedy drama · Released Aug 21', 16),
  ('Vaazha II: Biopic of a Billion Bros', 'Comedy drama · Released Apr 2', 18)
)
update public.poll_options o
set subtitle = n.subtitle, sort_order = n.sort_order
from nominees n, public.polls p
where o.poll_id = p.id and o.name = n.name
  and p.category = 'best-picture' and p.award_year = 2026 and p.is_active;

with nominees(name, subtitle, sort_order) as (values
  ('Vishwanath & Sons', 'Family drama · Released Aug 14', 5),
  ('Peddi', 'Sports action drama · Released Jun 4', 8),
  ('Irumudi', 'Action drama · Released Aug 21', 12),
  ('DC', 'Action drama · Released Aug 7', 15),
  ('Bethlehem Kudumba Unit', 'Comedy drama · Released Aug 21', 16),
  ('Vaazha II: Biopic of a Billion Bros', 'Comedy drama · Released Apr 2', 18)
)
insert into public.poll_options (poll_id, name, subtitle, sort_order)
select p.id, n.name, n.subtitle, n.sort_order
from public.polls p cross join nominees n
where p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and not exists (select 1 from public.poll_options o where o.poll_id = p.id and o.name = n.name);

insert into public.polls (category, award_year, question, closes_at, results_at, is_active)
select 'best-actor', 2026, 'Best Actor of 2026',
  '2026-12-31 00:00:00+05:30'::timestamptz,
  '2026-12-31 12:00:00+05:30'::timestamptz,
  true
where not exists (
  select 1 from public.polls where category = 'best-actor' and award_year = 2026 and is_active
);

with nominees(name, subtitle, sort_order) as (values
  ('Shah Rukh Khan', 'King', 0),
  ('Ranbir Kapoor', 'Ramayana: Rise of a Legend', 1),
  ('Salman Khan', 'Maatrubhumi', 2),
  ('Ranveer Singh', 'Dhurandhar: The Revenge', 3),
  ('Yash', 'Toxic', 4),
  ('Nani', 'The Paradise', 5),
  ('Sunny Deol', 'Border 2', 6),
  ('Divyenndu', 'Mirzapur: The Movie as Munna Tripathi', 7),
  ('Akshay Kumar', 'Bhooth Bangla', 8),
  ('Ajay Devgn', 'Drishyam 3', 9),
  ('Emraan Hashmi', 'Awarapan 2', 10),
  ('Shahid Kapoor', 'Cocktail 2', 11),
  ('Ravi Teja', 'Irumudi', 12),
  ('Ram Charan', 'Peddi', 13),
  ('Suriya', 'Vishwanath & Sons', 14),
  ('Nivin Pauly', 'Bethlehem Kudumba Unit', 15)
)
update public.poll_options o
set subtitle = n.subtitle, sort_order = n.sort_order
from nominees n, public.polls p
where o.poll_id = p.id and o.name = n.name
  and p.category = 'best-actor' and p.award_year = 2026 and p.is_active;

update public.poll_options o
set image_url = case o.name
  when 'Yash' then 'https://thumb.wikimedia.org/wikipedia/commons/thumb/d/d7/Yash_during_toxic_trailer_launch_event.jpg/330px-Yash_during_toxic_trailer_launch_event.jpg'
  when 'Nani' then 'https://thumb.wikimedia.org/wikipedia/commons/thumb/9/9a/Nani_at_an_interview_for_film_companion_%28cropped%29.png/330px-Nani_at_an_interview_for_film_companion_%28cropped%29.png'
end
from public.polls p
where o.poll_id = p.id and p.category = 'best-actor' and p.award_year = 2026 and p.is_active
  and o.name in ('Yash', 'Nani');

update public.poll_options o
set image_url = 'https://cdn.moviefone.com/image-assets/1479832/k9AwqfQ9wYtaGew8oZh6GBouvO2.jpg?d=800x1200&q=85',
    subtitle = 'Tamil action drama · Lokesh Kanagaraj, Wamiqa Gabbi · Released Aug 7'
from public.polls p
where o.poll_id = p.id and p.category = 'best-picture' and p.award_year = 2026 and p.is_active
  and o.name = 'DC';

with nominees(name, subtitle, sort_order) as (values
  ('Shah Rukh Khan', 'King', 0),
  ('Ranbir Kapoor', 'Ramayana: Rise of a Legend', 1),
  ('Salman Khan', 'Maatrubhumi', 2),
  ('Ranveer Singh', 'Dhurandhar: The Revenge', 3),
  ('Yash', 'Toxic', 4),
  ('Nani', 'The Paradise', 5),
  ('Sunny Deol', 'Border 2', 6),
  ('Divyenndu', 'Mirzapur: The Movie as Munna Tripathi', 7),
  ('Akshay Kumar', 'Bhooth Bangla', 8),
  ('Ajay Devgn', 'Drishyam 3', 9),
  ('Emraan Hashmi', 'Awarapan 2', 10),
  ('Shahid Kapoor', 'Cocktail 2', 11),
  ('Ravi Teja', 'Irumudi', 12),
  ('Ram Charan', 'Peddi', 13),
  ('Suriya', 'Vishwanath & Sons', 14),
  ('Nivin Pauly', 'Bethlehem Kudumba Unit', 15)
)
insert into public.poll_options (poll_id, name, subtitle, sort_order)
select p.id, n.name, n.subtitle, n.sort_order
from public.polls p cross join nominees n
where p.category = 'best-actor' and p.award_year = 2026 and p.is_active
  and not exists (select 1 from public.poll_options o where o.poll_id = p.id and o.name = n.name);
