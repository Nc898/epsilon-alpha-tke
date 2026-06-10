# TKE Chapter Platform — Design

**Date:** 2026-06-10
**Status:** Approved by Nick
**Hard deadline:** Car show signup live by ~Jul 5 (flyer QR window Jun 15–Jul 5; Show #1 is Sun Jul 26 at City Foundry STL)

## Context

The chapter is running a $100K St. Jude season (Jun 2026 → Red Carnation Gala Mar 20, 2027) per the master plan workbook. The website (React 18 + Vite, currently on Base44 BaaS) becomes the season's operational hub: QR-driven car show registration with payment, automated confirmation/reminder emails, and eventually gala ticketing. Base44 is being abandoned in favor of Supabase + Vercel.

Related prior work: donor-prospect discovery pipeline in `Downloads\GalaSearchAutomation2` (1,459 STL businesses, 575 emails, `gala_donation_targets.xlsx`) — the mass-email sender for it was never built and is included here (§6).

## Decisions made

- **Architecture:** Approach A — single platform: Supabase + Vercel + Stripe + Resend, signup page ships first, full Base44 migration follows
- **Payments:** Hybrid — Stripe Checkout for entry fees (chapter bank) + optional St. Jude donation line item
- **Domain:** buy now (Nick handles purchase + Stripe account setup)
- **Fallback if build slips past ~Jul 1:** point `tkeslu.org/carshow` redirect at a Stripe Payment Link with custom fields — flyer QR never waits

## 1. Infrastructure

| Layer | Choice | Notes |
|---|---|---|
| Domain | tkeslu.org or similar | DNS → Vercel; SPF/DKIM → Resend |
| Hosting | Vercel hobby | SPA + `/api` Vercel Functions; `vercel.json` SPA rewrite |
| Database | Supabase free tier | RLS on everything |
| Payments | Stripe | Needs chapter bank acct + Treasurer as rep — external prerequisite |
| Transactional email | Resend (3k/mo free) | `events@<domain>`, React Email templates |
| Mass outreach | Gmail API script (§6) | Deliberately NOT the new domain — protects deliverability |

## 2. Data model (Supabase)

New tables:

- **events** — `id, title, slug, date, time, location, description, event_type, status, registration_open bool, entry_price_cents, capacity, image_url`
- **registrations** — `id, event_id→events, name, email, phone, car_year, car_make, car_model, car_class enum(classic/exotic/performance/other), stripe_session_id, amount_paid_cents, donation_cents, status enum(pending/paid/refunded/checked_in), created_at`
- **email_log** — `id, registration_id, email_type enum(confirmation/reminder_7d/reminder_1d/thank_you), sent_at` — idempotency for the reminder cron

Ported from Base44: `members`, `alumni_updates`, `sponsors`, `fundraising_stats`, `contact_inquiries`, `recruitment_inquiries`.

RLS: public SELECT on content tables; INSERT-only anon on inquiry tables; `registrations` writable only via service-role key from Vercel Functions (payment status integrity).

## 3. Car show signup (`/carshow`)

Page (mobile-first, site design system): event hero → form (name, email, phone, car year/make/model, class) → optional "Add a St. Jude donation" amount → Stripe Checkout (Apple/Google Pay on) → success page with registration #.

- `POST /api/checkout` — validate, insert pending registration, create Stripe session
- `POST /api/stripe-webhook` — on `checkout.session.completed`: mark paid, send confirmation, log
- `/carshow` is a stable redirect to the active event's canonical `/events/<slug>` page — one printed QR works all season
- `/donate` — second QR target for gate donations → chapter St. Jude page
- Rain-or-shine + rain-date language (fail-safe R1) on page and in all emails
- **No tax-deductibility language anywhere** until ALSAC GATE 1 clears (standing rule)
- Admin: password/Supabase-auth-gated registrations list — live count (Jul 12 trigger check), paid totals, day-of check-in
- QR print assets (SVG/PNG) generated for the flyer

## 4. Email sequences (Resend)

| Email | Trigger | Content |
|---|---|---|
| Confirmation | webhook, instant | Reg #, event details, rain policy, "show at check-in" |
| Reminder T-7 | Vercel cron daily 9am, email_log-idempotent | Schedule, parking, raffle preview |
| Reminder T-1 | same cron | Final logistics, weather call status |
| Thank-you (72-hr ritual) | manual button in admin | Total raised, photos, next-event CTA |

## 5. Migration sequencing

- **Week 1:** Supabase project + new tables only; signup page built against them; Vercel deploy of whole site (Base44 SDK still serving legacy pages); domain + Stripe started by Nick
- **Week 2:** emails wired, QR assets, /donate, admin view
- **Week 3–4:** port six legacy entities, swap base44Client → supabaseClient page by page (hardcoded fallbacks prevent breakage), download 4 Base44-CDN images to `public/assets/`, remove public auth pages (admin route instead), seed `events` from season plan dates
- **Aug+:** Exotics show reuse; alumni list import + newsletter; Sunnen pre-reg (add shirt-size field, capacity 250); gala save-the-date
- **Post-Sunnen:** gala ticketing + table captains on same registration engine

## 6. Mass-outreach sender (`/tools/email-sender`)

Python script, joins `gala_donation_targets.xlsx` (existing `{{Business Name}}`/`{{Pitch Line}}` merge fields, fills `Email Status` column):

- Sends via chapter Gmail (Gmail API) — established reputation; ~500/day cap = healthy pacing
- Throttle ~1/min, CAN-SPAM footer + opt-out, dry-run mode, writes status+timestamp back
- Reused later for alumni segments (newsletters, year-end appeal) with different sheet + template
- Replies stay human — script never auto-replies

**Why not Resend for this:** 575 cold emails from a brand-new domain → spam folder + domain reputation damage that would also hurt registration confirmations.

## Out of scope (YAGNI, revisit later)

Gala auction software, member peer-to-peer pages (St. Jude's platform covers it), sponsor self-serve portal, Awwwards design overhaul (parallel track — see design reference doc), live fundraising thermometer from Stripe data.

## External prerequisites (Nick/Anthony)

1. Stripe account + chapter bank details (Treasurer as rep) — started 2026-06-10
2. Domain purchase — started 2026-06-10
3. ALSAC GATE 1 answer governs donation receipt language (Jun 24)
