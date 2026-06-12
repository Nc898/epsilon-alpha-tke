import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Calendar, ArrowRight } from 'lucide-react';
import { motion, useReducedMotion } from 'framer-motion';

const HERO_IMAGES = [
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/d2143a975_tempImagevdeNDs.jpg',
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/793feca1a_IMG_61365.jpg',
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/8454d81a7_tempImage9R7i2T.jpg',
];

const ACCENT_STYLE = { color: 'hsl(1 70% 52%)', textShadow: '0 2px 16px rgba(0,0,0,0.55)' };

// "Better World" gets the red accent treatment, word by word.
const HEADLINE_WORDS = [
  { text: 'Better' },
  { text: 'Men' },
  { text: 'for' },
  { text: 'a' },
  { text: 'Better', accent: true },
  { text: 'World', accent: true },
];

const wordContainer = {
  hidden: {},
  visible: { transition: { staggerChildren: 0.07, delayChildren: 0.15 } },
};

const wordItem = {
  hidden: { opacity: 0, y: '0.6em' },
  visible: {
    opacity: 1,
    y: 0,
    transition: { duration: 0.7, ease: [0.16, 1, 0.3, 1] },
  },
};

function ScrollIndicator() {
  const reduce = useReducedMotion();
  const [hidden, setHidden] = useState(false);

  useEffect(() => {
    const onScroll = () => setHidden(window.scrollY > 120);
    window.addEventListener('scroll', onScroll, { passive: true });
    onScroll();
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div
      className={`hidden sm:flex absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex-col items-center gap-2 transition-opacity duration-500 ${
        hidden ? 'opacity-0 pointer-events-none' : 'opacity-100'
      }`}
      aria-hidden="true"
    >
      <span className="text-[10px] tracking-[0.3em] uppercase text-white/60 font-semibold">
        Scroll
      </span>
      {reduce ? (
        <span className="w-px h-7 bg-white/50 origin-top" />
      ) : (
        <motion.span
          className="w-px h-7 bg-white/50 origin-top"
          animate={{ scaleY: [0, 1, 0] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
        />
      )}
    </div>
  );
}

export default function HeroSection() {
  const [idx, setIdx] = useState(0);
  const reduce = useReducedMotion();

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

  const h1Style = { fontSize: 'clamp(2.75rem, 7.5vw, 6.5rem)', letterSpacing: '-0.02em', lineHeight: 1.05 };

  return (
    <section className="relative h-screen min-h-[600px] max-h-[900px] flex items-center overflow-hidden">
      {HERO_IMAGES.map((img, i) => (
        <div key={i}
          className={`absolute inset-0 transition-opacity duration-[1500ms] ease-in-out bg-cover bg-center ${
            i === idx ? 'opacity-100' : 'opacity-0'
          }`}
          style={{ backgroundImage: `url(${img})` }}
        />
      ))}
      <div className="absolute inset-0 bg-gradient-to-b from-black/50 via-black/30 to-black/70" />

      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 text-center">
        {reduce ? (
          <p className="text-white font-heading text-sm sm:text-base lg:text-lg tracking-[0.22em] uppercase font-bold mb-4 drop-shadow-md" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            Tau Kappa Epsilon — Epsilon Alpha Chapter
          </p>
        ) : (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.7, delay: 0.7, ease: 'easeOut' }}
            className="text-white font-heading text-sm sm:text-base lg:text-lg tracking-[0.22em] uppercase font-bold mb-4 drop-shadow-md"
            style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}
          >
            Tau Kappa Epsilon — Epsilon Alpha Chapter
          </motion.p>
        )}

        {reduce ? (
          <h1 className="font-heading text-white font-bold mb-6" style={h1Style}>
            Better Men for a <span style={ACCENT_STYLE}>Better World</span>
          </h1>
        ) : (
          <motion.h1
            className="font-heading text-white font-bold mb-6"
            style={h1Style}
            variants={wordContainer}
            initial="hidden"
            animate="visible"
            aria-label="Better Men for a Better World"
          >
            {HEADLINE_WORDS.map((w, i) => (
              <motion.span
                key={i}
                variants={wordItem}
                className="inline-block whitespace-pre"
                style={w.accent ? ACCENT_STYLE : undefined}
                aria-hidden="true"
              >
                {w.text}
                {i < HEADLINE_WORDS.length - 1 ? ' ' : ''}
              </motion.span>
            ))}
          </motion.h1>
        )}

        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: reduce ? 0 : 0.85, ease: [0.16, 1, 0.3, 1] }}
        >
          <p className="text-white/80 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Through Service-Oriented Leadership, Professional Competence, Brotherhood, and Philanthropy at Saint Louis University.
          </p>

          <div className="flex flex-col sm:flex-row sm:flex-wrap items-stretch sm:items-center justify-center gap-3 sm:gap-4 max-w-xs sm:max-w-none mx-auto">
            <Link to="/philanthropy" className="contents">
              <Button size="lg" className="group w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" /> Support St. Jude
                <ArrowRight className="h-4 w-4 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
              </Button>
            </Link>
            <Link to="/recruitment" className="contents">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" /> Join TKE
              </Button>
            </Link>
            <Link to="/calendar" className="contents">
              <Button size="lg" variant="outline" className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" /> Upcoming Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Scroll indicator — bottom-center at sm+, hidden on mobile where dots live */}
      <ScrollIndicator />

      {/* Slideshow dots — centered on mobile, bottom-right at sm+ to make room for the indicator */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 sm:left-auto sm:translate-x-0 sm:right-8 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            aria-label={`Show slide ${i + 1}`}
            className={`w-2 h-2 rounded-full transition-all ${
              i === idx ? 'bg-accent w-6' : 'bg-white/40 hover:bg-white/60'
            }`} />
        ))}
      </div>
    </section>
  );
}
