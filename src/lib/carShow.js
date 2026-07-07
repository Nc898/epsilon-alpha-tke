// ─────────────────────────────────────────────────────────────────────────────
// Single source of truth for the 2026 TKE × City Foundry STL car show.
//
// Both the dedicated /carshow page and the Philanthropy landing page read from
// here, so updating the event is a one-file edit.
//
// Registration is a flat $30 per vehicle through the event date. Keep the
// hosted Stripe Payment Link and dynamic checkout price aligned at $30.
// ─────────────────────────────────────────────────────────────────────────────

export const REGISTER_URL = 'https://buy.stripe.com/00w7sLc0e0iuc499OU67S00';

export const CAR_SHOW = {
  name: 'All-Classics & Imports Car Show',
  presenter: 'TKE × City Foundry STL',
  beneficiary: "St. Jude Children's Research Hospital",

  registerUrl: REGISTER_URL,

  // Supabase event slug — the registration form lives at /events/<slug>.
  // Must match the `slug` in the seed SQL (supabase/migrations/20260617_car_show_event.sql).
  slug: 'car-show-2026',

  // Date / time (America/Chicago)
  dateISO: '2026-07-26',
  dateLabel: 'Sunday, July 26, 2026',
  hoursLabel: '11:00 AM – 2:00 PM',
  arriveByLabel: 'before 11:00 AM',

  // Flat pricing
  price: 30,

  // Capacity
  capacity: 50,
  insured: true,

  // Venue
  venue: 'City Foundry STL',
  address: '3730 Foundry Way, St. Louis, MO 63110',
  mapsUrl:
    'https://www.google.com/maps/search/?api=1&query=3730%20Foundry%20Way%2C%20St.%20Louis%2C%20MO%2063110',
  meetingSpot: 'behind Fresh Thyme Market, near Colibri Real Estate',

  // Contact
  contactName: 'Anthony Fahim',
  contactPhone: '314-374-5893',
  contactPhoneHref: 'tel:+13143745893',
  contactEmail: 'slutkestewardship@gmail.com',
  instagramHandle: '@tkeslu_carshow',
  instagramUrl: 'https://www.instagram.com/tkeslu_carshow',
};

// "Add to Google Calendar" link. Show runs 11:00 AM–2:00 PM CDT (UTC-5).
export function googleCalendarUrl() {
  const text = encodeURIComponent(`TKE ${CAR_SHOW.name} — for St. Jude`);
  const dates = '20260726T160000Z/20260726T190000Z'; // 11 AM–2 PM CDT
  const details = encodeURIComponent(
    `${CAR_SHOW.presenter}. A rain-or-shine car show benefiting ${CAR_SHOW.beneficiary}. ` +
      `Registered show vehicles arrive ${CAR_SHOW.arriveByLabel} — meet ${CAR_SHOW.meetingSpot}. ` +
      `Register: https://www.tkeslu.org/carshow`
  );
  const location = encodeURIComponent(`${CAR_SHOW.venue}, ${CAR_SHOW.address}`);
  return `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${text}&dates=${dates}&details=${details}&location=${location}`;
}
