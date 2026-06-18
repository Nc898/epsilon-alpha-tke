// Shared entry-price logic for registerable events. Imported by BOTH the
// browser form (display) and the server checkout (the authoritative charge), so
// they can never disagree.
//
// An event may define an early-bird window via two optional columns:
//   early_bird_price_cents  – the discounted price
//   early_bird_until        – last day it applies (date, 'YYYY-MM-DD', inclusive)
// When today (America/Chicago) is on or before that date, the early-bird price
// applies; otherwise the regular `entry_price_cents`. The flip happens at local
// midnight with no manual change — no link/price swap to remember.

// Today's date as 'YYYY-MM-DD' in St. Louis (Central) time.
export function chicagoToday(now = new Date()) {
  return now.toLocaleDateString('en-CA', { timeZone: 'America/Chicago' });
}

// The entry price (in cents) that applies right now for the given event row.
export function entryCentsNow(event, now = new Date()) {
  if (!event) return 0;
  const eb = event.early_bird_price_cents;
  const until = event.early_bird_until; // 'YYYY-MM-DD' or null
  if (eb != null && until && chicagoToday(now) <= until) return eb;
  return event.entry_price_cents;
}

// True when the early-bird price is the one currently in effect.
export function isEarlyBird(event, now = new Date()) {
  return (
    !!event &&
    event.early_bird_price_cents != null &&
    !!event.early_bird_until &&
    chicagoToday(now) <= event.early_bird_until
  );
}
