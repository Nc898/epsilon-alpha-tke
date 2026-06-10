-- Applied to project sbwjtbwjghapopiutjdu (tke-epsilon-alpha) on 2026-06-10
-- via Supabase MCP apply_migration: platform_events_registrations_email_log

-- events: one row per registerable event
create table public.events (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  slug text not null unique,
  date date not null,
  time text,
  location text not null,
  description text,
  event_type text not null default 'philanthropy',
  status text not null default 'upcoming',
  registration_open boolean not null default false,
  entry_price_cents integer not null default 2000,
  capacity integer,
  image_url text,
  rain_date date,
  created_at timestamptz not null default now()
);

-- registrations: service-role writes only
create table public.registrations (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id),
  name text not null,
  email text not null,
  phone text,
  car_year text,
  car_make text,
  car_model text,
  car_class text check (car_class in ('classic','exotic','performance','other')),
  stripe_session_id text unique,
  amount_paid_cents integer not null default 0,
  donation_cents integer not null default 0,
  status text not null default 'pending'
    check (status in ('pending','paid','refunded','checked_in')),
  created_at timestamptz not null default now()
);

-- email_log: idempotency for automated sends
create table public.email_log (
  id uuid primary key default gen_random_uuid(),
  registration_id uuid not null references public.registrations(id),
  email_type text not null
    check (email_type in ('confirmation','reminder_7d','reminder_1d','thank_you')),
  sent_at timestamptz not null default now(),
  unique (registration_id, email_type)
);

alter table public.events enable row level security;
alter table public.registrations enable row level security;
alter table public.email_log enable row level security;

-- events are publicly readable; only service role writes
create policy "events_public_read" on public.events
  for select using (true);

-- registrations + email_log: NO anon policies at all.
-- Service role bypasses RLS, so Vercel Functions retain full access.

-- registration counts must be public (capacity display) without exposing PII
create view public.registration_counts
  with (security_invoker = off) as
  select event_id, count(*)::int as paid_count
  from public.registrations
  where status = 'paid'
  group by event_id;
grant select on public.registration_counts to anon, authenticated;
