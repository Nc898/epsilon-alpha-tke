import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FundraisingTracker from '../components/FundraisingTracker';
import EventCard from '../components/EventCard';
import SponsorTierCard from '../components/SponsorTierCard';
import { Button } from '@/components/ui/button';
import { motion } from 'framer-motion';
import { Heart, Download, Mail, Building2 } from 'lucide-react';
import { Link } from 'react-router-dom';

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

  const { data: donations = [] } = useQuery({
    queryKey: ['donations'],
    queryFn: () => base44.entities.Donation.list(),
  });

  const totalRaised = donations.reduce((sum, d) => sum + (d.amount || 0), 0);

  return (
    <div className="pt-20">
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Philanthropy</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">
            TKE for St. Jude
          </h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto mb-8">
            Join our fight against childhood cancer. Every dollar raised goes directly to 
            St. Jude Children's Research Hospital.
          </p>
          <a href="https://www.stjude.org/donate" target="_blank" rel="noopener noreferrer">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-10 text-base">
              <Heart className="h-5 w-5" /> Donate to St. Jude
            </Button>
          </a>
        </div>
      </section>

      {/* Fundraising Progress */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Our Progress</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Fundraising Impact</h2>
          </div>
          <div className="flex justify-center">
            <FundraisingTracker raised={totalRaised || 34200} goal={50000} />
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
              {events.map(e => <EventCard key={e.id} event={e} />)}
            </div>
          )}
        </div>
      </section>

      {/* Sponsorship Tiers */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Partner With Us</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Sponsorship Opportunities</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Your sponsorship directly supports our mission to fight childhood cancer. 
              Every partner helps us reach our fundraising goal.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {TIERS.map(t => <SponsorTierCard key={t.tier} {...t} />)}
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