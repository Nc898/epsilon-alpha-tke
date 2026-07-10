// Featured sponsors for the rotating Partner Showcase rail. These render
// regardless of the Base44 backend (which is frequently offline); any active
// Base44 Sponsor entities are appended after these.
//
// To feature a sponsor, add an object here:
//   id      (required) — unique string, used as the React key
//   name    (required) — shown as the logo's alt text / text fallback
//   logo    (optional) — path under /public (e.g. '/assets/sponsors/foo.png')
//   website (optional) — makes the tile a clickable link
//   darkBg  (optional) — set true when the logo art sits on a dark/black
//                        background, so it renders full-color on a dark tile
//                        instead of the default grayscale-on-light treatment.
export const FEATURED_SPONSORS = [
  {
    id: 'revved-up-wishes',
    name: 'Revved Up Wishes',
    logo: '/assets/sponsors/revved-up-wishes.png',
    darkBg: true,
  },
];
