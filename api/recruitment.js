// api/recruitment.js — forwards rush interest-form submissions to the chapter email via Resend.
import { Resend } from 'resend';

const esc = (s) =>
  String(s ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

export default async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { name, email, phone, major, graduation_year, message } = req.body ?? {};
  if (!name || !email) {
    return res.status(400).json({ error: 'name and email are required' });
  }

  if (!process.env.RESEND_API_KEY) {
    console.error('recruitment: RESEND_API_KEY is not configured');
    return res.status(500).json({ error: 'Email is not configured. Please try again later.' });
  }
  const resend = new Resend(process.env.RESEND_API_KEY);

  const row = (label, value) =>
    value
      ? `<tr><td style="padding:8px 0;font-size:13px;color:#6b7280;width:140px">${label}</td>
             <td style="padding:8px 0;font-size:14px;font-weight:600">${esc(value)}</td></tr>`
      : '';

  const html = `
    <div style="font-family:-apple-system,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;max-width:600px;margin:0 auto;color:#0a0a0a">
      <div style="background:#AD2624;padding:24px 32px">
        <h1 style="margin:0;color:#fff;font-size:20px;font-weight:700">New Rush Interest Form</h1>
        <p style="margin:4px 0 0;color:rgba(255,255,255,0.8);font-size:14px">TKE Epsilon Alpha — Recruitment</p>
      </div>
      <div style="padding:32px;background:#fff;border:1px solid #e5e7eb">
        <table style="width:100%;border-collapse:collapse">
          ${row('Name', name)}
          <tr><td style="padding:8px 0;font-size:13px;color:#6b7280">Reply-to</td>
              <td style="padding:8px 0;font-size:14px"><a href="mailto:${esc(email)}" style="color:#AD2624">${esc(email)}</a></td></tr>
          ${row('Phone', phone)}
          ${row('Major', major)}
          ${row('Graduation', graduation_year)}
        </table>
        ${
          message
            ? `<hr style="border:none;border-top:1px solid #e5e7eb;margin:20px 0"/>
               <h2 style="margin:0 0 12px;font-size:15px">Message</h2>
               <p style="margin:0;font-size:14px;line-height:1.6;white-space:pre-wrap">${esc(message)}</p>`
            : ''
        }
      </div>
      <div style="padding:16px 32px;background:#f9fafb;border:1px solid #e5e7eb;border-top:none;font-size:12px;color:#9ca3af;text-align:center">
        TKE Epsilon Alpha — Saint Louis University · Reply directly to this email to reach ${esc(name)}.
      </div>
    </div>
  `;

  const text =
    `New rush interest from ${name} <${email}>\n` +
    [
      phone && `Phone: ${phone}`,
      major && `Major: ${major}`,
      graduation_year && `Graduation: ${graduation_year}`,
    ]
      .filter(Boolean)
      .join('\n') +
    (message ? `\n\n${message}` : '');

  try {
    const { data, error } = await resend.emails.send({
      from: process.env.EMAIL_FROM,
      to: 'slutkestewardship@gmail.com',
      reply_to: email,
      subject: `[TKE EA] Rush interest from ${name}`,
      html,
      text,
    });
    // The Resend SDK resolves (does not throw) on API errors — it returns
    // { data, error }. We must inspect `error` explicitly or sends fail silently.
    if (error) {
      console.error('recruitment email rejected by Resend:', error);
      return res.status(502).json({ error: 'Email provider rejected the message.', detail: error.message ?? String(error) });
    }
    return res.status(200).json({ ok: true, id: data?.id });
  } catch (err) {
    console.error('recruitment email failed:', err);
    return res.status(500).json({ error: 'Failed to send form. Please try again.' });
  }
}
