-- Sponsor-attributed car show registrations.
-- Apply in the Supabase SQL editor (or CLI) BEFORE/WITH deploying the sponsor
-- pages. The API degrades gracefully if this lags a deploy (it retries inserts
-- without the new columns), but attribution is only persisted once applied.
--
-- Column mapping vs. the spec: this schema already stores
--   stripe_checkout_session_id → stripe_session_id (unique)
--   payment_status             → status ('pending'|'paid'|'refunded'|…)
--   amount_paid                → amount_paid_cents
-- so only the genuinely new fields are added here.

-- Reusable sponsor records. The approved list lives in
-- src/lib/carShowSponsors.js (deploy-time source of truth); rows here are
-- upserted by api/checkout.js on first use so registrations can reference a
-- stable sponsor_id and reporting can join on it.
create table if not exists public.sponsors (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  slug text not null unique,
  is_active boolean not null default true,
  logo_url text,
  acknowledgment_text text,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

-- Service-role access only (no anon policies): sponsor rows are written and
-- read exclusively by the serverless functions.
alter table public.sponsors enable row level security;

-- Attribution snapshot on each registration. sponsor_name/slug are stored
-- denormalized on purpose: they are a historical record of what the sponsor
-- was called when the registration happened, even if the sponsor's display
-- info changes later. sponsor_id is the relational link.
alter table public.registrations add column if not exists registration_source text not null default 'direct';
alter table public.registrations add column if not exists sponsor_id uuid references public.sponsors(id);
alter table public.registrations add column if not exists sponsor_name text;
alter table public.registrations add column if not exists sponsor_slug text;
alter table public.registrations add column if not exists referral_page text;
alter table public.registrations add column if not exists referred_at timestamptz;
alter table public.registrations add column if not exists stripe_payment_intent_id text;

create index if not exists registrations_sponsor_slug_idx on public.registrations (sponsor_slug);
create index if not exists registrations_source_idx on public.registrations (registration_source);

-- Seed sponsors (slug must match src/lib/carShowSponsors.js).
insert into public.sponsors (name, slug)
values
  ('Fastlane', 'fastlane'),
  ('Jim Butler Maserati & Alfa Romeo', 'jim-butler')
on conflict (slug) do nothing;
