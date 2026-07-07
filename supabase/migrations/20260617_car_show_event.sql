-- ─────────────────────────────────────────────────────────────────────────────
-- Car show event seed + optional time-window pricing columns.
-- Run once in the Supabase SQL editor (Project sbwjtbwjghapopiutjdu → SQL Editor).
-- Safe to re-run: idempotent (adds columns only if missing, upserts on slug).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Optional time-window pricing columns for other events.
alter table public.events
  add column if not exists early_bird_price_cents integer;
alter table public.events
  add column if not exists early_bird_until date;

-- 2. The 2026 Classics & Imports Car Show has one flat $30 vehicle fee.
insert into public.events
  (title, slug, date, "time", location, description,
   event_type, status, registration_open,
   entry_price_cents, early_bird_price_cents, early_bird_until,
   capacity, rain_date)
values
  ('All-Classics & Imports Car Show',
   'car-show-2026',
   '2026-07-26',
   '11:00 AM – 2:00 PM',
   'City Foundry STL, 3730 Foundry Way, St. Louis, MO 63110',
   'TKE × City Foundry STL — an insured, rain-or-shine car show benefiting St. Jude Children''s Research Hospital. Every registered owner is recognized as a Participating Event Sponsor/Supporter.',
   'philanthropy', 'upcoming', true,
   3000, null, null,
   50, null)
on conflict (slug) do update set
   title                  = excluded.title,
   date                   = excluded.date,
   "time"                 = excluded."time",
   location               = excluded.location,
   description            = excluded.description,
   registration_open      = excluded.registration_open,
   entry_price_cents      = excluded.entry_price_cents,
   early_bird_price_cents = excluded.early_bird_price_cents,
   early_bird_until       = excluded.early_bird_until,
   capacity               = excluded.capacity;

-- 3. Confirm it landed.
select slug, registration_open, entry_price_cents, early_bird_price_cents,
       early_bird_until, capacity
from public.events where slug = 'car-show-2026';
