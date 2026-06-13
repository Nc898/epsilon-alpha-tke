import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Rotating brotherhood showcase for the Member Directory hero: three
 * typographic panels — Love / Charity / Esteem with their definitions from
 * the Declaration of Principles — crossfading to the chapter group photo
 * and back, on a continuous loop. Static (values only) for reduced motion.
 */
const VALUES = [
  {
    word: 'Love',
    desc: 'Binds our hearts with the sturdy chords of fraternal affection.',
  },
  {
    word: 'Charity',
    desc: 'Impulsive to see virtues in a brother, and slow to reprove his faults.',
  },
  {
    word: 'Esteem',
    desc: 'Respectful to the honest convictions of others, refraining from treading upon what is sacred to spirit and conscience.',
  },
];

const GROUP_PHOTO = '/assets/tke-banquet.jpg';
const HOLD_MS = 6000;

const cardList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

export default function ValuesShowcase() {
  const reduce = useReducedMotion();
  const [showGroup, setShowGroup] = useState(false);

  useEffect(() => {
    if (reduce) return;
    const t = setInterval(() => setShowGroup((v) => !v), HOLD_MS);
    return () => clearInterval(t);
  }, [reduce]);

  return (
    <div className="relative h-[400px] sm:h-[380px] lg:h-[440px]">
      <AnimatePresence initial={false}>
        {showGroup ? (
          <motion.div
            key="group"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.9, ease: 'easeInOut' }}
            className="absolute inset-0 overflow-hidden rounded-2xl"
          >
            <img
              src={GROUP_PHOTO}
              alt="Brothers and alumni of TKE Epsilon Alpha at the chapter banquet"
              className="w-full h-full object-cover"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
            <p className="absolute bottom-5 left-6 font-heading font-bold text-white text-xl sm:text-2xl drop-shadow">
              One Brotherhood<span className="text-primary">.</span>
              <span className="block text-xs sm:text-sm font-body font-semibold text-white/70 tracking-[0.2em] uppercase mt-1">
                Actives &amp; Alumni — Est. 1955
              </span>
            </p>
          </motion.div>
        ) : (
          <motion.div
            key="values"
            variants={cardList}
            initial={reduce ? false : 'hidden'}
            animate="visible"
            exit={{ opacity: 0, transition: { duration: 0.9, ease: 'easeInOut' } }}
            className="absolute inset-0 flex flex-col"
          >
            <div className="flex-1 grid grid-cols-1 sm:grid-cols-3 gap-3 sm:gap-4">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.word}
                  variants={card}
                  className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10 flex flex-col justify-center sm:justify-end p-5 sm:p-7"
                >
                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-4 text-[11px] font-semibold text-white/25 tabular-nums"
                  >
                    0{i + 1}
                  </span>
                  <p
                    className="font-heading font-bold text-white leading-none"
                    style={{ fontSize: 'clamp(2rem, 4.5vw, 3.5rem)' }}
                  >
                    {v.word}
                    <span className="text-primary">.</span>
                  </p>
                  <p className="text-white/55 text-xs sm:text-sm leading-relaxed mt-2 sm:mt-3">
                    {v.desc}
                  </p>
                </motion.div>
              ))}
            </div>
            <motion.p
              variants={card}
              className="text-center text-white/35 text-[11px] sm:text-xs tracking-[0.18em] uppercase mt-4"
            >
              The triple obligations of every brother in the bond — Declaration of Principles, 1907–08
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
