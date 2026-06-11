# Design & Fluidity Upgrade Plan

**Date:** 2026-06-11
**Source:** "AWARD-WINNING WEB DESIGN ANALYSIS" reference doc (7 Awwwards sites) + live UI walkthrough (desktop/tablet/mobile screenshots of every page)
**Status:** Proposed — awaiting Nick's approval

---

## Part A — Walkthrough findings (what the site looks like TODAY)

### 🔴 P0 — Actually broken (fix before anything aesthetic)

**A1. Navbar logo lockup collides with hero text on every page.**
`public/assets/tke-logo.png` is now a 4500×1848 transparent lockup (triangle crest + "TAU KAPPA EPSILON" + "Better Men for a Better World" tagline). `Navbar.jsx` renders it 220px tall (unscrolled), so the lockup's own text hangs over the page heros and double-prints against the heros' identical copy ("TAU KAPPA EPSILON… Better Men for a Better World" appears twice, offset — reads as a rendering glitch). Affects Home, Calendar, Events signup, every dark-hero page.

**A2. Mobile is horizontally broken.**
At 375px viewport the 220px-tall logo renders ~536px wide (`width: auto`), overflowing the viewport — the entire page gains a horizontal scrollbar and the crest sits half off-screen.

**A3. Scrolled navbar logo is illegible.**
At 68px tall, the lockup's dark-red text sits on the black navbar — unreadable smudge.

**A4. Hero/eyebrow text redundancy.**
The hero eyebrow says "Tau Kappa Epsilon — Epsilon Alpha Chapter" and the h1 says "Better Men for a Better World" — the same words as the logo image. Even when the overlap is fixed, the words appear twice on first paint.

### 🟡 Observations (working, but flat against the reference doc)

- No motion anywhere on scroll: sections pop in statically; the only animation is the hero crossfade + navbar resize
- Default browser scrolling — no inertia/weight (the doc's #1 finding across all 7 sites)
- Hero type tops out at `text-7xl` (~72px) — the doc's winners run 8–14vw, text-as-graphic
- Background is flat near-white `hsl(0,0%,97%)` everywhere — no tonal layering, no tinted off-white
- Buttons are stock shadcn rectangles; hover states are color-only
- Active nav state is just red text; no underline personality
- No scroll cue at the hero's bottom edge
- Stat tiles ("12 Events Hosted", "25% Goal Progress") are static numbers — no count-up, no life
- Hero CTA row wraps awkwardly into a 2+1 layout at tablet widths
- Signup page (new) is clean and on-system; same logo collision in its hero

---

## Part B — The plan

Mapped to the reference doc, sequenced by impact-per-effort. Each phase is shippable on its own.

### Phase 0 — Repair (do first, ~1 session)

**0.1 Logo strategy** — the root fix for A1/A2/A3:
- Navbar uses a **triangle-crest-only** asset (`tke-crest.png`, cropped from the lockup or sourced from `C:\Users\Nick\Downloads\BM4BW` if a no-text variant exists — check first)
- Sizes: unscrolled 96px desktop / 72px mobile; scrolled 56px. Kill `width:auto` unboundedness with `max-width` clamps. The crest may still protrude slightly below the bar (the intended look) but never overlaps copy
- The full lockup with wordmark is reserved for: footer, email headers, print/QR flyers
- Hero keeps the text version (eyebrow + h1) — fixing A4 by making the *image* logo wordless

**0.2 Mobile hero CTA stack** — at <640px the three buttons become a clean vertical stack (full-width primary, two halves below or all stacked); no orphan wrapping.

### Phase 1 — Foundation tokens (the doc's "Tier 1", ~1 session)

**1.1 Design token pass in `src/index.css`:**
```css
:root {
  /* existing TKE colors stay */
  --background: 240 14% 97%;        /* F0F1FA-family cool off-white (doc: never pure/flat white) */
  --radius-global: 1.25rem;          /* one radius, used everywhere (doc: Lusion's strict 20px) */
  --ease-out-expo: cubic-bezier(0.16, 1, 0.3, 1);
  --ease-in-out-circ: cubic-bezier(0.77, 0, 0.175, 1);
  --dur-fast: 0.3s; --dur-base: 0.6s; --dur-slow: 1.1s;
}
```
Sweep components to use the shared radius (cards currently mix rounded-xl/lg/2xl).

**1.2 Hero display typography:**
`font-size: clamp(2.75rem, 7.5vw, 6.5rem)` on the hero h1, `letter-spacing: -0.02em`, `line-height: 1.05`. Section h2s get a smaller clamp. Text becomes the visual, per the doc.

**1.3 Selective word color:** "Better Men for a **Better World**" — last two words in cherry red via a span. One highlight per headline, max (doc rule). Also apply to one StJude section headline.

**1.4 Wavy active-nav underline:**
```css
text-decoration: underline wavy 2px; text-underline-offset: 6px;
```
on the active link (both navs). Tiny change, big personality signal (doc: Oddly Made).

### Phase 2 — Motion system (the doc's universal patterns, ~1-2 sessions)

**2.1 Lenis smooth scroll** — `npm i lenis` (the maintained package; `@studio-freight/lenis` is its deprecated name). Mount in `Layout.jsx` via a `useLenis` hook, `duration: 1.1`, respecting `prefers-reduced-motion` (disable entirely). The doc calls this the single highest-impact change; every reference site has scroll physics.

**2.2 Scroll-reveal primitives** — one small `<Reveal>` wrapper component (Framer Motion `whileInView`, `viewport={{ once: true, margin: '-80px' }}`, y:32→0, opacity, `--ease-out-expo`, 60-90ms stagger via `staggerChildren` for grids). Apply to: ImpactStats tiles, About pillar cards, StJude section, sponsor tiers, calendar event cards, recruitment pillars, footer columns. No new dependency.

**2.3 Hero word-stagger** — split the h1 into word spans, stagger 70ms, rise+fade on load. Eyebrow fades in after, CTAs last. (Doc: ghost-echo/stagger typography — we take the stagger, skip the echo gimmick.)

**2.4 Scroll indicator** — bottom-center of hero: `SCROLL` in 10px tracked uppercase + animated chevron/line, fades out after first scroll (doc: Lusion's `+ SCROLL TO EXPLORE +`, Explora's chevron).

**2.5 Stat count-up** — ImpactStats numbers animate from 0 when revealed (Framer Motion `useInView` + `animate`); ~1.2s, `--ease-out-expo`. Pairs with 2.2.

**2.6 Button system** — pill radius (`rounded-full`) on marketing CTAs (hero, donate, section CTAs; forms keep rectangles). Primary gets an arrow that slides in on hover (`group-hover:translate-x-0.5 opacity` pattern). All interactive elements get a defined hover transform (doc: "hover must always respond").

### Phase 3 — Atmosphere & identity (~1-2 sessions, after Phases 0-2 ship)

**3.1 "Next event" ambient data** — small live element in the hero (or above the fold): "🏁 Foundry Car Show — 45 days away · Register →" pulled from the Supabase `events` table (already live). The doc's "live ambient data" pattern, but in service of the season plan: every homepage visit funnels to the active registration. This is the highest-ROI doc idea for THIS site.

**3.2 Tonal section layering** — alternate `--background` (cool off-white) with slightly deeper `hsl(240 10% 93%)` panels and the existing near-black sections; section seams get generous radius (`rounded-t-[2.5rem]`) so dark sections read as "cards" entering the page (doc: rounded viewport containers).

**3.3 Page transitions** — Framer Motion `AnimatePresence` around the router outlet: 250ms fade+y on route change. Subtle; skip the full overlay-wipe (overkill for a chapter site).

**3.4 Footer lockup** — full wordmark lockup PNG (white/knockout version) replaces the "TKE ΕΑ" text mark; rotating chapter taglines are NOT recommended (doc pattern, but gimmicky for a fraternity's public site).

### Explicitly skipped (from the doc, with reasons)
- **Three.js/WebGL hero, GLSL, particle effects** — load weight + maintenance for zero recruiting value; photos of real brothers are the asset
- **Custom cursor** — high polish ceiling but desktop-only and easy to get wrong; revisit post-launch if desired
- **Comma nav separators, monospace UI font, chromatic aberration/glitch** — wrong brand voice for TKE/St. Jude
- **Center-stage gallery** — save for a post-Sunnen photo gallery page when there are 250-car photos to show off

### Sequencing & rules
- Build on `feat/carshow-platform` after it merges (or a new `feat/design-upgrade` branch off master)
- Every motion: 0.3-1.1s, eased both ways, `prefers-reduced-motion` respected globally (one media query kills Lenis + reveals)
- After each phase: screenshot pass at 375/768/1280 (the preview harness is configured in `.claude/launch.json`)
- Phase 0 ships before the July flyer QR goes anywhere — the signup page hero must not look glitched on a phone
