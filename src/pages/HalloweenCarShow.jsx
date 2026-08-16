import { Link } from 'react-router-dom';
import {
  Calendar, Clock, MapPin, Heart, Car, Flag, ArrowRight,
  Phone, Mail, CalendarPlus, Navigation, Users, ShieldCheck, AlertTriangle,
  Link2, BadgePercent, Instagram, Ghost,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import ImageReveal from '../components/ImageReveal';
import { HALLOWEEN_SHOW, halloweenCalendarUrl } from '@/lib/halloweenShow';

const SCHEDULE = [
  {
    time: HALLOWEEN_SHOW.sponsorLoadInLabel,
    title: 'Sponsor load-in',
    body: 'Sponsor vehicles arrive first and are staged before the general field so sponsor displays anchor the show.',
  },
  {
    time: HALLOWEEN_SHOW.generalLoadInLabel,
    title: 'General load-in',
    body: 'All other registered vehicles arrive and are directed into the display area by event staff.',
  },
  {
    time: HALLOWEEN_SHOW.startLabel,
    title: 'Show begins',
    body: 'The event officially opens to spectators. Vehicles remain in the show area until the event concludes.',
  },
];

function RegisterButton({ className = '' }) {
  return (
    <Magnetic>
      <Link to={`/events/${HALLOWEEN_SHOW.slug}`} className="contents">
        <Button
          size="lg"
          className={`group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98] ${className}`}
        >
          <Car className="h-5 w-5" /> Register Your Vehicle
          <ArrowRight className="h-4 w-4 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
        </Button>
      </Link>
    </Magnetic>
  );
}

export default function HalloweenCarShow() {
  const mailtoCustomLink = `mailto:${HALLOWEEN_SHOW.contactEmail}?subject=${encodeURIComponent(
    'Custom Registration Link — Halloween Car Show'
  )}&body=${encodeURIComponent(
    'Hi Anthony,\n\nWe would like a custom registration link for the Halloween Car Show at Neiman Marcus on October 25.\n\nOrganization / club / business name:\nContact person:\nAre you an event sponsor? (yes/no):\n\nThanks!'
  )}`;

  return (
    <div className="pt-24">
      {/* ── Hero ── */}
      <PageHero
        eyebrow={`TKE for St. Jude · ${HALLOWEEN_SHOW.dateLabel}`}
        title="Halloween Car Show at Neiman Marcus"
        accent="Halloween Car Show"
        watermark="ΤΚΕ"
        spin="stjude"
        lead="Tau Kappa Epsilon at Saint Louis University brings the 2026 series home for Halloween — classics, imports, and exotics on display at Neiman Marcus, Plaza Frontenac, benefiting St. Jude Children's Research Hospital."
        media={
          <ImageReveal className="rounded-2xl shadow-2xl">
            <div className="duotone-wrap">
              <img
                src="/assets/photos/q16.webp"
                alt="Show cars on display at a TKE charity car show"
                className="duotone w-full object-cover aspect-[16/9]"
              />
            </div>
          </ImageReveal>
        }
      >
        <RegisterButton className="h-14 px-10 text-base" />
        <a href={HALLOWEEN_SHOW.mapsUrl} target="_blank" rel="noopener noreferrer">
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
              { icon: Calendar, label: 'Date', value: HALLOWEEN_SHOW.dateLabel },
              { icon: Clock, label: 'Show Hours', value: HALLOWEEN_SHOW.hoursLabel },
              { icon: MapPin, label: HALLOWEEN_SHOW.venue, value: HALLOWEEN_SHOW.address, href: HALLOWEEN_SHOW.mapsUrl },
              { icon: Heart, label: 'Benefiting', value: HALLOWEEN_SHOW.beneficiary },
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
            <a href={halloweenCalendarUrl()} target="_blank" rel="noopener noreferrer">
              <Button variant="ghost" size="sm" className="gap-2 text-muted-foreground hover:text-foreground">
                <CalendarPlus className="h-4 w-4" /> Add to Calendar
              </Button>
            </a>
            <a href={HALLOWEEN_SHOW.mapsUrl} target="_blank" rel="noopener noreferrer">
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
                Bring your car to the <span className="text-primary">Halloween showcase</span>
              </h2>

              <div className="mb-6 max-w-md rounded-2xl border border-primary bg-primary/10 p-5 ring-1 ring-primary/40">
                <p className="text-xs uppercase tracking-widest text-white/60 font-semibold">Flat vehicle entry</p>
                <p className="font-heading text-4xl font-bold mt-1">${HALLOWEEN_SHOW.price}</p>
                <p className="text-sm text-white/60 mt-1">per vehicle through the day of the event</p>
              </div>

              <ul className="space-y-3 text-white/75 mb-8">
                <li className="flex items-start gap-3">
                  <Clock className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>
                    Sponsor vehicles load in at <strong className="text-white">{HALLOWEEN_SHOW.sponsorLoadInLabel}</strong>, general
                    registrations at <strong className="text-white">{HALLOWEEN_SHOW.generalLoadInLabel}</strong> — the show begins
                    at <strong className="text-white">{HALLOWEEN_SHOW.startLabel}</strong>.
                  </span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Secure checkout powered by Stripe. A confirmation receipt is emailed instantly.</span>
                </li>
                <li className="flex items-start gap-3">
                  <ShieldCheck className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span><strong className="text-white">Transparency:</strong> TKE is insured for this event.</span>
                </li>
                <li className="flex items-start gap-3">
                  <AlertTriangle className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                  <span>Registration fees are <strong className="text-white">nonrefundable</strong> due to weather unless the event is officially canceled by the organizers.</span>
                </li>
              </ul>

              <RegisterButton className="h-14 px-10 text-base" />
              <p className="text-xs text-white/45 mt-4">
                Registration is ${HALLOWEEN_SHOW.price} per vehicle through October 25. 100% supports our St. Jude fundraising mission.
              </p>
            </Reveal>

            <Reveal delay={0.12}>
              <div className="relative">
                <ImageReveal className="rounded-2xl shadow-2xl">
                  <div className="duotone-wrap">
                    <img
                      src="/assets/photos/p26.webp"
                      alt="Show car beneath the TKE Car Show for St. Jude banner"
                      className="duotone w-full object-cover aspect-[4/5]"
                    />
                  </div>
                </ImageReveal>
                <div className="absolute -bottom-6 -left-6 bg-accent text-accent-foreground rounded-xl p-5 shadow-xl">
                  <Ghost className="h-6 w-6 mb-1" />
                  <p className="text-sm font-medium">Halloween showcase</p>
                </div>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Show-day schedule ── */}
      <section className="py-20 sm:py-24 bg-muted/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Show-Day Schedule</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">How the morning runs</h2>
            <p className="text-muted-foreground mt-3 max-w-xl mx-auto">
              Load-in is staggered so every vehicle is staged before spectators arrive.
            </p>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 max-w-5xl mx-auto">
            {SCHEDULE.map((s, i) => (
              <Reveal key={i} delay={i * 0.08}>
                <div className="h-full bg-card border border-border rounded-2xl p-6">
                  <span className="font-heading text-3xl font-bold text-primary">{s.time}</span>
                  <h3 className="font-heading font-bold text-foreground text-lg mt-2 mb-2">{s.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{s.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Custom registration links for clubs & sponsors ── */}
      <section className="py-20 sm:py-28 bg-[hsl(0,0%,7%)] text-white overflow-hidden rounded-[2.5rem] mx-2 sm:mx-4">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto max-w-3xl text-center">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Clubs &amp; Sponsors</p>
            <h2 className="font-heading text-3xl sm:text-5xl font-bold leading-tight">
              Invite your people with a <span className="text-primary">custom registration link</span>
            </h2>
            <p className="mt-5 text-white/70 leading-relaxed">
              Car clubs and event sponsors can request a personal registration link — a branded page at
              tkeslu.org/carshow/register/your-name — to invite their customer base and members to the show.
              Every registration through your link is tracked to you.
            </p>
          </Reveal>

          <div className="mt-12 grid gap-6 lg:grid-cols-2 max-w-4xl mx-auto">
            <Reveal>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.04] p-7">
                <Link2 className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-heading text-xl font-bold">Car clubs</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/55">
                  Get a link for your club, share it with members, and roll in together. Same $
                  {HALLOWEEN_SHOW.price} entry, same Stripe checkout — your club is credited for every
                  car it brings.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.06}>
              <div className="h-full rounded-2xl border border-accent/25 bg-accent/10 p-7">
                <BadgePercent className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-heading text-xl font-bold">Sponsors: earn $30 off per car</h3>
                <p className="mt-2 text-sm leading-relaxed text-white/70">
                  For event sponsors the link does double duty: on request, every vehicle registered through
                  your link discounts your sponsorship total for the event by{' '}
                  <strong className="text-white">${HALLOWEEN_SHOW.sponsorDiscountPerCar}</strong>. Bring four
                  cars and that&apos;s a <strong className="text-white">$120 discount</strong> — the more of
                  your customer base you invite, the less your sponsorship costs.
                </p>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-10 text-center">
              <a href={mailtoCustomLink}>
                <Button size="lg" className="rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-14 px-9 text-base transition-transform hover:scale-[1.02] active:scale-[0.98]">
                  <Mail className="h-5 w-5" /> Request a Custom Link
                </Button>
              </a>
              <p className="text-xs text-white/45 mt-4">
                Or reach out on Instagram{' '}
                <a
                  href={HALLOWEEN_SHOW.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-1 font-semibold text-primary hover:underline"
                >
                  <Instagram className="h-3.5 w-3.5" /> {HALLOWEEN_SHOW.instagramHandle}
                </a>
              </p>
            </div>
          </Reveal>
        </div>
      </section>

      {/* ── Contact / sponsorship ── */}
      <section className="py-20 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid gap-6 sm:grid-cols-2 items-stretch">
            <Reveal>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <Users className="h-6 w-6 text-primary" />
                <h3 className="mt-4 font-heading text-xl font-bold text-foreground">Become an Official Sponsor</h3>
                <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                  Official Car Show Sponsors receive recognition at the event, plus a spotlight on{' '}
                  {HALLOWEEN_SHOW.instagramHandle} and the TKE website. Ask Anthony for the sponsorship packet.
                </p>
              </div>
            </Reveal>
            <Reveal delay={0.08}>
              <div className="h-full rounded-2xl border border-border bg-card p-7">
                <p className="text-xs uppercase tracking-widest text-muted-foreground font-semibold">Contact</p>
                <p className="mt-3 font-heading text-2xl font-bold text-foreground">{HALLOWEEN_SHOW.contactName}</p>
                <p className="text-muted-foreground text-sm">Car Show Organizer</p>
                <a href={HALLOWEEN_SHOW.contactPhoneHref} className="mt-4 flex items-center gap-3 text-foreground hover:text-primary transition-colors">
                  <Phone className="h-5 w-5 text-primary" /> {HALLOWEEN_SHOW.contactPhone}
                </a>
                <a href={`mailto:${HALLOWEEN_SHOW.contactEmail}`} className="mt-2 flex items-center gap-3 break-all text-foreground hover:text-primary transition-colors">
                  <Mail className="h-5 w-5 flex-shrink-0 text-primary" /> {HALLOWEEN_SHOW.contactEmail}
                </a>
              </div>
            </Reveal>
          </div>
        </div>
      </section>

      {/* ── Final CTA ── */}
      <section className="py-20 bg-[hsl(0,0%,7%)] text-white text-center rounded-t-[2.5rem]">
        <div className="max-w-2xl mx-auto px-4 sm:px-6">
          <Reveal>
            <Flag className="h-9 w-9 text-primary mx-auto mb-4" />
            <h2 className="font-heading text-3xl sm:text-4xl font-bold mb-4">Ready to roll in?</h2>
            <p className="text-white/65 mb-8">
              ${HALLOWEEN_SHOW.price} per vehicle · {HALLOWEEN_SHOW.dateLabel} · benefiting St. Jude.
            </p>
            <RegisterButton className="h-14 px-10 text-base" />
          </Reveal>
        </div>
      </section>
    </div>
  );
}
