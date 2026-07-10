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
      const md = session.metadata ?? {};
      const regId = md.registration_id;
      if (regId) {
        // Payment truth comes from this signature-verified webhook — never
        // from the success-page redirect. The update is idempotent: Stripe
        // may deliver the event more than once, and re-applying the same
        // values (keyed by our own registration_id) is harmless; the email
        // send below is separately guarded by the unique email_log row.
        const paidUpdate = {
          status: 'paid',
          amount_paid_cents: session.amount_total,
          stripe_payment_intent_id:
            typeof session.payment_intent === 'string'
              ? session.payment_intent
              : session.payment_intent?.id ?? null,
        };
        // Re-persist the sponsor attribution from Stripe metadata (set
        // server-side at checkout from the approved list — not client input)
        // so it survives even if the pending row predates the migration.
        if (md.registration_source === 'sponsor' && md.sponsor_slug) {
          paidUpdate.registration_source = 'sponsor';
          paidUpdate.sponsor_name = md.sponsor_name ?? null;
          paidUpdate.sponsor_slug = md.sponsor_slug;
        }

        let { data: reg, error: updateErr } = await supabaseAdmin
          .from('registrations')
          .update(paidUpdate)
          .eq('id', regId)
          .select('*, events(*)').single();
        if (updateErr) {
          // Migration-lag safety: never let missing attribution columns block
          // marking a verified payment as paid.
          console.error('paid update with attribution failed, retrying legacy payload:', updateErr);
          ({ data: reg } = await supabaseAdmin
            .from('registrations')
            .update({ status: 'paid', amount_paid_cents: session.amount_total })
            .eq('id', regId)
            .select('*, events(*)').single());
        }

        // Confirmation email is best-effort: the paid registration is already
        // saved above. Only attempt a send when Resend is configured, so a
        // missing email setup never blocks checkout or triggers webhook retries.
        if (reg && process.env.RESEND_API_KEY && process.env.EMAIL_FROM) {
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
