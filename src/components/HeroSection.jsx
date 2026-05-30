import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Heart, Users, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';

const HERO_IMAGES = [
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/d2143a975_tempImagevdeNDs.jpg',
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/793feca1a_IMG_61365.jpg',
  'https://media.base44.com/images/public/6a190a936fbf6af2a63c4d1d/8454d81a7_tempImage9R7i2T.jpg',
];

export default function HeroSection() {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    const t = setInterval(() => setIdx(p => (p + 1) % HERO_IMAGES.length), 6000);
    return () => clearInterval(t);
  }, []);

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
        <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.9 }}>
          <p className="text-white font-heading text-sm sm:text-base lg:text-lg tracking-[0.22em] uppercase font-bold mb-4 drop-shadow-md" style={{ textShadow: '0 1px 6px rgba(0,0,0,0.8)' }}>
            Tau Kappa Epsilon — Epsilon Alpha Chapter
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-7xl text-white font-bold leading-[1.1] mb-6">
            Better Men for a Better World
          </h1>
          <p className="text-white/80 text-base sm:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
            Through Service-Oriented Leadership, Professional Competence, Brotherhood, and Philanthropy at Saint Louis University.
          </p>

          <div className="flex flex-wrap justify-center gap-3 sm:gap-4">
            <Link to="/philanthropy">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2">
                <Heart className="h-4 w-4 sm:h-5 sm:w-5" /> Support St. Jude
              </Button>
            </Link>
            <Link to="/recruitment">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2">
                <Users className="h-4 w-4 sm:h-5 sm:w-5" /> Join TKE
              </Button>
            </Link>
            <Link to="/calendar">
              <Button size="lg" variant="outline" className="border-white/30 text-white hover:bg-white/10 font-semibold px-6 sm:px-8 h-12 sm:h-14 text-sm sm:text-base gap-2">
                <Calendar className="h-4 w-4 sm:h-5 sm:w-5" /> Upcoming Events
              </Button>
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Bottom dots */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-2 z-10">
        {HERO_IMAGES.map((_, i) => (
          <button key={i} onClick={() => setIdx(i)}
            className={`w-2 h-2 rounded-full transition-all ${
              i === idx ? 'bg-accent w-6' : 'bg-white/40 hover:bg-white/60'
            }`} />
        ))}
      </div>
    </section>
  );
}