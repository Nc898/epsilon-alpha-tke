import { motion, useReducedMotion } from 'framer-motion';

const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.06, delayChildren: 0.1 } },
};

const wordItem = {
  hidden: { opacity: 0, y: '0.5em' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.65, ease: [0.16, 1, 0.3, 1] },
  },
};

/**
 * Shared editorial hero for inner pages: numbered eyebrow, giant staggered
 * display type with one red accent phrase, outlined watermark, dark card
 * that rounds off into the page. Replaces the old shared stock-photo hero.
 *
 * `accent` is the substring of `title` to render in chapter red.
 */
export default function PageHero({ eyebrow, title, accent, watermark = 'ΤΚΕ', lead, children }) {
  const reduce = useReducedMotion();

  const accentWords = new Set((accent ?? '').split(/\s+/).filter(Boolean));
  const words = title.split(/\s+/).map((text) => ({ text, accent: accentWords.has(text) }));

  const h1Style = { fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05 };

  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white rounded-b-[2.5rem]">
      <span
        aria-hidden="true"
        className="absolute -bottom-12 -right-4 font-heading font-bold text-outline-light select-none pointer-events-none leading-none whitespace-nowrap"
        style={{ fontSize: 'clamp(8rem, 22vw, 18rem)' }}
      >
        {watermark}
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-24">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="text-accent font-semibold text-sm tracking-widest uppercase mb-4"
        >
          {eyebrow}
        </motion.p>

        {reduce ? (
          <h1 className="font-heading font-bold" style={h1Style}>
            {words.map((w, i) => (
              <span key={i} className={w.accent ? 'text-primary' : undefined}>
                {w.text}
                {i < words.length - 1 ? ' ' : ''}
              </span>
            ))}
          </h1>
        ) : (
          <motion.h1
            className="font-heading font-bold"
            style={h1Style}
            variants={wordContainer}
            initial="hidden"
            animate="visible"
            aria-label={title}
          >
            {words.map((w, i) => (
              <motion.span
                key={i}
                variants={wordItem}
                className={`inline-block whitespace-pre ${w.accent ? 'text-primary' : ''}`}
                aria-hidden="true"
              >
                {w.text}
                {i < words.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.h1>
        )}

        {lead && (
          <motion.p
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="text-white/70 text-base sm:text-lg max-w-2xl mt-6 leading-relaxed"
          >
            {lead}
          </motion.p>
        )}

        {children && (
          <motion.div
            initial={reduce ? false : { opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: reduce ? 0 : 0.6, ease: [0.16, 1, 0.3, 1] }}
            className="flex flex-wrap gap-3 sm:gap-4 mt-9"
          >
            {children}
          </motion.div>
        )}
      </div>
    </section>
  );
}
