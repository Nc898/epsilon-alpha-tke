import { lazy, Suspense, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Heart, Users, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Magnetic from '../Magnetic';

const Logo3D = lazy(() => import('../Logo3D'));

// Headline split into lines; the middle two words get the red accent.
const LINES = [
  [{ t: 'Better' }, { t: 'Men' }],
  [{ t: 'for' }, { t: 'a' }],
  [{ t: 'Better', accent: true }, { t: 'World', accent: true }],
];

const lineWrap = { hidden: {}, visible: { transition: { staggerChildren: 0.08, delayChildren: 0.2 } } };
const wordRise = {
  hidden: { y: '110%' },
  visible: { y: 0, transition: { duration: 0.9, ease: [0.16, 1, 0.3, 1] } },
};

export default function KineticHero() {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  // pointer → springy parallax for the type and the crest (opposite directions = depth)
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 55, damping: 16 });
  const sy = useSpring(my, { stiffness: 55, damping: 16 });
  const typeX = useTransform(sx, [-0.5, 0.5], [22, -22]);
  const typeY = useTransform(sy, [-0.5, 0.5], [14, -14]);
  const crestX = useTransform(sx, [-0.5, 0.5], [-40, 40]);
  const crestY = useTransform(sy, [-0.5, 0.5], [-26, 26]);

  const [interactive] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const onMove = (e) => {
    if (reduce || !ref.current) return;
    const r = ref.current.getBoundingClientRect();
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  return (
    <section
      ref={ref}
      onMouseMove={onMove}
      className="relative min-h-screen flex items-center justify-center overflow-hidden bg-[hsl(0,0%,5%)] text-white"
    >
      {/* radial glow */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 42%, hsl(1 70% 30% / 0.35), transparent 55%)' }}
      />
      {/* giant outline watermark */}
      <span
        aria-hidden="true"
        className="absolute font-heading font-bold text-outline-light select-none pointer-events-none leading-none opacity-30"
        style={{ fontSize: 'clamp(20rem, 64vw, 52rem)' }}
      >
        ΤΚΕ
      </span>

      {/* 3D crest, parallaxing behind the type */}
      <motion.div
        aria-hidden="true"
        style={reduce ? undefined : { x: crestX, y: crestY }}
        className="absolute z-0 w-[300px] h-[300px] sm:w-[440px] sm:h-[440px] lg:w-[560px] lg:h-[560px]"
      >
        {interactive ? (
          <Suspense fallback={<img src="/assets/tke-crest.png" alt="" className="w-full h-full object-contain opacity-90" />}>
            <Logo3D shape="triangle" className="w-full h-full" />
          </Suspense>
        ) : (
          <img src="/assets/tke-crest.png" alt="" className="w-full h-full object-contain opacity-90 drop-shadow-2xl" />
        )}
      </motion.div>

      {/* foreground content */}
      <motion.div style={reduce ? undefined : { x: typeX, y: typeY }} className="relative z-10 px-4 text-center">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.7, delay: 1, ease: 'easeOut' }}
          className="font-heading text-xs sm:text-sm tracking-[0.34em] uppercase font-bold text-white/70 mb-5"
          style={{ textShadow: '0 2px 12px rgba(0,0,0,0.8)' }}
        >
          Tau Kappa Epsilon — Epsilon Alpha
        </motion.p>

        {reduce ? (
          <h1 className="font-heading font-bold leading-[0.92]" style={{ fontSize: 'clamp(3rem, 11vw, 9rem)', letterSpacing: '-0.02em', textShadow: '0 4px 30px rgba(0,0,0,0.6)' }}>
            Better Men for a <span className="text-primary">Better World</span>
          </h1>
        ) : (
          <motion.h1
            variants={lineWrap}
            initial="hidden"
            animate="visible"
            aria-label="Better Men for a Better World"
            className="font-heading font-bold leading-[0.92]"
            style={{ fontSize: 'clamp(3rem, 11vw, 9rem)', letterSpacing: '-0.02em', textShadow: '0 4px 30px rgba(0,0,0,0.55)' }}
          >
            {LINES.map((line, li) => (
              <span key={li} className="block overflow-hidden py-[0.04em]">
                <span className="inline-flex gap-[0.25em]">
                  {line.map((w, wi) => (
                    <motion.span
                      key={wi}
                      variants={wordRise}
                      className={`inline-block ${w.accent ? 'text-primary' : ''}`}
                      aria-hidden="true"
                    >
                      {w.t}
                    </motion.span>
                  ))}
                </span>
              </span>
            ))}
          </motion.h1>
        )}

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 1.15, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Magnetic className="w-full sm:w-auto">
            <Link to="/recruitment" className="contents">
              <Button size="lg" className="group w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Users className="h-5 w-5" /> Join TKE
              </Button>
            </Link>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            {/* Was /carshow — repointed 2026-07-30 when the July 26 show was
                archived. Restore to /carshow with the App.jsx HIDDEN block. */}
            <Link to="/philanthropy" className="contents">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-14 text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Heart className="h-5 w-5" /> Support St. Jude
              </Button>
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      {/* scroll cue */}
      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.6 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/55"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">Scroll</span>
        {reduce ? (
          <ArrowDown className="h-4 w-4" />
        ) : (
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
