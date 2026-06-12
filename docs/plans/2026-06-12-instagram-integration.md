# Instagram Integration Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** Auto-updating Instagram feed sections on Home + Gallery fed by a Behold.so JSON feed, plus Instagram links in Footer, Contact, and Recruitment — with a styled fallback card whenever the feed is unavailable.

**Architecture:** A pure mapper (`src/lib/instagramFeed.js`, TDD'd) normalizes Behold's JSON into a tile model. A single `InstagramFeed` component fetches via TanStack Query (30-min staleTime) and renders a profile-style square grid, or a fallback "Follow @tkeslu" card on any failure. All links/handles come from one constants file. No backend changes.

**Tech Stack:** React 18 + Vite, TanStack Query v5, framer-motion (existing `Reveal`), Tailwind + shadcn `Button`, lucide-react `Instagram` icon, vitest (logic only — repo has no component-test tooling).

**Design doc:** `docs/plans/2026-06-12-instagram-integration-design.md`

**Conventions to follow:** kebab-free component filenames (`InstagramFeed.jsx`), section pattern = `py-16/20` + `max-w-7xl` container + `Reveal` entrances, dark cards use `bg-[hsl(0,0%,7%)]` with `ring-1 ring-white/10`. Run all commands from repo root `C:\Users\Nick\.claude\epsilon-alpha-tke`.

---

### Task 1: Social constants

**Files:**
- Create: `src/lib/social.js`

**Step 1: Create the constants file**

```js
// src/lib/social.js
export const INSTAGRAM_HANDLE = 'tkeslu';
export const INSTAGRAM_URL = `https://www.instagram.com/${INSTAGRAM_HANDLE}/`;
```

**Step 2: Commit**

```bash
git add src/lib/social.js
git commit -m "feat(social): shared Instagram handle/url constants"
```

---

### Task 2: Behold payload mapper (TDD)

Behold's feed JSON has shipped in two shapes: a bare array of posts, or
`{ username, profilePictureUrl, posts: [...] }`. Posts may have `mediaUrl`,
`thumbnailUrl` (videos), or a `sizes.medium.mediaUrl`. The mapper must
tolerate all of these and any garbage, returning `[]` rather than throwing.

**Files:**
- Create: `src/lib/instagramFeed.js`
- Test: `src/lib/instagramFeed.test.js`

**Step 1: Write the failing tests**

```js
// src/lib/instagramFeed.test.js
import { describe, it, expect } from 'vitest';
import { mapBeholdPayload } from './instagramFeed';

const post = (over = {}) => ({
  id: '123',
  permalink: 'https://www.instagram.com/p/abc/',
  mediaUrl: 'https://cdn.example.com/full.jpg',
  caption: 'Car show day! #tke',
  timestamp: '2026-06-01T15:00:00+0000',
  mediaType: 'IMAGE',
  ...over,
});

describe('mapBeholdPayload', () => {
  it('maps an object payload with posts array', () => {
    const tiles = mapBeholdPayload({ username: 'tkeslu', posts: [post()] });
    expect(tiles).toEqual([
      {
        id: '123',
        permalink: 'https://www.instagram.com/p/abc/',
        imageUrl: 'https://cdn.example.com/full.jpg',
        caption: 'Car show day! #tke',
        timestamp: '2026-06-01T15:00:00+0000',
        isVideo: false,
      },
    ]);
  });

  it('maps a bare array payload', () => {
    expect(mapBeholdPayload([post()])).toHaveLength(1);
  });

  it('prefers sizes.medium.mediaUrl when present', () => {
    const tiles = mapBeholdPayload([
      post({ sizes: { medium: { mediaUrl: 'https://cdn.example.com/med.jpg' } } }),
    ]);
    expect(tiles[0].imageUrl).toBe('https://cdn.example.com/med.jpg');
  });

  it('falls back to thumbnailUrl for videos and flags isVideo', () => {
    const tiles = mapBeholdPayload([
      post({ mediaType: 'VIDEO', mediaUrl: undefined, thumbnailUrl: 'https://cdn.example.com/thumb.jpg' }),
    ]);
    expect(tiles[0].imageUrl).toBe('https://cdn.example.com/thumb.jpg');
    expect(tiles[0].isVideo).toBe(true);
  });

  it('drops posts missing an image or permalink', () => {
    expect(mapBeholdPayload([post({ mediaUrl: undefined, sizes: undefined })])).toEqual([]);
    expect(mapBeholdPayload([post({ permalink: undefined })])).toEqual([]);
  });

  it('defaults caption to empty string', () => {
    expect(mapBeholdPayload([post({ caption: undefined })])[0].caption).toBe('');
  });

  it('returns [] for garbage payloads', () => {
    expect(mapBeholdPayload(null)).toEqual([]);
    expect(mapBeholdPayload(undefined)).toEqual([]);
    expect(mapBeholdPayload('nope')).toEqual([]);
    expect(mapBeholdPayload({ posts: 'nope' })).toEqual([]);
    expect(mapBeholdPayload({})).toEqual([]);
  });
});
```

**Step 2: Run tests to verify they fail**

Run: `npx vitest run src/lib/instagramFeed.test.js`
Expected: FAIL — cannot resolve `./instagramFeed`.

**Step 3: Write the implementation**

```js
// src/lib/instagramFeed.js
// Normalizes a Behold.so feed payload (bare array OR {posts: []}) into the
// tile model rendered by <InstagramFeed>. Never throws — bad input → [].
export function mapBeholdPayload(payload) {
  const posts = Array.isArray(payload) ? payload : payload?.posts;
  if (!Array.isArray(posts)) return [];

  return posts.flatMap((p) => {
    if (!p || typeof p !== 'object') return [];
    const imageUrl = p.sizes?.medium?.mediaUrl ?? p.mediaUrl ?? p.thumbnailUrl;
    if (!imageUrl || !p.permalink) return [];
    return [{
      id: p.id ?? p.permalink,
      permalink: p.permalink,
      imageUrl,
      caption: p.caption ?? '',
      timestamp: p.timestamp ?? null,
      isVideo: p.mediaType === 'VIDEO',
    }];
  });
}
```

**Step 4: Run tests to verify they pass**

Run: `npx vitest run src/lib/instagramFeed.test.js`
Expected: 7 passing.

**Step 5: Run the full suite (19 existing tests must stay green)**

Run: `npm test`
Expected: all pass.

**Step 6: Commit**

```bash
git add src/lib/instagramFeed.js src/lib/instagramFeed.test.js
git commit -m "feat(instagram): behold payload mapper (TDD)"
```

---

### Task 3: InstagramFeed component

**Files:**
- Create: `src/components/InstagramFeed.jsx`

**Step 1: Create the component**

Behavior: reads `import.meta.env.VITE_BEHOLD_FEED_URL`. Query is disabled when
the env var is missing. Any of {missing env var, fetch error, empty tiles}
renders the fallback follow card. While loading, render nothing (`null`) —
no spinner; the section simply appears when ready, matching NextEventBanner.

```jsx
// src/components/InstagramFeed.jsx
import { useQuery } from '@tanstack/react-query';
import { Instagram, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { mapBeholdPayload } from '../lib/instagramFeed';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

const FEED_URL = import.meta.env.VITE_BEHOLD_FEED_URL;

function FollowButton({ size = 'default' }) {
  return (
    <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
      <Button
        size={size}
        className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
      >
        <Instagram className="h-4 w-4" /> Follow @{INSTAGRAM_HANDLE}
        <ArrowRight className="h-4 w-4 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </Button>
    </a>
  );
}

function FallbackCard() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] ring-1 ring-white/10 text-white px-8 py-12 sm:py-16 text-center">
        <Instagram className="h-8 w-8 text-primary mx-auto mb-4" />
        <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          Life at Epsilon Alpha
        </h3>
        <p className="text-white/65 max-w-md mx-auto mb-7">
          Brotherhood, philanthropy, and everything in between — follow along on Instagram.
        </p>
        <FollowButton size="lg" />
      </div>
    </Reveal>
  );
}

export default function InstagramFeed({ title = 'Latest from Instagram' }) {
  const { data: tiles = [], isLoading, isError } = useQuery({
    queryKey: ['instagram-feed'],
    enabled: Boolean(FEED_URL),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const res = await fetch(FEED_URL);
      if (!res.ok) throw new Error(`Behold feed ${res.status}`);
      return mapBeholdPayload(await res.json());
    },
  });

  if (FEED_URL && isLoading) return null;
  const showGrid = tiles.length > 0 && !isError;

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showGrid ? (
          <>
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
              <div>
                <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                  <Instagram className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  @{INSTAGRAM_HANDLE}
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                  {title}
                </h2>
              </div>
              <FollowButton />
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tiles.slice(0, 6).map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 0.08}>
                  <a
                    href={t.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-2xl bg-[hsl(0,0%,7%)]"
                  >
                    <img
                      src={t.imageUrl}
                      alt={t.caption ? t.caption.slice(0, 80) : 'Instagram post'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {t.caption && (
                        <p className="text-white text-sm font-medium line-clamp-2">{t.caption}</p>
                      )}
                      {t.timestamp && (
                        <p className="text-white/60 text-xs mt-1">
                          {new Date(t.timestamp).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <Instagram className="absolute top-3 right-3 h-4 w-4 text-white/80 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <FallbackCard />
        )}
      </div>
    </section>
  );
}
```

**Step 2: Commit**

```bash
git add src/components/InstagramFeed.jsx
git commit -m "feat(instagram): InstagramFeed grid with follow fallback card"
```

---

### Task 4: Mount on Home and Gallery

**Files:**
- Modify: `src/pages/Home.jsx` (imports ~line 11; JSX after `<StJudeSection />` ~line 22)
- Modify: `src/pages/Gallery.jsx` (imports ~line 7; JSX before closing `</div>` ~line 105)

**Step 1: Home — import and mount between StJudeSection and the CTA banner**

```jsx
import InstagramFeed from '../components/InstagramFeed';
```

```jsx
      <StJudeSection />
      <InstagramFeed title="Latest from the Chapter" />
```

(The CTA banner section below keeps its existing `-mt-10` overlap styling — verify in preview that the rounded seam still overlaps the feed section cleanly.)

**Step 2: Gallery — import and mount as the last section**

```jsx
import InstagramFeed from '../components/InstagramFeed';
```

After the albums `</section>` closing tag, before the final `</div>`:

```jsx
      <InstagramFeed title="More on Instagram" />
```

**Step 3: Verify in preview**

With no `VITE_BEHOLD_FEED_URL` set, both pages must show the fallback card
(never a broken grid). Check Home seam with the CTA banner.

**Step 4: Commit**

```bash
git add src/pages/Home.jsx src/pages/Gallery.jsx
git commit -m "feat(instagram): mount feed on Home + Gallery"
```

---

### Task 5: Universal link layer (Footer, Contact, Recruitment)

**Files:**
- Modify: `src/components/Footer.jsx` (contact block, ~lines 70–81)
- Modify: `src/pages/Contact.jsx` (Get in Touch card, after MapPin row ~line 101)
- Modify: `src/pages/Recruitment.jsx` (after the interest-form section, end of file)

**Step 1: Footer — add Instagram row to the contact column**

Import: add `Instagram` to the lucide import and the social constants:

```jsx
import { Heart, Phone, Mail, ArrowRight, Instagram } from 'lucide-react';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';
```

After the email `<a>` (line 79), add:

```jsx
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="flex items-center gap-2 hover:text-accent transition-colors">
                <Instagram className="h-4 w-4" /> @{INSTAGRAM_HANDLE}
              </a>
```

**Step 2: Contact — add Instagram row to the Get in Touch card**

Import `Instagram` in the lucide import and the constants (same as above,
path `../lib/social`). After the MapPin block (~line 101), add a fourth row
matching the existing pattern:

```jsx
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Instagram</p>
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white/60 text-sm hover:text-white transition-colors">
                          DM us @{INSTAGRAM_HANDLE}
                        </a>
                      </div>
                    </div>
```

**Step 3: Recruitment — "Follow our story" CTA after the interest form**

Import `Instagram` (lucide) + constants. After the form's closing
`</section>`, before the final `</div>`, add:

```jsx
      <section className="py-14 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <p className="text-muted-foreground mb-4">
              Want to see brotherhood in action first?
            </p>
            <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
              <Button variant="outline" size="lg" className="rounded-full font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Instagram className="h-4 w-4" /> Follow our story — @{INSTAGRAM_HANDLE}
              </Button>
            </a>
          </Reveal>
        </div>
      </section>
```

(Recruitment.jsx already imports `Reveal` and `Button`; check the existing
imports at the top of the file and only add what's missing.)

**Step 4: Verify in preview**

Footer (any page), `/contact` card, `/recruitment` bottom — all three links
open `instagram.com/tkeslu` in a new tab.

**Step 5: Commit**

```bash
git add src/components/Footer.jsx src/pages/Contact.jsx src/pages/Recruitment.jsx
git commit -m "feat(instagram): link layer in footer, contact, recruitment"
```

---

### Task 6: Env scaffolding + mocked-feed verification

**Files:**
- Modify: `.env.example` (append)
- No other code changes — this task is wiring + proof.

**Step 1: Append to `.env.example`**

```bash
# Instagram feed (Behold.so) — JSON feed URL from the Behold dashboard.
# Optional: when unset, Instagram sections show a "Follow @tkeslu" card.
VITE_BEHOLD_FEED_URL=
```

**Step 2: Verify the live-grid path with a mocked feed**

The fallback path was verified in Tasks 4–5. To prove the grid renders
without a real Behold account yet, temporarily point the env var at a local
mock: create `public/mock-behold.json` with 6 posts shaped like the Task 2
fixture (use any 6 placeholder image URLs, e.g. existing
`/assets/*.png` files), set `VITE_BEHOLD_FEED_URL=http://localhost:5173/mock-behold.json`
in `.env.local`, restart the dev server, and confirm Home + Gallery render
the 3×2 grid with hover captions. Then DELETE `public/mock-behold.json` and
the `.env.local` line. Do not commit either.

**Step 3: Run full test suite**

Run: `npm test`
Expected: 26 passing (19 existing + 7 new).

**Step 4: Commit**

```bash
git add .env.example
git commit -m "chore(instagram): document VITE_BEHOLD_FEED_URL"
```

---

## Post-implementation (human steps — Nick/Anthony)

1. Convert `@tkeslu` to a **Business or Creator** account (Instagram app →
   Settings → Account type). Behold requires it for reliable feeds.
2. Sign up at **behold.so** (free), connect the Instagram account, create a
   feed (JSON type), copy the feed URL.
3. Locally: put `VITE_BEHOLD_FEED_URL=<url>` in `.env.local`.
   On Vercel (deploy task 13): add the same var in Project → Settings →
   Environment Variables.
4. Behold emails the account owner if the Instagram connection ever breaks —
   use a shared chapter email, not a personal one, when signing up.
