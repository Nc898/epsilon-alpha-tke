// api/registrations.js
import { createHash, timingSafeEqual } from 'node:crypto';
import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { EXOTICS_SHOW, ST_JUDE_URL } from '../src/lib/exoticsCarShow.js';

const DECISION_STATUSES = new Set(['pending', 'approved', 'waitlisted', 'declined', 'checked_in']);

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

function sha256(value) {
  return createHash('sha256').update(String(value)).digest();
}

function keyMatches(provided, expected) {
  if (!provided || !expected) return false;
  // Hashing both sides makes the buffers equal length, so timingSafeEqual is valid.
  return timingSafeEqual(sha256(provided), sha256(expected));
}

function decisionEmail(registration, status) {
  const vehicle = [registration.car_year, registration.car_make, registration.car_model].filter(Boolean).join(' ');
  const copy = {
    approved: {
      title: 'Your display spot is confirmed',
      body: `Your ${vehicle} has been selected for the 30-car field at ${EXOTICS_SHOW.name}.`,
      next: `Detailed arrival and staging guidance will be emailed before the show.`,
    },
    waitlisted: {
      title: 'You are on the display waitlist',
      body: `The initial 30-car field is currently allocated, and your ${vehicle} has been placed on the waitlist.`,
      next: 'We will contact you immediately if a display spot becomes available.',
    },
    declined: {
      title: 'An update on your display application',
      body: `Thank you for offering your ${vehicle} for ${EXOTICS_SHOW.name}. We are unable to include it in this limited 30-car field.`,
      next: 'We appreciate your support of TKE and St. Jude and hope to welcome you at a future automotive event.',
    },
  }[status];

  if (!copy) return null;
  const subject = `${copy.title} — ${EXOTICS_SHOW.name}`;
  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:620px;margin:0 auto;color:#111">
      <div style="background:#090909;color:#fff;padding:28px 32px;border-bottom:4px solid #AD2624">
        <p style="margin:0 0 5px;font-size:11px;letter-spacing:3px;color:#ccc">TKE EPSILON ALPHA</p>
        <h1 style="margin:0;font-family:Georgia,serif;font-size:25px">${esc(copy.title)}</h1>
      </div>
      <div style="padding:32px;border:1px solid #e5e7eb;border-top:0">
        <p>Hi ${esc(registration.name)},</p>
        <p>${esc(copy.body)}</p>
        <p>${esc(copy.next)}</p>
        ${status === 'approved' ? `<p><strong>${esc(EXOTICS_SHOW.dateLabel)} · ${esc(EXOTICS_SHOW.hoursLabel)}</strong></p><p>Display vehicles will be surrounded by stanchions throughout the show.</p>` : ''}
        <p style="margin:24px 0"><a href="${ST_JUDE_URL}" style="display:inline-block;background:#AD2624;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:999px">Support St. Jude</a></p>
        <p style="font-size:13px;color:#777">Questions? ${esc(EXOTICS_SHOW.contactEmail)} · ${esc(EXOTICS_SHOW.contactPhone)}</p>
      </div>
    </div>`;
  const text = [
    copy.title,
    '',
    `Hi ${registration.name},`,
    copy.body,
    copy.next,
    status === 'approved' && `${EXOTICS_SHOW.dateLabel} · ${EXOTICS_SHOW.hoursLabel}`,
    '',
    `Support St. Jude: ${ST_JUDE_URL}`,
    `Questions: ${EXOTICS_SHOW.contactEmail} · ${EXOTICS_SHOW.contactPhone}`,
  ].filter((line) => line !== false).join('\n');
  return { subject, html, text };
}

export default async function handler(req, res) {
  if (!['GET', 'PATCH'].includes(req.method)) return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!keyMatches(req.headers['x-admin-key'], process.env.ADMIN_KEY)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    if (req.method === 'PATCH') {
      const { id, status } = req.body ?? {};
      if (!id || !DECISION_STATUSES.has(status)) {
        return res.status(400).json({ error: 'Invalid registration decision' });
      }

      const { data: registration, error: lookupError } = await supabaseAdmin
        .from('registrations')
        .select('*, events(title, slug, date, capacity)')
        .eq('id', id)
        .single();
      if (lookupError || !registration) return res.status(404).json({ error: 'Registration not found' });
      if (registration.events?.slug !== EXOTICS_SHOW.slug) {
        return res.status(400).json({ error: 'Decision controls apply only to the exotics event' });
      }

      if (status === 'approved' && registration.status !== 'approved') {
        const { count } = await supabaseAdmin
          .from('registrations')
          .select('*', { count: 'exact', head: true })
          .eq('event_id', registration.event_id)
          .in('status', ['approved', 'checked_in']);
        if (registration.events?.capacity && count >= registration.events.capacity) {
          return res.status(409).json({ error: `All ${registration.events.capacity} display spots are already approved.` });
        }
      }

      const { data: updated, error: updateError } = await supabaseAdmin
        .from('registrations')
        .update({ status })
        .eq('id', id)
        .select('*, events(title, slug, date, capacity)')
        .single();
      if (updateError) throw updateError;

      const email = decisionEmail(updated, status);
      let emailWarning = false;
      if (email && process.env.RESEND_API_KEY) {
        const resend = new Resend(process.env.RESEND_API_KEY);
        const { error: emailError } = await resend.emails.send({
          from: process.env.EMAIL_FROM,
          to: updated.email,
          reply_to: EXOTICS_SHOW.contactEmail,
          ...email,
        });
        if (emailError) {
          emailWarning = true;
          console.error('registration decision email warning:', emailError);
        }
      } else if (email) {
        emailWarning = true;
      }

      return res.status(200).json({ registration: updated, email_warning: emailWarning });
    }

    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select('*, events(title, slug, date)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const totals = { paid: 0, pending: 0, approved: 0, waitlisted: 0, gross_cents: 0, donation_cents: 0 };
    for (const row of registrations) {
      if (row.status === 'paid') {
        totals.paid += 1;
        totals.gross_cents += row.amount_paid_cents ?? 0;
        totals.donation_cents += row.donation_cents ?? 0;
      } else if (row.status === 'pending') {
        totals.pending += 1;
      } else if (row.status === 'approved') {
        totals.approved += 1;
      } else if (row.status === 'waitlisted') {
        totals.waitlisted += 1;
      }
    }

    return res.status(200).json({ registrations, totals });
  } catch (err) {
    console.error('registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
