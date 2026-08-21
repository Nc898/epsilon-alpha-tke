import { motion } from 'framer-motion';
import { Heart } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { ST_JUDE_URL as STJUDE_URL } from '@/lib/stjude';


export default function Donate() {
  return (
    <div className="pt-24">
      <section className="bg-[hsl(0,0%,7%)] min-h-[70vh] flex items-center justify-center py-16 sm:py-20">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, ease: 'easeOut' }}
          className="max-w-xl mx-auto px-4 sm:px-6 text-center"
        >
          <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
            TKE for St. Jude
          </p>
          <h1 className="font-heading text-4xl sm:text-5xl font-bold text-white mb-5">
            Support St. Jude
          </h1>
          <p className="text-white/80 text-base sm:text-lg mb-8">
            {"Every dollar from today's show goes to St. Jude Children's Research Hospital — thank you for being part of it."}
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary hover:bg-primary/90 text-primary-foreground font-semibold h-14 px-8 text-base gap-2"
          >
            <a href={STJUDE_URL} target="_blank" rel="noopener noreferrer">
              <Heart className="h-5 w-5" /> Donate to St. Jude
            </a>
          </Button>
          <p className="text-white/50 text-sm mt-6">
            TKE Epsilon Alpha — Saint Louis University
          </p>
        </motion.div>
      </section>
    </div>
  );
}
