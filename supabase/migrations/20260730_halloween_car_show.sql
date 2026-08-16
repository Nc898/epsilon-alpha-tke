-- ─────────────────────────────────────────────────────────────────────────────
-- Halloween Car Show at Neiman Marcus (Oct 25, 2026) — event seed.
-- Run once in the Supabase SQL editor. Safe to re-run: upserts on slug.
--
-- capacity is NULL on purpose: the show has no hard vehicle cap. The site and
-- api/checkout.js/api/free-registration.js all treat a null capacity as
-- "no limit" (no sold-out gate, no spots-left chip). Close registration by
-- setting registration_open = false when the time comes.
-- ─────────────────────────────────────────────────────────────────────────────

insert into public.events
  (title, slug, date, "time", location, description,
   event_type, status, registration_open,
   entry_price_cents, early_bird_price_cents, early_bird_until,
   capacity, rain_date)
values
  ('Halloween Car Show at Neiman Marcus',
   'halloween-car-show-2026',
   '2026-10-25',
   '11:00 AM – 2:00 PM',
   'Neiman Marcus, Plaza Frontenac, 1701 S Lindbergh Blvd, Frontenac, MO 63131',
   'TKE × Neiman Marcus — the Halloween finale of the 2026 charity car show series, benefiting St. Jude Children''s Research Hospital. Sponsor vehicles load in at 9:30 AM, general registrations at 10:00 AM; the show begins at 11:00 AM.',
   'philanthropy', 'upcoming', true,
   3000, null, null,
   null, null)
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
