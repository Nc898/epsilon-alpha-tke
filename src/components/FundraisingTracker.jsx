import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';

export default function FundraisingTracker({ raised = 12400, goal = 50000, isLoading = false, lastUpdated = null }) {
  const pct = goal > 0 ? Math.min((raised / goal) * 100, 100) : 0;
  const r = 90;
  const circ = 2 * Math.PI * r;
  const offset = circ - (pct / 100) * circ;

  const formattedLastUpdated = lastUpdated
    ? new Date(lastUpdated).toLocaleString('en-US', {
        timeZone: 'America/Chicago',
        month: 'short', day: 'numeric',
        hour: 'numeric', minute: '2-digit',
        hour12: true,
      })
    : null;

  return (
    <div className="flex flex-col lg:flex-row items-center gap-10 lg:gap-16">
      <div className="flex flex-col items-center">
        <div className="relative w-56 h-56 sm:w-64 sm:h-64">
          {isLoading ? (
            <div className="w-full h-full flex items-center justify-center">
              <div className="w-10 h-10 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : (
            <>
              <svg className="w-full h-full -rotate-90" viewBox="0 0 200 200">
                <circle cx="100" cy="100" r={r} fill="none" stroke="hsl(var(--border))" strokeWidth="8" />
                <motion.circle cx="100" cy="100" r={r} fill="none"
                  stroke="hsl(var(--accent))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                  whileInView={{ strokeDashoffset: offset }}
                  viewport={{ once: true }} transition={{ duration: 1.5, ease: 'easeOut' }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Heart className="h-6 w-6 text-primary mb-2" />
                <p className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                  {Math.round(pct)}%
                </p>
                <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wide">of goal</p>
              </div>
            </>
          )}
        </div>
        <div className="mt-6 text-center">
          {isLoading ? (
            <div className="h-6 w-40 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <>
              <p className="text-foreground font-heading text-xl font-bold">
                ${raised.toLocaleString()} <span className="text-muted-foreground font-body text-sm font-normal">/ ${goal.toLocaleString()}</span>
              </p>
              <p className="text-muted-foreground text-sm mt-1">raised for St. Jude Children's Research Hospital</p>
              {formattedLastUpdated && (
                <p className="text-muted-foreground text-xs mt-2">Updated {formattedLastUpdated} CT</p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-72 h-80 sm:w-80 sm:h-96 rounded-2xl overflow-hidden shadow-xl flex-shrink-0">
        <img
          src="https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/34dc63c53_tempImage0dskXs.jpg"
          alt="TKE brothers at St. Jude"
          className="w-full h-full object-cover"
        />
      </div>
    </div>
  );
}
