-- Friday Night Lights (exotics showcase) moved: Aug 28 → Friday, September 4, 2026.
-- Run in the Supabase SQL editor. Idempotent. Supersedes the date seeded by
-- 20260621_exotics_car_show.sql (do not re-run that older seed afterwards).
update public.events
set date = '2026-09-04',
    registration_open = true
where slug = 'exotics-car-show-2026';

select slug, date, "time", registration_open, capacity
from public.events where slug = 'exotics-car-show-2026';
