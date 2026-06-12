import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
import { Flag, ArrowRight } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';

// 'en-CA' yields YYYY-MM-DD; America/Chicago keeps "today" consistent with
// the reminder cron (see api/_lib/reminderLogic.js).
const chicagoDate = new Intl.DateTimeFormat('en-CA', { timeZone: 'America/Chicago' });

function daysUntil(eventDate) {
  const today = chicagoDate.format(new Date());
  return Math.round(
    (Date.parse(`${eventDate}T00:00:00Z`) - Date.parse(`${today}T00:00:00Z`)) / 86_400_000
  );
}

export default function NextEventBanner() {
  const reduce = useReducedMotion();

  const { data: event } = useQuery({
    queryKey: ['next-upcoming-event'],
    queryFn: async () => {
      const today = chicagoDate.format(new Date());
      const { data, error } = await supabase
        .from('events')
        .select('title, slug, date, time, location, registration_open')
        .eq('status', 'upcoming')
        .gte('date', today)
        .order('date')
        .limit(1);
      if (error) throw error;
      return data?.[0] ?? null;
    },
    staleTime: 1000 * 60 * 5,
  });

  // Graceful: zero layout footprint while loading or when nothing is upcoming.
  if (!event) return null;

  const days = daysUntil(event.date);
  const when = days === 0 ? 'today!' : `in ${days} day${days === 1 ? '' : 's'}`;

  return (
    <div className="relative z-20 h-0 -mt-8 flex justify-center px-4">
      <motion.div
        initial={reduce ? false : { opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="flex items-center gap-2.5 max-w-fit rounded-full bg-[hsl(0,0%,7%)] text-white/90 border-l-4 border-primary ring-1 ring-white/10 shadow-xl pl-4 pr-5 py-2.5 text-sm"
      >
        <Flag className="h-4 w-4 text-primary shrink-0" aria-hidden="true" />
        <span className="truncate max-w-[11rem] sm:max-w-xs font-medium text-white">
          {event.title}
        </span>
        <span className="text-white/40" aria-hidden="true">—</span>
        <span className="whitespace-nowrap">{when}</span>
        <span className="text-white/30" aria-hidden="true">·</span>
        {event.registration_open ? (
          <Link
            to={`/events/${event.slug}`}
            className="group inline-flex items-center gap-1 whitespace-nowrap font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Register
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        ) : (
          <Link
            to="/calendar"
            className="group inline-flex items-center gap-1 whitespace-nowrap font-semibold text-primary hover:text-primary/80 transition-colors"
          >
            Details
            <ArrowRight className="h-3.5 w-3.5 transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}
      </motion.div>
    </div>
  );
}
