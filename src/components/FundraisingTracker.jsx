import { useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, animate } from 'framer-motion';
import { Heart } from 'lucide-react';
import ImageReveal from './ImageReveal';

// Counts from 0 to `to` when scrolled into view, synced with the ring draw.
function CountUp({ to, format = (v) => Math.round(v).toLocaleString(), duration = 1.8 }) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px' });
  const reduce = useReducedMotion();
  const [val, setVal] = useState(reduce ? to : 0);

  useEffect(() => {
    if (!inView || reduce) return;
    const controls = animate(0, to, {
      duration,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: setVal,
    });
    return () => controls.stop();
  }, [inView, reduce, to, duration]);

  return <span ref={ref}>{format(val)}</span>;
}

export default function FundraisingTracker({ raised = 12400, goal = 50000, isLoading = false, lastUpdated = null, periodLabel = null }) {
  // When there is no goal (e.g. a completed fundraising year), the ring is a
  // full celebratory circle and the dollar total sits in the center instead of
  // a percent-of-goal.
  const hasGoal = goal > 0;
  const pct = hasGoal ? Math.min((raised / goal) * 100, 100) : 100;
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
                  stroke="hsl(var(--primary))" strokeWidth="8" strokeLinecap="round"
                  strokeDasharray={circ} initial={{ strokeDashoffset: circ }}
                  whileInView={{ strokeDashoffset: offset }}
                  viewport={{ once: true, margin: '-60px' }}
                  transition={{ duration: 1.8, ease: [0.16, 1, 0.3, 1] }}
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <Heart className="h-6 w-6 text-primary mb-2" />
                {hasGoal ? (
                  <>
                    <p className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                      <CountUp to={pct} format={(v) => `${Math.round(v)}%`} />
                    </p>
                    <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wide">of goal</p>
                  </>
                ) : (
                  <>
                    <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                      $<CountUp to={raised} />
                    </p>
                    {periodLabel && (
                      <p className="text-muted-foreground text-xs mt-1 uppercase tracking-wide">{periodLabel}</p>
                    )}
                  </>
                )}
              </div>
            </>
          )}
        </div>
        <div className="mt-6 text-center">
          {isLoading ? (
            <div className="h-6 w-40 bg-muted animate-pulse rounded mx-auto" />
          ) : (
            <>
              {hasGoal ? (
                <p className="text-foreground font-heading text-xl font-bold">
                  $<CountUp to={raised} />{' '}
                  <span className="text-muted-foreground font-body text-sm font-normal">/ ${goal.toLocaleString()}</span>
                </p>
              ) : (
                <p className="text-foreground font-heading text-xl font-bold">
                  Raised for St. Jude Children&apos;s Research Hospital
                </p>
              )}
              {hasGoal && (
                <p className="text-muted-foreground text-sm mt-1">raised for St. Jude Children&apos;s Research Hospital</p>
              )}
              {formattedLastUpdated && (
                <p className="text-muted-foreground text-xs mt-2">Updated {formattedLastUpdated} CT</p>
              )}
            </>
          )}
        </div>
      </div>
      <div className="w-72 h-80 sm:w-80 sm:h-96 flex-shrink-0">
        <ImageReveal className="rounded-2xl shadow-xl h-full">
          <div className="duotone-wrap h-full">
            <img
              src="/assets/photos/q26.jpg"
              alt="TKE brother accepting a St. Jude award"
              className="duotone w-full h-full object-cover"
              style={{ height: '100%' }}
            />
          </div>
        </ImageReveal>
      </div>
    </div>
  );
}
