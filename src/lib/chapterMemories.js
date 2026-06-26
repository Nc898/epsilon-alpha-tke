/**
 * Chapter memories for the homepage "Living Bond" intro.
 *
 * HOW TO MAINTAIN (for chapter leadership):
 *  - Add a real photo to /public/assets/photos/ (and a small copy in
 *    /public/assets/photos/thumb/ at ~512px — the intro uses the thumb).
 *  - Add an entry below. Only `id`/`alt` are required.
 *  - `year` and `caption` are OPTIONAL and shown on hover only when set — nothing
 *    is fabricated, so leave them empty until you have the real details.
 *  - `group` ('love' | 'charity' | 'esteem') only controls which photos brighten
 *    during the three-principles wave; it is a visual grouping, not a claim.
 *  - `importance: 1` means the photo is among the first revealed (kept light, so
 *    it preloads). Everything else lazy-loads as the sequence needs it.
 *
 * The intro reads this file alone — no animation code needs editing to swap
 * photos.
 */

const FILES = [
  'p07', 'p18', 'q16', 'p21', 'q07', 'p26', 'q26', 'p09', 'q15', 'p15',
  'q17', 'p19', 'q05', 'p27', 'q22', 'p13', 'q31', 'p28', 'q06', 'p17',
  'q02', 'q33', 'q34',
];

const GROUPS = ['love', 'charity', 'esteem'];

export const MEMORIES = FILES.map((f, i) => ({
  id: f,
  thumb: `/assets/photos/thumb/${f}.jpg`,
  full: `/assets/photos/${f}.jpg`,
  year: null, // e.g. 2023 — shown on hover when set
  caption: '', // short caption — shown on hover when set
  alt: 'Tau Kappa Epsilon, Epsilon Alpha chapter moment',
  group: GROUPS[i % GROUPS.length],
  importance: i < 5 ? 1 : 0,
}));

// Ambient generational markers, briefly illuminated as the camera passes them.
// 1955 = chapter founding. Edit to match real chapter milestones.
export const ERA_MARKERS = ['1955', '1975', '2000', 'TODAY'];

// The three TKE principles, in order.
export const PRINCIPLES = [
  { word: 'LOVE', group: 'love' },
  { word: 'CHARITY', group: 'charity' },
  { word: 'ESTEEM', group: 'esteem' },
];
