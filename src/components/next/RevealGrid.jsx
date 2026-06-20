import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';
import Reveal from '../Reveal';

const PHOTOS = [
  '/assets/photos/q15.jpg',
  '/assets/photos/p07.jpg',
  '/assets/photos/q06.jpg',
  '/assets/photos/p17.jpg',
  '/assets/photos/q34.jpg',
  '/assets/photos/p13.jpg',
  '/assets/photos/q26.jpg',
  '/assets/photos/p21.jpg',
  '/assets/photos/q31.jpg',
];

function PhotoCard({ src }) {
  const ref = useRef(null);
  const reduce = useReducedMotion();
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start end', 'end start'] });
  const y = useTransform(scrollYProgress, [0, 1], ['-7%', '7%']);

  return (
    <div ref={ref} className="mb-4 sm:mb-5 overflow-hidden rounded-2xl break-inside-avoid shadow-lg">
      <motion.div
        initial={reduce ? false : { clipPath: 'inset(100% 0% 0% 0%)' }}
        whileInView={reduce ? {} : { clipPath: 'inset(0% 0% 0% 0%)' }}
        viewport={{ once: true, margin: '-8%' }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="duotone-wrap"
      >
        <motion.img
          src={src}
          alt=""
          loading="lazy"
          style={reduce ? undefined : { y, scale: 1.16 }}
          className="duotone w-full object-cover"
        />
      </motion.div>
    </div>
  );
}

export default function RevealGrid() {
  return (
    <section className="bg-[hsl(0,0%,7%)] text-white py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="mb-14 sm:mb-20 max-w-2xl">
          <p className="text-accent font-semibold text-sm tracking-[0.3em] uppercase mb-3">The Chapter</p>
          <h2 className="font-heading font-bold leading-[0.95]" style={{ fontSize: 'clamp(2.5rem, 6vw, 5rem)', letterSpacing: '-0.02em' }}>
            Brotherhood <span className="text-primary">in motion</span>
          </h2>
          <p className="text-white/55 mt-5 text-base sm:text-lg leading-relaxed">
            Car shows, philanthropy, formals, late nights, and everything in between — moments from the
            Epsilon Alpha chapter.
          </p>
        </Reveal>

        <div className="columns-2 lg:columns-3 gap-4 sm:gap-5">
          {PHOTOS.map((src) => (
            <PhotoCard key={src} src={src} />
          ))}
        </div>
      </div>
    </section>
  );
}
