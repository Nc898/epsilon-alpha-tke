// api/registrations.js
import { createHash, timingSafeEqual } from 'node:crypto';
import { supabaseAdmin } from './_lib/supabaseAdmin.js';

function sha256(value) {
  return createHash('sha256').update(String(value)).digest();
}

function keyMatches(provided, expected) {
  if (!provided || !expected) return false;
  // Hashing both sides makes the buffers equal length, so timingSafeEqual is valid.
  return timingSafeEqual(sha256(provided), sha256(expected));
}

export default async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ error: 'Method not allowed' });

  try {
    if (!keyMatches(req.headers['x-admin-key'], process.env.ADMIN_KEY)) {
      return res.status(401).json({ error: 'Unauthorized' });
    }

    const { data: registrations, error } = await supabaseAdmin
      .from('registrations')
      .select('*, events(title, slug, date)')
      .order('created_at', { ascending: false });
    if (error) throw error;

    const totals = { paid: 0, pending: 0, gross_cents: 0, donation_cents: 0 };
    for (const row of registrations) {
      if (row.status === 'paid') {
        totals.paid += 1;
        totals.gross_cents += row.amount_paid_cents ?? 0;
        totals.donation_cents += row.donation_cents ?? 0;
      } else if (row.status === 'pending') {
        totals.pending += 1;
      }
    }

    return res.status(200).json({ registrations, totals });
  } catch (err) {
    console.error('registrations error:', err);
    return res.status(500).json({ error: 'Failed to load registrations' });
  }
}
