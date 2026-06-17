import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { ArrowRight, Newspaper } from 'lucide-react';
import PageHero from '../components/PageHero';
import { NEWS_ITEMS } from '../lib/news';

export default function News() {
  return (
    <div className="pt-24">
      <PageHero
        eyebrow="Chapter"
        title="News & Updates"
        accent="Updates"
        watermark="ΤΚΕ"
        lead="Announcements, upcoming events, and what's happening around Epsilon Alpha."
      />

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          {NEWS_ITEMS.length === 0 ? (
            <div className="text-center py-16 text-muted-foreground">
              <Newspaper className="h-10 w-10 mx-auto mb-4 opacity-60" />
              <p>No news right now — check back soon.</p>
            </div>
          ) : (
            <div className="space-y-6">
              {NEWS_ITEMS.map((item) => (
                <article
                  key={item.id}
                  className="rounded-2xl border border-border bg-card p-6 sm:p-8 shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className="flex items-center gap-2 mb-3">
                    <item.icon className="h-4 w-4 text-primary" />
                    <span className="text-[11px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {item.tag}
                    </span>
                  </div>
                  <h2 className="font-heading text-2xl sm:text-3xl font-bold text-foreground leading-tight mb-3">
                    {item.title}
                  </h2>
                  <p className="text-muted-foreground leading-relaxed">{item.body}</p>
                  {item.cta && (
                    <Link to={item.cta.to} className="contents">
                      <Button className="mt-6 group/btn rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5">
                        {item.cta.label}
                        <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover/btn:translate-x-0.5" />
                      </Button>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
