import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import StJudeSection from '../components/StJudeSection';
import ImpactStats from '../components/ImpactStats';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function Home() {
  return (
    <div>
      <HeroSection />
      <ImpactStats />
      <AboutSection />
      <StJudeSection />

      {/* CTA Banner */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 text-center">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} transition={{ duration: 0.6 }}>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-6">
              Ready to Make an Impact?
            </h2>
            <p className="text-muted-foreground text-lg mb-8 max-w-2xl mx-auto">
              Whether you're a prospective member, alumnus, or community partner — 
              there's a place for you in the TKE Epsilon Alpha story.
            </p>
            <div className="flex flex-wrap justify-center gap-4">
              <Link to="/recruitment">
                <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-8">
                  Join Our Brotherhood <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
              <Link to="/alumni">
                <Button size="lg" variant="outline" className="font-semibold gap-2 h-12 px-8">
                  Alumni Resources <ArrowRight className="h-4 w-4" />
                </Button>
              </Link>
            </div>
          </motion.div>
        </div>
      </section>
    </div>
  );
}