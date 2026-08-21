import { useEffect, useRef, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { motion } from 'framer-motion';
import confetti from 'canvas-confetti';
import {
  Calendar, Clock, MapPin, CloudRain, Ticket, Loader2,
  CheckCircle2, X, AlertTriangle, Users, Heart,
} from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { registrationSchema } from '@/lib/registrationSchema';
import { entryCentsNow, isEarlyBird } from '@/lib/eventPricing';
import { CAR_SHOW } from '@/lib/carShow';
import { HALLOWEEN_SHOW } from '@/lib/halloweenShow';

// Static per-show config, keyed by event slug — drives the dev mock, the
// hosted-payment-link fallback, and the show-specific "good to know" strip.
const SHOW_CONFIGS = {
  [CAR_SHOW.slug]: CAR_SHOW,
  [HALLOWEEN_SHOW.slug]: HALLOWEEN_SHOW,
};
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { ST_JUDE_URL } from '@/lib/stjude';

const CAR_CLASSES = ['classic', 'exotic', 'performance', 'other'];
// At or below this many remaining spots, show the true count for real urgency;
// above it, the exact number is hidden (a high "spots left" count reads as an
// empty event and discourages registration).
const LOW_SPOTS = 12;

function formatEventDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' });
}

function formatRainDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(`${dateStr}T00:00:00`);
  return d.toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });
}

function fadeUp(delay = 0) {
  return {
    initial: { opacity: 0, y: 20 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.5, delay, ease: 'easeOut' },
  };
}

function StatusCard({ icon, title, children }) {
  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-xl mx-auto px-4 sm:px-6">
        <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-xl p-8 sm:p-10 text-center shadow-sm">
          <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
            {icon}
          </div>
          <h2 className="font-heading text-2xl font-bold text-foreground mb-3">{title}</h2>
          {children}
        </motion.div>
      </div>
    </section>
  );
}

function FieldError({ error }) {
  if (!error) return null;
  return <p className="text-destructive text-xs mt-1">{error.message}</p>;
}

function VehicleSpinViewer({ feature }) {
  const frames = feature.spinFrames?.length ? feature.spinFrames : [feature.image];
  const [frame, setFrame] = useState(frames.length - 1);
  const [dragging, setDragging] = useState(false);
  const dragStart = useRef(null);

  useEffect(() => {
    frames.forEach((src) => {
      const image = new window.Image();
      image.src = src;
    });
  }, [frames]);

  const rotate = (steps) => {
    setFrame((current) => (current + steps + frames.length) % frames.length);
  };

  const onPointerDown = (event) => {
    event.currentTarget.setPointerCapture(event.pointerId);
    dragStart.current = { x: event.clientX, frame };
    setDragging(true);
  };

  const onPointerMove = (event) => {
    if (!dragStart.current) return;
    const steps = Math.trunc((event.clientX - dragStart.current.x) / 36);
    setFrame((dragStart.current.frame - steps + frames.length * 10) % frames.length);
  };

  const finishDrag = (event) => {
    if (dragStart.current && event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    dragStart.current = null;
    setDragging(false);
  };

  const onKeyDown = (event) => {
    if (event.key === 'ArrowLeft') {
      event.preventDefault();
      rotate(-1);
    }
    if (event.key === 'ArrowRight') {
      event.preventDefault();
      rotate(1);
    }
  };

  const angleLabel = feature.spinLabels?.[frame] ?? `View ${frame + 1}`;

  return (
    <div className="relative z-10 w-full">
      <div
        role="group"
        aria-label="Interactive 360-degree vehicle view. Drag horizontally or use the arrow keys to rotate."
        tabIndex={0}
        onPointerDown={onPointerDown}
        onPointerMove={onPointerMove}
        onPointerUp={finishDrag}
        onPointerCancel={finishDrag}
        onKeyDown={onKeyDown}
        className={`relative mx-auto flex h-[260px] w-full max-w-[720px] touch-pan-y select-none items-center justify-center outline-none sm:h-[360px] ${
          dragging ? 'cursor-grabbing' : 'cursor-grab'
        } focus-visible:ring-2 focus-visible:ring-accent/70 focus-visible:ring-offset-4 focus-visible:ring-offset-black`}
      >
        <img
          src={frames[frame]}
          alt={`${feature.alt} — ${angleLabel}`}
          draggable="false"
          decoding="async"
          className="pointer-events-none h-full w-full object-contain drop-shadow-[0_24px_24px_rgba(0,0,0,0.58)]"
        />
        <div aria-hidden="true" className="pointer-events-none absolute inset-x-[12%] bottom-[12%] h-8 rounded-full bg-black/35 blur-xl" />
      </div>

      <div className="mt-1 flex items-center justify-center gap-3">
        <button
          type="button"
          onClick={() => rotate(-1)}
          aria-label="Rotate vehicle left"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl text-white/80 transition hover:border-accent/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          ‹
        </button>
        <div className="min-w-36 text-center">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-white/45">Drag to rotate · 360°</p>
          <p aria-live="polite" className="mt-0.5 text-xs font-semibold text-accent/85">{angleLabel}</p>
        </div>
        <button
          type="button"
          onClick={() => rotate(1)}
          aria-label="Rotate vehicle right"
          className="flex h-10 w-10 items-center justify-center rounded-full border border-white/15 bg-white/[0.06] text-xl text-white/80 transition hover:border-accent/50 hover:bg-white/10 hover:text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
        >
          ›
        </button>
      </div>
    </div>
  );
}

// Sponsor logo(s) shown in the dark hero of a sponsor registration page. The
// logos sit on a soft white halo that dissolves into the dark background (so
// the dark-artwork logos stay readable without a hard white box), and multiple
// brands cross-fade as a gentle rolling slideshow (first logo first). Purely a
// courtesy display — it never implies the sponsor runs the event.
function SponsorLogosHero({ logos, name, display = 'standard', features = [] }) {
  const [i, setI] = useState(0);
  const immersive = display === 'immersive';
  useEffect(() => {
    if (logos.length < 2) return undefined;
    const id = setInterval(() => setI((n) => (n + 1) % logos.length), 3200);
    return () => clearInterval(id);
  }, [logos.length]);
  if (!logos.length) return null;

  if (features.length) {
    const multi = features.length > 1;
    return (
      <div className="mt-10 flex flex-col items-center">
        <p className="mb-4 text-[11px] uppercase tracking-[0.25em] text-white/40">
          Community registration partner
        </p>
        <div className="relative isolate flex w-full max-w-5xl flex-col items-center overflow-visible px-2 pb-2 pt-1 [perspective:1200px]">
          <div
            aria-hidden="true"
            className="absolute left-1/2 top-[46%] -z-10 h-44 w-[92%] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[radial-gradient(ellipse_at_center,rgba(109,119,57,0.28),rgba(21,23,18,0.08)_48%,transparent_72%)] blur-xl"
          />
          <motion.img
            src={logos[0]}
            alt={`${name} logo`}
            loading="lazy"
            decoding="async"
            className={`relative z-20 h-auto w-44 object-contain drop-shadow-[0_8px_18px_rgba(0,0,0,0.6)] sm:w-52 ${multi ? 'mb-1' : 'mb-[-1.25rem]'}`}
            initial={false}
            animate={{ y: [0, -3, 0] }}
            transition={{ duration: 4.8, repeat: Infinity, ease: 'easeInOut' }}
          />
          <div className={`grid w-full gap-x-4 gap-y-8 ${multi ? 'md:grid-cols-2' : 'grid-cols-1'}`}>
            {features.map((f) => (
              <div key={f.title} className="flex flex-col items-center">
                <VehicleSpinViewer feature={f} />
                <div className="relative z-20 mt-4 rounded-full border border-white/10 bg-black/35 px-5 py-2.5 text-center shadow-lg backdrop-blur-sm">
                  <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-accent/80">{f.eyebrow}</p>
                  <p className="mt-0.5 font-heading text-sm font-bold text-white sm:text-base">{f.title}</p>
                  <p className="mt-0.5 text-[11px] text-white/55 sm:text-xs">{f.details}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-10 flex flex-col items-center">
      <p className="text-[11px] uppercase tracking-[0.25em] text-white/40 mb-4">
        Community registration partner
      </p>
      <div className={`relative flex w-full max-w-md items-center justify-center ${immersive ? 'h-40' : 'h-20'}`}>
        {!immersive && (
          <div
            aria-hidden="true"
            className="absolute inset-0"
            style={{ background: 'radial-gradient(ellipse 66% 60% at center, rgba(255,255,255,0.9), rgba(255,255,255,0.55) 42%, rgba(255,255,255,0) 74%)' }}
          />
        )}
        {logos.map((src, idx) => (
          <motion.img
            key={src}
            src={src}
            alt={`${name} logo`}
            loading="lazy"
            decoding="async"
            className={`absolute inset-0 m-auto object-contain ${
              immersive
                ? 'max-h-36 max-w-[340px] drop-shadow-[0_14px_24px_rgba(0,0,0,0.5)]'
                : 'max-h-14 max-w-[260px]'
            }`}
            initial={false}
            animate={{ opacity: idx === i ? 1 : 0 }}
            transition={{ duration: 0.7 }}
          />
        ))}
      </div>
    </div>
  );
}

// `eventSlug` / `sponsor` are only passed by the sponsor-attributed wrapper
// (src/pages/SponsorCarShowSignup.jsx). `free` is only passed by the unlisted
// no-payment wrapper (src/pages/FreeCarShowSignup.jsx). The direct
// /events/:slug route renders with none of these, and nothing about the
// direct experience changes.
export default function EventSignup({ eventSlug = null, sponsor = null, free = false }) {
  const { slug: routeSlug } = useParams();
  const slug = eventSlug ?? routeSlug;
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');

  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [soldOutFromApi, setSoldOutFromApi] = useState(false);
  const [freeError, setFreeError] = useState('');
  const [cancelNoticeDismissed, setCancelNoticeDismissed] = useState(false);
  const confettiFired = useRef(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      if (!supabase) {
        // Local dev has no Supabase env, so the event fetch is a no-op in prod
        // terms. Return a mock of the live car-show row for the car show slug so
        // the hero/form can be worked on locally; prod always uses real data.
        const show = SHOW_CONFIGS[slug];
        if (import.meta.env.DEV && show) {
          return {
            id: 'dev-mock', slug: show.slug, title: show.name,
            date: show.dateISO, time: show.hoursLabel, location: `${show.venue}, ${show.address}`,
            entry_price_cents: show.price * 100, early_bird_price_cents: null, early_bird_until: null,
            capacity: show.capacity, registration_open: true, rain_date: null,
          };
        }
        return null;
      }
      const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['registration_counts', event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
      if (!supabase) {
        // Dev has no Supabase; pretend a couple spots are taken so the hero's
        // urgency chip can be worked on locally. Prod uses the real view.
        return import.meta.env.DEV ? [{ paid_count: 2 }] : null;
      }
      const { data, error } = await supabase
        .from('registration_counts')
        .select('paid_count')
        .eq('event_id', event.id);
      if (error) throw error;
      return data;
    },
  });

  useEffect(() => {
    if (status === 'success' && !confettiFired.current) {
      confettiFired.current = true;
      confetti({ particleCount: 140, spread: 75, origin: { y: 0.6 } });
    }
  }, [status]);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm({
    resolver: zodResolver(registrationSchema),
    defaultValues: {
      name: '', email: '', phone: '',
      car_year: '', car_make: '', car_model: '',
      car_class: undefined, donation_dollars: '',
    },
  });

  const entryDollars = event ? entryCentsNow(event) / 100 : CAR_SHOW.price;
  const earlyBird = isEarlyBird(event);
  const total = entryDollars;

  const paidCount = counts?.[0]?.paid_count ?? 0;
  const spotsLeft = event?.capacity != null ? Math.max(event.capacity - paidCount, 0) : null;
  const soldOut = soldOutFromApi || (event?.capacity != null && counts != null && spotsLeft <= 0);

  // Show the "redirecting to payment" notice for a beat, then send them off.
  const goToPayment = (url) => {
    setRedirecting(true);
    setTimeout(() => { window.location.href = url; }, 1400);
  };

  const onSubmit = async (values) => {
    setSubmitting(true);

    // Free/comp registrations never touch Stripe — one request confirms the
    // spot immediately, then we go straight to the success view.
    if (free) {
      try {
        const res = await fetch('/api/free-registration', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ registration: values }),
        });
        if (res.ok) {
          setSubmitting(false);
          setSearchParams({ status: 'success' });
          return;
        }
        if (res.status === 409) {
          setSoldOutFromApi(true);
          setSubmitting(false);
          return;
        }
        const data = await res.json().catch(() => ({}));
        setFreeError(data.error || 'Something went wrong — please try again or contact us.');
        setSubmitting(false);
      } catch {
        setFreeError('Network error — please try again.');
        setSubmitting(false);
      }
      return;
    }

    try {
      const res = await fetch('/api/checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        // Only the sponsor SLUG is sent — the server validates it against the
        // approved list and derives the sponsor name itself, so attribution
        // can't be forged or altered from the browser.
        body: JSON.stringify({
          event_slug: slug,
          registration: values,
          ...(sponsor ? { sponsor_slug: sponsor.slug } : {}),
        }),
      });
      const data = await res.json().catch(() => ({}));
      // Seamless path: registration saved + a dynamic Stripe Checkout session.
      if (res.ok && data.url) {
        goToPayment(data.url);
        return;
      }
      // Sold out is the one hard stop.
      if (res.status === 409) {
        setSoldOutFromApi(true);
        setSubmitting(false);
        return;
      }
      // Fallback: the registration is captured server-side before the Stripe
      // session step, so if that step fails we still send them to THIS show's
      // hosted Stripe payment link to complete payment rather than dead-ending.
      // Guarded per show: an event with no hosted link (registerUrl null, e.g.
      // the Halloween show) must never fall through to another show's link —
      // that would charge into the wrong event's Stripe product.
      const fallbackUrl = SHOW_CONFIGS[slug]?.registerUrl;
      if (fallbackUrl) {
        goToPayment(fallbackUrl);
      } else {
        setFreeError(data?.error || 'Something went wrong starting checkout. Please try again in a moment, or contact us and we’ll get you registered.');
        setSubmitting(false);
      }
    } catch {
      // Network/server unreachable — hosted link if this show has one.
      const fallbackUrl = SHOW_CONFIGS[slug]?.registerUrl;
      if (fallbackUrl) {
        goToPayment(fallbackUrl);
      } else {
        setFreeError('We couldn’t reach the registration server. Please check your connection and try again.');
        setSubmitting(false);
      }
    }
  };

  // ---- Redirecting to payment ----
  if (redirecting) {
    return (
      <div className="pt-24">
        <StatusCard
          icon={<Loader2 className="h-9 w-9 text-primary animate-spin" />}
          title="Vehicle registered — taking you to payment"
        >
          <p className="text-muted-foreground">
            Hang tight! We&apos;re sending you to our secure Stripe payment page to complete your
            entry. Please don&apos;t refresh or close this tab.
          </p>
        </StatusCard>
      </div>
    );
  }

  // ---- Loading ----
  if (isLoading) {
    return (
      <div className="pt-24 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  // ---- Not found / fetch error ----
  if (isError || !event) {
    return (
      <div className="pt-24">
        <StatusCard icon={<AlertTriangle className="h-8 w-8 text-primary" />} title="Event not found">
          <p className="text-muted-foreground mb-6">
            {"We couldn't find that event. It may have been moved or the link is out of date."}
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </StatusCard>
      </div>
    );
  }

  const formattedDate = formatEventDate(event.date);
  const formattedRainDate = formatRainDate(event.rain_date);

  return (
    <div className="pt-24">
      {/* Hero */}
      <section className="bg-[hsl(0,0%,7%)] py-16 sm:py-20">
        <motion.div {...fadeUp(0)} className="max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">TKE for St. Jude</p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold mb-6">{event.title}</h1>

          <div className="flex flex-col sm:flex-row flex-wrap items-center justify-center gap-3 sm:gap-6 text-white/80 text-sm">
            {formattedDate && (
              <span className="inline-flex items-center gap-2">
                <Calendar className="h-4 w-4 text-accent" /> {formattedDate}
              </span>
            )}
            {event.time && (
              <span className="inline-flex items-center gap-2">
                <Clock className="h-4 w-4 text-accent" /> {event.time}
              </span>
            )}
            {event.location && (
              <span className="inline-flex items-center gap-2">
                <MapPin className="h-4 w-4 text-accent" /> {event.location}
              </span>
            )}
          </div>

          <div className="mt-5 flex flex-col sm:flex-row items-center justify-center gap-3 sm:gap-6 text-sm">
            {free ? (
              <span className="inline-flex items-center gap-2 text-white font-semibold">
                <Ticket className="h-4 w-4 text-accent" /> Free entry
                <span className="rounded-full bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wide px-2 py-0.5">
                  You&apos;ve been given a free ticket
                </span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 text-white font-semibold">
                <Ticket className="h-4 w-4 text-accent" /> ${entryDollars} entry
                {earlyBird && (
                  <span className="rounded-full bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wide px-2 py-0.5">
                    Early-bird
                  </span>
                )}
              </span>
            )}
            <span className="inline-flex items-center gap-2 text-white/70">
              <CloudRain className="h-4 w-4 text-accent" />
              Rain or shine{formattedRainDate ? ` — rain date ${formattedRainDate}` : ''}
            </span>
          </div>

          {/* Urgency without an exact count: a low remaining live count reads as
              "the event is empty" and discourages sign-ups, so the raw number is
              hidden until it is genuinely low (LOW_SPOTS). Below that threshold
              the true remaining count is shown for real scarcity. */}
          {event.capacity != null && counts != null && !soldOut && (
            <div className="mt-6">
              {spotsLeft <= LOW_SPOTS ? (
                <span className="inline-flex items-center gap-2 rounded-full border border-primary/50 bg-primary/20 px-4 py-1.5 text-sm font-semibold text-white">
                  <Users className="h-4 w-4 text-accent" />
                  Only {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
                </span>
              ) : (
                <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/90">
                  <Users className="h-4 w-4 text-accent" />
                  Spots are limited — register early
                </span>
              )}
            </div>
          )}

          {/* Car-show specifics so no registrant is left guessing day-of. */}
          {slug === CAR_SHOW.slug && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left max-w-2xl mx-auto">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">Show vehicles arrive</p>
                <p className="text-sm text-white/90">{CAR_SHOW.arriveByLabel} · meet {CAR_SHOW.meetingSpot}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">
                  {free ? 'Your free entry' : `Your $${CAR_SHOW.price} entry`}
                </p>
                <p className="text-sm text-white/90">One vehicle · {CAR_SHOW.insured ? 'insured, ' : ''}rain or shine · you&apos;re recognized as a Participating Supporter</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">Benefiting</p>
                <p className="text-sm text-white/90">{CAR_SHOW.beneficiary}, organized by TKE Epsilon Alpha</p>
              </div>
            </div>
          )}

          {/* Halloween-show specifics — staggered load-in is the one thing
              registrants must not miss day-of. */}
          {slug === HALLOWEEN_SHOW.slug && (
            <div className="mt-8 grid gap-3 sm:grid-cols-3 text-left max-w-2xl mx-auto">
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">Load-in times</p>
                <p className="text-sm text-white/90">
                  Sponsor vehicles {HALLOWEEN_SHOW.sponsorLoadInLabel} · general registrations {HALLOWEEN_SHOW.generalLoadInLabel} · show begins {HALLOWEEN_SHOW.startLabel}
                </p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">
                  {`Your $${HALLOWEEN_SHOW.price} entry`}
                </p>
                <p className="text-sm text-white/90">One vehicle · {HALLOWEEN_SHOW.insured ? 'insured · ' : ''}{HALLOWEEN_SHOW.venue}</p>
              </div>
              <div className="rounded-xl border border-white/10 bg-white/5 px-4 py-3">
                <p className="text-[11px] uppercase tracking-wider text-accent font-semibold mb-1">Benefiting</p>
                <p className="text-sm text-white/90">{HALLOWEEN_SHOW.beneficiary}, organized by TKE Epsilon Alpha</p>
              </div>
            </div>
          )}

          {sponsor && sponsor.logos?.length > 0 && (
            <SponsorLogosHero
              logos={sponsor.logos}
              name={sponsor.name}
              display={sponsor.logoDisplay}
              features={sponsor.features}
            />
          )}
        </motion.div>
      </section>

      {/* Success panel */}
      {status === 'success' ? (
        <StatusCard icon={<CheckCircle2 className="h-9 w-9 text-primary" />} title="You're registered!">
          <p className="text-muted-foreground mb-6">
            A confirmation email with your registration number is on its way — check your inbox.
          </p>
          <div className="bg-primary/5 border border-primary/20 rounded-xl p-5 mb-6 text-left sm:text-center">
            <p className="font-heading font-bold text-foreground mb-1">Want to do even more for the kids?</p>
            <p className="text-muted-foreground text-sm mb-4">
              Every extra dollar goes straight to St. Jude Children&apos;s Research Hospital — families
              never receive a bill for treatment.
            </p>
            <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
              <Button className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2">
                <Heart className="h-4 w-4" /> Donate to St. Jude
              </Button>
            </a>
          </div>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </StatusCard>
      ) : !event.registration_open ? (
        <StatusCard icon={<Clock className="h-8 w-8 text-primary" />} title="Registration isn't open for this event yet">
          <p className="text-muted-foreground mb-6">
            Check back soon — registration will open closer to the event.
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </StatusCard>
      ) : soldOut ? (
        <StatusCard icon={<Users className="h-8 w-8 text-primary" />} title="This show is full">
          <p className="text-muted-foreground mb-6">
            {"Every spot has been claimed. Questions, or want to be notified if one opens up? Reach us at "}
            <a href="mailto:slutkestewardship@gmail.com" className="text-primary font-medium hover:underline">
              slutkestewardship@gmail.com
            </a>
            .
          </p>
          <Button asChild variant="outline">
            <Link to="/">Back to home</Link>
          </Button>
        </StatusCard>
      ) : (
        <section className="py-12 sm:py-16 bg-background">
          <div className="max-w-xl mx-auto px-4 sm:px-6">
            {status === 'cancelled' && !cancelNoticeDismissed && (
              <motion.div
                initial={{ opacity: 0, y: -8 }}
                animate={{ opacity: 1, y: 0 }}
                className="mb-6 flex items-start gap-3 rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900"
              >
                <AlertTriangle className="h-5 w-5 flex-shrink-0 mt-0.5" />
                <p className="text-sm flex-1">
                  Payment was cancelled — your spot is not reserved until payment completes.
                </p>
                <button
                  type="button"
                  aria-label="Dismiss notice"
                  onClick={() => {
                    setCancelNoticeDismissed(true);
                    setSearchParams({}, { replace: true });
                  }}
                  className="text-amber-900/60 hover:text-amber-900 transition-colors"
                >
                  <X className="h-4 w-4" />
                </button>
              </motion.div>
            )}

            <motion.div {...fadeUp(0.1)} className="bg-card border border-border rounded-xl p-6 sm:p-8 shadow-sm">
              {sponsor && (
                <p className="mb-5 rounded-lg border border-border bg-muted/50 px-4 py-3 text-xs leading-relaxed text-muted-foreground">
                  {sponsor.acknowledgment ||
                    `You are registering through the ${sponsor.name} community registration page.`}{' '}
                  This event is organized by TKE Epsilon Alpha and benefits St.&nbsp;Jude
                  Children&apos;s Research Hospital; payment is processed by TKE via Stripe.
                </p>
              )}
              {free && (
                <p className="mb-5 rounded-lg border border-primary/25 bg-primary/5 px-4 py-3 text-xs leading-relaxed text-foreground">
                  <span className="font-semibold">You&apos;ve been given a free ticket to this event</span> — no payment
                  is required to complete your registration below.
                </p>
              )}
              <h2 className="font-heading text-xl font-bold text-foreground mb-1">Register your vehicle</h2>
              <p className="text-muted-foreground text-sm mb-6">
                {free ? (
                  'Tell us about your vehicle below to claim your free registration — no payment required.'
                ) : (
                  <>
                    <span className="font-semibold text-foreground">Step 1 of 2.</span> Tell us about your
                    vehicle below — then you&apos;ll be sent to secure Stripe payment to lock in your spot.
                  </>
                )}
              </p>
              {freeError && (
                <p className="mb-5 rounded-lg border border-destructive/30 bg-destructive/5 px-4 py-3 text-sm text-destructive">
                  {freeError}
                </p>
              )}

              <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" noValidate>
                <div>
                  <Label htmlFor="name" className="text-sm">Name *</Label>
                  <Input id="name" className="mt-1" placeholder="Your full name" autoComplete="name" {...register('name')} />
                  <FieldError error={errors.name} />
                </div>

                <div>
                  <Label htmlFor="email" className="text-sm">Email *</Label>
                  <Input id="email" type="email" className="mt-1" placeholder="your@email.com" autoComplete="email" {...register('email')} />
                  <FieldError error={errors.email} />
                </div>

                <div>
                  <Label htmlFor="phone" className="text-sm">Phone <span className="text-muted-foreground font-normal">(optional)</span></Label>
                  <Input id="phone" type="tel" className="mt-1" placeholder="(314) 555-0123" autoComplete="tel" {...register('phone')} />
                  <FieldError error={errors.phone} />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="car_year" className="text-sm">Year *</Label>
                    <Input id="car_year" className="mt-1" placeholder="1969" inputMode="numeric" {...register('car_year')} />
                    <FieldError error={errors.car_year} />
                  </div>
                  <div>
                    <Label htmlFor="car_make" className="text-sm">Make *</Label>
                    <Input id="car_make" className="mt-1" placeholder="Chevrolet" {...register('car_make')} />
                    <FieldError error={errors.car_make} />
                  </div>
                </div>

                <div>
                  <Label htmlFor="car_model" className="text-sm">Model *</Label>
                  <Input id="car_model" className="mt-1" placeholder="Camaro SS" {...register('car_model')} />
                  <FieldError error={errors.car_model} />
                </div>

                <div>
                  <Label className="text-sm">Class *</Label>
                  <Controller
                    name="car_class"
                    control={control}
                    render={({ field }) => (
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="mt-1">
                          <SelectValue placeholder="Choose a class" />
                        </SelectTrigger>
                        <SelectContent>
                          {CAR_CLASSES.map((c) => (
                            <SelectItem key={c} value={c}>
                              {c.charAt(0).toUpperCase() + c.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    )}
                  />
                  <FieldError error={errors.car_class} />
                </div>

                <Button
                  type="submit"
                  size="lg"
                  disabled={submitting}
                  className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2"
                >
                  {submitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Registering your vehicle…
                    </>
                  ) : free ? (
                    'Claim Your Free Registration'
                  ) : (
                    <>Register &amp; Continue to Payment — ${total}</>
                  )}
                </Button>
              </form>
            </motion.div>
          </div>
        </section>
      )}
    </div>
  );
}
