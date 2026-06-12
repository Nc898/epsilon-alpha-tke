import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FundraisingTracker from '../components/FundraisingTracker';
import EventCard from '../components/EventCard';
import SponsorTierCard from '../components/SponsorTierCard';
import PageHero from '../components/PageHero';
import Marquee from '../components/Marquee';
import Magnetic from '../components/Magnetic';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import Reveal from '../components/Reveal';
import { Heart, Download, Mail, Building2, ExternalLink } from 'lucide-react';
import { Link } from 'react-router-dom';

const ST_JUDE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry';

const TIERS = [
  { tier: 'title', price: 10000 },
  { tier: 'platinum', price: 5000 },
  { tier: 'gold', price: 2500 },
  { tier: 'silver', price: 1000 },
  { tier: 'bronze', price: 500 },
  { tier: 'friend', price: 100 },
];

export default function Philanthropy() {
  const { data: events = [], isLoading: eventsLoading } = useQuery({
    queryKey: ['events', 'philanthropy'],
    queryFn: () => base44.entities.ChapterEvent.filter({ event_type: 'philanthropy' }, '-date'),
  });

  const { data: sponsors = [] } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => base44.entities.Sponsor.filter({ active: true }),
  });

  const { data: statsArr = [], isLoading: statsLoading } = useQuery({
    queryKey: ['fundraising-stats'],
    queryFn: () => base44.entities.FundraisingStats.list(),
    staleTime: 1000 * 60 * 30,
  });

  const fStats = statsArr[0];
  const raised = fStats?.amount_raised ?? 12400;
  const goal = fStats?.goal ?? 50000;
  const lastUpdated = fStats?.last_updated ?? null;

  return (
    <div className="pt-24">
      {/* Hero */}
      <PageHero
        eyebrow="01 — Philanthropy"
        title="TKE for St. Jude"
        accent="St. Jude"
        watermark="ΤΚΕ"
        spin="stjude"
        lead="Join our fight against childhood cancer. Every dollar raised goes directly to St. Jude Children's Research Hospital."
      >
        <Magnetic>
          <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-10 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <Heart className="h-5 w-5" /> Donate to St. Jude
            </Button>
          </a>
        </Magnetic>
        <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-8 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <ExternalLink className="h-4 w-4" /> View Our Fundraising Page
          </Button>
        </a>
      </PageHero>

      {/* Live stats marquee */}
      <Marquee
        phrases={[
          `$${raised.toLocaleString()} raised`,
          `${fStats?.donor_count ?? 42} donors strong`,
          'Fighting childhood cancer',
          'TKE × St. Jude',
        ]}
      />

      {/* Fundraising Progress */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Our Progress</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Fundraising Impact</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Live totals pulled directly from our{' '}
              <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer"
                className="text-primary underline underline-offset-2 hover:text-primary/80">
                St. Jude fundraising page
              </a>
              , updated three times daily.
            </p>
          </Reveal>
          <div className="flex justify-center">
            <FundraisingTracker raised={raised} goal={goal} isLoading={statsLoading} lastUpdated={lastUpdated} />
          </div>
        </div>
      </section>

      {/* Events */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }} className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Upcoming</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Philanthropy Events</h2>
          </motion.div>

          {eventsLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : events.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              New events are being planned — check back soon for exciting opportunities.
            </p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((e, i) => (
                <Reveal key={e.id} delay={i * 0.08}>
                  <EventCard event={e} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Partner With Us</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Sponsorship Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your sponsorship directly supports our mission to fight childhood cancer.
              Every partner helps us reach our fundraising goal.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TIERS.map((t, i) => (
              <Reveal key={t.tier} delay={i * 0.08}>
                <SponsorTierCard {...t} />
              </Reveal>
            ))}
          </div>

          <div className="flex flex-wrap justify-center gap-4">
            <Button variant="outline" size="lg" className="font-semibold gap-2">
              <Download className="h-4 w-4" /> Download Sponsorship Packet
            </Button>
            <Link to="/contact?type=sponsorship">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <Mail className="h-4 w-4" /> Sponsor Inquiry
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* Sponsor Showcase */}
      {sponsors.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Thank You</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Our Sponsors</h2>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-6">
              {sponsors.map(s => (
                <a key={s.id} href={s.website || '#'} target="_blank" rel="noopener noreferrer"
                  className="bg-card border border-border rounded-xl p-6 flex items-center justify-center h-24 hover:border-accent/30 hover:shadow-md transition-all grayscale hover:grayscale-0">
                  {s.logo ? (
                    <img src={s.logo} alt={s.name} className="max-h-12 max-w-full object-contain" />
                  ) : (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <Building2 className="h-5 w-5" />
                      <span className="font-semibold text-sm">{s.name}</span>
                    </div>
                  )}
                </a>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
