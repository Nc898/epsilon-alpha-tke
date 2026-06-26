import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, ArrowUpRight, Sparkles } from 'lucide-react';
import { Button } from '@/components/ui/button';
import LivingBond from '../components/next/LivingBond';
import HeroSection from '../components/HeroSection';
import PinnedValues from '../components/next/PinnedValues';
import RevealGrid from '../components/next/RevealGrid';
import Marquee from '../components/Marquee';
import StJudeSection from '../components/StJudeSection';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';

/**
 * Interactive home. "The Living Bond" cinematic entrance → rolling photo
 * slideshow hero (HeroSection) → kinetic marquee → scroll-pinned values →
 * reveal-on-scroll photo grid → St. Jude → CTA. Smooth scroll is provided once
 * globally by Layout's useLenis() (disabled for reduced motion); this page must
 * not create its own Lenis or two RAF loops fight each other. (ForgeHero and
 * BrotherhoodIntro are kept in the repo as alternates.)
 */
export default function HomeNext() {
  const [replayToken, setReplayToken] = useState(0);

  return (
    <div className="bg-[hsl(0,0%,5%)]">
      <LivingBond key={replayToken} replayToken={replayToken} />

      {/* Discreet replay control for the entrance experience. */}
      <button
        onClick={() => setReplayToken((n) => n + 1)}
        className="fixed bottom-4 left-4 z-40 flex items-center gap-1.5 rounded-full border border-white/15 bg-black/40 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-[0.2em] text-white/55 backdrop-blur-sm transition-colors hover:border-primary/50 hover:text-white focus:outline-none focus-visible:ring-2 focus-visible:ring-primary"
        aria-label="Replay the intro experience"
      >
        <Sparkles className="h-3 w-3" /> Replay
      </button>

      <HeroSection />

      <Marquee
        phrases={[
          'Better Men for a Better World',
          'Est. 1955',
          'TKE × St. Jude',
          'Epsilon Alpha',
          'Love · Charity · Esteem',
        ]}
      />

      <PinnedValues />
      <RevealGrid />
      <StJudeSection />

      {/* Final CTA */}
      <section className="relative bg-[hsl(0,0%,5%)] text-white py-28 sm:py-36 overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute -bottom-16 left-1/2 -translate-x-1/2 font-heading font-bold text-outline-light select-none pointer-events-none leading-none opacity-20"
          style={{ fontSize: 'clamp(10rem, 34vw, 30rem)' }}
        >
          ΤΚΕ
        </span>
        <div className="relative max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="font-heading font-bold leading-[0.95] mb-7" style={{ fontSize: 'clamp(2.75rem, 8vw, 6.5rem)', letterSpacing: '-0.02em' }}>
              Build something <span className="text-primary">that lasts</span>
            </h2>
            <p className="text-white/60 text-lg max-w-2xl mx-auto mb-10">
              Prospective member, alumnus, or community partner — there's a place for you in the
              Epsilon Alpha story.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Magnetic>
                <Link to="/recruitment" className="contents">
                  <Button size="lg" className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-9 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    Join Our Brotherhood
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </Button>
                </Link>
              </Magnetic>
              <Link to="/alumni">
                <Button size="lg" variant="outline" className="rounded-full border-white/25 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-9 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Alumni Resources <ArrowUpRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
