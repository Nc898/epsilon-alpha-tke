import { CAR_SHOW } from '@/lib/carShow';
import EventSignup from './EventSignup';

/**
 * /carshow/register/free — a no-payment registration link for the July 26
 * Classics & Imports Car Show, for vehicle owners TKE has given a free spot.
 *
 * Renders the SAME EventSignup page as every other car show registration
 * link — same event, form, and confirmation — so it automatically inherits
 * future updates. The `free` prop swaps the pricing/CTA copy and posts to
 * api/free-registration.js instead of api/checkout.js (no Stripe).
 *
 * This URL is intentionally unlisted — not linked from any page — since it
 * bypasses payment. Only share it with people who were actually given a
 * free ticket.
 */
export default function FreeCarShowSignup() {
  return <EventSignup eventSlug={CAR_SHOW.slug} free />;
}
