import { Shield, BookOpen, Users, Award } from 'lucide-react';
import { motion } from 'framer-motion';

const PILLARS = [
  { icon: Shield, title: 'Brotherhood', desc: 'A lifelong bond forged through shared values, mutual respect, and a commitment to one another.' },
  { icon: BookOpen, title: 'Leadership', desc: 'Developing principled leaders who make a positive impact in every community they serve.' },
  { icon: Users, title: 'Service', desc: 'Dedicated to giving back through philanthropy, community engagement, and volunteerism.' },
  { icon: Award, title: 'Excellence', desc: 'Pursuing academic distinction and personal growth in everything we do.' },
];

export default function AboutSection() {
  return (
    <section className="py-20 sm:py-28 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }} transition={{ duration: 0.6 }} className="text-center mb-16">
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">Our Foundation</p>
          <h2 className="font-heading text-3xl sm:text-4xl lg:text-5xl font-bold text-foreground mb-6">
            About Epsilon Alpha
          </h2>
          <div className="w-16 h-0.5 bg-accent mx-auto mb-6" />
          <p className="text-muted-foreground max-w-3xl mx-auto text-base sm:text-lg leading-relaxed">
            The Epsilon Alpha Chapter of Tau Kappa Epsilon at Saint Louis University is built on the
            foundational principles of love, charity, and esteem. We develop men of character who are
            committed to making a lasting impact through brotherhood, leadership, and service.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {PILLARS.map((p, i) => (
            <motion.div key={p.title} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }}
              className="group bg-card border border-border rounded-xl p-8 text-center hover:border-accent/30 hover:shadow-lg transition-all duration-300">
              <div className="w-14 h-14 rounded-xl bg-primary/10 flex items-center justify-center mx-auto mb-5 group-hover:bg-primary/20 transition-colors">
                <p.icon className="h-7 w-7 text-primary" />
              </div>
              <h3 className="font-heading text-xl font-semibold text-foreground mb-3">{p.title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{p.desc}</p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}