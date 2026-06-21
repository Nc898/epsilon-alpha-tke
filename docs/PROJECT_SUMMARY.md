# TKE Epsilon-Alpha Project Summary

## Product

This repository powers the Tau Kappa Epsilon Epsilon-Alpha chapter website at Saint Louis University. It is more than a brochure site: it combines recruitment, philanthropy, alumni news, chapter events, member profiles, photo galleries, authentication, donations, and event registration/administration.

## Architecture

- Front end: React 18, Vite 6, React Router, Tailwind CSS, Radix-derived UI components, TanStack Query, Framer Motion, Lenis, Three.js, and MapLibre.
- Base44: authentication and chapter-content entities such as members, sponsors, fundraising statistics, alumni updates, and chapter events.
- Supabase: public events and gallery metadata/storage; protected registration and email-log data using row-level security and service-role server access.
- Vercel functions: contact and recruitment email, Stripe checkout/webhooks, registration admin, gallery admin, and scheduled reminder email.
- External services: Stripe for payments, Resend for email, Behold for Instagram feed, and Vercel for deployment/cron.

The system is transitional rather than fully unified: Base44 owns content/auth while Supabase owns newer transactional features. That is workable, but it creates two data models and two operational failure surfaces.

## User experience and visual system

The primary route uses the experimental `HomeNext` experience: a satellite descent, shader-driven forge hero, kinetic marquee, pinned values, photo reveal grid, St. Jude section, and final recruitment/alumni call to action. The classic home remains at `/home-classic`.

The design language is editorial and cinematic: Playfair Display headings, Inter body text, deep near-black fields, TKE crimson, large Greek-letter watermarks, duotone photography, generous rounded geometry, grain, motion, magnetic controls, and custom cursor behavior. Reduced-motion fallbacks exist in several motion systems. The strongest visual asset is the dramatic homepage; the main design risk is performance and visual coherence across less cinematic utility/admin pages.

## Main routes

- Public: home, philanthropy, alumni, recruitment, calendar, members, contact, news, event signup, car show, donate, gallery, privacy, and terms.
- Authentication: login, register with OTP, forgot password, and reset password.
- Administration: registrations and gallery management protected by an admin key at the API boundary.

## Data and operational flows

- Event signup validates registration data, creates a pending Supabase registration through a server function, opens Stripe Checkout, and updates the record through the signed webhook.
- Reminder cron reads paid registrations, sends time-based Resend messages, and records sends idempotently.
- Contact and recruitment forms call server functions that validate, email, and avoid exposing provider secrets to the browser.
- Gallery management uploads compressed images to Supabase Storage and stores album/photo metadata in Supabase.
- Alumni tooling extracts a private roster, renders branded newsletters, supports safe dry runs/tests, sends batches with Resend, honors unsubscribe lists, and optionally archives the newsletter into Base44.

## Repository shape

- `src/pages`: route-level experiences.
- `src/components`: shared site and motion components; `src/components/next` contains the cinematic homepage system; `src/components/ui` is the reusable UI kit.
- `src/lib`: authentication, validation, service clients, content constants, and utilities.
- `api`: Vercel serverless endpoints and shared server helpers.
- `supabase/migrations`: event/registration/email-log, gallery, and car-show schema evolution.
- `scripts`: alumni email, sponsor discovery, spreadsheet, QR, gallery upload, and fundraising operations.
- `docs/plans`: dated design and implementation decisions.
- `public/assets`: brand, event, philanthropy, and chapter photography.

## Current engineering health (2026-06-21)

- Production build passes.
- Test suite passes: 5 files, 33 tests.
- Lint passes.
- Typecheck fails extensively. The JavaScript-checking configuration traverses Three.js source and also exposes missing/overly strict component prop typing throughout the JSX codebase. The build still succeeds, but `typecheck` is not a useful quality gate until its scope and component typings are repaired.
- The build reports one ambiguous Tailwind arbitrary-duration class.
- GitHub authentication uses clean remote URLs and repository-scoped GitHub CLI credentials.

## Highest-value next work

1. Revoke the previously exposed GitHub token if that has not already been done; the repository now uses GitHub CLI authentication with clean remote URLs.
2. Repair `jsconfig.json`/Three.js exclusion and component prop defaults so typecheck becomes actionable.
3. Add integration coverage for checkout/webhook idempotency, admin authorization, email failure behavior, and Supabase-unavailable states.
4. Establish one long-term source of truth for content and transactional data, or document the Base44/Supabase ownership boundary explicitly.
5. Measure mobile performance of MapLibre, Three.js, large imagery, and motion; lazy-load or degrade the cinematic intro where needed.
