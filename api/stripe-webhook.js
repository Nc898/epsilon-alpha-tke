// api/stripe-webhook.js
import Stripe from 'stripe';
import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { confirmationEmail } from './_lib/emailTemplates.js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY);
const resend = new Resend(process.env.RESEND_API_KEY);

// Reads the raw request stream for Stripe signature verification.
// IMPORTANT: the handler must never read req.body before verifying the
// signature — any body parsing would consume/alter the raw payload.
async function rawBody(req) {
  const chunks = [];
  for await (const chunk of req) chunks.push(chunk);
  return Buffer.concat(chunks);
}

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).end();

  let stripeEvent;
  try {
    stripeEvent = stripe.webhooks.constructEvent(
      await rawBody(req),
      req.headers['stripe-signature'],
      process.env.STRIPE_WEBHOOK_SECRET
    );
  } catch (err) {
    return res.status(400).json({ error: `Webhook signature failed: ${err.message}` });
  }

  if (stripeEvent.type === 'checkout.session.completed') {
    try {
      const session = stripeEvent.data.object;
      const regId = session.metadata?.registration_id;
      if (regId) {
        const { data: reg } = await supabaseAdmin
          .from('registrations')
          .update({ status: 'paid', amount_paid_cents: session.amount_total })
          .eq('id', regId)
          .select('*, events(*)').single();

        if (reg) {
          // idempotent: unique (registration_id, email_type) — insert first, send only if new
          const { error: logErr } = await supabaseAdmin
            .from('email_log')
            .insert({ registration_id: reg.id, email_type: 'confirmation' });
          if (!logErr) {
            const { subject, html, text } = confirmationEmail({ registration: reg, event: reg.events });
            try {
              await resend.emails.send({
                from: process.env.EMAIL_FROM, to: reg.email, subject, html, text,
              });
            } catch (sendErr) {
              // Roll back the log row so a Stripe retry can re-attempt the send.
              await supabaseAdmin
                .from('email_log')
                .delete()
                .eq('registration_id', reg.id)
                .eq('email_type', 'confirmation');
              throw sendErr;
            }
          }
        }
      }
    } catch (err) {
      console.error('stripe-webhook processing error:', err);
      // non-2xx → Stripe retries the webhook
      return res.status(500).json({ error: 'Webhook processing failed' });
    }
  }

  return res.status(200).json({ received: true });
}
