import { useParams, Navigate } from 'react-router-dom';
import { getSponsorBySlug } from '@/lib/carShowSponsors';
import { CAR_SHOW } from '@/lib/carShow';
import EventSignup from './EventSignup';

/**
 * /carshow/register/:sponsorSlug — sponsor-attributed car show registration.
 *
 * One dynamic route serves every sponsor (sponsors are configured by name in
 * src/lib/carShowSponsors.js). It renders the SAME EventSignup page as the
 * main /events/car-show-2026 registration — same event, form, price, Stripe
 * flow, and confirmation — so future updates to the main form automatically
 * apply here. The only difference is the sponsor prop, which adds a subtle
 * acknowledgment and sends the slug to the checkout API for server-side
 * attribution.
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

  return <EventSignup eventSlug={CAR_SHOW.slug} sponsor={sponsor} />;
}
