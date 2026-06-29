# TKE Epsilon Alpha Website — Session Handoff

Drop this into a new code chat to continue the work. Covers the homepage
entrance experience, the performance/QoL audit, and the critical workflow
gotchas. Last updated alongside `origin/main` tip `4659b1d`.

## Project
Chapter website for **Tau Kappa Epsilon, Epsilon Alpha at Saint Louis
University** — live at **tkeslu.org**. Working dir:
`/Users/anthonyfahim/TKE - EA/epsilon-alpha-tke`.

**Stack:** React 18 + Vite 6, TailwindCSS, Shadcn UI, framer-motion, three.js,
MapLibre GL, Lenis (smooth scroll). Backends: Base44 (legacy, mostly **down —
returns 404s, expected noise**), Supabase (events/registrations), Stripe
(car-show payments), Resend (email). Hosted on **Vercel**.

---

## ⚠️ Critical workflow gotchas (read before committing/deploying)
- **Two remotes:** `origin` = `anthonyfahim50/epsilon-alpha-tke` (main → Vercel
  deploys). `oldrepo-nlevi` = `Nc898/epsilon-alpha-tke` (collaborator "NLEVI" /
  Nick Childs, who also pushes to origin/main).
- **Vercel deploy gate:** blocks deploys whose **tip commit author email can't
  be matched to a GitHub account**. NLEVI's `nlevichilds@gmail.com` blocks.
  **Always run before committing:**
  ```
  git config user.email "289067618+anthonyfahim50@users.noreply.github.com"
  git config user.name "anthonyfahim50"
  ```
  Ensure the **tip commit is Anthony-authored**. If behind NLEVI:
  `git fetch origin` → `git merge --no-ff origin/main` → push.
- **Push flow:** set config → `git add -A` → check no secrets staged →
  `git commit` (end message with
  `Co-Authored-By: Claude Opus 4.8 <noreply@anthropic.com>`) → `git fetch origin`
  → merge if behind → `git push origin main` → verify `git rev-parse origin/main`
  == HEAD and tip author is anthonyfahim50.
- **Secrets** (Stripe/Supabase/Resend keys) go into Vercel/Supabase/Stripe
  dashboards, never into git/chat.
- **Umbrella/OpenDNS blocks tkeslu.org locally.** Verify live with
  `curl --resolve www.tkeslu.org:443:216.198.79.65 https://www.tkeslu.org/...`
  and poll the live JS bundle for a unique new string (Vercel hashes ≠ local
  build hashes — verify by content, not hash).

## ⚠️ Preview-environment quirks
- Dev server is **`tke-vite`** (port 5173). It **dies between sessions** —
  `preview_start "tke-vite"` to restart; the serverId changes each time.
- The preview tab frequently reports **`document.hidden = true`**, which
  **pauses framer-motion's rAF** → elements stay at their `initial` state and
  animations don't progress. Timeline `setTimeout`s still fire (throttled).
- **The viewport collapses to ~1px wide on reload.** After every
  reload/navigate, call `preview_resize` to explicit `width:1280, height:800`
  (presets are unreliable).
- **Screenshots can't capture WebGL** (maplibre globe, GLSL shaders). DOM /
  `preview_eval` checks are the source of truth.
- **`[Base44 SDK Error] 404` console spam is expected** (legacy backend down).
- **To visually verify a framer/DOM intro beat** (given paused rAF + collapse):
  navigate, resize to 1280×800, then `preview_eval` to manually paint a frame
  (set transforms/opacity on the elements), then screenshot. **Gotcha:**
  `img.closest('.absolute')` selects the `<img>` itself when the img has class
  `absolute` — walk up to the real wrapper instead.

---

## Homepage (`/` → `src/pages/HomeNext.jsx`)
Flow: **LivingBond intro → rolling slideshow hero → Marquee → PinnedValues →
RevealGrid → StJudeSection → CTA.** Classic home preserved at `/home-classic`.

### Intro — "THE LIVING BOND" (`src/components/next/LivingBond.jsx`, data in `src/lib/chapterMemories.js`)
- Sequence (~11.5s): heartbeat spark ("Every brotherhood begins with one.") →
  cherry-red threads connect real chapter photos → living constellation
  (parallax, depth) → LOVE·CHARITY·ESTEEM → photos assemble into the **INVERTED
  TKE triangle (apex DOWN)** with a white **"TKE" wordmark filling it like the
  logo** ("Not joined for a moment." → "Bound for life.") → three principle
  corners illuminate → photos contract into a single-line **Gateway Arch** → red
  **portal** flash → hero.
- **Tech:** CSS 3D transforms + SVG threads + framer-motion. **No WebGL, no new
  deps.** Transform/opacity only.
- **Rendered via `createPortal(document.body)`** — critical: Layout wraps pages
  in a framer `motion.div` whose transform became the containing block for
  `fixed`, making the overlay 6753px tall / off-center. Portal escapes that.
- Skippable (button / Escape / scroll-accelerate); `sessionStorage` key
  `tke-livingbond-seen` (full once/session, ~1.3s short reveal after);
  reduced-motion → short reveal; scroll locked then restored; pointer-parallax
  desktop-only (no device tilt); responsive photo counts 14/11/7;
  spacing-relaxation so cards don't clump; photos use **512px
  `/assets/photos/thumb/` variants**.
- A single inverted-triangle geometry (`buildLayout`) drives the triangle shape,
  the thread edges, the photo placement, AND the principle corners — so "upside
  down" applies everywhere.

### Hero — rolling slideshow (`src/components/HeroSection.jsx`)
Cross-fades 5 chapter photos every 6s, slideshow dots, parallax, "Better Men for
a Better World" + CTAs. This **replaced `ForgeHero`** (the WebGL fire/forge),
which the user asked to remove. Homepage no longer loads three.js.

**Alternates kept in repo (not used on home):** `ForgeHero.jsx`+`ForgeCanvas.jsx`
(fire), `BrotherhoodIntro.jsx` (Earth-orbit intro), `SatelliteIntro.jsx`.

---

## Performance + QoL audit (done, pushed)
- **Route code-splitting** (`App.jsx` React.lazy + Suspense; inner Suspense in
  `Layout.jsx` keeps nav during loads): entry bundle **1.6MB → 582KB**;
  three.js/maplibre now load on demand.
- **Image optimization** via macOS `sips` (no dep): `public/assets/photos/*.jpg`
  **14MB → 6.7MB** (1280px/q75, EXIF orientation preserved) + new
  **`/photos/thumb/`** 512px set (~1.4MB) used by intros.
- **Removed duplicate Lenis** (HomeNext had a 2nd instance fighting Layout's).
- **AuthContext** (`src/lib/AuthContext.jsx`): 6s timeout so a slow/dead Base44
  can't block render; expected failure logged as `warn`.
- `loading="lazy"`/`decoding="async"` on below-fold imgs that lacked them.
- Removed 6 unused deps (lodash, jspdf, html2canvas, @hello-pangea/dnd,
  react-quill, react-leaflet) via `npm uninstall`.
- Vite `manualChunks` isolates three/recharts; `index.html` absolute OG image +
  canonical + twitter meta.

## Validation
`npm run lint` clean, `npm test` **33/33 pass**, `npm run build` passes.
`npm run typecheck` has **pre-existing** errors only in `ResetPassword.jsx` /
`Terms.jsx` (loose JSX typing, untouched files — not from this work).

## Editing photos (chapter leadership)
Edit **`src/lib/chapterMemories.js`** only (no animation code). Add photo to
`/public/assets/photos/` + a ~512px copy in `/thumb/`; add an entry (`id`/`alt`
required; `year`/`caption` optional, shown on hover only when set — nothing
fabricated; `group: 'love'|'charity'|'esteem'` drives the principle wave;
`importance:1` preloads).

## Outstanding / optional (verify against current code — some may be stale)
- **Sound toggle** for LivingBond: omitted (no audio assets); hooks easy to add.
- **"TKE" wordmark font:** uses site heading font (Playfair Display), not the
  logo's block font (rules forbid adding fonts). Could swap to crest artwork for
  exact-logo look.
- From earlier handoff (confirm relevance): `src/lib/news.js` car-show entry
  text ($30 / $50-after-Jul-15, no rain date); Stripe webhook end-to-end test +
  refund; Supabase cleanup SQL (delete test registration, close stale
  `foundry-classics-2026`); `RESEND_API_KEY` + `EMAIL_FROM` env vars for
  contact/confirmation emails.
- Cross-browser (Safari/Firefox/Edge) + real-device mobile testing — not runnable
  in the preview env.
