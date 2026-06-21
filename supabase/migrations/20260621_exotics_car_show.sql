-- Complimentary, curated exotics display event.
-- Safe to re-run: the event is upserted on its unique slug.

-- Application details used by the curated display workflow.
alter table public.registrations add column if not exists car_color text;
alter table public.registrations add column if not exists instagram text;
alter table public.registrations add column if not exists application_notes text;

-- Extend the paid-event lifecycle with curated-application decisions.
alter table public.registrations drop constraint if exists registrations_status_check;
alter table public.registrations add constraint registrations_status_check
  check (status in ('pending','approved','waitlisted','declined','paid','refunded','checked_in'));

insert into public.events
  (title, slug, date, "time", location, description,
   event_type, status, registration_open, entry_price_cents,
   capacity, rain_date, image_url)
values
  ('Exotics at the Foundry',
   'exotics-car-show-2026',
   '2026-08-28',
   '5:30–7:30 PM',
   'City Foundry STL — check in at Colibri Real Estate from 5:00–5:30 PM',
   'A curated 30-car exotic display benefiting St. Jude Children''s Research Hospital. Complimentary application; approved display vehicles are protected by stanchions.',
   'philanthropy', 'upcoming', true, 0,
   30, null, '/assets/photos/q17.jpg')
on conflict (slug) do update set
   title             = excluded.title,
   date              = excluded.date,
   "time"            = excluded."time",
   location          = excluded.location,
   description       = excluded.description,
   registration_open = excluded.registration_open,
   entry_price_cents = excluded.entry_price_cents,
   capacity          = excluded.capacity,
   rain_date         = excluded.rain_date,
   image_url         = excluded.image_url;

select slug, registration_open, entry_price_cents, capacity
from public.events where slug = 'exotics-car-show-2026';
