import { Link, Navigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { motion } from 'framer-motion';
import { Loader2, CalendarClock } from 'lucide-react';
import { supabase } from '@/lib/supabaseClient';
import { Button } from '@/components/ui/button';

function todayLocalISO() {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
}

export default function CarShowRedirect() {
  const { data, isLoading } = useQuery({
    queryKey: ['next-open-event'],
    queryFn: async () => {
      if (!supabase) return null;
      const { data, error } = await supabase
        .from('events')
        .select('slug')
        .eq('registration_open', true)
        .gte('date', todayLocalISO())
        .order('date', { ascending: true })
        .limit(1);
      if (error) throw error;
      return data;
    },
  });

  if (isLoading) {
    return (
      <div className="pt-24 min-h-[60vh] flex items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    );
  }

  const slug = data?.[0]?.slug;
  if (slug) {
    return <Navigate to={`/events/${slug}`} replace />;
  }

  return (
    <div className="pt-24">
      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-xl mx-auto px-4 sm:px-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1, ease: 'easeOut' }}
            className="bg-card border border-border rounded-xl p-8 sm:p-10 text-center shadow-sm"
          >
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
              <CalendarClock className="h-8 w-8 text-primary" />
            </div>
            <h1 className="font-heading text-2xl font-bold text-foreground mb-3">
              Registration opens soon
            </h1>
            <p className="text-muted-foreground mb-6">
              {"Registration for our next show isn't open yet — check back soon or follow @tke_slu. Questions? Reach us at "}
              <a href="mailto:tke.epsilonalpha@slu.edu" className="text-primary font-medium hover:underline">
                tke.epsilonalpha@slu.edu
              </a>
              .
            </p>
            <Button asChild variant="outline">
              <Link to="/">Back to home</Link>
            </Button>
          </motion.div>
        </div>
      </section>
    </div>
  );
}
