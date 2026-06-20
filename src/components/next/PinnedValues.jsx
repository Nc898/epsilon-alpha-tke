import { useRef } from 'react';
import { motion, useScroll, useTransform, useReducedMotion } from 'framer-motion';

const VALUES = [
  { n: '01', word: 'Love', text: 'The foundation of the Bond — a genuine, lifelong care for one another that outlasts our years on campus.' },
  { n: '02', word: 'Charity', text: 'Service above self. We give our time and effort for St. Jude, our campus, and the St. Louis community.' },
  { n: '03', word: 'Esteem', text: 'Respect earned through character and conduct — never through wealth, rank, or honor alone.' },
];

function ValuePanel({ item, index, total, progress }) {
  const seg = 1 / total;
  const start = index * seg;
  const mid = start + seg / 2;
  const end = start + seg;

  const opacity = useTransform(
    progress,
    [start - seg * 0.12, mid - seg * 0.28, mid + seg * 0.28, end + seg * 0.12],
    [0, 1, 1, 0]
  );
  const y = useTransform(progress, [start, end], ['12%', '-12%']);

  return (
    <motion.div style={{ opacity, y }} className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
      <span className="font-heading font-bold text-primary/30 text-lg tracking-[0.4em] mb-4">{item.n}</span>
      <h3 className="font-heading font-bold leading-none" style={{ fontSize: 'clamp(3.5rem, 15vw, 12rem)', letterSpacing: '-0.02em' }}>
        {item.word}
      </h3>
      <p className="text-white/60 text-base sm:text-lg max-w-xl mt-8 leading-relaxed">{item.text}</p>
    </motion.div>
  );
}

export default function PinnedValues() {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ['start start', 'end end'] });
  const barScaleY = useTransform(scrollYProgress, [0, 1], [0, 1]);

  // Reduced motion / no-JS fallback: a simple stacked list, no pinning.
  if (reduce) {
    return (
      <section className="bg-[hsl(0,0%,5%)] text-white py-24">
        <div className="max-w-3xl mx-auto px-6 space-y-16 text-center">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase">What We Stand For</p>
          {VALUES.map((v) => (
            <div key={v.word}>
              <h3 className="font-heading font-bold text-5xl sm:text-6xl mb-4">{v.word}</h3>
              <p className="text-white/60 max-w-xl mx-auto">{v.text}</p>
            </div>
          ))}
        </div>
      </section>
    );
  }

  return (
    <section ref={ref} className="relative bg-[hsl(0,0%,5%)] text-white" style={{ height: `${VALUES.length * 100}vh` }}>
      <div className="sticky top-0 h-screen overflow-hidden flex items-center">
        {/* eyebrow */}
        <p className="absolute top-10 left-1/2 -translate-x-1/2 text-accent font-semibold text-xs sm:text-sm tracking-[0.3em] uppercase z-10">
          What We Stand For
        </p>

        {/* side progress rail */}
        <div className="absolute right-6 sm:right-10 top-1/2 -translate-y-1/2 h-40 w-px bg-white/10 overflow-hidden">
          <motion.div className="w-full bg-primary origin-top" style={{ scaleY: barScaleY, height: '100%' }} />
        </div>

        {VALUES.map((item, i) => (
          <ValuePanel key={item.word} item={item} index={i} total={VALUES.length} progress={scrollYProgress} />
        ))}
      </div>
    </section>
  );
}
