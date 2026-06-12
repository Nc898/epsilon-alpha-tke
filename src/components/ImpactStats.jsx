import { useEffect, useRef, useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { animate, useInView, useReducedMotion } from 'framer-motion';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';
import Reveal from './Reveal';

function CountUp({ value, prefix = '', suffix = '' }) {
  const reduce = useReducedMotion();
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px' });
  const [display, setDisplay] = useState(0);
  const started = useRef(false);

  useEffect(() => {
    if (reduce || !inView || started.current) return;
    started.current = true;
    const controls = animate(0, value, {
      duration: 1.2,
      ease: [0.16, 1, 0.3, 1],
      onUpdate: (v) => setDisplay(Math.round(v)),
    });
    return () => controls.stop();
  }, [inView, value, reduce]);

  const shown = reduce ? value : display;
  return (
    <span ref={ref}>
      {prefix}{shown.toLocaleString()}{suffix}
    </span>
  );
}

export default function ImpactStats() {
  const { data: statsArr = [] } = useQuery({
    queryKey: ['fundraising-stats'],
    queryFn: () => base44.entities.FundraisingStats.list(),
    staleTime: 1000 * 60 * 30, // 30 min — synced with 3x daily update cadence
  });

  const stats = statsArr[0];
  const raised = stats?.amount_raised ?? 12400;
  const donors = stats?.donor_count ?? 42;
  const goal = stats?.goal ?? 50000;
  const pct = goal > 0 ? Math.round((raised / goal) * 100) : 0;

  const STATS = [
    { icon: DollarSign, value: raised > 0 ? raised : null, prefix: '$', label: 'Raised for St. Jude', accent: true },
    { icon: Users, value: donors > 0 ? donors : null, label: 'Total Donors' },
    { icon: Calendar, value: 12, label: 'Events Hosted' },
    { icon: TrendingUp, value: pct > 0 ? pct : null, suffix: '%', label: 'Goal Progress' },
  ];

  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <Reveal key={s.label} delay={i * 0.08} className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                s.accent ? 'bg-accent/20' : 'bg-primary/10'
              }`}>
                <s.icon className={`h-6 w-6 ${s.accent ? 'text-accent' : 'text-primary'}`} />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">
                {s.value == null ? '—' : <CountUp value={s.value} prefix={s.prefix} suffix={s.suffix} />}
              </p>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}
