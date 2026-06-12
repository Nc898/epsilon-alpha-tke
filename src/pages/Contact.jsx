import { useState, useEffect } from 'react';
import { useMutation } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from 'sonner';
import { Phone, Mail, MapPin, Send, CheckCircle, Instagram } from 'lucide-react';
import { motion } from 'framer-motion';
import PageHero from '../components/PageHero';
import Magnetic from '../components/Magnetic';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

export default function Contact() {
  const params = new URLSearchParams(window.location.search);
  const initialType = params.get('type') || 'general';

  const [form, setForm] = useState({ name: '', email: '', inquiry_type: initialType, message: '' });
  const [submitted, setSubmitted] = useState(false);

  useEffect(() => {
    const t = params.get('type');
    if (t) setForm(p => ({ ...p, inquiry_type: t }));
  }, []);

  const submit = useMutation({
    mutationFn: (data) => base44.entities.ContactInquiry.create(data),
    onSuccess: () => {
      setSubmitted(true);
      setForm({ name: '', email: '', inquiry_type: 'general', message: '' });
      toast.success('Your message has been sent!');
    },
  });

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!form.name || !form.email || !form.message) {
      toast.error('Please fill in all required fields.');
      return;
    }
    submit.mutate(form);
  };

  return (
    <div className="pt-24">
      <PageHero
        eyebrow="04 — Reach Out"
        title="Contact Us"
        accent="Us"
        watermark="ΕΑ"
        lead="We'd love to hear from you. Choose a topic and send us a message."
      />

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-12 lg:gap-16">
            <div className="lg:col-span-2">
              <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(0,0%,5%)] text-white p-8 sm:p-10 h-full">
                <span
                  aria-hidden="true"
                  className="absolute -bottom-8 -right-3 font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
                  style={{ fontSize: 'clamp(7rem, 18vw, 11rem)' }}
                >
                  ΤΚΕ
                </span>

                <div className="relative">
                  <h2 className="font-heading text-2xl font-bold mb-8">Get in Touch</h2>
                  <div className="space-y-6">
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Phone className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Anthony Fahim</p>
                        <a href="tel:3143745893" className="text-white/60 text-sm hover:text-white transition-colors">
                          (314) 374-5893
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Mail className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Email</p>
                        <a href="mailto:tke.epsilonalpha@slu.edu" className="text-white/60 text-sm hover:text-white transition-colors">
                          tke.epsilonalpha@slu.edu
                        </a>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <MapPin className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Saint Louis University</p>
                        <p className="text-white/60 text-sm">1 N Grand Blvd, St. Louis, MO 63103</p>
                      </div>
                    </div>
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Instagram className="h-5 w-5 text-primary" />
                      </div>
                      <div>
                        <p className="font-semibold">Instagram</p>
                        <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer" className="text-white/60 text-sm hover:text-white transition-colors">
                          DM us @{INSTAGRAM_HANDLE}
                        </a>
                      </div>
                    </div>
                  </div>

                  <div className="mt-10 pt-8 border-t border-white/10">
                    <h3 className="font-heading text-lg font-semibold mb-3">Inquiry Types</h3>
                    <ul className="space-y-2 text-sm text-white/60">
                      <li><span className="font-medium text-white">General</span> {"—"} questions about TKE</li>
                      <li><span className="font-medium text-white">Sponsorship</span> {"—"} partnership and support</li>
                      <li><span className="font-medium text-white">Alumni</span> {"—"} reconnect and get involved</li>
                      <li><span className="font-medium text-white">Recruitment</span> {"—"} join our chapter</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-3">
              {submitted ? (
                <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}
                  className="bg-card border border-border rounded-xl p-10 text-center">
                  <div className="w-16 h-16 rounded-full bg-accent/20 flex items-center justify-center mx-auto mb-4">
                    <CheckCircle className="h-8 w-8 text-accent" />
                  </div>
                  <h3 className="font-heading text-2xl font-bold text-foreground mb-2">Message Sent</h3>
                  <p className="text-muted-foreground mb-6">
                    {"Thank you for reaching out. We'll get back to you as soon as possible."}
                  </p>
                  <Button variant="outline" onClick={() => setSubmitted(false)}>Send Another Message</Button>
                </motion.div>
              ) : (
                <form onSubmit={handleSubmit} className="bg-card border border-border rounded-xl p-6 sm:p-8 space-y-5">
                  <h2 className="font-heading text-xl font-bold text-foreground mb-2">Send a Message</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm">Name *</Label>
                      <Input value={form.name} onChange={e => setForm(p => ({ ...p, name: e.target.value }))}
                        className="mt-1" placeholder="Your full name" required />
                    </div>
                    <div>
                      <Label className="text-sm">Email *</Label>
                      <Input type="email" value={form.email} onChange={e => setForm(p => ({ ...p, email: e.target.value }))}
                        className="mt-1" placeholder="your@email.com" required />
                    </div>
                  </div>
                  <div>
                    <Label className="text-sm">Inquiry Type</Label>
                    <Select value={form.inquiry_type} onValueChange={v => setForm(p => ({ ...p, inquiry_type: v }))}>
                      <SelectTrigger className="mt-1"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        <SelectItem value="general">General Inquiry</SelectItem>
                        <SelectItem value="sponsorship">Sponsorship Inquiry</SelectItem>
                        <SelectItem value="alumni">Alumni Inquiry</SelectItem>
                        <SelectItem value="recruitment">Recruitment Inquiry</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label className="text-sm">Message *</Label>
                    <Textarea value={form.message} onChange={e => setForm(p => ({ ...p, message: e.target.value }))}
                      className="mt-1" placeholder="How can we help you?" rows={5} required />
                  </div>
                  <Magnetic>
                    <Button type="submit" size="lg" disabled={submit.isPending}
                      className="w-full rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-12 gap-2 transition-transform hover:scale-[1.01] active:scale-[0.99]">
                      {submit.isPending ? 'Sending...' : <><Send className="h-4 w-4" /> Send Message</>}
                    </Button>
                  </Magnetic>
                </form>
              )}
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}