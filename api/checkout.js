// api/checkout.js
import Stripe from 'stripe';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { registrationSchema } from '../src/lib/registrationSchema.js';

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

    const donationCents = reg.donation_dollars * 100;
    const { data: row, error: insertErr } = await supabaseAdmin
      .from('registrations')
      .insert({
        event_id: event.id,
        name: reg.name, email: reg.email, phone: reg.phone ?? null,
        car_year: reg.car_year, car_make: reg.car_make, car_model: reg.car_model,
        car_class: reg.car_class,
        amount_paid_cents: 0, donation_cents: donationCents, status: 'pending',
      })
      .select().single();
    if (insertErr) return res.status(500).json({ error: 'Could not create registration' });

    const lineItems = [{
      price_data: {
        currency: 'usd',
        product_data: { name: `${event.title} — Entry` },
        unit_amount: event.entry_price_cents,
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

    const session = await stripe.checkout.sessions.create({
      mode: 'payment',
      line_items: lineItems,
      customer_email: reg.email,
      metadata: { registration_id: row.id, event_slug: event.slug },
      success_url: `${process.env.SITE_URL}/events/${event.slug}?status=success`,
      cancel_url: `${process.env.SITE_URL}/events/${event.slug}?status=cancelled`,
    });

    await supabaseAdmin.from('registrations')
      .update({ stripe_session_id: session.id }).eq('id', row.id);

    return res.status(200).json({ url: session.url });
  } catch (err) {
    console.error('checkout error:', err);
    return res.status(500).json({ error: 'Checkout failed' });
  }
}
