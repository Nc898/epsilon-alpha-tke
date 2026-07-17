// api/free-registration.js
//
// Comp/free-ticket registration for the July 26 Classics & Imports Car Show
// ONLY (src/lib/carShow.js CAR_SHOW.slug) — no Stripe involved, no charge.
// The link is unlisted (not surfaced anywhere on the site); anyone with the
// URL can register a free vehicle, so it deliberately still enforces the
// event's capacity and registration_open the same as the paid flow, and is
// hard-restricted to this one event so it can't be pointed at a future show.
import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { registrationSchema } from '../src/lib/registrationSchema.js';
import { confirmationEmail } from './_lib/emailTemplates.js';
import { CAR_SHOW } from '../src/lib/carShow.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    const parsed = registrationSchema.safeParse(req.body?.registration);
    if (!parsed.success) return res.status(400).json({ error: 'Invalid registration data' });
    const reg = parsed.data;

    const { data: event } = await supabaseAdmin
      .from('events').select('*').eq('slug', CAR_SHOW.slug).single();
    if (!event || !event.registration_open) {
      return res.status(404).json({ error: 'Registration is not open for this event' });
    }

    // A free vehicle still takes a physical spot, so it counts against the
    // same capacity pool as paid registrations.
    if (event.capacity) {
      const { count } = await supabaseAdmin
        .from('registrations')
        .select('*', { count: 'exact', head: true })
        .eq('event_id', event.id).eq('status', 'paid');
      if (count >= event.capacity) {
        return res.status(409).json({ error: 'This event is sold out' });
      }
    }

    const { data: row, error: insertErr } = await supabaseAdmin
      .from('registrations')
      .insert({
        event_id: event.id,
        name: reg.name, email: reg.email, phone: reg.phone ?? null,
        car_year: reg.car_year, car_make: reg.car_make, car_model: reg.car_model,
        car_class: reg.car_class,
        amount_paid_cents: 0, donation_cents: 0,
        status: 'paid', // no payment to await — the free spot is confirmed immediately
        registration_source: 'comp',
      })
      .select().single();
    if (insertErr) {
      console.error('free-registration insert failed:', insertErr);
      return res.status(500).json({ error: 'Could not create registration' });
    }

    // Best-effort confirmation email — the free registration is already
    // saved above regardless of whether the email sends.
    if (process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
      const { error: logErr } = await supabaseAdmin
        .from('email_log')
        .insert({ registration_id: row.id, email_type: 'confirmation' });
      if (!logErr) {
        const { subject, html, text } = confirmationEmail({ registration: row, event });
        try {
          await resend.emails.send({ from: process.env.EMAIL_FROM, to: row.email, subject, html, text });
        } catch (sendErr) {
          await supabaseAdmin.from('email_log')
            .delete().eq('registration_id', row.id).eq('email_type', 'confirmation');
          console.error('free-registration confirmation email failed:', sendErr);
        }
      }
    }

    return res.status(200).json({ ok: true, registration_id: row.id });
  } catch (err) {
    console.error('free-registration error:', err);
    return res.status(500).json({ error: 'Registration failed' });
  }
}
