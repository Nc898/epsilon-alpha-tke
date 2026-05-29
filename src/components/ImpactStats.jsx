import { useQuery } from '@tanstack/react-query';
import { base44 } from '@/api/base44Client';
import { motion } from 'framer-motion';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

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
    { icon: DollarSign, value: raised > 0 ? `$${raised.toLocaleString()}` : '—', label: 'Raised for St. Jude', accent: true },
    { icon: Users, value: donors > 0 ? `${donors.toLocaleString()}` : '—', label: 'Total Donors' },
    { icon: Calendar, value: '12', label: 'Events Hosted' },
    { icon: TrendingUp, value: pct > 0 ? `${pct}%` : '—', label: 'Goal Progress' },
  ];

  return (
    <section className="py-16 bg-background border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
          {STATS.map((s, i) => (
            <motion.div key={s.label} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="text-center">
              <div className={`w-12 h-12 rounded-xl flex items-center justify-center mx-auto mb-4 ${
                s.accent ? 'bg-accent/20' : 'bg-primary/10'
              }`}>
                <s.icon className={`h-6 w-6 ${s.accent ? 'text-accent' : 'text-primary'}`} />
              </div>
              <p className="font-heading text-2xl sm:text-3xl font-bold text-foreground">{s.value}</p>
              <p className="text-muted-foreground text-sm mt-1">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
