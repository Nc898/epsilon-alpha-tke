-- Replace the former early-bird/regular pricing for the July 26 car show with
-- one flat $30 vehicle fee through the event date.

update public.events
set title = 'All-Classics & Imports Car Show',
    description = 'TKE × City Foundry STL — an insured, rain-or-shine car show benefiting St. Jude Children''s Research Hospital. Every registered owner is recognized as a Participating Event Sponsor/Supporter.',
    entry_price_cents = 3000,
    early_bird_price_cents = null,
    early_bird_until = null
where slug = 'car-show-2026';

update public.events
set title = 'Friday Night Lights',
    "time" = '5:00–7:00 PM',
    location = 'City Foundry STL — arrival instructions sent after approval',
    description = 'Free, registration-required exotics showcase capped at 30 vehicles and benefiting St. Jude Children''s Research Hospital.'
where slug = 'exotics-car-show-2026';

select slug, entry_price_cents, early_bird_price_cents, early_bird_until
from public.events
where slug = 'car-show-2026';

select slug, title, date, "time", location, capacity
from public.events
where slug = 'exotics-car-show-2026';
