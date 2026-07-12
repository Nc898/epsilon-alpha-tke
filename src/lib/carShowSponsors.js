// ─────────────────────────────────────────────────────────────────────────────
// Car show sponsor registration pages — the ONE place sponsors are configured.
//
// ★ TO ADD A NEW SPONSOR PAGE, ADD ONE LINE TO CAR_SHOW_SPONSORS BELOW. ★
//   { name: 'RP Exotics' }        →  https://tkeslu.org/carshow/register/rp-exotics
//
// Everything else is automatic: the URL-safe slug, the live registration page
// (which reuses the main /events form — same fields, price, Stripe flow, and
// confirmation), the server-side attribution, the Stripe metadata, and the
// admin filtering/reporting.
//
// This module is imported by BOTH the browser (route + acknowledgment) and the
// Vercel serverless functions (api/checkout.js validates the slug and derives
// the approved sponsor name server-side), so the approved list can never
// disagree between client and server. Keep it dependency-free.
//
// Optional per-sponsor fields:
//   slug           — pin the URL slug. REQUIRED if you later change `name`
//                    after registrations exist: attribution history keys off
//                    the slug, so the slug must stay stable forever.
//   active         — set false to turn the page off (visitors are sent to the
//                    main /carshow page; the server refuses new attributions).
//   logo           — one logo path shown on the registration page, e.g.
//                    '/assets/sponsors/<slug>.png'.
//   logos          — array of logo paths shown as a gentle rolling slideshow
//                    (use instead of `logo` when a sponsor has more than one
//                    brand). First entry appears first.
//   logoBg         — 'light' (default) or 'dark' tile behind the logo(s).
//   logoDisplay    — 'standard' (default) or 'immersive'. Immersive logos are
//                    shown larger without the light halo, for transparent art.
//   acknowledgment — override the default acknowledgment sentence.
// ─────────────────────────────────────────────────────────────────────────────

export const CAR_SHOW_SPONSORS = [
  { name: 'Fastlane' },
  {
    // Jim Butler dealer group — one registration link, both brand logos
    // rotate on the page (Maserati first, then Alfa Romeo).
    name: 'Jim Butler Maserati & Alfa Romeo',
    slug: 'jim-butler',
    logos: [
      '/assets/sponsors/jim-butler-maserati.png',
      '/assets/sponsors/jim-butler-alfa-romeo.png',
    ],
  },
  {
    name: 'Revved Up Wishes',
    logo: '/assets/sponsors/revved-up-wishes.png',
  },
  {
    name: 'Cherry Garage',
    logo: '/assets/sponsors/cherry-garage.png',
    logoDisplay: 'immersive',
  },
];

// Generate a URL-safe slug from a sponsor name:
// lowercase → drop apostrophes → non-alphanumerics become hyphens (collapsing
// runs) → trim leading/trailing hyphens.
//   'RP Exotics'              → 'rp-exotics'
//   'Neiman Marcus St. Louis' → 'neiman-marcus-st-louis'
//   'Audi Exchange Kirkwood'  → 'audi-exchange-kirkwood'
export function sponsorSlug(name) {
  return String(name ?? '')
    .toLowerCase()
    .replace(/['’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Normalized, validated sponsor list. Throws on duplicate/empty slugs so a
// misconfiguration (e.g. two sponsors with colliding names) fails the build
// and tests instead of silently mis-attributing registrations.
export function listSponsors() {
  const seen = new Set();
  return CAR_SHOW_SPONSORS.map((s) => {
    const slug = s.slug ?? sponsorSlug(s.name);
    if (!slug) throw new Error(`Sponsor "${s.name}" produces an empty slug — set an explicit slug.`);
    if (seen.has(slug)) throw new Error(`Duplicate sponsor slug "${slug}" — set an explicit slug to disambiguate.`);
    seen.add(slug);
    // Normalize to a `logos` array so the page has one shape to render.
    const logos = s.logos ?? (s.logo ? [s.logo] : []);
    return {
      name: s.name,
      slug,
      active: s.active !== false,
      logos,
      logo: logos[0] ?? null,
      logoBg: s.logoBg === 'dark' ? 'dark' : 'light',
      logoDisplay: s.logoDisplay === 'immersive' ? 'immersive' : 'standard',
      acknowledgment: s.acknowledgment ?? null,
    };
  });
}

// Look up an APPROVED sponsor by its URL slug. Returns null for anything not
// on the list — a visitor cannot invent a slug to create an attribution.
// Callers must also check `.active` before attributing.
export function getSponsorBySlug(slug) {
  if (!slug) return null;
  return listSponsors().find((s) => s.slug === String(slug).toLowerCase()) ?? null;
}
