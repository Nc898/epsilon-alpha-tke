import { Resend } from 'resend';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';
import { reminderEmail } from './_lib/emailTemplates.js';
import { reminderTypeForEvent } from './_lib/reminderLogic.js';

const resend = new Resend(process.env.RESEND_API_KEY);

export default async function handler(req, res) {
  // Vercel cron sends Authorization: Bearer $CRON_SECRET — fail closed if unset
  if (!process.env.CRON_SECRET ||
      req.headers.authorization !== `Bearer ${process.env.CRON_SECRET}`) {
    return res.status(401).end();
  }

  try {
    const { data: events } = await supabaseAdmin
      .from('events').select('*').eq('status', 'upcoming');

    let sent = 0;
    for (const event of events ?? []) {
      const type = reminderTypeForEvent(event.date, new Date());
      if (!type) continue;
      const daysOut = type === 'reminder_7d' ? 7 : 1;

      const { data: regs } = await supabaseAdmin
        .from('registrations').select('*')
        .eq('event_id', event.id).eq('status', 'paid');

      for (const reg of regs ?? []) {
        const { error: logErr } = await supabaseAdmin
          .from('email_log').insert({ registration_id: reg.id, email_type: type });
        if (logErr) continue; // already sent — idempotent
        const { subject, html, text } = reminderEmail({ registration: reg, event, daysOut });
        try {
          await resend.emails.send({ from: process.env.EMAIL_FROM, to: reg.email, subject, html, text });
        } catch (sendErr) {
          // Roll back the log row so a retried run can re-attempt the send.
          await supabaseAdmin
            .from('email_log')
            .delete()
            .eq('registration_id', reg.id)
            .eq('email_type', type);
          console.error(`reminder send failed for registration ${reg.id}:`, sendErr);
          continue;
        }
        sent++;
      }
    }
    return res.status(200).json({ sent });
  } catch (err) {
    console.error('send-reminders failed:', err);
    return res.status(500).json({ error: 'Internal error' });
  }
}
