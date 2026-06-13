import { motion, useReducedMotion } from 'framer-motion';

/**
 * Chapter history timeline for the Alumni hero — horizontal milestone rows
 * that reveal one per second. All visible at once for reduced motion.
 *
 * Anthony: swap in the real milestones (max ~7 rows fit the hero cleanly).
 */
const HISTORY = [
  { year: '1955', text: 'Epsilon-Alpha Chapter chartered at Saint Louis University.' },
  { year: '1956', text: 'Chapter earns its first Top TKE Chapter Award.' },
  { year: '1980', text: 'Epsilon-Alpha alumni association established.' },
  { year: '2005', text: 'Fifty years of brotherhood celebrated at SLU.' },
  { year: '2015', text: 'Chapter passes its first major fundraising milestone for St. Jude.' },
  { year: '2025', text: 'Inaugural TKE for St. Jude Car Show at City Foundry STL.' },
  { year: '2026', text: 'Seventy-one years strong — actives and alumni, one bond.' },
];

const STEP_S = 1.0; // one row per second, per the design

export default function ChapterTimeline() {
  const reduce = useReducedMotion();

  return (
    <div>
      <motion.p
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6 }}
        className="text-white/40 text-[11px] sm:text-xs font-semibold tracking-[0.25em] uppercase mb-3"
      >
        Chapter Milestones
      </motion.p>

      <div className="border-t border-white/10">
        {HISTORY.map((h, i) => (
          <motion.div
            key={`${h.year}-${i}`}
            initial={reduce ? false : { opacity: 0, x: -36 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.4 + i * STEP_S, ease: [0.16, 1, 0.3, 1] }}
            className="flex items-baseline gap-4 sm:gap-7 py-3.5 sm:py-4 border-b border-white/10"
          >
            <span className="font-heading font-bold text-primary text-xl sm:text-3xl tabular-nums w-16 sm:w-24 flex-shrink-0">
              {h.year}
            </span>
            <span aria-hidden="true" className="hidden sm:block h-px w-10 flex-shrink-0 bg-white/20 self-center" />
            <p className="text-white/75 text-sm sm:text-base leading-snug">{h.text}</p>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
