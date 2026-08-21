import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import FundraisingTracker from '../components/FundraisingTracker';
import SponsorLogoRail from '../components/SponsorLogoRail';
import PageHero from '../components/PageHero';
import Marquee from '../components/Marquee';
import Magnetic from '../components/Magnetic';
import { Button } from '@/components/ui/button';
import Reveal from '../components/Reveal';
// `Handshake` and `CAR_SHOW` are only used by the HIDDEN July 26 blocks below —
// restore both imports when restoring those blocks (archived 2026-07-30).
import { Heart, Mail, Phone, ExternalLink, Car, Calendar, MapPin, ArrowRight, CheckCircle2, Megaphone, Download } from 'lucide-react';
import { Link } from 'react-router-dom';
import { FEATURED_SPONSORS } from '@/lib/sponsors';
import {
  ST_JUDE_URL, ST_JUDE_TAX_URL, FUNDRAISING_YEAR, LAST_YEAR,
  ST_JUDE_CONTACT, CHAPTER_ST_JUDE_CONTACT,
} from '@/lib/stjude';
import { HALLOWEEN_SHOW } from '@/lib/halloweenShow';

export default function Philanthropy() {
  const { data: remoteSponsors = [] } = useQuery({
    queryKey: ['sponsors'],
    queryFn: () => base44.entities.Sponsor.filter({ active: true }),
  });
  // Featured (static) sponsors always show; any live Base44 sponsors follow.
  const sponsors = [...FEATURED_SPONSORS, ...remoteSponsors];

  const { data: statsArr = [] } = useQuery({
    queryKey: ['fundraising-stats'],
    queryFn: () => base44.entities.FundraisingStats.list(),
    staleTime: 1000 * 60 * 30,
  });

  const fStats = statsArr[0];
  // The 2025–2026 fundraising year is complete — its final total renders as a
  // recap further down. The active year (FUNDRAISING_YEAR) and current donate
  // link come from src/lib/stjude.js.
  const YEAR_LABEL = LAST_YEAR.label;
  const raised = LAST_YEAR.raised;

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
        {/* ── HIDDEN — July 26 car show archived 2026-07-30. Restore with the
            App.jsx HIDDEN block.
        <Link to="/carshow">
          <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-8 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <Car className="h-5 w-5" /> Register for the Car Show
          </Button>
        </Link>
        ── */}
        <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-8 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
            <ExternalLink className="h-4 w-4" /> View Our Fundraising Page
          </Button>
        </a>
      </PageHero>

      {/* Live stats marquee */}
      <Marquee
        phrases={[
          `$${raised.toLocaleString()} raised in ${YEAR_LABEL}`,
          `Now fundraising: ${FUNDRAISING_YEAR}`,
          `${fStats?.donor_count ?? 42} donors strong`,
          'Fighting childhood cancer',
          'TKE × St. Jude',
        ]}
      />

      {/* ── Current fundraising year (2026–2027) ── */}
      <section className="py-16 sm:py-20 bg-[hsl(0,0%,7%)] text-white overflow-hidden rounded-[2.5rem] mx-2 sm:mx-4 mt-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-[1.2fr_0.8fr] gap-10 lg:gap-14 items-center">
            <Reveal>
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Now Fundraising</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold leading-tight mb-5">
                The <span className="text-primary">{FUNDRAISING_YEAR}</span> fundraising year is underway
              </h2>
              <p className="text-white/70 leading-relaxed mb-4">
                Our {LAST_YEAR.label} campaign is in the books — we&apos;re now raising for the {FUNDRAISING_YEAR} year.
                Every gift goes directly to St. Jude Children&apos;s Research Hospital through our official
                fundraising page.
              </p>
              <p className="text-white/70 leading-relaxed mb-8">
                Donations are{' '}
                <a href={ST_JUDE_TAX_URL} target="_blank" rel="noopener noreferrer" className="font-semibold text-white underline decoration-primary/60 underline-offset-4 hover:decoration-primary">
                  tax deductible
                </a>{' '}
                since they go directly to St. Jude — and when you include your address and details with your
                donation, St. Jude will mail you an acknowledgment letter for your records.
              </p>
              <Magnetic>
                <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
                  <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-10 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                    <Heart className="h-5 w-5" /> Donate to the {FUNDRAISING_YEAR} Campaign
                  </Button>
                </a>
              </Magnetic>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Questions? Start here</p>
                <p className="mt-3 font-heading text-2xl font-bold">{CHAPTER_ST_JUDE_CONTACT.name}</p>
                <p className="text-white/55 text-sm">Chapter contact — please reach out to Anthony first</p>
                <a href={CHAPTER_ST_JUDE_CONTACT.phoneHref} className="mt-4 flex items-center gap-3 text-white/85 hover:text-primary transition-colors">
                  <Phone className="h-5 w-5 text-primary" /> {CHAPTER_ST_JUDE_CONTACT.phone} <span className="text-white/45 text-xs">call / text</span>
                </a>
                <a href={`mailto:${CHAPTER_ST_JUDE_CONTACT.email}`} className="mt-2 flex items-center gap-3 break-all text-white/85 hover:text-primary transition-colors">
                  <Mail className="h-5 w-5 flex-shrink-0 text-primary" /> {CHAPTER_ST_JUDE_CONTACT.email}
                </a>
                <div className="mt-6 border-t border-white/10 pt-5">
                  <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Our St. Jude contact this year</p>
                  <p className="mt-2 font-semibold text-white">{ST_JUDE_CONTACT.name}</p>
                  <p className="text-white/55 text-sm">{ST_JUDE_CONTACT.office}</p>
                  <a href={`mailto:${ST_JUDE_CONTACT.email}`} className="mt-1 inline-flex items-center gap-2 break-all text-sm text-white/75 hover:text-primary transition-colors">
                    <Mail className="h-4 w-4 flex-shrink-0 text-primary" /> {ST_JUDE_CONTACT.email}
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* Featured Events */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mb-10 text-center">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Upcoming Fundraisers</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Two shows. One mission.</h2>
            <p className="mt-3 text-muted-foreground">A full season of automotive events benefiting St. Jude Children&apos;s Research Hospital.</p>
          </Reveal>
          {/* ── HIDDEN — the whole July 26 "Featured Event" promo card, archived
              2026-07-30 (event has passed). Restore this Reveal block together
              with the App.jsx HIDDEN block. The card that follows is now the
              October Halloween show (it replaced the cancelled Sept 4 exotics
              card) — leave it alone.
          <Reveal>
            <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] text-white shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="relative min-h-[260px] lg:min-h-full">
                  <div className="duotone-wrap absolute inset-0">
                    <img src="/assets/photos/p26.webp" alt="TKE Car Show for St. Jude"
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
                    All-Classics &amp; Imports <span className="text-primary">Car Show</span>
                  </h3>
                  <div className="space-y-2 text-white/75 mb-6">
                    <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary flex-shrink-0" /> {CAR_SHOW.dateLabel} · {CAR_SHOW.hoursLabel}</p>
                    <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> {CAR_SHOW.venue}</p>
                    <p className="flex items-center gap-3"><Heart className="h-4 w-4 text-primary flex-shrink-0" /> Benefiting {CAR_SHOW.beneficiary}</p>
                  </div>
                  <p className="text-white/55 text-sm mb-7">
                    ${CAR_SHOW.price} per vehicle through July 26 · no price increase · limited to {CAR_SHOW.capacity} vehicles, first come first served.
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
          ── END HIDDEN July 26 card ── */}

          {/* Was the Sept 4 "Friday Night Lights" exotics card — that show was
              CANCELLED 2026-07-30. Replaced with the October 25 Halloween show
              so this section still has the season's live event (the July card
              above is hidden). */}
          <Reveal delay={0.08}>
            <div className="relative mt-8 overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] text-white shadow-2xl">
              <div className="grid grid-cols-1 lg:grid-cols-2">
                <div className="p-8 sm:p-10 lg:p-12 flex flex-col justify-center order-2 lg:order-1">
                  <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">{HALLOWEEN_SHOW.presenter}</p>
                  <h3 className="font-heading text-3xl sm:text-4xl font-bold leading-tight mb-4">
                    <span className="text-primary">Halloween</span> Car Show
                  </h3>
                  <div className="space-y-2 text-white/75 mb-6">
                    <p className="flex items-center gap-3"><Calendar className="h-4 w-4 text-primary flex-shrink-0" /> {HALLOWEEN_SHOW.dateLabel} · {HALLOWEEN_SHOW.hoursLabel}</p>
                    <p className="flex items-center gap-3"><MapPin className="h-4 w-4 text-primary flex-shrink-0" /> {HALLOWEEN_SHOW.venue}</p>
                    <p className="flex items-center gap-3"><Heart className="h-4 w-4 text-primary flex-shrink-0" /> Benefiting {HALLOWEEN_SHOW.beneficiary}</p>
                  </div>
                  <p className="text-white/55 text-sm mb-7">
                    ${HALLOWEEN_SHOW.price} per vehicle. Sponsor vehicles load in at {HALLOWEEN_SHOW.sponsorLoadInLabel}, general registrations at {HALLOWEEN_SHOW.generalLoadInLabel}. Car clubs and sponsors can request a custom registration link.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Magnetic>
                      <Link to={`/events/${HALLOWEEN_SHOW.slug}`}>
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
                <div className="relative min-h-[300px] lg:min-h-full order-1 lg:order-2">
                  <div className="duotone-wrap absolute inset-0">
                    <img src="/assets/photos/q34.webp" alt="TKE brothers among the show cars" className="duotone w-full h-full object-cover" />
                  </div>
                  <div className="absolute inset-0 bg-gradient-to-t from-[hsl(0,0%,7%)] via-transparent to-transparent lg:bg-gradient-to-l" />
                  <span className="absolute top-5 right-5 inline-flex items-center gap-2 bg-primary text-primary-foreground text-xs font-bold uppercase tracking-wide rounded-full px-4 py-1.5">
                    <Car className="h-3.5 w-3.5" /> Next Event
                  </span>
                </div>
              </div>
            </div>
          </Reveal>

          <Reveal delay={0.12}>
            <div className="relative mt-8 overflow-hidden rounded-[2rem] border border-border bg-card p-8 shadow-xl sm:p-10 lg:p-12">
              <span aria-hidden="true" className="absolute -right-4 -top-10 font-heading text-[10rem] font-bold leading-none text-primary/5">10</span>
              <div className="relative max-w-3xl">
                <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Show #3 · Details Coming Soon</p>
                <h3 className="font-heading text-3xl sm:text-4xl font-bold text-foreground leading-tight">
                  Halloween <span className="text-primary">Car Show</span>
                </h3>
                <p className="mt-4 max-w-2xl text-muted-foreground leading-relaxed">
                  Our third charity car show will arrive this Halloween season. Date, time, location, vehicle categories, and registration details will be announced soon.
                </p>
                <p className="mt-5 inline-flex items-center gap-2 text-sm font-semibold text-foreground">
                  <Heart className="h-4 w-4 text-primary" /> Benefiting St. Jude Children&apos;s Research Hospital
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* 2025–2026 recap — completed year. All figures kept for the record;
          the ONLY donate link on this page is the current-year one above. */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">{YEAR_LABEL} Recap</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Last year&apos;s impact</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Our final {YEAR_LABEL} total raised for St. Jude Children&apos;s Research Hospital.
              Thank you to everyone who gave — the {FUNDRAISING_YEAR} campaign is now underway above.
            </p>
          </Reveal>
          <div className="flex justify-center">
            <FundraisingTracker raised={raised} goal={0} periodLabel={YEAR_LABEL} />
          </div>
        </div>
      </section>

      {/* Partnership pathways */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Partner With Us</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-4">Participation recognition or Official Sponsorship</h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              Every registered July vehicle owner is recognized as a Participating Event Sponsor/Supporter. Official Sponsors receive expanded visibility across both shows.
            </p>
          </Reveal>

          {/* Grid was lg:grid-cols-2; the July "Participating Supporter" card
              below is hidden (archived 2026-07-30), so the remaining Official
              Sponsorship card centers instead of sitting in a half-width
              column. Restore both together. */}
          <div className="grid grid-cols-1 gap-6 max-w-2xl mx-auto">
            {/* ── HIDDEN — July 26 registration tier card, archived 2026-07-30.
                Restore with the App.jsx HIDDEN block (and put back
                `lg:grid-cols-2` above).
            <Reveal>
              <div className="h-full rounded-3xl border border-border bg-card p-7 sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary"><Handshake className="h-6 w-6" /></div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-primary">Included with July vehicle registration</p>
                <h3 className="mt-2 font-heading text-3xl font-bold text-foreground">Participating Event Sponsor/Supporter</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Vehicle owners make the July show possible. Every registered owner receives recognition as a participating supporter of the event and its St. Jude mission.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-muted-foreground">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Included with the standard ${CAR_SHOW.price} vehicle registration</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Recognition as a July event participant and supporter</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Helps showcase what a student-led charity event can accomplish</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Promotional rights require separate Official Sponsor approval</li>
                </ul>
                <Link to="/carshow">
                  <Button variant="outline" className="mt-7 rounded-full font-semibold">Explore the July program <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </Link>
              </div>
            </Reveal>
            ── END HIDDEN July tier card ── */}

            <Reveal delay={0.08}>
              <div className="h-full rounded-3xl border border-primary/25 bg-[hsl(0,0%,7%)] p-7 text-white shadow-xl sm:p-9">
                <div className="flex h-12 w-12 items-center justify-center rounded-full bg-primary/15 text-primary"><Megaphone className="h-6 w-6" /></div>
                <p className="mt-6 text-xs font-bold uppercase tracking-[0.2em] text-accent">Both shows · Official</p>
                <h3 className="mt-2 font-heading text-3xl font-bold">Official Car Show Sponsorship</h3>
                <p className="mt-4 leading-relaxed text-white/65">
                  One Official Sponsorship provides recognition across both 2026 shows — the July All-Classics &amp; Imports show and the Halloween Car Show at Neiman Marcus in October.
                </p>
                <ul className="mt-6 space-y-3 text-sm text-white/65">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> On-site signage and promotional materials</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Social-media recognition across both events</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Logo in the rotating website sponsor showcase</li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-4 w-4 flex-shrink-0 text-primary" /> Sponsor activation coordinated directly with Anthony</li>
                </ul>
                {/* Was /exotics-car-show (cancelled 2026-07-30) — repointed to
                    the live October show's page. */}
                <Link to="/carshow">
                  <Button className="mt-7 rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">View sponsorship details <ArrowRight className="ml-2 h-4 w-4" /></Button>
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
            <a href="/assets/docs/tke-sponsorship-packet.pdf" download target="_blank" rel="noopener noreferrer">
              <Button size="lg" variant="outline" className="font-semibold gap-2">
                <Download className="h-4 w-4" /> Download the sponsorship packet
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
            <p className="mx-auto mt-3 max-w-2xl text-muted-foreground">Official Car Show Sponsors receive rotating website recognition alongside their dedicated social-media spotlight.</p>
          </div>
          {sponsors.length > 0 ? (
            <SponsorLogoRail sponsors={sponsors} />
          ) : (
            <div className="mx-auto max-w-2xl rounded-2xl border border-dashed border-border bg-card p-8 text-center">
              <p className="font-heading text-xl font-bold text-foreground">Partner logos will rotate here</p>
              <p className="mt-2 text-sm text-muted-foreground">Contact Anthony to request the Official Car Show Sponsorship packet and discuss recognition across the three-show series.</p>
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
