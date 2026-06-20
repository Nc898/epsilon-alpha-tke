# Cosmic Intro Redesign — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Replace the procedural `/home-next` intro + forge hero with a cinematic, fully-generated golden-hour "dive from space into the SLU clocktower, then ease back out to a drifting clocktower hero."

**Architecture:** Three short Higgsfield image→video clips (Earth descent; dive into the real clock face; ease back out) are generated, upscaled, and dropped into `public/assets/intro/`. A rebuilt `CosmicIntro.jsx` plays them as muted autoplay `<video>` layers on the existing staged timeline, cross-blended at peak motion blur, with the HUD wayfinding restyled for golden hour. `ForgeHero`/`ForgeCanvas` are replaced by a golden-hour clocktower hero. Skippable, once-per-session, reduced-motion safe.

**Tech Stack:** React + Vite, Framer Motion, Higgsfield MCP (image→video, upscale), HTML5 `<video>`.

**Design doc:** `docs/plans/2026-06-20-cosmic-intro-redesign-design.md`

---

## Phase 0 — Prep

### Task 0: Branch + asset folder

**Files:**
- Create: `public/assets/intro/.gitkeep`

**Step 1:** Confirm on a feature branch (or create one):
```bash
git checkout -b feat/cosmic-intro || git checkout feat/cosmic-intro
```
**Step 2:** Create the asset folder:
```bash
mkdir -p public/assets/intro && type nul > public/assets/intro/.gitkeep
```
(PowerShell: `New-Item -ItemType Directory -Force public/assets/intro; New-Item -ItemType File public/assets/intro/.gitkeep`)
**Step 3:** Commit:
```bash
git add public/assets/intro/.gitkeep && git commit -m "chore(intro): asset folder for generated clips"
```

---

## Phase 1 — Asset generation (interactive, Higgsfield + user uploads)

> These tasks cost credits and require the user. Generate ONE clip, review together, iterate, then proceed. Never batch-generate blind. Each accepted clip is upscaled, downloaded, and committed before the next.

### Task 1: Upload the real clocktower reference photos

**Step 1:** Call `media_upload_widget` so the user can upload their SLU clocktower photos (the close-up with a clear clock face + at least one fuller tower shot). Capture the returned `media_id`s.
**Step 2:** Record each `media_id` in this plan file under "Asset IDs" (below) so later tasks reference them.

### Task 2: Clip 1 — Earth → through clouds toward STL (golden hour)

**Step 1:** Generate a golden-hour Earth-from-orbit start still with `generate_image` (model `nano_banana_pro` for crispness), prompt ~: "cinematic view of Earth from low orbit at golden hour, sun grazing the curve of the planet, warm atmospheric rim light, North America visible through breaking clouds, photoreal, ultra-detailed, anamorphic". `get_cost: true` first to preflight.
**Step 2:** Animate it with `generate_video` (cinematic model, e.g. `cinematic_studio_video_v2` or `kling3_0`, `sound: off`), prompt ~: "continuous accelerating descent from orbit down through golden-hour clouds toward a city, camera diving forward, increasing speed, natural motion blur, no cuts". Duration ~4-5s, 16:9.
**Step 3:** Review the result widget with the user. Iterate prompt/seed if needed.
**Step 4:** `upscale_video` the accepted clip.
**Step 5:** Download the MP4 to `public/assets/intro/01-earth-descent.mp4` (via the returned URL).
**Step 6:** Commit:
```bash
git add public/assets/intro/01-earth-descent.mp4 && git commit -m "feat(intro): clip 1 — golden-hour earth descent"
```

### Task 3: Clip 2 — Emerge over SLU → dive into the clock face

**Step 1:** `generate_video` image→video using the uploaded clocktower **close-up** `media_id` as `start_image`. Prompt ~: "cinematic golden-hour aerial swooping down toward a red-brick clocktower with a green pyramidal spire and white clock faces, camera accelerating straight into the clock face, 3D parallax, fountains and tree-lined plaza below, natural motion blur, continuous dive, no cuts". Duration ~4-5s.
**Step 2:** Review with user; iterate.
**Step 3:** `upscale_video`, download to `public/assets/intro/02-dive-clockface.mp4`.
**Step 4:** Commit.

### Task 4: Clip 3 — Ease back out → drifting clocktower hero

**Step 1:** `generate_video` image→video from a fuller clocktower `media_id` as `start_image`. Prompt ~: "camera eases back out from the clock face to reveal the full red-brick SLU clocktower in warm golden-hour light, slow continuous decelerating pull-back settling into a gentle drifting orbit, never fully stopping, cinematic, shallow depth of field". Duration ~5s.
**Step 2:** Review; iterate. (If beats 2+3 read better as one clip, try a combined "dive in then ease out" generation and skip this file.)
**Step 3:** `upscale_video`, download to `public/assets/intro/03-clocktower-hero.mp4`.
**Step 4:** Commit.

**Asset IDs (fill in during Phase 1):**
- Tower close-up media_id: `____`
- Tower full media_id: `____`
- Clip job IDs: `____`

---

## Phase 2 — Code integration

### Task 5: `IntroVideo` seam-blur helper component

**Files:**
- Create: `src/components/next/IntroVideo.jsx`

**Step 1:** Create a small component that renders a muted, playsInline, autoplay `<video>` for one clip, with `opacity` and a timeline-driven directional blur driven by a passed-in Framer `MotionValue` (0→1 stage progress). Reuse the SVG directional-blur approach from `ScrollBlur.jsx`. Crossfade in/out via opacity transforms keyed on the global intro progress.
**Step 2 (verify):** Temporarily render `<IntroVideo src="/assets/intro/01-earth-descent.mp4" />` on a scratch route or in `CosmicIntro` and confirm via `preview_start` + `preview_screenshot` that the clip plays and blur responds. Remove scratch usage.
**Step 3:** Commit.

### Task 6: Rebuild `CosmicIntro.jsx` to play the clips

**Files:**
- Modify: `src/components/next/CosmicIntro.jsx`

**Step 1:** Replace the CSS "Earth" planet, starfield canvas, reticle, and SLU-gate photo with three stacked `IntroVideo` layers (clips 1→2→3), sequenced on the existing `progress` motion value (`animate(progress, 1, { duration: ~6.5 })`). Crossfade each clip at peak velocity; place crossfades where the design's blur peaks are.
**Step 2:** Keep and restyle the **HUD wayfinding** (UNITED STATES → MISSOURI → ST. LOUIS → SAINT LOUIS UNIVERSITY + live coordinates) as an overlay; warm/golden text treatment instead of crimson HUD.
**Step 3:** Preserve existing behavior: `sessionStorage` once-per-session gate, `Skip ›` button, reduced-motion users call `finish()` immediately (no video).
**Step 4 (verify):** `preview_eval` to clear `tke-cosmic-seen`, reload `/home-next`, screenshot mid-intro and at hero handoff. Confirm no still frames and seams are blur-hidden.
**Step 5:** Commit.

### Task 7: Replace forge hero with golden-hour clocktower hero

**Files:**
- Modify: `src/pages/HomeNext.jsx`
- Create: `src/components/next/ClocktowerHero.jsx`
- Delete: `src/components/next/ForgeHero.jsx`, `src/components/next/ForgeCanvas.jsx`

**Step 1:** Create `ClocktowerHero.jsx`: clip 3 (`03-clocktower-hero.mp4`) as a looping, slowly-drifting muted `<video>` background (or the tail frame held with a subtle Framer parallax so it never fully stops), with the existing headline ("Better Men for a Better World"), subhead, and the Join TKE / Support St. Jude CTAs over a golden-hour scrim. Cursor-parallax on the type may stay; drop the crest-glow tuned for the dark bg.
**Step 2:** In `HomeNext.jsx`, swap `<ForgeHero />` for `<ClocktowerHero />`; remove the forge imports.
**Step 3:** Delete `ForgeHero.jsx` and `ForgeCanvas.jsx`. Confirm nothing else imports them (`grep -rn "ForgeHero\|ForgeCanvas" src`).
**Step 4 (verify):** `npm run build` (exit 0). Preview `/home-next`: intro → clocktower hero handoff is continuous and golden; scroll into marquee/values/grid (motion blur intact).
**Step 5:** Commit.

### Task 8: Reduced-motion + mobile + perf pass

**Files:**
- Modify: `src/components/next/CosmicIntro.jsx`, `src/components/next/ClocktowerHero.jsx`

**Step 1:** Reduced-motion: intro skipped; `ClocktowerHero` shows a static golden-hour poster frame (add `poster` attr / first-frame image) instead of looping video.
**Step 2:** Mobile: confirm `<video>` has `playsInline muted autoplay loop preload="auto"`; provide a lighter poster; verify clips are 16:9 letterboxed acceptably or generate 9:16 variants if needed (flag to user, don't auto-spend credits).
**Step 3 (verify):** `preview_resize` to mobile; screenshot. Check `preview_console_logs` for autoplay errors.
**Step 4:** Commit.

### Task 9: Final review + ship

**Step 1:** Full `npm run build`, exit 0.
**Step 2:** Walk the whole `/home-next` with the user via preview screenshots.
**Step 3:** Push to `anthony` + `origin`; flag that a Vercel deploy is needed (webhook has been flaky).
**Step 4:** Decision point (deferred from design): promote `/home-next` to `/` or keep as showcase.

---

## Notes

- **Credits:** Phase 1 is the only cost. Generate→review→accept one clip at a time.
- **Chat attachments:** Higgsfield cannot read them; always use `media_upload_widget` / `media_import_url`.
- **Video weight:** keep each clip a few seconds, upscaled then compressed if large (target < ~3-4 MB each) so the page stays fast.
- **No flat photos in-scene:** photos are generation references only.
