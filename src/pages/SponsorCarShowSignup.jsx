import { useParams, Navigate } from 'react-router-dom';
import { getSponsorBySlug } from '@/lib/carShowSponsors';
import { HALLOWEEN_SHOW } from '@/lib/halloweenShow';
import EventSignup from './EventSignup';

/**
 * /carshow/register/:sponsorSlug — sponsor/club-attributed registration for
 * the CURRENT car show (October 25 Halloween show — see halloweenShow.js;
 * this route previously served the July 26 show).
 *
 * One dynamic route serves every sponsor and club (configured by name in
 * src/lib/carShowSponsors.js). It renders the SAME EventSignup page as the
 * main /events/<slug> registration — same event, form, price, Stripe flow,
 * and confirmation — so future updates to the main form automatically apply
 * here. The only difference is the sponsor prop, which adds a subtle
 * acknowledgment and sends the slug to the checkout API for server-side
 * attribution (which also powers the sponsor's $30-per-car discount tally
 * in /admin).
 *
 * Unknown or deactivated slugs redirect to the main car show page with no
 * attribution — a visitor cannot invent a sponsor URL.
 */
export default function SponsorCarShowSignup() {
  const { sponsorSlug } = useParams();
  const sponsor = getSponsorBySlug(sponsorSlug);

  if (!sponsor || !sponsor.active) {
    return <Navigate to="/carshow" replace />;
  }

  return <EventSignup eventSlug={HALLOWEEN_SHOW.slug} sponsor={sponsor} />;
}
