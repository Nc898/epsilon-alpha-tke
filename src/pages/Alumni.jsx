import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { FileText, Newspaper, Star, Calendar, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import { format } from 'date-fns';
import PageHero from '../components/PageHero';

const CATEGORY_ICONS = { newsletter: Newspaper, spotlight: Star, announcement: FileText, event: Calendar };

export default function Alumni() {
  const { data: updates = [], isLoading } = useQuery({
    queryKey: ['alumni-updates'],
    queryFn: () => base44.entities.AlumniUpdate.filter({ published: true }, '-created_date'),
  });

  const { data: events = [] } = useQuery({
    queryKey: ['events', 'alumni'],
    queryFn: () => base44.entities.ChapterEvent.filter({ event_type: 'alumni' }, '-date'),
  });

  return (
    <div className="pt-24">
      {/* Hero */}
      <PageHero
        eyebrow="03 — Stay Connected"
        title="Alumni Portal"
        accent="Portal"
        watermark="1955"
        lead="Once a TKE, always a TKE. Stay connected with your brothers and the Epsilon Alpha Chapter."
      />

      {/* Updates & Newsletters */}
      <section className="py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">What's New</p>
            <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Chapter Updates</h2>
          </div>

          {isLoading ? (
            <div className="flex justify-center py-12">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : updates.length === 0 ? (
            <p className="text-center text-muted-foreground py-12">
              Exciting updates are on the way — stay tuned, brothers.
            </p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {updates.map((u, i) => {
                const Icon = CATEGORY_ICONS[u.category] || FileText;
                return (
                  <motion.div key={u.id} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }} transition={{ delay: i * 0.1 }}
                    className="group bg-card border border-border rounded-xl overflow-hidden hover:border-accent/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300">
                    {u.image && (
                      <div className="duotone-wrap h-48 overflow-hidden">
                        <img src={u.image} alt={u.title} className="duotone w-full h-full object-cover" />
                      </div>
                    )}
                    <div className="p-6">
                      <div className="flex items-center gap-2 mb-3">
                        <Icon className="h-4 w-4 text-accent" />
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-accent">
                          {u.category}
                        </span>
                        <span className="text-muted-foreground text-xs ml-auto">
                          {u.created_date ? format(new Date(u.created_date), 'MMM d, yyyy') : ''}
                        </span>
                      </div>
                      <h3 className="font-heading text-lg font-semibold text-foreground mb-2">{u.title}</h3>
                      <p className="text-muted-foreground text-sm leading-relaxed line-clamp-3">{u.content}</p>
                      {u.pdf_url && (
                        <a href={u.pdf_url} target="_blank" rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-primary text-sm font-semibold mt-4 hover:text-primary/80">
                          <FileText className="h-4 w-4" /> Download PDF
                        </a>
                      )}
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </section>

      {/* Alumni Events */}
      {events.length > 0 && (
        <section className="py-20 bg-muted/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-12">
              <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Get Together</p>
              <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">Alumni Events</h2>
            </div>
            <div className="space-y-4">
              {events.map(e => (
                <div key={e.id} className="bg-card border border-border rounded-xl p-6 flex flex-col sm:flex-row items-start sm:items-center gap-4 hover:border-accent/30 transition-all">
                  <div className="w-14 h-14 bg-primary/10 rounded-lg flex flex-col items-center justify-center flex-shrink-0">
                    <span className="text-primary font-bold text-lg leading-none">
                      {e.date ? format(new Date(e.date + 'T00:00:00'), 'd') : '—'}
                    </span>
                    <span className="text-primary text-[10px] font-semibold uppercase">
                      {e.date ? format(new Date(e.date + 'T00:00:00'), 'MMM') : ''}
                    </span>
                  </div>
                  <div className="flex-1">
                    <h3 className="font-heading text-lg font-semibold text-foreground">{e.title}</h3>
                    <p className="text-muted-foreground text-sm">{e.location}{e.time ? ` · ${e.time}` : ''}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* CTA */}
      <section className="py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 text-center">
          <h2 className="font-heading text-3xl font-bold text-foreground mb-4">Stay in Touch</h2>
          <p className="text-muted-foreground mb-8">
            Have news to share? Want to get involved? We'd love to hear from you.
          </p>
          <Link to="/contact?type=alumni">
            <Button size="lg" className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 h-12 px-8">
              Alumni Contact Form <ArrowRight className="h-4 w-4" />
            </Button>
          </Link>
        </div>
      </section>
    </div>
  );
}