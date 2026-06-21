# Cosmic Intro Redesign — `/home-next`

**Date:** 2026-06-20
**Status:** Approved (design)
**Scope:** Replace the procedural intro on `/home-next` with a cinematic, fully-generated golden-hour "dive from space to the SLU clocktower." Scrap the dark forge hero.

## Problem

The current `/home-next` intro (`CosmicIntro.jsx`) and hero (`ForgeHero.jsx`) rely on procedural fakes:
- The "Earth" is a CSS radial-gradient circle — reads as a maroon blob, not a planet.
- The "forge" hero is an fbm-noise WebGL shader that renders as muddy orange smears.
- Two unrelated metaphors (cosmic descent + forge) are bolted together with no throughline.

Decision: throw out the dark forge hero. Replace the whole opening with one cohesive, cinematic sequence.

## Concept

A single, continuously flowing camera move — the viewer **dives from orbit down to SLU's clocktower, into the clock face, then eases back out** to reveal the tower as the page hero, all in warm golden-hour light.

```
SPACE ═══► US ═══► MISSOURI ═══► STL ═══► TOWER ═══► CLOCK FACE ═══► (ease back out) ═══► HERO (drifting)
      accelerate · decelerate-just-enough-to-read · accelerate · ... · decelerate · never stops
```

## Hard constraints (from review)

1. **Nothing is ever still.** No freeze frames, no static landmarks, no hard stop. The camera decelerates to make landmarks legible but never parks; the final hero keeps a slow perpetual drift.
2. **No flat 2D photos in the scene.** Photos are *references* (image→video input), never composited/scaled on screen. Everything the viewer sees is generated video with real 3D parallax.
3. **Golden hour** throughout — warm, cinematic, premium.
4. **Authentic SLU clocktower.** The dive-in and pull-back are generated from the user's real clocktower photos (red brick, green pyramidal spire, white clock faces, fountain plaza). Generic AI towers are unacceptable.
5. **Motion blur is the glue.** Every seam between clips sits at peak motion blur ("cut on peak motion"), so separate clips read as one continuous move. Blur is (a) native in the AI clips and (b) code-driven on cross-stage transitions.

## Production approach (chosen: B, all-video)

Three short generated clips, stitched at peak blur:

| Beat | Clip | Source / notes |
|---|---|---|
| 1. Orbit → through clouds toward STL | AI clip | golden-hour Earth descent; space → city in one continuous fall |
| 2. Emerge over SLU → dive into clock face | AI clip | from real tower photo; model adds 3D parallax; flows through the glass |
| 3. Ease back out → clocktower hero | AI clip | from real tower photo; continuous decelerating pull-back, settles into endless slow drift |

Beats 2+3 may combine into a single "dive-in then ease-out" clip if the model holds continuity (fewer seams). Test clip-by-clip; nothing generated blind.

Rejected approaches:
- **A (5-clip full sequence):** more credits than needed for the same effect at this stage.
- **C (one continuous "powers of ten" clip):** models can't hold coherence across ~6 orders of magnitude scale change, and would invent a non-SLU tower. Loses authenticity.

## Assets & tooling

- **Generator:** Higgsfield MCP (image→video). Cinematic models (e.g. Kling 3.0 / Cinema Studio Video / Seedance) with native motion blur; `upscale_video` for final quality.
- **Reference photos:** user-provided SLU clocktower shots (multiple angles + clock-face close-up). Must be uploaded via `media_upload_widget` or imported by URL — Higgsfield cannot read chat attachments.
- **Output:** muted autoplay `<video>` (MP4/WebM) in `public/assets/`, loaded by the intro component.

## Integration

- Reuse the existing staged timeline scaffold in `CosmicIntro.jsx`, but swap procedural visuals for the generated clips.
- **Keep HUD wayfinding** (UNITED STATES → MISSOURI → ST. LOUIS → SAINT LOUIS UNIVERSITY + live coordinates) as UI text over the footage, restyled for golden hour.
- Total ~6–7s, **skippable**, runs **once per session** (existing `sessionStorage` gate).
- Reduced-motion users skip the intro entirely (existing behavior).
- The dive-out lands on a golden-hour clocktower hero with the headline fading in over moving footage — replacing `ForgeHero`/`ForgeCanvas`.

## Motion blur (already built)

`ScrollBlur` (scroll-velocity directional SVG blur) ships on the photo grid. The intro reuses the same directional-blur technique driven by the intro *timeline* progress instead of scroll velocity, to cover clip seams.

## Future enhancements

- A chapter-in-front-of-the-tower shot as its own image→video clip layered at the very end (never a flat drop-in).
- Possible upgrade to the 5-clip Approach A if more granularity is wanted.

## Decision on promotion

Whether `/home-next` replaces the live home page is deferred until the polished result can be compared side-by-side.

## Out of scope

- Audio (browsers block autoplay audio; intro is silent).
- Changes to the live home page.
