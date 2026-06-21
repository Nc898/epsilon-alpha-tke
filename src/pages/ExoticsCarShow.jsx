import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  ArrowRight,
  Calendar,
  Car,
  CheckCircle2,
  Clock,
  ExternalLink,
  Heart,
  Loader2,
  Mail,
  MapPin,
  Phone,
  ShieldCheck,
  Sparkles,
  Users,
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import PageHero from '@/components/PageHero';
import Reveal from '@/components/Reveal';
import ImageReveal from '@/components/ImageReveal';
import { exoticsRegistrationSchema } from '@/lib/exoticsRegistrationSchema';
import { EXOTICS_SHOW, ST_JUDE_TAX_URL, ST_JUDE_URL } from '@/lib/exoticsCarShow';

const FIELD_CLASS = 'mt-1.5 h-12 rounded-xl bg-background';

function FieldError({ message }) {
  return message ? <p className="mt-1.5 text-xs text-destructive">{message}</p> : null;
}

function ApplicationForm() {
  const [submitted, setSubmitted] = useState(false);
  const [serverError, setServerError] = useState('');
  const [emailWarning, setEmailWarning] = useState(false);
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm({
    resolver: zodResolver(exoticsRegistrationSchema),
    defaultValues: {
      name: '',
      email: '',
      phone: '',
      car_year: '',
      car_make: '',
      car_model: '',
      car_color: '',
      instagram: '',
      notes: '',
      attendance_acknowledged: false,
    },
  });

  const onSubmit = async (values) => {
    setServerError('');
    setEmailWarning(false);
    try {
      const response = await fetch('/api/exotics-registration', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(values),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || 'Application could not be submitted.');
      setEmailWarning(Boolean(result.email_warning));
      setSubmitted(true);
    } catch (error) {
      setServerError(error.message || 'Application could not be submitted. Please try again.');
    }
  };

  if (submitted) {
    return (
      <div className="rounded-3xl border border-primary/25 bg-primary/5 p-8 sm:p-10 text-center">
        <div className="mx-auto mb-5 flex h-14 w-14 items-center justify-center rounded-full bg-primary text-primary-foreground">
          <CheckCircle2 className="h-7 w-7" />
        </div>
        <h3 className="font-heading text-3xl font-bold text-foreground">Application received</h3>
        <p className="mx-auto mt-3 max-w-lg text-muted-foreground leading-relaxed">
          Your application is in review. A submission is not yet a confirmed display spot; TKE will contact you separately with a decision and, if approved, private arrival instructions.
        </p>
        {emailWarning && (
          <p className="mx-auto mt-4 max-w-lg text-sm text-amber-700">
            Your application was saved, but the receipt email may be delayed. Please do not submit it again.
          </p>
        )}
        <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
          <Button className="mt-7 rounded-full bg-primary px-7 font-semibold text-primary-foreground hover:bg-primary/90">
            <Heart className="mr-2 h-4 w-4" /> Make the suggested ${EXOTICS_SHOW.suggestedDonation} donation
          </Button>
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="rounded-3xl border border-border bg-card p-6 shadow-xl sm:p-9">
      <div className="mb-8">
        <p className="text-xs font-bold uppercase tracking-[0.2em] text-primary">Display application</p>
        <h3 className="mt-2 font-heading text-3xl font-bold text-foreground">Tell us about your vehicle</h3>
        <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
          Applications are complimentary and reviewed individually. Selection is based on the overall display—not donation status.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Label htmlFor="exotics-name">Full name</Label>
          <Input id="exotics-name" autoComplete="name" {...register('name')} className={FIELD_CLASS} />
          <FieldError message={errors.name?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-email">Email</Label>
          <Input id="exotics-email" type="email" autoComplete="email" {...register('email')} className={FIELD_CLASS} />
          <FieldError message={errors.email?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-phone">Phone</Label>
          <Input id="exotics-phone" type="tel" autoComplete="tel" {...register('phone')} className={FIELD_CLASS} />
          <FieldError message={errors.phone?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-year">Year</Label>
          <Input id="exotics-year" inputMode="numeric" placeholder="2024" maxLength={4} {...register('car_year')} className={FIELD_CLASS} />
          <FieldError message={errors.car_year?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-make">Make</Label>
          <Input id="exotics-make" placeholder="Ferrari" {...register('car_make')} className={FIELD_CLASS} />
          <FieldError message={errors.car_make?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-model">Model</Label>
          <Input id="exotics-model" placeholder="296 GTB" {...register('car_model')} className={FIELD_CLASS} />
          <FieldError message={errors.car_model?.message} />
        </div>
        <div>
          <Label htmlFor="exotics-color">Color</Label>
          <Input id="exotics-color" placeholder="Rosso Corsa" {...register('car_color')} className={FIELD_CLASS} />
          <FieldError message={errors.car_color?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="exotics-instagram">Instagram <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Input id="exotics-instagram" placeholder="@yourhandle" {...register('instagram')} className={FIELD_CLASS} />
          <FieldError message={errors.instagram?.message} />
        </div>
        <div className="sm:col-span-2">
          <Label htmlFor="exotics-notes">Vehicle details or special considerations <span className="font-normal text-muted-foreground">(optional)</span></Label>
          <Textarea id="exotics-notes" rows={4} placeholder="Notable specification, modifications, ground-clearance concerns, or anything our staging team should know." {...register('notes')} className="mt-1.5 rounded-xl bg-background" />
          <FieldError message={errors.notes?.message} />
        </div>
      </div>

      <label className="mt-6 flex cursor-pointer items-start gap-3 rounded-2xl border border-border bg-muted/40 p-4">
        <input type="checkbox" {...register('attendance_acknowledged')} className="mt-1 h-4 w-4 rounded border-border accent-[hsl(var(--primary))]" />
        <span className="text-sm leading-relaxed text-muted-foreground">
          I understand this is an application, not an automatic confirmation. If selected, I can arrive at {EXOTICS_SHOW.meetingSpot} between {EXOTICS_SHOW.arrivalLabel} and follow TKE staging instructions.
        </span>
      </label>
      <FieldError message={errors.attendance_acknowledged?.message} />

      {serverError && (
        <div role="alert" className="mt-5 rounded-xl border border-destructive/25 bg-destructive/5 p-4 text-sm text-destructive">
          {serverError}{' '}
          <a className="font-semibold underline" href={EXOTICS_SHOW.contactPhoneHref}>Contact Anthony</a>
        </div>
      )}

      <Button type="submit" disabled={isSubmitting} className="mt-7 h-14 w-full rounded-full bg-primary text-base font-semibold text-primary-foreground hover:bg-primary/90">
        {isSubmitting ? <Loader2 className="mr-2 h-5 w-5 animate-spin" /> : <Car className="mr-2 h-5 w-5" />}
        {isSubmitting ? 'Submitting application…' : 'Apply for one of 30 display spots'}
      </Button>
      <p className="mt-3 text-center text-xs text-muted-foreground">No entry fee. No payment information required.</p>
    </form>
  );
}

export default function ExoticsCarShow() {
  return (
    <div className="pt-24">
      <PageHero
        eyebrow={`TKE for St. Jude · ${EXOTICS_SHOW.dateLabel}`}
        title="Exotics at the Foundry"
        accent="Exotics"
        watermark="30"
        spin="stjude"
        lead="A private-feeling, public-facing showcase of exceptional cars—curated to 30 vehicles and benefiting St. Jude Children's Research Hospital."
        media={
          <ImageReveal className="overflow-hidden rounded-2xl shadow-2xl">
            <div className="duotone-wrap">
              <img src={EXOTICS_SHOW.image} alt="Car show display at City Foundry STL" className="duotone aspect-[16/8] w-full object-cover" />
            </div>
          </ImageReveal>
        }
      >
        <a href="#apply">
          <Button size="lg" className="h-14 rounded-full bg-primary px-9 text-base font-semibold text-primary-foreground hover:bg-primary/90">
            Apply to Display <ArrowRight className="ml-2 h-4 w-4" />
          </Button>
        </a>
        <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
          <Button size="lg" variant="outline" className="h-14 rounded-full border-white/30 px-8 text-base font-semibold text-white hover:bg-white/10">
            Donate ${EXOTICS_SHOW.suggestedDonation} to St. Jude <ExternalLink className="ml-2 h-4 w-4" />
          </Button>
        </a>
      </PageHero>

      <section className="bg-background py-16 sm:py-20">
        <div className="mx-auto grid max-w-7xl gap-5 px-4 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:px-8">
          {[
            { icon: Calendar, label: 'Date', value: EXOTICS_SHOW.dateLabel },
            { icon: Clock, label: 'Show hours', value: EXOTICS_SHOW.hoursLabel },
            { icon: MapPin, label: 'Vehicle check-in', value: `${EXOTICS_SHOW.meetingSpot} · ${EXOTICS_SHOW.arrivalLabel}` },
            { icon: Users, label: 'Curated capacity', value: `${EXOTICS_SHOW.capacity} display vehicles` },
          ].map((fact, index) => (
            <Reveal key={fact.label} delay={index * 0.06}>
              <div className="h-full rounded-2xl border border-border bg-card p-6">
                <fact.icon className="mb-3 h-6 w-6 text-primary" />
                <p className="mb-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">{fact.label}</p>
                <p className="font-heading font-bold leading-snug text-foreground">{fact.value}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </section>

      <section className="mx-2 overflow-hidden rounded-[2.5rem] bg-[hsl(0,0%,7%)] py-20 text-white sm:mx-4 sm:py-24">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-accent">Designed around the vehicle owner</p>
            <h2 className="mt-3 font-heading text-4xl font-bold sm:text-5xl">Curated field. Controlled arrival. Protected display.</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-3">
            {[
              { icon: Sparkles, title: 'Complimentary application', body: 'There is no display fee. A $30 St. Jude donation is encouraged but never required and never affects selection.' },
              { icon: Car, title: 'Managed staging', body: `Approved vehicles meet at ${EXOTICS_SHOW.meetingSpot} from ${EXOTICS_SHOW.arrivalLabel}. TKE staff will coordinate the arrival and display order.` },
              { icon: ShieldCheck, title: 'Stanchion protection', body: 'Each display vehicle will be surrounded with stanchions to create a clear guest boundary and help protect the field throughout the show.' },
            ].map((item, index) => (
              <Reveal key={item.title} delay={index * 0.08}>
                <div className="h-full rounded-3xl border border-white/10 bg-white/[0.04] p-7">
                  <item.icon className="mb-5 h-7 w-7 text-primary" />
                  <h3 className="font-heading text-2xl font-bold">{item.title}</h3>
                  <p className="mt-3 text-sm leading-relaxed text-white/60">{item.body}</p>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      <section id="apply" className="scroll-mt-28 bg-background py-20 sm:py-28">
        <div className="mx-auto grid max-w-7xl gap-12 px-4 sm:px-6 lg:grid-cols-[0.8fr_1.2fr] lg:gap-16 lg:px-8">
          <Reveal>
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Thirty-car field</p>
            <h2 className="mt-3 font-heading text-4xl font-bold leading-tight text-foreground sm:text-5xl">Apply for the lineup</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              We are curating a balanced field of exotic and high-performance vehicles. Every application is reviewed, and approved owners will receive private arrival guidance and a reconfirmation request before the show.
            </p>
            <div className="mt-8 rounded-3xl border border-primary/20 bg-primary/5 p-6">
              <Heart className="h-7 w-7 text-primary" />
              <h3 className="mt-4 font-heading text-2xl font-bold text-foreground">Suggested ${EXOTICS_SHOW.suggestedDonation} donation</h3>
              <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                Registration is complimentary. If you would like to support the mission, donate directly through our existing St. Jude fundraising page.
              </p>
              <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
                <Button variant="outline" className="mt-5 rounded-full border-primary/30 font-semibold text-primary hover:bg-primary hover:text-primary-foreground">
                  Open the St. Jude donation page <ExternalLink className="ml-2 h-4 w-4" />
                </Button>
              </a>
            </div>
          </Reveal>
          <Reveal delay={0.08}>
            <ApplicationForm />
          </Reveal>
        </div>
      </section>

      <section className="bg-muted/50 py-20 sm:py-28">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <Reveal className="mx-auto mb-12 max-w-3xl text-center">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary">Paid event sponsorship</p>
            <h2 className="mt-3 font-heading text-4xl font-bold text-foreground sm:text-5xl">Sponsor two shows with one commitment</h2>
            <p className="mt-5 leading-relaxed text-muted-foreground">
              A paid sponsorship begins with Exotics at the Foundry in August and continues through our all-inclusive car show planned for late October. The October location and final event details will be announced separately.
            </p>
          </Reveal>

          <div className="grid gap-6 lg:grid-cols-2">
            <Reveal>
              <div className="h-full rounded-3xl border border-primary/25 bg-[hsl(0,0%,7%)] p-7 text-white shadow-xl sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-accent">Paid sponsor</p>
                <h3 className="mt-3 font-heading text-3xl font-bold">Recognition and activation at both events</h3>
                <p className="mt-4 leading-relaxed text-white/65">
                  Sponsors may represent their organization with approved signage, a promotional table, brand materials, and coordinated event-day activation. Recognition applies to both the August Exotics showcase and the October all-inclusive show.
                </p>
                <ul className="mt-7 space-y-4 text-sm text-white/70">
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /><span><strong className="text-white">Event signage:</strong> approved logo and brand placement at both shows.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /><span><strong className="text-white">Digital recognition:</strong> social-media coverage and logo placement in the rotating philanthropy-page showcase.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /><span><strong className="text-white">On-site presence:</strong> an approved table, promotional materials, or another activation coordinated with Anthony.</span></li>
                  <li className="flex gap-3"><CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" /><span><strong className="text-white">Automotive participation:</strong> sponsor vehicles and staging needs are coordinated directly with the event team.</span></li>
                </ul>
              </div>
            </Reveal>

            <Reveal delay={0.08}>
              <div className="h-full rounded-3xl border border-border bg-card p-7 sm:p-9">
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-muted-foreground">Display participant</p>
                <h3 className="mt-3 font-heading text-3xl font-bold text-foreground">Bringing a car is still free</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  You do not need to sponsor the event to apply for the 30-car field. Approved non-sponsor vehicles receive the same stanchion protection and staging care, but participation is display-only.
                </p>
                <div className="mt-7 rounded-2xl border border-destructive/20 bg-destructive/5 p-5">
                  <p className="font-semibold text-foreground">Display-only means no business promotion.</p>
                  <p className="mt-2 text-sm leading-relaxed text-muted-foreground">
                    Non-sponsors may not set up tables, distribute promotional materials, display business signage, or receive event, social-media, or website sponsor recognition.
                  </p>
                </div>
                <a href="#apply">
                  <Button variant="outline" className="mt-6 rounded-full font-semibold">Apply to bring a vehicle <ArrowRight className="ml-2 h-4 w-4" /></Button>
                </a>
              </div>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="mt-7 grid gap-8 rounded-[2rem] border border-border bg-card p-8 shadow-sm sm:p-10 lg:grid-cols-[1.25fr_0.75fr] lg:items-center">
              <div>
                <h3 className="font-heading text-3xl font-bold text-foreground">How the sponsorship contribution works</h3>
                <p className="mt-4 leading-relaxed text-muted-foreground">
                  Sponsorship contributions are made directly through TKE’s official St. Jude fundraising page. St. Jude provides the donation receipt. Tax treatment depends on applicable law and the sponsor’s circumstances; review St. Jude’s guidance or consult a tax professional before claiming a deduction.
                </p>
                <div className="mt-5 flex flex-wrap gap-3">
                  <a href={ST_JUDE_URL} target="_blank" rel="noopener noreferrer">
                    <Button className="rounded-full bg-primary font-semibold text-primary-foreground hover:bg-primary/90">Open our St. Jude page <ExternalLink className="ml-2 h-4 w-4" /></Button>
                  </a>
                  <a href={ST_JUDE_TAX_URL} target="_blank" rel="noopener noreferrer">
                    <Button variant="outline" className="rounded-full font-semibold">St. Jude tax guidance <ExternalLink className="ml-2 h-4 w-4" /></Button>
                  </a>
                </div>
              </div>
              <div className="rounded-2xl bg-[hsl(0,0%,7%)] p-6 text-white">
                <p className="text-sm text-white/55">Build a custom sponsorship with</p>
                <p className="mt-2 font-heading text-2xl font-bold">{EXOTICS_SHOW.contactName}</p>
                <a href={EXOTICS_SHOW.contactPhoneHref} className="mt-4 flex items-center gap-2 text-sm text-white/75 hover:text-white">
                  <Phone className="h-4 w-4 text-primary" /> {EXOTICS_SHOW.contactPhone}
                </a>
                <a href={`mailto:${EXOTICS_SHOW.contactEmail}?subject=Exotics%20Car%20Show%20Paid%20Sponsorship`} className="mt-3 flex items-center gap-2 break-all text-sm text-white/75 hover:text-white">
                  <Mail className="h-4 w-4 flex-shrink-0 text-primary" /> {EXOTICS_SHOW.contactEmail}
                </a>
              </div>
            </div>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
