import { useState, useEffect } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';

/**
 * Rotating brotherhood showcase for the Member Directory hero: three vertical
 * photo cards captioned Love / Charity / Esteem, crossfading to the full
 * chapter group photo and back, on a continuous loop. Static (values only)
 * for reduced motion.
 */
const VALUES = [
  {
    word: 'Love',
    img: 'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/d2143a975_tempImagevdeNDs.jpg',
  },
  {
    word: 'Charity',
    img: 'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/34dc63c53_tempImage0dskXs.jpg',
  },
  {
    word: 'Esteem',
    img: 'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/793feca1a_IMG_61365.jpg',
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
    <div className="relative h-[320px] sm:h-[400px] lg:h-[460px]">
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
            className="absolute inset-0 grid grid-cols-3 gap-3 sm:gap-4"
          >
            {VALUES.map((v) => (
              <motion.div key={v.word} variants={card} className="relative overflow-hidden rounded-2xl">
                <img src={v.img} alt="" className="w-full h-full object-cover" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
                <p
                  className="absolute bottom-4 left-4 sm:bottom-5 sm:left-5 font-heading font-bold text-white drop-shadow"
                  style={{ fontSize: 'clamp(1.25rem, 3.2vw, 2.25rem)' }}
                >
                  {v.word}
                  <span className="text-primary">.</span>
                </p>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
