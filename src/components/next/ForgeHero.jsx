import { useRef } from 'react';
import { Link } from 'react-router-dom';
import { motion, useMotionValue, useSpring, useTransform, useReducedMotion } from 'framer-motion';
import { Heart, Users, ArrowDown } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Magnetic from '../Magnetic';
import ForgeCanvas from './ForgeCanvas';

const GRAIN =
  "url(\"data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='120' height='120'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='2' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E\")";

const LINES = [
  [{ t: 'Better' }, { t: 'Men' }],
  [{ t: 'for' }, { t: 'a' }],
  [{ t: 'Better', accent: true }, { t: 'World', accent: true }],
];

const lineWrap = { hidden: {}, visible: { transition: { staggerChildren: 0.09, delayChildren: 0.35 } } };
const wordRise = {
  hidden: { y: '116%' },
  visible: { y: 0, transition: { duration: 1.0, ease: [0.16, 1, 0.3, 1] } },
};

export default function ForgeHero() {
  const reduce = useReducedMotion();
  const ref = useRef(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const sx = useSpring(mx, { stiffness: 50, damping: 16 });
  const sy = useSpring(my, { stiffness: 50, damping: 16 });
  const typeX = useTransform(sx, [-0.5, 0.5], [18, -18]);
  const typeY = useTransform(sy, [-0.5, 0.5], [10, -10]);
  const crestX = useTransform(sx, [-0.5, 0.5], [-28, 28]);
  const crestY = useTransform(sy, [-0.5, 0.5], [-18, 18]);

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
      className="relative min-h-screen flex items-center justify-center overflow-hidden text-white"
      style={{ background: 'radial-gradient(circle at 50% 70%, #2a0a08, #0a0606 60%, #050303)' }}
    >
      {/* WebGL forge */}
      <ForgeCanvas className="absolute inset-0 z-0" />

      {/* legibility scrim */}
      <div className="absolute inset-0 z-[1] pointer-events-none"
        style={{ background: 'radial-gradient(circle at 50% 44%, transparent 30%, rgba(5,3,3,0.55) 78%)' }} />

      {/* film grain */}
      <div className="absolute inset-0 z-[2] pointer-events-none opacity-[0.06] mix-blend-overlay"
        style={{ backgroundImage: GRAIN, backgroundRepeat: 'repeat' }} aria-hidden="true" />

      {/* content */}
      <motion.div style={reduce ? undefined : { x: typeX, y: typeY }} className="relative z-10 px-4 text-center">
        {/* glowing crest */}
        <motion.img
          src="/assets/tke-crest.png"
          alt=""
          aria-hidden="true"
          style={reduce ? undefined : { x: crestX, y: crestY }}
          initial={reduce ? false : { opacity: 0, scale: 0.6, y: -8 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ duration: 1, delay: 0.15, ease: [0.16, 1, 0.3, 1] }}
          className="mx-auto h-16 sm:h-20 w-auto mb-7 drop-shadow-[0_0_28px_rgba(214,42,30,0.65)]"
        />

        <motion.p
          initial={reduce ? false : { opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.9, ease: 'easeOut' }}
          className="font-heading text-[11px] sm:text-sm tracking-[0.4em] uppercase font-bold text-white/65 mb-6"
          style={{ textShadow: '0 2px 14px rgba(0,0,0,0.9)' }}
        >
          Tau Kappa Epsilon · Epsilon Alpha · Est. 1955
        </motion.p>

        {reduce ? (
          <h1 className="font-heading font-bold leading-[0.9]" style={{ fontSize: 'clamp(3rem, 12vw, 10rem)', letterSpacing: '-0.025em' }}>
            Better Men for a <span className="text-primary">Better World</span>
          </h1>
        ) : (
          <motion.h1
            variants={lineWrap}
            initial="hidden"
            animate="visible"
            aria-label="Better Men for a Better World"
            className="font-heading font-bold leading-[0.9]"
            style={{ fontSize: 'clamp(3rem, 12vw, 10rem)', letterSpacing: '-0.025em', textShadow: '0 6px 40px rgba(0,0,0,0.6)' }}
          >
            {LINES.map((line, li) => (
              <span key={li} className="block overflow-hidden py-[0.02em]">
                <span className="inline-flex gap-[0.24em]">
                  {line.map((w, wi) => (
                    <motion.span key={wi} variants={wordRise}
                      className={`inline-block ${w.accent ? 'text-primary' : ''}`}
                      style={w.accent ? { textShadow: '0 0 36px rgba(214,42,30,0.55)' } : undefined}
                      aria-hidden="true">
                      {w.t}
                    </motion.span>
                  ))}
                </span>
              </span>
            ))}
          </motion.h1>
        )}

        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: reduce ? 0 : 1.3 }}
          className="text-white/65 text-base sm:text-lg max-w-xl mx-auto mt-7"
        >
          Seventy years of brotherhood, service, and becoming more than we were — at Saint Louis University.
        </motion.p>

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 1.45, ease: [0.16, 1, 0.3, 1] }}
          className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-4"
        >
          <Magnetic className="w-full sm:w-auto">
            <Link to="/recruitment" className="contents">
              <Button size="lg" className="group w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-14 text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] shadow-[0_8px_40px_rgba(214,42,30,0.4)]">
                <Users className="h-5 w-5" /> Join TKE
              </Button>
            </Link>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <Link to="/carshow" className="contents">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-14 text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Heart className="h-5 w-5" /> Support St. Jude
              </Button>
            </Link>
          </Magnetic>
        </motion.div>
      </motion.div>

      <motion.div
        initial={reduce ? false : { opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1, delay: 1.9 }}
        className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/55"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">Scroll</span>
        {reduce ? <ArrowDown className="h-4 w-4" /> : (
          <motion.div animate={{ y: [0, 7, 0] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}>
            <ArrowDown className="h-4 w-4" />
          </motion.div>
        )}
      </motion.div>
    </section>
  );
}
