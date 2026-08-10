import { lazy, Suspense, useEffect, useState } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const Logo3D = lazy(() => import('./Logo3D'));

const SPIN_CONFIG = {
  tke: { shape: 'triangle', textureUrl: '/assets/tke-crest.webp', fallback: '/assets/tke-crest.webp' },
  stjude: { shape: 'disc', textureUrl: '/assets/stjude-logo.webp', fallback: '/assets/stjude-logo.webp' },
};

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
 * display type with one red accent phrase, outlined watermark, and a spinning
 * 3D logo (TKE triangle by default, St. Jude coin via spin="stjude").
 *
 * `accent` is the substring of `title` to render in chapter red.
 * `media` renders full-width below the headline row, still inside the dark zone.
 */
export default function PageHero({ eyebrow, title, accent, watermark = 'ΤΚΕ', lead, spin = 'tke', media, children }) {
  const reduce = useReducedMotion();
  const spinCfg = SPIN_CONFIG[spin] ?? null;

  // The spinning logo is pure decoration (aria-hidden) and its container is
  // `hidden lg:block`, so below 1024px it renders nothing at all. Gate the
  // three.js chunk (~124KB gzipped) on the SAME breakpoint the CSS uses —
  // otherwise a narrow desktop window downloads all of it to show nothing.
  // Phones and reduced-motion users keep the static logo image.
  //
  // Loading is deferred to idle so WebGL never competes with the hero's own
  // first paint, and re-evaluated on change so resizing across `lg` still works.
  const [interactive, setInteractive] = useState(false);

  useEffect(() => {
    if (!spinCfg) return undefined;

    const fine = window.matchMedia('(pointer: fine)');
    const calm = window.matchMedia('(prefers-reduced-motion: reduce)');
    const wide = window.matchMedia('(min-width: 1024px)'); // Tailwind `lg`

    const idle = window.requestIdleCallback ?? ((fn) => setTimeout(fn, 200));
    const cancelIdle = window.cancelIdleCallback ?? clearTimeout;
    let handle;

    const sync = () => {
      if (!(fine.matches && wide.matches && !calm.matches)) {
        setInteractive(false);
        return;
      }
      handle = idle(() => setInteractive(true));
    };

    sync();
    wide.addEventListener('change', sync);
    calm.addEventListener('change', sync);
    return () => {
      wide.removeEventListener('change', sync);
      calm.removeEventListener('change', sync);
      if (handle !== undefined) cancelIdle(handle);
    };
  }, [spinCfg]);

  const accentWords = new Set((accent ?? '').split(/\s+/).filter(Boolean));
  const words = title.split(/\s+/).map((text) => ({ text, accent: accentWords.has(text) }));

  const h1Style = { fontSize: 'clamp(2.75rem, 6.5vw, 5.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05 };
  // Long watermarks (BROTHERS) render smaller so they aren't clipped; heroes
  // with a media block also use the small size so it fits the clearance strip.
  const wmSize =
    watermark.length <= 4 && !media ? 'clamp(5.5rem, 14vw, 12rem)' : 'clamp(2.75rem, 7vw, 6.5rem)';

  const logoFallback = spinCfg && (
    <div className="h-full w-full flex items-center justify-center">
      <img
        src={spinCfg.fallback}
        alt=""
        className="max-h-[70%] w-auto max-w-full object-contain drop-shadow-2xl"
      />
    </div>
  );

  return (
    <section className="relative overflow-hidden bg-[hsl(0,0%,5%)] text-white rounded-b-[2.5rem]">
      <span
        aria-hidden="true"
        className="absolute bottom-5 right-6 font-heading font-bold text-outline-light select-none pointer-events-none leading-none whitespace-nowrap"
        style={{ fontSize: wmSize }}
      >
        {watermark}
      </span>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 sm:py-20 lg:flex lg:items-center lg:justify-between lg:gap-12">
        <div className="max-w-3xl">
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

        {spinCfg && (
          <motion.div
            initial={reduce ? false : { opacity: 0, scale: 0.92 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, delay: reduce ? 0 : 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="hidden lg:block flex-shrink-0 w-64 h-64 xl:w-80 xl:h-80 overflow-hidden"
            aria-hidden="true"
          >
            {interactive ? (
              <Suspense fallback={logoFallback}>
                <Logo3D shape={spinCfg.shape} textureUrl={spinCfg.textureUrl} className="h-full w-full" />
              </Suspense>
            ) : (
              logoFallback
            )}
          </motion.div>
        )}
      </div>

      {media && (
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 24 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.5, ease: [0.16, 1, 0.3, 1] }}
          className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24 sm:pb-36 -mt-2"
        >
          {media}
        </motion.div>
      )}
    </section>
  );
}
