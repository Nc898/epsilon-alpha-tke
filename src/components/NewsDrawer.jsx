import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Newspaper, X, ArrowRight, Flag } from 'lucide-react';

// News items — newest first. Append here for future reminders.
const NEWS_ITEMS = [
  {
    id: 'carshow-2026',
    icon: Flag,
    tag: 'Registration Open',
    title: 'TKE for St. Jude Car Show — Foundry Classics',
    body: 'Sunday, July 26 at City Foundry STL. $20 entry benefits St. Jude Children\'s Research Hospital. Rain or shine — rain date August 2.',
    cta: { label: 'Sign Up Your Car', to: '/carshow' },
  },
];

const SESSION_KEY = 'tke-news-autoopened';

export default function NewsDrawer() {
  const reduce = useReducedMotion();
  const [open, setOpen] = useState(false);

  // Auto-open once per session, shortly after first load
  useEffect(() => {
    if (sessionStorage.getItem(SESSION_KEY)) return;
    const t = setTimeout(() => {
      setOpen(true);
      sessionStorage.setItem(SESSION_KEY, '1');
    }, 1200);
    return () => clearTimeout(t);
  }, []);

  return (
    <div className="fixed right-0 top-28 z-40">
      <AnimatePresence initial={false} mode="wait">
        {open ? (
          <motion.aside
            key="panel"
            initial={reduce ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: '100%' }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="w-[19rem] sm:w-80 bg-[hsl(0,0%,7%)] text-white rounded-l-2xl shadow-2xl ring-1 ring-white/10 border-l-4 border-primary overflow-hidden"
            aria-label="Chapter news"
          >
            <div className="flex items-center justify-between px-5 py-3.5 border-b border-white/10">
              <div className="flex items-center gap-2">
                <Newspaper className="h-4 w-4 text-primary" />
                <h2 className="font-heading text-lg font-bold tracking-wide">News</h2>
              </div>
              <button
                onClick={() => setOpen(false)}
                aria-label="Collapse news panel"
                className="p-1.5 rounded-full text-white/60 hover:text-white hover:bg-white/10 transition-colors"
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {NEWS_ITEMS.map((item) => (
                <article key={item.id} className="px-5 py-4 border-b border-white/5 last:border-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <item.icon className="h-3.5 w-3.5 text-primary" />
                    <span className="text-[10px] font-semibold uppercase tracking-[0.18em] text-primary">
                      {item.tag}
                    </span>
                  </div>
                  <h3 className="font-heading font-semibold text-[15px] leading-snug mb-1.5">
                    {item.title}
                  </h3>
                  <p className="text-white/65 text-[13px] leading-relaxed mb-3">{item.body}</p>
                  {item.cta && (
                    <Link to={item.cta.to} onClick={() => setOpen(false)} className="contents">
                      <Button
                        size="sm"
                        className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-1.5 text-xs transition-transform hover:scale-[1.02] active:scale-[0.98]"
                      >
                        {item.cta.label}
                        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-300 group-hover:translate-x-0.5" />
                      </Button>
                    </Link>
                  )}
                </article>
              ))}
            </div>
          </motion.aside>
        ) : (
          <motion.button
            key="tab"
            initial={reduce ? false : { x: '100%' }}
            animate={{ x: 0 }}
            exit={reduce ? undefined : { x: '100%' }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            onClick={() => setOpen(true)}
            aria-label="Open news panel"
            className={`flex flex-col items-center gap-1.5 bg-primary text-primary-foreground rounded-l-xl pl-2 pr-1.5 py-4 shadow-lg cursor-pointer hover:bg-primary/90 transition-colors ${
              reduce ? '' : 'animate-news-pulse'
            }`}
          >
            <Newspaper className="h-4 w-4" />
            <span
              className="text-[10px] font-bold uppercase tracking-[0.22em]"
              style={{ writingMode: 'vertical-rl' }}
            >
              News
            </span>
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  );
}
