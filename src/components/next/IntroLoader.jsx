import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Award-site style intro: a 0→100 counter with the crest, then the whole
 * curtain slides up to reveal the page. Plays once per browser session
 * (sessionStorage) and is skipped entirely for reduced-motion users.
 */
export default function IntroLoader() {
  const reduce = useReducedMotion();
  const [done, setDone] = useState(
    () => typeof window !== 'undefined' && sessionStorage.getItem('tke-intro-seen') === '1'
  );
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (done) return;
    if (reduce) {
      sessionStorage.setItem('tke-intro-seen', '1');
      setDone(true);
      return;
    }
    let raf;
    const start = performance.now();
    const duration = 1500;
    const tick = (t) => {
      const p = Math.min((t - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3); // easeOutCubic
      setCount(Math.round(eased * 100));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setTimeout(() => {
          sessionStorage.setItem('tke-intro-seen', '1');
          setDone(true);
        }, 400);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [done, reduce]);

  return (
    <AnimatePresence>
      {!done && (
        <motion.div
          key="intro"
          className="fixed inset-0 z-[100] bg-[hsl(0,0%,4%)] flex flex-col items-center justify-center overflow-hidden"
          initial={{ y: 0 }}
          exit={{ y: '-100%' }}
          transition={{ duration: 0.95, ease: [0.76, 0, 0.24, 1] }}
        >
          {/* faint oversized watermark */}
          <span
            aria-hidden="true"
            className="absolute font-heading font-bold text-outline-light select-none pointer-events-none leading-none opacity-40"
            style={{ fontSize: 'clamp(18rem, 60vw, 44rem)' }}
          >
            ΤΚΕ
          </span>

          <motion.img
            src="/assets/tke-crest.webp"
            alt=""
            className="relative h-20 sm:h-24 w-auto mb-8 drop-shadow-[0_8px_24px_rgba(0,0,0,0.6)]"
            initial={{ opacity: 0, scale: 0.82, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          />

          <div className="relative font-heading text-white font-bold tabular-nums leading-none"
            style={{ fontSize: 'clamp(3.5rem, 12vw, 7rem)' }}>
            {count}
          </div>

          <div className="relative w-40 sm:w-56 h-px bg-white/15 mt-7 overflow-hidden rounded-full">
            <div className="h-full bg-primary transition-[width] duration-100 ease-linear" style={{ width: `${count}%` }} />
          </div>

          <p className="relative text-white/40 text-[11px] tracking-[0.34em] uppercase mt-5 font-semibold">
            Tau Kappa Epsilon · Epsilon Alpha
          </p>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
