import { useRef } from 'react';
import { motion, useScroll, useSpring, useReducedMotion } from 'framer-motion';
import Reveal from './Reveal';

/**
 * "Our History" river timeline: a wavy red line draws itself down the page as
 * you scroll, with milestones surfacing alternately left and right of the
 * current. Each entry: big year, description, and a small tilted photo that
 * straightens and blooms to color on hover. Line is pre-drawn for reduced
 * motion.
 *
 * Anthony: swap in real milestones + era photos here (7 rows flows best).
 */
const HISTORY = [
  {
    year: '1955',
    text: 'Epsilon-Alpha Chapter chartered at Saint Louis University.',
    img: '/assets/photos/q05.webp',
  },
  {
    year: '1956',
    text: 'Chapter earns its first Top TKE Chapter Award.',
    img: '/assets/photos/p15.webp',
  },
  {
    year: '1980',
    text: 'Epsilon-Alpha alumni association established.',
    img: '/assets/photos/p07.webp',
  },
  {
    year: '2005',
    text: 'Fifty years of brotherhood celebrated at SLU.',
    img: '/assets/photos/p17.webp',
  },
  {
    year: '2015',
    text: 'Chapter passes its first major fundraising milestone for St. Jude.',
    img: '/assets/photos/p21.webp',
  },
  {
    year: '2025',
    text: 'Inaugural TKE for St. Jude Car Show at City Foundry STL.',
    img: '/assets/photos/q17.webp',
  },
  {
    year: '2026',
    text: 'Seventy-one years strong — actives and alumni, one bond.',
    img: '/assets/photos/q34.webp',
  },
];

// One S-bend per milestone, crossing the center at each row so the node dots
// sit on (or kiss) the river. Stretched to the full column height by
// preserveAspectRatio="none"; non-scaling stroke keeps the line crisp.
function riverPath(rows) {
  const seg = 200;
  let d = `M 50 0`;
  for (let i = 0; i < rows; i++) {
    const y = i * seg;
    const bulge = i % 2 === 0 ? 92 : 8;
    const counter = i % 2 === 0 ? 8 : 92;
    d += ` C ${bulge} ${y + seg * 0.35}, ${counter} ${y + seg * 0.65}, 50 ${y + seg}`;
  }
  return d;
}

function Milestone({ item, index }) {
  const left = index % 2 === 0;
  const tilt = left ? '-rotate-3' : 'rotate-3';

  return (
    <div className="relative sm:grid sm:grid-cols-[1fr,7rem,1fr] sm:items-center">
      {/* Node dot on the river */}
      <motion.span
        initial={{ scale: 0 }}
        whileInView={{ scale: 1 }}
        viewport={{ once: true, margin: '-120px' }}
        transition={{ type: 'spring', stiffness: 260, damping: 18 }}
        className="absolute left-8 sm:left-1/2 top-2 sm:top-1/2 -translate-x-1/2 sm:-translate-y-1/2 w-4 h-4 rounded-full bg-primary ring-4 ring-[hsl(0,0%,7%)] animate-news-pulse z-10"
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, x: left ? -48 : 48 }}
        whileInView={{ opacity: 1, x: 0 }}
        viewport={{ once: true, margin: '-100px' }}
        transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
        className={`group pl-16 sm:pl-0 ${
          left
            ? 'sm:col-start-1 sm:pr-4 sm:justify-self-end sm:text-right'
            : 'sm:col-start-3 sm:pl-4 sm:justify-self-start'
        }`}
      >
        <div
          className={`flex items-start gap-5 max-w-md ${
            left ? 'sm:flex-row-reverse' : ''
          }`}
        >
          <div
            className={`duotone-wrap flex-shrink-0 w-28 h-24 sm:w-36 sm:h-28 rounded-xl overflow-hidden shadow-lg ${tilt} group-hover:rotate-0 group-hover:scale-[1.04] transition-transform duration-500`}
          >
            <img src={item.img} alt="" loading="lazy" className="duotone w-full h-full object-cover" />
          </div>
          <div>
            <p className="font-heading font-bold text-primary text-3xl sm:text-4xl leading-none">
              {item.year}
            </p>
            <p className="text-white/65 text-sm sm:text-base leading-relaxed mt-2">
              {item.text}
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}

export default function RiverTimeline() {
  const riverRef = useRef(null);
  const reduce = useReducedMotion();

  const { scrollYProgress } = useScroll({
    target: riverRef,
    offset: ['start 0.75', 'end 0.85'],
  });
  const pathLength = useSpring(scrollYProgress, { stiffness: 90, damping: 26 });

  const viewH = HISTORY.length * 200;
  const d = riverPath(HISTORY.length);

  return (
    <section className="py-20 sm:py-24 bg-[hsl(0,0%,7%)] overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Reveal className="text-center mb-16 sm:mb-20">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Our History</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-white mb-4">
            The Epsilon-Alpha Story
          </h2>
          <p className="text-white/65 max-w-xl mx-auto">
            Seven decades of brotherhood — follow the river.
          </p>
        </Reveal>

        <div ref={riverRef} className="relative">
          {/* The river */}
          <svg
            className="absolute top-0 h-full w-16 left-0 sm:w-28 sm:left-1/2 sm:-translate-x-1/2"
            viewBox={`0 0 100 ${viewH}`}
            preserveAspectRatio="none"
            aria-hidden="true"
          >
            {/* Faint full course of the river */}
            <path
              d={d}
              fill="none"
              stroke="rgba(255,255,255,0.14)"
              strokeWidth="2"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
            />
            {/* Drawn-by-scroll current */}
            <motion.path
              d={d}
              fill="none"
              stroke="hsl(var(--primary))"
              strokeWidth="2.5"
              vectorEffect="non-scaling-stroke"
              strokeLinecap="round"
              style={reduce ? undefined : { pathLength }}
            />
          </svg>

          <div className="space-y-16 sm:space-y-24 py-4">
            {HISTORY.map((item, i) => (
              <Milestone key={`${item.year}-${i}`} item={item} index={i} />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
