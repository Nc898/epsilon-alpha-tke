// api/checkout.js
import Stripe from 'stripe';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { registrationSchema } from '../src/lib/registrationSchema.js';
import { entryCentsNow } from '../src/lib/eventPricing.js';
import { getSponsorBySlug } from '../src/lib/carShowSponsors.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parsed = registrationSchema.safeParse(req.body?.registration);
    const eventSlug = req.body?.event_slug;
    if (!parsed.success || !eventSlug) {
      return res.status(400).json({ error: 'Invalid registration data' });
    }
    const reg = parsed.data;

    // ── Sponsor attribution (server-authoritative) ─────────────────────────
    // The client sends only a slug. The approved sponsor NAME is derived here
    // from src/lib/carShowSponsors.js — hidden fields, devtools edits, or
    // hand-crafted requests cannot invent or alter an attribution. Unknown or
    // deactivated slugs are rejected outright (no silently-direct fallback,
    // so a stale sponsor link never misattributes).
    let sponsor = null;
    if (req.body?.sponsor_slug != null) {
      sponsor = getSponsorBySlug(String(req.body.sponsor_slug));
      if (!sponsor || !sponsor.active) {
        return res.status(400).json({
          error: 'This sponsor registration link is no longer active. Please register at tkeslu.org/carshow.',
        });
      }
    }

    const { data: event } = await supabaseAdmin
      .from('events').select('*').eq('slug', eventSlug).single();
    if (!event || !event.registration_open) {
      return res.status(404).json({ error: 'Registration is not open for this event' });
    }

    // capacity check (paid only — pendings may abandon)
    if (event.capacity) {
      const { count } = await supabaseAdmin
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id).eq('status', 'paid');
      if (count >= event.capacity) {
        return res.status(409).json({ error: 'This event is sold out' });
      }
    }

    // Authoritative server-side price so the charge cannot be tampered with
    // from the client. Handles flat and optional time-window event pricing.
    const entryCents = entryCentsNow(event);
    const donationCents = reg.donation_dollars * 100;

    const basePayload = {
      event_id: event.id,
      name: reg.name, email: reg.email, phone: reg.phone ?? null,
      car_year: reg.car_year, car_make: reg.car_make, car_model: reg.car_model,
      car_class: reg.car_class,
      amount_paid_cents: 0, donation_cents: donationCents, status: 'pending',
    };

    // Attribution is stored server-side on the registration BEFORE the Stripe
    // redirect. sponsor_name/slug are a permanent snapshot; sponsor_id links
    // to the sponsors table (best-effort upsert keeps its display name in
    // sync with the config while snapshots on old registrations stay put).
    const attribution = { registration_source: sponsor ? 'sponsor' : 'direct' };
    if (sponsor) {
      attribution.sponsor_name = sponsor.name;
      attribution.sponsor_slug = sponsor.slug;
      attribution.referral_page = `${process.env.SITE_URL}/carshow/register/${sponsor.slug}`;
      attribution.referred_at = new Date().toISOString();
      try {
        const { data: sponsorRow } = await supabaseAdmin
          .from('sponsors')
          .upsert({ slug: sponsor.slug, name: sponsor.name, is_active: sponsor.active }, { onConflict: 'slug' })
          .select('id')
          .single();
        if (sponsorRow?.id) attribution.sponsor_id = sponsorRow.id;
      } catch (sponsorErr) {
        // sponsors table missing (migration not applied yet) — snapshot
        // columns + Stripe metadata still carry the attribution.
        console.error('sponsor upsert failed (run 20260710_sponsor_attribution.sql):', sponsorErr);
      }
    }

    let { data: row, error: insertErr } = await supabaseAdmin
      .from('registrations')
      .insert({ ...basePayload, ...attribution })
      .select().single();
    if (insertErr) {
      // Migration-lag safety: if the attribution columns don't exist yet,
      // fall back to the legacy payload so registration NEVER breaks. The
      // Stripe metadata below still records the attribution and the webhook
      // re-attempts persisting it.
      console.error('registration insert with attribution failed, retrying legacy payload:', insertErr);
      ({ data: row, error: insertErr } = await supabaseAdmin
        .from('registrations')
        .insert(basePayload)
        .select().single());
    }
    if (insertErr) return res.status(500).json({ error: 'Could not create registration' });

    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: { name: `${event.title} — Entry` },
        unit_amount: entryCents,
      },
      quantity: 1,
    }];
    if (donationCents > 0) {
      lineItems.push({
        price_data: {
          currency: 'usd',
          product_data: { name: 'St. Jude Donation (optional add-on)' },
          unit_amount: donationCents,
        },
        quantity: 1,
      });
    }

    // Sponsor flows return to the sponsor page (same form component) so a
    // cancelled payment keeps its attribution when the visitor retries.
    const returnPath = sponsor ? `/carshow/register/${sponsor.slug}` : `/events/${event.slug}`;

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: reg.email,
      // Attribution rides in Stripe metadata too, so it survives the entire
      // payment lifecycle and is re-persisted by the verified webhook.
      metadata: {
        registration_id: row.id,
        event_slug: event.slug,
        event_type: 'car_show',
        registration_source: sponsor ? 'sponsor' : 'direct',
        ...(sponsor ? { sponsor_name: sponsor.name, sponsor_slug: sponsor.slug } : {}),
      },
      success_url: `${process.env.SITE_URL}${returnPath}?status=success`,
      cancel_url: `${process.env.SITE_URL}${returnPath}?status=cancelled`,
    });

    await supabaseAdmin.from('registrations')
      .update({ stripe_session_id: session.id }).eq('id', row.id);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
}
