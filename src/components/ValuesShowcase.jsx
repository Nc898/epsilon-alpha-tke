import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Rotating brotherhood showcase for the Member Directory hero: three
 * typographic panels — each value word stacked letter-by-letter down the
 * center in hero type, with its Declaration of Principles definition as
 * faint oversized background text — crossfading to the chapter group photo
 * and back on a continuous loop. Static (values only) for reduced motion.
 *
 * All three value words use one shared letter size (LETTER_SIZE), tuned so
 * the longest word (CHARITY, 7 letters) still fits its column height. The
 * stacks are vertically centered, so shorter words simply sit with more
 * breathing room above and below.
 */
const LETTER_SIZE = 'clamp(1.3rem, 3.4vw, 2.6rem)';

const VALUES = [
  {
    word: 'LOVE',
    desc: 'Binds our hearts with the sturdy chords of fraternal affection.',
  },
  {
    word: 'CHARITY',
    desc: 'Impulsive to see virtues in a brother, and slow to reprove his faults.',
  },
  {
    word: 'ESTEEM',
    desc: 'Respectful to the honest convictions of others, refraining from treading upon what is sacred to spirit and conscience.',
  },
];

const GROUP_PHOTO = '/assets/tke-banquet.jpg';
const VALUES_HOLD_MS = 8000;
const GROUP_HOLD_MS = 3000;

const cardList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.12 } },
};

const card = {
  hidden: { opacity: 0, y: 28 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] } },
};

const letterList = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.25 } },
};

const letter = {
  hidden: { opacity: 0, y: 14 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.5, ease: [0.16, 1, 0.3, 1] } },
};

export default function ValuesShowcase() {
  const reduce = useReducedMotion();
  const [showGroup, setShowGroup] = useState(false);

  // Asymmetric loop: values hold longer than the group photo.
  useEffect(() => {
    if (reduce) return;
    const t = setTimeout(
      () => setShowGroup((v) => !v),
      showGroup ? GROUP_HOLD_MS : VALUES_HOLD_MS
    );
    return () => clearTimeout(t);
  }, [reduce, showGroup]);

  return (
    <div className="relative h-[380px] sm:h-[420px] lg:h-[480px]">
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
            <div className="flex-1 grid grid-cols-3 gap-3 sm:gap-4 min-h-0">
              {VALUES.map((v, i) => (
                <motion.div
                  key={v.word}
                  variants={card}
                  className="relative overflow-hidden rounded-2xl bg-white/[0.04] border border-white/10"
                >
                  {/* Declaration text as the panel's background texture */}
                  <p
                    aria-hidden="true"
                    className="absolute inset-0 p-3 sm:p-5 font-heading italic font-semibold text-white/[0.08] select-none pointer-events-none leading-snug break-words"
                    style={{ fontSize: 'clamp(1rem, 2.3vw, 1.85rem)' }}
                  >
                    {`${v.desc} ${v.desc} ${v.desc}`}
                  </p>
                  <div className="absolute inset-0 bg-gradient-to-b from-transparent via-black/10 to-black/30 pointer-events-none" />

                  {/* The value word, stacked letter-by-letter and top-aligned
                      so all three words start on the same line. */}
                  <motion.div
                    variants={letterList}
                    className="relative h-full flex flex-col items-center justify-start pt-8 sm:pt-10"
                    role="img"
                    aria-label={`${v.word} — ${v.desc}`}
                  >
                    {v.word.split('').map((ch, j) => (
                      <motion.span
                        key={j}
                        variants={letter}
                        className="font-heading font-bold text-white drop-shadow-md"
                        style={{ fontSize: LETTER_SIZE, lineHeight: 1.08 }}
                        aria-hidden="true"
                      >
                        {ch}
                      </motion.span>
                    ))}
                    <motion.span
                      variants={letter}
                      className="w-1.5 h-1.5 sm:w-2 sm:h-2 rounded-full bg-primary mt-2 sm:mt-3"
                      aria-hidden="true"
                    />
                  </motion.div>

                  <span
                    aria-hidden="true"
                    className="absolute top-3 right-4 text-[11px] font-semibold text-white/25 tabular-nums"
                  >
                    0{i + 1}
                  </span>
                </motion.div>
              ))}
            </div>
            <motion.p
              variants={card}
              className="text-center text-white/35 text-[10px] sm:text-xs tracking-[0.18em] uppercase mt-4"
            >
              The triple obligations of every brother in the bond — Declaration of Principles, 1907–08
            </motion.p>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
