import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { exoticsRegistrationSchema } from '../src/lib/exoticsRegistrationSchema.js';
import { EXOTICS_SHOW, ST_JUDE_URL } from '../src/lib/exoticsCarShow.js';

const esc = (value) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');

function applicantEmail(registration) {
  const vehicle = `${registration.car_year} ${registration.car_make} ${registration.car_model}`;
  return {
    subject: `Application received — ${EXOTICS_SHOW.name}`,
    html: `
      <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:620px;margin:0 auto;color:#111">
        <div style="background:#090909;color:#fff;padding:28px 32px;border-bottom:4px solid #AD2624">
          <p style="margin:0 0 5px;font-size:11px;letter-spacing:3px;color:#ccc">TKE EPSILON ALPHA</p>
          <h1 style="margin:0;font-family:Georgia,serif;font-size:26px">Application received</h1>
        </div>
        <div style="padding:32px;border:1px solid #e5e7eb;border-top:0">
          <p>Hi ${esc(registration.name)},</p>
          <p>We received your application to display your <strong>${esc(vehicle)}</strong> at <strong>${esc(EXOTICS_SHOW.name)}</strong>. Submitting an application does not guarantee a display spot; our team will contact you separately after review.</p>
          <table style="width:100%;margin:24px 0;border-collapse:collapse">
            <tr><td style="padding:7px 0;color:#777;width:100px">Date</td><td style="padding:7px 0"><strong>${esc(EXOTICS_SHOW.dateLabel)}</strong></td></tr>
            <tr><td style="padding:7px 0;color:#777">Show</td><td style="padding:7px 0">${esc(EXOTICS_SHOW.hoursLabel)}</td></tr>
            <tr><td style="padding:7px 0;color:#777">Arrival</td><td style="padding:7px 0">${esc(EXOTICS_SHOW.arrivalLabel)}</td></tr>
          </table>
          <p>Approved vehicles will receive arrival and staging instructions by email. Display vehicles will be surrounded by stanchions during the show.</p>
          <p style="margin:24px 0"><a href="${ST_JUDE_URL}" style="display:inline-block;background:#AD2624;color:#fff;text-decoration:none;font-weight:700;padding:13px 20px;border-radius:999px">Make the suggested $${EXOTICS_SHOW.suggestedDonation} St. Jude donation</a></p>
          <p style="font-size:13px;color:#666">The donation is encouraged, never required, and does not affect selection.</p>
        </div>
      </div>`,
    text: [
      `Application received — ${EXOTICS_SHOW.name}`,
      '',
      `Hi ${registration.name}, we received your application for your ${vehicle}.`,
      `Submitting an application does not guarantee a display spot; our team will contact you separately after review.`,
      '',
      `${EXOTICS_SHOW.dateLabel} · ${EXOTICS_SHOW.hoursLabel}`,
      `Arrival: ${EXOTICS_SHOW.arrivalLabel}`,
      '',
      `Suggested $${EXOTICS_SHOW.suggestedDonation} St. Jude donation (never required): ${ST_JUDE_URL}`,
      '',
      `Questions: ${EXOTICS_SHOW.contactEmail}`,
    ].join('\n'),
  };
}

function organizerEmail(registration) {
  const row = (label, value) =>
    `<tr><td style="padding:7px 0;color:#777;width:110px">${label}</td><td style="padding:7px 0;font-weight:600">${esc(value)}</td></tr>`;

  return {
    subject: `[TKE EA] Exotics application — ${registration.car_year} ${registration.car_make} ${registration.car_model}`,
    html: `
      <div style="font-family:-apple-system,'Segoe UI',Roboto,Arial,sans-serif;max-width:620px;margin:0 auto;color:#111">
        <div style="background:#AD2624;color:#fff;padding:24px 30px"><h1 style="margin:0;font-size:21px">New exotics display application</h1></div>
        <div style="padding:30px;border:1px solid #e5e7eb;border-top:0">
          <table style="width:100%;border-collapse:collapse">
            ${row('Name', registration.name)}
            ${row('Email', registration.email)}
            ${row('Phone', registration.phone)}
            ${row('Vehicle', `${registration.car_year} ${registration.car_make} ${registration.car_model}`)}
            ${row('Color', registration.car_color)}
            ${registration.instagram ? row('Instagram', registration.instagram) : ''}
          </table>
          ${registration.notes ? `<h2 style="font-size:15px;margin:24px 0 8px">Notes</h2><p style="white-space:pre-wrap">${esc(registration.notes)}</p>` : ''}
          <p style="margin-top:24px;font-size:13px;color:#777">Review this application in the registrations dashboard. The applicant has only received an application receipt—not a display confirmation.</p>
        </div>
      </div>`,
    text: [
      'New exotics display application',
      `Name: ${registration.name}`,
      `Email: ${registration.email}`,
      `Phone: ${registration.phone}`,
      `Vehicle: ${registration.car_year} ${registration.car_make} ${registration.car_model}`,
      `Color: ${registration.car_color}`,
      registration.instagram && `Instagram: ${registration.instagram}`,
      registration.notes && `Notes: ${registration.notes}`,
    ].filter(Boolean).join('\n'),
  };
}

export default async function handler(req, res) {
  // ── CANCELLED 2026-07-30 ──────────────────────────────────────────────────
  // The Sept 4 "Friday Night Lights" exotics showcase is not happening. Its
  // pages are removed from the site, but this endpoint stays reachable on its
  // own URL, so it is hard-closed here: a stale tab, a cached page, or a direct
  // POST can no longer create an application or send an acceptance email.
  // The rest of the handler is intact — delete this block to reinstate.
  return res.status(410).json({
    error: 'The Friday Night Lights exotics showcase has been cancelled. Our next event is the Halloween Car Show at Neiman Marcus on October 25 — register at tkeslu.org/carshow.',
  });

  // eslint-disable-next-line no-unreachable
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const parsed = exoticsRegistrationSchema.safeParse(req.body);
  if (!parsed.success) {
    return res.status(400).json({ error: 'Please check the application fields and try again.' });
  }

  try {
    const registration = parsed.data;
    const { data: event, error: eventError } = await supabaseAdmin
      .from('events')
      .select('*')
      .eq('slug', EXOTICS_SHOW.slug)
      .single();

    if (eventError || !event || !event.registration_open) {
      return res.status(404).json({ error: 'Applications are not open for this event yet.' });
    }

    const { data: duplicate } = await supabaseAdmin
      .from('registrations')
      .select('id')
      .eq('event_id', event.id)
      .eq('email', registration.email)
      .neq('status', 'refunded')
      .maybeSingle();

    if (duplicate) {
      return res.status(409).json({ error: 'An application for this email has already been received.' });
    }

    const { data: saved, error: insertError } = await supabaseAdmin
      .from('registrations')
      .insert({
        event_id: event.id,
        name: registration.name,
        email: registration.email,
        phone: registration.phone,
        car_year: registration.car_year,
        car_make: registration.car_make,
        car_model: registration.car_model,
        car_color: registration.car_color,
        instagram: registration.instagram || null,
        application_notes: registration.notes || null,
        car_class: 'exotic',
        amount_paid_cents: 0,
        donation_cents: 0,
        status: 'pending',
      })
      .select()
      .single();

    if (insertError) throw insertError;

    if (!process.env.RESEND_API_KEY) {
      console.error('exotics-registration: RESEND_API_KEY is not configured');
      return res.status(200).json({ ok: true, id: saved.id, email_warning: true });
    }

    const resend = new Resend(process.env.RESEND_API_KEY);
    const applicant = applicantEmail(registration);
    const organizer = organizerEmail(registration);
    const [applicantResult, organizerResult] = await Promise.all([
      resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: registration.email,
        reply_to: EXOTICS_SHOW.contactEmail,
        ...applicant,
      }),
      resend.emails.send({
        from: process.env.EMAIL_FROM,
        to: EXOTICS_SHOW.contactEmail,
        reply_to: registration.email,
        ...organizer,
      }),
    ]);

    if (applicantResult.error || organizerResult.error) {
      console.error('exotics-registration email warning:', applicantResult.error || organizerResult.error);
      return res.status(200).json({ ok: true, id: saved.id, email_warning: true });
    }

    return res.status(200).json({ ok: true, id: saved.id });
  } catch (error) {
    console.error('exotics-registration failed:', error);
    return res.status(500).json({ error: 'We could not save the application. Please try again or contact Anthony.' });
  }
}
