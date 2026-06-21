import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FundraisingTracker from '../components/FundraisingTracker';
import SponsorLogoRail from '../components/SponsorLogoRail';
import PageHero from '../components/PageHero';
import Marquee from '../components/Marquee';
import Magnetic from '../components/Magnetic';
import { Button } from '@/components/ui/button';
import Reveal from '../components/Reveal';
import { Heart, Mail, ExternalLink, Car, Calendar, MapPin, ArrowRight, CheckCircle2, Handshake, Megaphone } from 'lucide-react';
import { Link } from 'react-router-dom';
import { CAR_SHOW } from '@/lib/carShow';
import { EXOTICS_SHOW, ST_JUDE_URL } from '@/lib/exoticsCarShow';

export default function Philanthropy() {
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
        <Link to="/carshow">
          <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-8 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Car className="h-5 w-5" /> Register for the Car Show
          </Button>
        </Link>
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

      {/* Featured Events */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Upcoming Fundraisers</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Two shows. One mission.</h2>
            <p className="mt-3 text-muted-foreground">Distinct automotive experiences, united in support of St. Jude.</p>
          </Reveal>
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] text-white shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[260px] lg:min-h-full">
                  <div className="duotone-wrap absolute inset-0">
                    <img src="/assets/photos/p26.jpg" alt="TKE Car Show for St. Jude"
                      className="duotone w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,7%)] via-transparent to-transparent lg:bg-gradient-to-r" />
                  <span className="absolute top-5 left-5 inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide rounded-full px-4 py-1.5">
                    <Car className="h-3.5 w-3.5" /> Featured Event
                  </span>
                </div>
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center">
                  <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">{CAR_SHOW.presenter}</p>
                  <h3 className="font-heading text-3xl sm:text-4xl font-bold leading-tight mb-4">
                    Classics &amp; Imports <span className="text-primary">Car Show</span>
                  </h3>
                  <div className="space-y-2 text-white/75 mb-6">
                    <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary flex-shrink-0" /> {CAR_SHOW.dateLabel} · {CAR_SHOW.hoursLabel}</p>
                    <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> {CAR_SHOW.venue}</p>
                    <p className="flex items-center gap-3"><Heart className="h-4 w-4 text-primary flex-shrink-0" /> Benefiting {CAR_SHOW.beneficiary}</p>
                  </div>
                  <p className="text-white/55 text-sm mb-7">
                    ${CAR_SHOW.earlyBirdPrice} early-bird through {CAR_SHOW.earlyBirdEndsLabel} · ${CAR_SHOW.regularPrice} after · limited to {CAR_SHOW.capacity} vehicles, first come first served.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <Link to={`/events/${CAR_SHOW.slug}`}>
                        <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-7 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                          <Car className="h-5 w-5" /> Register Your Vehicle
                        </Button>
                      </Link>
                    </Magnetic>
                    <Link to="/carshow">
                      <Button size="lg" variant="outline" className="rounded-full border-white/25 text-white hover:bg-white/10 font-semibold gap-2 h-12 px-7 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        Event Details <ArrowRight className="h-4 w-4" />
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.08}>
            <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] text-white shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                  <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Curated · Complimentary · 30 Cars</p>
                  <h3 className="font-heading text-3xl sm:text-4xl font-bold leading-tight mb-4">
                    <span className="text-primary">Exotics</span> at the Foundry
                  </h3>
                  <div className="space-y-2 text-white/75 mb-6">
                    <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary flex-shrink-0" /> {EXOTICS_SHOW.dateLabel} · {EXOTICS_SHOW.hoursLabel}</p>
                    <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> Check in at {EXOTICS_SHOW.meetingSpot} · {EXOTICS_SHOW.arrivalLabel}</p>
                    <p className="flex items-center gap-3"><Heart className="h-4 w-4 text-primary flex-shrink-0" /> Benefiting {EXOTICS_SHOW.beneficiary}</p>
                  </div>
                  <p className="text-white/55 text-sm mb-7">
                    Complimentary, application-based display. A ${EXOTICS_SHOW.suggestedDonation} St. Jude donation is encouraged but never required. Every vehicle is protected by stanchions during the show.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <Link to="/exotics-car-show">
                        <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-7 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                          <Car className="h-5 w-5" /> Apply to Display
                        </Button>
                      </Link>
                    </Magnetic>
                    <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
                      <Button size="lg" variant="outline" className="rounded-full border-white/25 text-white hover:bg-white/10 font-semibold gap-2 h-12 px-7 transition-transform hover:scale-[1.02] active:scale-[0.98]">
                        Donate ${EXOTICS_SHOW.suggestedDonation} <ExternalLink className="h-4 w-4" />
                      </Button>
                    </a>
                  </div>
                </div>
                <div className="relative min-h-[300px] lg:min-h-full order-1 lg:order-2">
                  <div className="duotone-wrap absolute inset-0">
                    <img src={EXOTICS_SHOW.image} alt="Vehicles displayed at City Foundry STL" className="duotone w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,7%)] via-transparent to-transparent lg:bg-gradient-to-l" />
                  <span className="absolute top-5 right-5 inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide rounded-full px-4 py-1.5">
                    <Car className="h-3.5 w-3.5" /> New Event
                  </span>
                </div>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

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

      {/* Partnership pathways */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Partner With Us</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Two ways to build something lasting</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              The July Classics show is our no-cost introduction for potential partners. Paid sponsorship begins with the August Exotics showcase and carries into our late-October all-inclusive show.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Reveal>
              <div className="h-full rounded-3xl border border-border bg-card p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">July · No sponsorship fee</p>
                <h3 className="mt-2 font-heading text-3xl font-bold text-foreground">Potential Sponsor Program</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Experience what a student-led TKE automotive event can deliver before making a paid commitment. Potential sponsors may host a table, display their brand, give away merchandise, or bring registered vehicles. Merchandise may not be sold.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Social-media recognition</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Logo in the rotating website partner showcase</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Complimentary table or giveaway presence</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Vehicles remain subject to the standard $30/$50 per-car registration</li>
                </ul>
                <Link to="/carshow">
                  <Button variant="outline" className="mt-7 rounded-full font-semibold">Explore the July program <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-3xl border border-primary/25 bg-[hsl(0,0%,7%)] p-7 text-white shadow-xl sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary"><Megaphone className="h-6 w-6" /></div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">August + October · Paid</p>
                <h3 className="mt-2 font-heading text-3xl font-bold">Event Sponsorship</h3>
                <p className="mt-4 leading-relaxed text-white/65">
                  One paid sponsorship covers Exotics at the Foundry in August and our all-inclusive car show planned for late October. Sponsors receive promotional rights and recognition across both events while supporting St. Jude.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/65">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> On-site signage and promotional materials</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Social-media recognition across both events</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Logo in the rotating website sponsor showcase</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Sponsor activation coordinated directly with Anthony</li>
                </ul>
                <Link to="/exotics-car-show">
                  <Button className="mt-7 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">View paid sponsorship details <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            </Reveal>
          </div>

          <div className="mt-10 flex flex-wrap justify-center gap-4">
            <a href="mailto:slutkestewardship@gmail.com?subject=TKE%20Car%20Show%20Partnership">
              <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <Mail className="h-4 w-4" /> Discuss a partnership with Anthony
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* Sponsor Showcase */}
      <section className="py-20 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Partner Showcase</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Organizations helping us move the mission forward</h2>
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Active sponsors and potential partners receive rotating website recognition alongside our event social-media coverage.</p>
          </div>
          {sponsors.length > 0 ? (
            <SponsorLogoRail sponsors={sponsors} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="font-heading text-xl font-bold text-foreground">Partner logos will rotate here</p>
              <p className="mt-2 text-sm text-muted-foreground">Contact Anthony to join the July Potential Sponsor program or discuss the paid August-and-October package.</p>
              <a href="mailto:slutkestewardship@gmail.com?subject=TKE%20Car%20Show%20Partnership">
                <Button variant="outline" className="mt-5 rounded-full font-semibold"><Mail className="mr-2 h-4 w-4" /> Become our first featured partner</Button>
              </a>
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
