import HeroSection from '../components/HeroSection';
import NextEventBanner from '../components/NextEventBanner';
import AboutSection from '../components/AboutSection';
import CreedSection from '../components/CreedSection';
import StJudeSection from '../components/StJudeSection';
import ImpactStats from '../components/ImpactStats';
import Marquee from '../components/Marquee';
import InstagramFeed from '../components/InstagramFeed';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import Reveal from '../components/Reveal';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <NextEventBanner />
      <ImpactStats />
      <Marquee />
      <AboutSection />
      <CreedSection />
      <StJudeSection />
      <InstagramFeed title="Latest from the Chapter" />

      {/* CTA Banner */}
      <section className="py-20 sm:py-24 bg-background rounded-t-[2.5rem] overflow-hidden relative z-10 -mt-10">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Whether you're a prospective member, alumnus, or community partner — 
              there's a place for you in the TKE Epsilon Alpha story.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/recruitment">
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Join Our Brotherhood <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/alumni">
                <Button size="lg" variant="outline" className="rounded-full font-semibold gap-2 h-12 px-8 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  Alumni Resources <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}