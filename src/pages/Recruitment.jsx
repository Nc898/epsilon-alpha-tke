import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';
import { Shield, BookOpen, Heart, Briefcase, GraduationCap, Users, Send, Calendar, MapPin } from 'lucide-react';
import { format } from 'date-fns';

const PILLARS = [
  { icon: Shield, title: 'Brotherhood', desc: 'Build lifelong friendships with men who share your values and push you to grow.' },
  { icon: BookOpen, title: 'Leadership', desc: 'Develop real-world leadership skills through chapter positions and community involvement.' },
  { icon: Heart, title: 'Philanthropy', desc: 'Make a tangible impact fighting childhood cancer through our partnership with St. Jude.' },
  { icon: Briefcase, title: 'Professional Network', desc: 'Connect with a national network of TKE alumni across every industry.' },
  { icon: GraduationCap, title: 'Academic Support', desc: 'Access study resources, mentorship, and a community that prioritizes academic excellence.' },
  { icon: Users, title: 'Alumni Connections', desc: 'Tap into decades of TKE alumni for career guidance, mentorship, and opportunities.' },
];

export default function Recruitment() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState({ name: '', email: '', phone: '', major: '', graduation_year: '', message: '' });
  const [submitted, setSubmitted] = useState(false);

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'recruitment'],
    queryFn: () => base44.entities.ChapterEvent.filter({ event_type: 'recruitment' }, 'date'),
  });

  const submitInquiry = useMutation({
    mutationFn: (data) => base44.entities.RecruitmentInquiry.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: '', email: '', phone: '', major: '', graduation_year: '', message: '' });
      toast.success('Your interest form has been submitted!');
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
      {/* Hero */}
      <section className="relative py-20 sm:py-28 overflow-hidden">
        <div className="absolute inset-0 bg-cover bg-center" style={{ backgroundImage: `url(https://static.wixstatic.com/media/12d367_4f26ccd17f8f4e3a8958306ea08c2332~mv2.png)` }} />
        <div className="absolute inset-0 bg-gradient-to-r from-black/80 via-black/60 to-black/80" />
        <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 text-center text-white">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Join Us</p>
          <h1 className="font-heading text-4xl sm:text-5xl lg:text-6xl font-bold mb-4">Why TKE?</h1>
          <p className="text-white/80 text-lg max-w-2xl mx-auto">
            Discover what makes Tau Kappa Epsilon the premier fraternity experience at Saint Louis University.
          </p>
        </div>
      </section>

      {/* Pillars */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-14">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">The TKE Difference</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">More Than a Fraternity</h2>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {PILLARS.map((p, i) => (
              <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }} transition={{ delay: i * 0.08 }}
                className="bg-card border border-border rounded-xl p-7 hover:border-accent/30 hover:shadow-lg transition-all">
                <div className="w-12 h-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4">
                  <p.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{p.title}</h3>
                <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Rush Events */}
      {events.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Come Meet Us</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Recruitment Events</h2>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 max-w-4xl mx-auto">
              {events.map(e => (
                <div key={e.id} className="bg-card border border-border rounded-xl p-6 hover:border-accent/30 transition-all">
                  <div className="flex items-start gap-4">
                    <div className="w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                      <span className="text-primary font-bold text-lg leading-none">
                        {e.date ? format(new Date(e.date + 'T00:00:00'), 'd') : '—'}
                      </span>
                      <span className="text-primary text-[10px] font-semibold uppercase">
                        {e.date ? format(new Date(e.date + 'T00:00:00'), 'MMM') : ''}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-heading text-lg font-semibold text-foreground">{e.title}</h3>
                      <div className="flex items-center gap-2 text-muted-foreground text-sm mt-1">
                        <MapPin className="h-3.5 w-3.5" />{e.location}
                      </div>
                      {e.description && <p className="text-muted-foreground text-sm mt-2">{e.description}</p>}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* Interest Form */}
      <section className="py-20 bg-[hsl(0,0%,7%)]">
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
              <Button type="submit" size="lg" disabled={submitInquiry.isPending}
                className="w-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2">
                {submitInquiry.isPending ? 'Submitting...' : <><Send className="h-4 w-4" /> Submit Interest Form</>}
              </Button>
            </form>
          )}
        </div>
      </section>
    </div>
  );
}