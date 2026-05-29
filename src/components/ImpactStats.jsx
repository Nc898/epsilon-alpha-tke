import { motion } from 'framer-motion';
import { DollarSign, Users, Calendar, TrendingUp } from 'lucide-react';

const STATS = [
  { icon: DollarSign, value: '$34,200', label: 'Raised This Year', accent: true },
  { icon: Users, value: '180+', label: 'Active Donors' },
  { icon: Calendar, value: '12', label: 'Events Hosted' },
  { icon: TrendingUp, value: '68%', label: 'Goal Progress' },
];

export default function ImpactStats() {
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