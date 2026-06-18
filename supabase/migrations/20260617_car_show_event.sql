-- ─────────────────────────────────────────────────────────────────────────────
-- Car show event seed + early-bird pricing columns.
-- Run once in the Supabase SQL editor (Project sbwjtbwjghapopiutjdu → SQL Editor).
-- Safe to re-run: idempotent (adds columns only if missing, upserts on slug).
-- ─────────────────────────────────────────────────────────────────────────────

-- 1. Early-bird pricing columns (optional per-event window).
alter table public.events
  add column if not exists early_bird_price_cents integer;
alter table public.events
  add column if not exists early_bird_until date;

-- 2. The 2026 Classics & Imports Car Show.
--    entry_price_cents      = regular price   ($50)
--    early_bird_price_cents = early-bird price ($30) — auto-applies through
--    early_bird_until       = the last early-bird day (inclusive); flips to $50
--                             at Central-time midnight on July 16 with no manual change.
insert into public.events
  (title, slug, date, "time", location, description,
   event_type, status, registration_open,
   entry_price_cents, early_bird_price_cents, early_bird_until,
   capacity, rain_date)
values
  ('Classics & Imports Car Show',
   'car-show-2026',
   '2026-07-26',
   '11:00 AM – 2:00 PM',
   'City Foundry STL, 3730 Foundry Way, St. Louis, MO 63110',
   'TKE × City Foundry STL — a rain-or-shine car show benefiting St. Jude Children''s Research Hospital.',
   'philanthropy', 'upcoming', true,
   5000, 3000, '2026-07-15',
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
