// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the 2026 TKE Halloween Car Show at Neiman Marcus.
//
// Third show of the 2026 series (July Classics · September Friday Night
// Lights · October Halloween). The /carshow page, the /events/<slug> form,
// news, and the calendar all read from here — updating the event is a
// one-file edit, same pattern as carShow.js (July, archived) and
// exoticsCarShow.js (September).
//
// Load-in is staggered: sponsor vehicles at 9:30 AM, general registrations at
// 10:00 AM, show opens 11:00 AM. No hard vehicle cap (capacity is null in the
// Supabase row; registration closes via the registration_open flag).
// ─────────────────────────────────────────────────────────────────────────────

export const HALLOWEEN_SHOW = {
  name: 'Halloween Car Show',
  presenter: 'TKE × Neiman Marcus',
  beneficiary: "St. Jude Children's Research Hospital",

  // No hosted Stripe Payment Link fallback yet — checkout uses the dynamic
  // API. If a hosted link is created later, put it here and EventSignup's
  // fallback path starts working automatically. MUST NOT reuse July's link.
  registerUrl: null,

  // Supabase event slug — the registration form lives at /events/<slug>.
  // Must match the seed SQL (supabase/migrations/20260730_halloween_car_show.sql).
  slug: 'halloween-car-show-2026',

  // Date / time (America/Chicago)
  dateISO: '2026-10-25',
  dateLabel: 'Sunday, October 25, 2026',
  // Staggered load-in schedule. End time TBD — update hoursLabel when known.
  sponsorLoadInLabel: '9:30 AM',
  generalLoadInLabel: '10:00 AM',
  startLabel: '11:00 AM',
  hoursLabel: 'Begins 11:00 AM',

  // Flat pricing, no capacity limit
  price: 30,
  capacity: null,
  insured: true,

  // Venue
  venue: 'Neiman Marcus, Plaza Frontenac',
  address: '1701 S Lindbergh Blvd, Frontenac, MO 63131',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=Neiman%20Marcus%2C%201701%20S%20Lindbergh%20Blvd%2C%20Frontenac%2C%20MO%2063131',

  // Contact
  contactName: 'Anthony Fahim',
  contactPhone: '314-374-5893',
  contactPhoneHref: 'tel:+13143745893',
  contactEmail: 'slutkestewardship@gmail.com',
  instagramHandle: '@tkeslu_carshow',
  instagramUrl: 'https://www.instagram.com/tkeslu_carshow',

  // Custom registration links: clubs and sponsors can request a personal link
  // (tkeslu.org/carshow/register/<their-slug>) to invite their customer base.
  // Sponsor links additionally earn the sponsor a discount on their event
  // package: $30 off per vehicle registered through their link, applied to
  // their sponsorship total on request (tracked in /admin, settled manually).
  sponsorDiscountPerCar: 30,
};

// "Add to Google Calendar" link. Oct 25 is CDT (UTC-5); 11:00 AM start.
// End time TBD — blocked out to 2:00 PM as a placeholder until confirmed.
export function halloweenCalendarUrl() {
  const text = encodeURIComponent(`TKE ${HALLOWEEN_SHOW.name} at Neiman Marcus — for St. Jude`);
  const dates = '20261025T160000Z/20261025T190000Z';
  const details = encodeURIComponent(
    `${HALLOWEEN_SHOW.presenter}. A Halloween car show benefiting ${HALLOWEEN_SHOW.beneficiary}. ` +
      `Sponsor vehicles load in at ${HALLOWEEN_SHOW.sponsorLoadInLabel}, general registrations at ` +
      `${HALLOWEEN_SHOW.generalLoadInLabel}; the show begins at ${HALLOWEEN_SHOW.startLabel}. ` +
      `Register: https://www.tkeslu.org/carshow`
  );
  const location = encodeURIComponent(`${HALLOWEEN_SHOW.venue}, ${HALLOWEEN_SHOW.address}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}
