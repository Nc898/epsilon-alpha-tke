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
//   logo           — optional logo path for future page use.
//   acknowledgment — override the default acknowledgment sentence.
// ─────────────────────────────────────────────────────────────────────────────

export const CAR_SHOW_SPONSORS = [
  { name: 'Fastlane' },
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
    return {
      name: s.name,
      slug,
      active: s.active !== false,
      logo: s.logo ?? null,
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
