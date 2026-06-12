# Instagram Integration — Design

**Date:** 2026-06-12
**Status:** Approved
**Account:** `@tkeslu` (full login access; can convert to Business/Creator)

## Goal

Both drive followers to the chapter Instagram and keep the site feeling alive
with fresh posts — without anyone touching the website.

## Decision: Approach B — feed middleman, custom-styled

Instagram's Basic Display API is dead (Dec 2024), so auto-pulling posts
requires either a Meta developer app or a middleman service.

- **A — Official Instagram API, self-hosted:** Meta app + token-refresh cron.
  Full control, no dependency, but Meta setup is painful and a lapsed token
  (e.g. password change at officer turnover) needs manual re-auth through
  Meta's dashboard. Rejected: silent breakage two officer-transitions from now
  is the failure mode that matters most.
- **B — Behold.so (or similar) JSON feed, our renderer (chosen):** the service
  connects to the IG account once, absorbs Meta's token churn, emails if the
  connection breaks, and hands us a JSON URL. We style the data natively —
  visually identical to A. Free tier (1 feed, ~12 recent posts, capped
  requests) is plenty.
- **C — Links only, no feed:** zero risk but misses the "site feels alive"
  half of the goal. The link layer ships regardless (see below).

A and B render identically because both just supply raw post data (image,
caption, permalink, date); the renderer is ours either way. If Behold dies,
we swap the data source for a self-hosted endpoint and keep the renderer.

Genuine Instagram embed cards (official per-post embed codes) were considered
for the primary treatment and rejected — they're manual per post, load
Instagram's heavy script, and look pasted-in. They remain an option later for
single curated posts (e.g. in the News drawer) since they need no API.

## 1. Feed section — `InstagramFeed` component

- Styled like an IG profile grid: heading with `@tkeslu` + rounded **Follow**
  button (IG gradient accent on hover).
- Responsive grid of square tiles: 3×2 desktop (6 posts), 2×3 mobile.
- Hover lifts the tile and reveals first line of caption + date over a dark
  gradient; click opens the real post on Instagram in a new tab.
- Tiles enter with the existing `Reveal` stagger.
- Placements: **Home** (between St. Jude section and CTA banner) and
  **Gallery** (below albums, titled "More on Instagram").

## 2. Data flow

- One-time: connect `@tkeslu` to Behold in their dashboard → JSON feed URL.
- Frontend fetches the URL with TanStack Query, `staleTime` 30 min — far
  under free-tier request caps. No backend.
- URL lives in `VITE_BEHOLD_FEED_URL`; safe to expose (public, read-only,
  rate-limited by Behold). Changing feeds requires no code edit.

## 3. Universal link layer

- Footer: Instagram icon by the contact info → `instagram.com/tkeslu`.
- Contact page: Instagram card alongside phone/email ("DM us @tkeslu").
- Recruitment page: "Follow our story" CTA near the bottom.
- One shared constant for the handle/URL so it changes in exactly one place.

## 4. Failure handling

If the fetch fails, returns empty, or the env var is missing, the section
renders a styled fallback card — "Follow @tkeslu on Instagram" + button.
Never a broken or empty grid.

## 5. Testing

- Vitest: mapping Behold JSON → tile model; fallback on bad/empty payloads.
- Visual verification on the preview server with a mocked feed.
