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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

const CAR_CLASSES = ['classic', 'exotic', 'performance', 'other'];
const ST_JUDE_URL = 'https://fundraising.stjude.org/site/TR?fr_id=162451&pg=entry';

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

// `eventSlug` / `sponsor` are only passed by the sponsor-attributed wrapper
// (src/pages/SponsorCarShowSignup.jsx). The direct /events/:slug route renders
// with neither, and nothing about the direct experience changes.
export default function EventSignup({ eventSlug = null, sponsor = null }) {
  const { slug: routeSlug } = useParams();
  const slug = eventSlug ?? routeSlug;
  const [searchParams, setSearchParams] = useSearchParams();
  const status = searchParams.get('status');

  const [submitting, setSubmitting] = useState(false);
  const [redirecting, setRedirecting] = useState(false);
  const [soldOutFromApi, setSoldOutFromApi] = useState(false);
  const [cancelNoticeDismissed, setCancelNoticeDismissed] = useState(false);
  const confettiFired = useRef(false);

  const { data: event, isLoading, isError } = useQuery({
    queryKey: ['event', slug],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase.from('events').select('*').eq('slug', slug).single();
      if (error) throw error;
      return data;
    },
  });

  const { data: counts } = useQuery({
    queryKey: ['registration_counts', event?.id],
    enabled: !!event?.id,
    queryFn: async () => {
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
      // session step, so if that step fails we still send them to the hosted
      // Stripe payment link to complete payment rather than dead-ending. (Once
      // STRIPE_SECRET_KEY/SITE_URL are correct this branch stops being hit.)
      goToPayment(CAR_SHOW.registerUrl);
    } catch {
      // Network/server unreachable — still let them pay via the hosted link.
      goToPayment(CAR_SHOW.registerUrl);
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
            <span className="inline-flex items-center gap-2 text-white font-semibold">
              <Ticket className="h-4 w-4 text-accent" /> ${entryDollars} entry
              {earlyBird && (
                <span className="rounded-full bg-accent/20 text-accent text-[11px] font-bold uppercase tracking-wide px-2 py-0.5">
                  Early-bird
                </span>
              )}
            </span>
            <span className="inline-flex items-center gap-2 text-white/70">
              <CloudRain className="h-4 w-4 text-accent" />
              Rain or shine{formattedRainDate ? ` — rain date ${formattedRainDate}` : ''}
            </span>
          </div>

          {event.capacity != null && counts != null && spotsLeft > 0 && (
            <div className="mt-6">
              <span className="inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-sm text-white/90">
                <Users className="h-4 w-4 text-accent" />
                {spotsLeft} {spotsLeft === 1 ? 'spot' : 'spots'} left
              </span>
            </div>
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
              <h2 className="font-heading text-xl font-bold text-foreground mb-1">Register your vehicle</h2>
              <p className="text-muted-foreground text-sm mb-6">
                <span className="font-semibold text-foreground">Step 1 of 2.</span> Tell us about your
                vehicle below — then you&apos;ll be sent to secure Stripe payment to lock in your spot.
              </p>

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
