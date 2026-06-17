import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import {
  Shield, BookOpen, Heart, Briefcase, GraduationCap, Users, Send,
  MapPin, Clock, ArrowDown, CalendarDays, Handshake, Mail, Star, Instagram,
} from 'lucide-react';
import { format } from 'date-fns';
import confetti from 'canvas-confetti';
import Magnetic from '../components/Magnetic';
import Reveal from '../components/Reveal';
import { getLenis } from '../lib/useLenis';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

/* ── Photo wall (godly.website-style hero) ──────────────────────
   Add more photo URLs here as they come in — the wall cycles them. */
const WALL_PHOTOS = [
  '/assets/photos/q06.jpg', // Bugatti Chiron at the show
  '/assets/photos/p07.jpg', // letterman jackets + TKE triangle at St. Jude
  '/assets/photos/p13.jpg', // elf costumes
  '/assets/photos/q02.jpg', // brother in a Lamborghini
  '/assets/photos/p21.jpg', // St. Jude Walk
  '/assets/photos/p09.jpg', // chapter game night
  '/assets/photos/p26.jpg', // Ferrari + "TKE Car Show for St. Jude" banner
  '/assets/photos/q22.jpg', // Mario at a costume night
  '/assets/photos/q33.jpg', // TKE hearts Ronald McDonald House
  '/assets/photos/p19.jpg', // late-night hangout
  '/assets/photos/p18.jpg', // supercars at sunset
  '/assets/photos/q07.jpg', // graduation
  '/assets/photos/p28.jpg', // suiting up before a formal
  '/assets/photos/q31.jpg', // western party
  '/assets/photos/p27.jpg', // Halloween formal
  '/assets/photos/q26.jpg', // accepting a St. Jude award
];

/* ── Rush events — Anthony fills in real title/date/time/location.
   date format: '2026-09-01' (or null while TBA). ──────────────── */
const RUSH_EVENTS = [
  {
    title: 'Meet the Tekes Night',
    date: null,
    time: 'TBA',
    location: 'TBA',
    desc: 'Kick off rush week — food, brothers, and zero pressure. Come as you are.',
  },
  {
    title: 'Brotherhood Game Night',
    date: null,
    time: 'TBA',
    location: 'TBA',
    desc: 'Poker, smash, and wings with the chapter. The fastest way to know if you fit.',
  },
  {
    title: 'TKE × St. Jude Service Night',
    date: null,
    time: 'TBA',
    location: 'TBA',
    desc: 'See the philanthropy side up close — what we build, who it helps, and why.',
  },
  {
    title: 'Preference Dinner',
    date: null,
    time: 'TBA',
    location: 'TBA',
    desc: 'Invite-only closing dinner with the brothers. Bids follow shortly after.',
  },
];

const RUSH_STEPS = [
  {
    icon: CalendarDays,
    title: 'Show Up',
    desc: 'Come to any rush event — no application, no commitment, no cost. Just show up and meet us.',
  },
  {
    icon: Handshake,
    title: 'Meet the Brothers',
    desc: 'Conversations, not interviews. We want to know who you are, and you should size us up too.',
  },
  {
    icon: Mail,
    title: 'Receive a Bid',
    desc: "If it's a mutual fit, you'll get a bid — a formal invitation to join the chapter.",
  },
  {
    icon: Star,
    title: 'Become a Teke',
    desc: 'Accept your bid and start the new-member journey to initiation. Brothers for life from day one.',
  },
];

const PILLARS = [
  { icon: Shield, title: 'Brotherhood', desc: 'Build lifelong friendships with men who share your values and push you to grow.' },
  { icon: BookOpen, title: 'Leadership', desc: 'Develop real-world leadership skills through chapter positions and community involvement.' },
  { icon: Heart, title: 'Philanthropy', desc: 'Make a tangible impact fighting childhood cancer through our partnership with St. Jude.' },
  { icon: Briefcase, title: 'Professional Network', desc: 'Connect with a national network of TKE alumni across every industry.' },
  { icon: GraduationCap, title: 'Academic Support', desc: 'Access study resources, mentorship, and a community that prioritizes academic excellence.' },
  { icon: Users, title: 'Alumni Connections', desc: 'Tap into decades of TKE alumni for career guidance, mentorship, and opportunities.' },
];

function scrollToId(id) {
  const el = document.getElementById(id);
  if (!el) return;
  const lenis = getLenis();
  if (lenis) lenis.scrollTo(el, { offset: -90 });
  else el.scrollIntoView({ behavior: 'smooth' });
}

/* One auto-scrolling column. Content is doubled so translateY(-50%)
   loops seamlessly; `start` staggers which photo each column leads with. */
function WallColumn({ reverse, duration, start = 0, className = '' }) {
  const ordered = [...WALL_PHOTOS.slice(start), ...WALL_PHOTOS.slice(0, start)];
  const items = [...ordered, ...ordered];
  return (
    <div className={`relative overflow-hidden ${className}`}>
      <div
        className={reverse ? 'animate-wall-reverse' : 'animate-wall'}
        style={{ '--wall-dur': duration }}
      >
        <div className="flex flex-col gap-3 sm:gap-4 pb-3 sm:pb-4">
          {items.map((src, i) => (
            <img
              key={i}
              src={src}
              alt=""
              loading={i < 3 ? 'eager' : 'lazy'}
              className="w-full aspect-[3/4] object-cover rounded-xl"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function RushHero() {
  const reduce = useReducedMotion();
  return (
    <section className="relative h-screen min-h-[640px] overflow-hidden bg-[hsl(0,0%,4%)]">
      {/* 4-column scrolling photo wall */}
      <div className="absolute inset-0 grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 px-3 sm:px-4 opacity-50">
        <WallColumn duration="52s" start={0} />
        <WallColumn duration="66s" start={1} reverse />
        <WallColumn duration="58s" start={2} className="hidden md:block" />
        <WallColumn duration="72s" start={3} reverse className="hidden md:block" />
      </div>
      <div className="absolute inset-0 bg-gradient-to-b from-black/80 via-black/50 to-black/85" />

      {/* Centered headline cluster */}
      <div className="relative z-10 h-full flex flex-col items-center justify-center text-center px-4 sm:px-6">
        <motion.p
          initial={reduce ? false : { opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6 }}
          className="text-accent font-semibold text-sm tracking-[0.25em] uppercase mb-5"
        >
          Fall Rush 2026 — Saint Louis University
        </motion.p>
        <motion.h1
          initial={reduce ? false : { opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="font-heading font-bold text-white"
          style={{ fontSize: 'clamp(3.25rem, 10vw, 8rem)', lineHeight: 0.98, letterSpacing: '-0.02em' }}
        >
          Rush <span className="text-primary">TKE</span>
        </motion.h1>
        <motion.p
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
          className="text-white/75 text-base sm:text-lg max-w-xl mt-6 leading-relaxed"
        >
          Better men for a better world starts with showing up.
          Come meet the brothers of Epsilon Alpha.
        </motion.p>
        <motion.div
          initial={reduce ? false : { opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.7, delay: reduce ? 0 : 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 sm:gap-4 mt-9 w-full max-w-xs sm:max-w-none sm:w-auto justify-center"
        >
          <Magnetic className="w-full sm:w-auto">
            <Button
              size="lg"
              onClick={() => scrollToId('rush-events')}
              className="w-full sm:w-auto rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold px-8 h-12 sm:h-14 text-sm sm:text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <CalendarDays className="h-4 w-4 sm:h-5 sm:w-5" /> See Rush Events
            </Button>
          </Magnetic>
          <Magnetic className="w-full sm:w-auto">
            <Button
              size="lg"
              variant="outline"
              onClick={() => scrollToId('interest-form')}
              className="w-full sm:w-auto rounded-full border-white/30 text-white hover:bg-white/10 font-semibold px-8 h-12 sm:h-14 text-sm sm:text-base gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
            >
              <Send className="h-4 w-4 sm:h-5 sm:w-5" /> Express Interest
            </Button>
          </Magnetic>
        </motion.div>
      </div>

      <button
        onClick={() => scrollToId('rush-events')}
        aria-label="Scroll to rush events"
        className="absolute bottom-7 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-1.5 text-white/60 hover:text-white transition-colors"
      >
        <span className="text-[10px] tracking-[0.3em] uppercase font-semibold">Scroll</span>
        <ArrowDown className="h-4 w-4 animate-bounce" />
      </button>
    </section>
  );
}

export default function Recruitment() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', major: '', graduation_year: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const submitInquiry = useMutation({
    mutationFn: (data) => base44.entities.RecruitmentInquiry.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', major: '', graduation_year: '', message: '' });
      toast.success('Your interest form has been submitted!');
      if (!window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
        confetti({ particleCount: 120, spread: 70, origin: { y: 0.7 } });
      }
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email) {
      toast.error('Please fill in your name and email.');
      return;
    }
    submitInquiry.mutate(form);
  };

  return (
    <div className="pt-24">
      <RushHero />

      {/* ── Rush events schedule ── */}
      <section id="rush-events" className="py-20 sm:py-24 bg-background">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">01 — The Events</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-4">
              Rush Week Schedule
            </h2>
            <p className="text-muted-foreground max-w-xl mx-auto">
              Dates, times, and locations are being finalized — check back soon or drop your info below
              and we'll keep you posted.
            </p>
          </Reveal>

          <div className="space-y-3">
            {RUSH_EVENTS.map((e, i) => (
              <Reveal key={e.title} delay={i * 0.07}>
                <div className="group bg-card border border-border rounded-xl p-5 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-accent/30 hover:shadow-lg hover:-translate-y-0.5 transition-all duration-300">
                  {/* Tear-off ticket stub */}
                  <div className="flex items-center flex-shrink-0 pr-4 border-r-2 border-dashed border-border group-hover:border-primary/40 transition-colors">
                    <div className="flex flex-col items-center justify-center w-16">
                      {e.date ? (
                        <>
                          <span className="font-heading text-primary font-bold text-3xl leading-none">
                            {format(new Date(e.date + 'T00:00:00'), 'd')}
                          </span>
                          <span className="text-primary text-[10px] font-semibold uppercase tracking-[0.2em] mt-1">
                            {format(new Date(e.date + 'T00:00:00'), 'MMM')}
                          </span>
                        </>
                      ) : (
                        <span className="font-heading text-primary font-bold text-xl leading-none tracking-wide">TBA</span>
                      )}
                    </div>
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading text-lg font-semibold text-foreground">{e.title}</h3>
                    <div className="flex flex-wrap items-center gap-3 text-muted-foreground text-sm mt-1">
                      <span className="flex items-center gap-1"><Clock className="h-3.5 w-3.5" />{e.time}</span>
                      <span className="flex items-center gap-1"><MapPin className="h-3.5 w-3.5" />{e.location}</span>
                    </div>
                    <p className="text-muted-foreground text-sm mt-1.5">{e.desc}</p>
                  </div>

                  <span className="text-[10px] font-semibold uppercase tracking-wider text-accent bg-accent/10 px-3 py-1 rounded-full flex-shrink-0">
                    Rush Week
                  </span>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── How rush works ── */}
      <section className="py-20 sm:py-24 bg-[hsl(0,0%,5%)] text-white rounded-t-[2.5rem] relative overflow-hidden">
        <span
          aria-hidden="true"
          className="absolute bottom-4 right-6 font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
          style={{ fontSize: 'clamp(4rem, 10vw, 9rem)' }}
        >
          RUSH
        </span>
        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">02 — The Process</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold mb-4">How Rush Works</h2>
            <p className="text-white/65 max-w-2xl mx-auto">
              Four steps, no mystery. Rush is just getting to know each other — here's the whole path
              from first handshake to brotherhood.
            </p>
          </Reveal>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {RUSH_STEPS.map((s, i) => (
              <Reveal key={s.title} delay={i * 0.08}>
                <div className="group relative overflow-hidden bg-white/5 border border-white/10 rounded-2xl p-7 h-full hover:bg-white/[0.08] hover:-translate-y-1.5 transition-all duration-300">
                  <span
                    aria-hidden="true"
                    className="absolute -top-3 right-2 font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
                    style={{ fontSize: '5rem' }}
                  >
                    0{i + 1}
                  </span>
                  <div className="relative">
                    <div className="w-12 h-12 rounded-xl bg-primary/15 flex items-center justify-center mb-4 group-hover:bg-primary/25 transition-colors">
                      <s.icon className="h-6 w-6 text-primary" />
                    </div>
                    <h3 className="font-heading text-lg font-semibold mb-2">{s.title}</h3>
                    <p className="text-white/60 text-sm leading-relaxed">{s.desc}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Why TKE pillars ── */}
      <section className="py-20 sm:py-24 bg-background rounded-t-[2.5rem] relative z-10 -mt-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <Reveal className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">03 — Why TKE</p>
            <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground">More Than a Fraternity</h2>
          </Reveal>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="group relative overflow-hidden bg-card border border-border rounded-xl p-7 hover:border-accent/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                <span
                  aria-hidden="true"
                  className="absolute -top-3 right-2 font-heading font-bold text-outline select-none pointer-events-none leading-none transition-opacity duration-300 group-hover:opacity-60"
                  style={{ fontSize: '5.5rem' }}
                >
                  0{i + 1}
                </span>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                    <p.icon className="h-6 w-6 text-primary" />
                  </div>
                  <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                  <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Interest form ── */}
      <section id="interest-form" className="py-20 bg-[hsl(0,0%,7%)]">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <div className="text-center mb-10">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Get Started</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-white mb-4">Express Your Interest</h2>
            <p className="text-white/70">Fill out the form below and a brother will reach out to you.</p>
          </div>

          {submitted ? (
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
              className="bg-white/10 backdrop-blur rounded-xl p-8 text-center">
              <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                <Send className="h-7 w-7 text-accent" />
              </div>
              <h3 className="font-heading text-xl font-bold text-white mb-2">Thank You!</h3>
              <p className="text-white/70">Your interest form has been received. A brother will be in touch soon.</p>
              <Button className="mt-6" variant="outline" onClick={() => setSubmitted(false)}>Submit Another</Button>
            </motion.div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <Label className="text-white/80 text-sm">Name *</Label>
                  <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="Your full name" required />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Email *</Label>
                  <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="your@email.com" required />
                </div>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div>
                  <Label className="text-white/80 text-sm">Phone</Label>
                  <Input value={form.phone} onChange={e => setForm(p => ({ ...p, phone: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="(555) 123-4567" />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Major</Label>
                  <Input value={form.major} onChange={e => setForm(p => ({ ...p, major: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="e.g. Business" />
                </div>
                <div>
                  <Label className="text-white/80 text-sm">Graduation Year</Label>
                  <Input value={form.graduation_year} onChange={e => setForm(p => ({ ...p, graduation_year: e.target.value }))}
                    className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="e.g. 2028" />
                </div>
              </div>
              <div>
                <Label className="text-white/80 text-sm">Message</Label>
                <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                  className="bg-white/10 border-white/20 text-white placeholder:text-white/40 mt-1" placeholder="Tell us about yourself..." rows={3} />
              </div>
              <Magnetic>
                <Button type="submit" size="lg" disabled={submitInquiry.isPending}
                  className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                  {submitInquiry.isPending ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Interest Form</>}
                </Button>
              </Magnetic>
            </form>
          )}
        </div>
      </section>

      <section className="py-14 bg-background">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 text-center">
          <Reveal>
            <p className="text-muted-foreground mb-4">
              Want to see brotherhood in action first?
            </p>
            <Button asChild variant="outline" size="lg" className="rounded-full font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]">
              <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
                <Instagram className="h-4 w-4" /> Follow our story — @{INSTAGRAM_HANDLE}
              </a>
            </Button>
          </Reveal>
        </div>
      </section>
    </div>
  );
}
