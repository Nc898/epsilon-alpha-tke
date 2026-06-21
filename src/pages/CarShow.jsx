import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Heart, Car, Flag, CloudRain, ArrowRight,
  Phone, Mail, CalendarPlus, Navigation, Trophy, Users, AlertTriangle, ShieldCheck,
  Download, Camera, Instagram,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import ImageReveal from '../components/ImageReveal';
import { CAR_SHOW, currentPrice, googleCalendarUrl } from '@/lib/carShow';

const VEHICLE_TYPES = [
  'Restored American classics',
  'Vintage cruisers',
  'European imports',
  'Japanese imports',
  'Specialty builds',
  'Unique enthusiast vehicles',
];

const ARRIVAL_STEPS = [
  {
    title: 'Arrive by 10:30 AM',
    body: 'All registered show vehicles must arrive no later than 10:30 AM so staff can stage the field before doors.',
  },
  {
    title: 'Meet at the staging area',
    body: `Before entering the event area, drivers meet ${CAR_SHOW.meetingSpot}. Event staff will organize vehicles here.`,
  },
  {
    title: 'Enter together',
    body: 'All show cars enter the designated display area together once staff give the go-ahead.',
  },
  {
    title: 'Stay until 2:00 PM',
    body: 'For safety and coordination, vehicles remain in the show area until the event concludes and are directed out together. Early departure only in an emergency.',
  },
];

function RegisterButton({ size = 'lg', className = '' }) {
  return (
    <Magnetic>
      <Link to={`/events/${CAR_SHOW.slug}`} className="contents">
        <Button
          size={size}
          className={`group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
        >
          <Car className="h-5 w-5" /> Register Your Vehicle
          <ArrowRight className="h-4 w-4 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </Button>
      </Link>
    </Magnetic>
  );
}

export default function CarShow() {
  const earlyActive = currentPrice() === CAR_SHOW.earlyBirdPrice;

  return (
    <div className="pt-24">
      {/* ── Hero ── */}
      <PageHero
        eyebrow={`TKE for St. Jude · ${CAR_SHOW.dateLabel}`}
        title="Classics & Imports Car Show"
        accent="Car Show"
        watermark="ΤΚΕ"
        spin="stjude"
        lead="Join Tau Kappa Epsilon at Saint Louis University and City Foundry STL for a rain-or-shine car show benefiting St. Jude Children's Research Hospital."
        media={
          <ImageReveal className="rounded-2xl shadow-2xl">
            <div className="duotone-wrap">
              <img
                src="/assets/photos/q17.jpg"
                alt="TKE car show at City Foundry STL"
                className="duotone w-full object-cover aspect-[16/9]"
              />
            </div>
          </ImageReveal>
        }
      >
        <RegisterButton className="h-14 px-10 text-base" />
        <a href={CAR_SHOW.mapsUrl} target="_blank" rel="noopener noreferrer">
          <Button
            size="lg"
            variant="outline"
            className="rounded-full border-white/30 text-white hover:bg-white/10 font-semibold gap-2 h-14 px-8 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
          >
            <Navigation className="h-4 w-4" /> Get Directions
          </Button>
        </a>
      </PageHero>

      {/* ── Quick facts ── */}
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {[
              { icon: Calendar, label: 'Date', value: CAR_SHOW.dateLabel },
              { icon: Clock, label: 'Show Hours', value: CAR_SHOW.hoursLabel },
              { icon: MapPin, label: CAR_SHOW.venue, value: CAR_SHOW.address, href: CAR_SHOW.mapsUrl },
              { icon: Heart, label: 'Benefiting', value: CAR_SHOW.beneficiary },
            ].map((f, i) => {
              const Inner = (
                <>
                  <f.icon className="h-6 w-6 text-primary mb-3" />
                  <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold mb-1">
                    {f.label}
                  </p>
                  <p className="font-heading font-bold text-foreground leading-snug">{f.value}</p>
                </>
              );
              return (
                <Reveal key={i} delay={i * 0.06}>
                  {f.href ? (
                    <a
                      href={f.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block h-full bg-card border border-border rounded-2xl p-6 hover:border-primary/40 hover:shadow-md transition-all"
                    >
                      {Inner}
                    </a>
                  ) : (
                    <div className="h-full bg-card border border-border rounded-2xl p-6">{Inner}</div>
                  )}
                </Reveal>
              );
            })}
          </div>

          <div className="flex flex-wrap justify-center gap-3 mt-8">
            <a href={googleCalendarUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <CalendarPlus className="h-4 w-4" /> Add to Calendar
              </Button>
            </a>
            <a href={CAR_SHOW.mapsUrl} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <Navigation className="h-4 w-4" /> Directions
              </Button>
            </a>
          </div>
        </div>
      </section>

      {/* ── Registration ── */}
      <section id="register" className="py-20 sm:py-28 bg-[hsl(0,0%,7%)] text-white overflow-hidden rounded-[2.5rem] mx-2 sm:mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-16 items-center">
            <Reveal>
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Vehicle Registration</p>
              <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-6 leading-tight">
                Reserve your <span className="text-primary">spot on the field</span>
              </h2>

              {/* Price tiers */}
              <div className="grid grid-cols-2 gap-4 mb-6 max-w-md">
                <div className={`rounded-2xl border p-5 transition-all ${earlyActive ? 'border-primary bg-primary/10 ring-1 ring-primary/40' : 'border-white/15 opacity-60'}`}>
                  <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Early-bird</p>
                  <p className="font-heading text-4xl font-bold mt-1">${CAR_SHOW.earlyBirdPrice}</p>
                  <p className="text-sm text-white/60 mt-1">through {CAR_SHOW.earlyBirdEndsLabel}</p>
                  {earlyActive && <p className="text-[11px] font-bold text-accent uppercase tracking-wide mt-2">Available now</p>}
                </div>
                <div className={`rounded-2xl border p-5 transition-all ${!earlyActive ? 'border-primary bg-primary/10 ring-1 ring-primary/40' : 'border-white/15 opacity-60'}`}>
                  <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Regular</p>
                  <p className="font-heading text-4xl font-bold mt-1">${CAR_SHOW.regularPrice}</p>
                  <p className="text-sm text-white/60 mt-1">from {CAR_SHOW.regularStartsLabel}</p>
                  {!earlyActive && <p className="text-[11px] font-bold text-accent uppercase tracking-wide mt-2">Available now</p>}
                </div>
              </div>

              <ul className="space-y-3 text-white/75 mb-8">
                <li className="flex items-start gap-3">
                  <Users className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Limited to <strong className="text-white">{CAR_SHOW.capacity} show vehicles</strong> — first come, first served. Registration may close early once capacity is reached.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Secure checkout powered by Stripe. A confirmation receipt is emailed instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Registration fees are <strong className="text-white">nonrefundable</strong> due to weather unless the event is officially canceled by the organizers.</span>
                </li>
              </ul>

              <RegisterButton className="h-14 px-10 text-base" />
              <p className="text-xs text-white/45 mt-4">
                Registering charges the {earlyActive ? `$${CAR_SHOW.earlyBirdPrice} early-bird` : `$${CAR_SHOW.regularPrice}`} rate. 100% supports our St. Jude fundraising mission.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative">
                <ImageReveal className="rounded-2xl shadow-2xl">
                  <div className="duotone-wrap">
                    <img
                      src="/assets/photos/p26.jpg"
                      alt="Ferrari beneath the TKE Car Show for St. Jude banner"
                      className="duotone w-full object-cover aspect-[4/5]"
                    />
                  </div>
                </ImageReveal>
                <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground rounded-xl p-5 shadow-xl">
                  <p className="font-heading text-3xl font-bold">50</p>
                  <p className="text-sm font-medium">Show cars max</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Eligible vehicles ── */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <Reveal>
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Who Can Enter</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-5">
              Classics <span className="text-primary">&</span> imports, side by side
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              Whether you own a restored American classic, a vintage cruiser, a European or Japanese
              import, a specialty build, or another unique enthusiast vehicle, you're invited to register
              and display in support of St. Jude.
            </p>
          </Reveal>
          <div className="flex flex-wrap justify-center gap-3 mt-9">
            {VEHICLE_TYPES.map((t, i) => (
              <Reveal key={t} delay={i * 0.05}>
                <span className="inline-flex items-center gap-2 bg-card border border-border rounded-full px-5 py-2.5 text-sm font-medium text-foreground">
                  <Car className="h-4 w-4 text-primary" /> {t}
                </span>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Show-day arrival ── */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Show-Day Arrival</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">How the morning runs</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              A quick rundown so every car gets staged and rolled in together.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {ARRIVAL_STEPS.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full bg-card border border-border rounded-2xl p-6">
                  <span className="font-heading text-4xl font-bold text-primary/25">0{i + 1}</span>
                  <h3 className="font-heading font-bold text-foreground text-lg mt-2 mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Rain or shine ── */}
      <section className="py-16 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal>
            <div className="flex flex-col sm:flex-row items-start gap-5 bg-card border border-border rounded-2xl p-7 sm:p-8">
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0">
                <CloudRain className="h-6 w-6 text-primary" />
              </div>
              <div>
                <h3 className="font-heading font-bold text-foreground text-xl mb-2">Rain or shine</h3>
                <p className="text-muted-foreground leading-relaxed">
                  This is a rain-or-shine car show — the event proceeds regardless of ordinary weather
                  conditions, so participants and attendees should plan accordingly. Registration fees are
                  nonrefundable due to weather unless the event is officially canceled by the organizers.
                </p>
              </div>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Spread the word — flyer ── */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Spread the Word</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground mb-3">Share the flyer</h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Help us pack the lot for the kids — download the flyer and pass it along to friends, family,
              and fellow enthusiasts.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 lg:gap-14 items-center">
            <Reveal>
              <a
                href="/assets/car-show-flyer.png"
                target="_blank"
                rel="noopener noreferrer"
                className="block group"
                aria-label="Open full-size car show flyer"
              >
                <img
                  src="/assets/car-show-flyer-preview.jpg"
                  alt="TKE × City Foundry STL All-Classics & Imports Car Show flyer — Sunday, July 26, 2026, benefiting St. Jude"
                  className="w-full max-w-sm mx-auto rounded-2xl shadow-2xl ring-1 ring-border transition-transform duration-300 group-hover:scale-[1.02]"
                />
              </a>
            </Reveal>

            <Reveal delay={0.1}>
              <div className="space-y-6">
                <a href="/assets/car-show-flyer.png" download="TKE-Car-Show-2026-Flyer.png" className="inline-block">
                  <Magnetic>
                    <Button
                      size="lg"
                      className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-9 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]"
                    >
                      <Download className="h-5 w-5" /> Download Flyer
                    </Button>
                  </Magnetic>
                </a>
                <p className="text-muted-foreground text-sm">
                  High-resolution image — great for printing, texting, or posting on social.
                </p>

                <div className="bg-card border border-border rounded-2xl p-6 sm:p-7">
                  <div className="flex items-center gap-3 mb-2">
                    <Camera className="h-5 w-5 text-primary flex-shrink-0" />
                    <h3 className="font-heading font-bold text-foreground text-lg">Photographers, let&apos;s collaborate</h3>
                  </div>
                  <p className="text-muted-foreground text-sm leading-relaxed">
                    We&apos;d be more than happy to have photographers collaborate with us to capture the
                    show. Reach out through our Instagram to get involved.
                  </p>
                  <a
                    href="https://www.instagram.com/tkeslu_carshow"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 mt-4 font-semibold text-primary hover:underline"
                  >
                    <Instagram className="h-4 w-4" /> @tkeslu_carshow
                  </a>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Potential Sponsor Program ── */}
      <section className="py-20 sm:py-24 bg-[hsl(0,0%,7%)] text-white overflow-hidden rounded-t-[2.5rem]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">A no-cost introduction for local organizations</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold leading-tight">
              Become a <span className="text-primary">Potential Sponsor</span>
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              There is no sponsorship fee for the July Classics &amp; Imports show. This program lets businesses and automotive organizations see what a student-led TKE event can deliver, meet our community, and begin a relationship that can grow into paid sponsorships at future shows.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: Users, title: 'Set up a table', body: 'Create a simple, approved presence where guests can meet your organization and learn what you do.' },
              { icon: Trophy, title: 'Receive recognition', body: 'Potential sponsors receive social-media recognition and logo placement in our rotating philanthropy-page partner showcase.' },
              { icon: Heart, title: 'Give merchandise away', body: 'Branded merchandise, samples, and guest giveaways are welcome. Merchandise may not be sold at this event.' },
              { icon: Car, title: 'Bring display cars', body: `Cars are welcome, but each vehicle must use the standard registration: $${CAR_SHOW.earlyBirdPrice} through ${CAR_SHOW.earlyBirdEndsLabel}, then $${CAR_SHOW.regularPrice} beginning ${CAR_SHOW.regularStartsLabel}.` },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.06}>
                <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-6">
                  <item.icon className="h-6 w-6 text-primary" />
                  <h3 className="mt-4 font-heading text-xl font-bold">{item.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/55">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>

          <div className="mt-8 grid gap-6 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
            <Reveal>
              <div className="rounded-2xl border border-accent/25 bg-accent/10 p-7">
                <h3 className="font-heading text-2xl font-bold">Program rules at a glance</h3>
                <ul className="mt-4 space-y-3 text-sm text-white/70">
                  <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /> Participation and setup must be approved by Anthony before show day.</li>
                  <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /> Free merchandise and giveaways are permitted; selling merchandise is not.</li>
                  <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /> Every display vehicle requires its own paid registration, including vehicles brought by a Potential Sponsor.</li>
                  <li className="flex gap-3"><ShieldCheck className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /> This July program is separate from the paid August-and-October sponsorship package.</li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <p className="text-xs uppercase tracking-widest text-white/50 font-semibold">Start the conversation</p>
                <p className="mt-3 font-heading text-2xl font-bold">{CAR_SHOW.contactName}</p>
                <p className="text-white/55 text-sm">Car Show Organizer</p>
                <a href={CAR_SHOW.contactPhoneHref} className="mt-5 flex items-center gap-3 text-white/85 hover:text-primary transition-colors">
                  <Phone className="h-5 w-5 text-primary" /> {CAR_SHOW.contactPhone}
                </a>
                <a href={`mailto:${CAR_SHOW.contactEmail}?subject=Classics%20Car%20Show%20Potential%20Sponsor`} className="mt-3 flex items-center gap-3 break-all text-white/85 hover:text-primary transition-colors">
                  <Mail className="h-5 w-5 flex-shrink-0 text-primary" /> {CAR_SHOW.contactEmail}
                </a>
                <a href={`mailto:${CAR_SHOW.contactEmail}?subject=Classics%20Car%20Show%20Potential%20Sponsor`}>
                  <Button size="lg" className="mt-6 w-full rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">
                    Contact Anthony to participate
                  </Button>
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-[hsl(0,0%,7%)] text-white text-center">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Reveal>
            <Flag className="h-9 w-9 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">Ready to roll in?</h2>
            <p className="text-white/65 mb-8">
              {CAR_SHOW.capacity} spots, first come first served. Lock in the {earlyActive ? `$${CAR_SHOW.earlyBirdPrice} early-bird rate before ${CAR_SHOW.earlyBirdEndsLabel}` : 'regular rate'}.
            </p>
            <RegisterButton className="h-14 px-10 text-base" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
