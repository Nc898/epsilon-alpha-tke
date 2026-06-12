import { useQuery } from '@tanstack/react-query';
import { Link } from 'react-router-dom';
import { supabase } from '@/lib/supabaseClient';
import PageHero from '../components/PageHero';
import Reveal from '../components/Reveal';
import { Camera, Images } from 'lucide-react';
import { format } from 'date-fns';

export function photoUrl(path) {
  if (!supabase || !path) return null;
  return supabase.storage.from('gallery').getPublicUrl(path).data.publicUrl;
}

export default function Gallery() {
  const { data: albums = [], isLoading } = useQuery({
    queryKey: ['albums'],
    queryFn: async () => {
      if (!supabase) return [];
      const { data, error } = await supabase
        .from('albums')
        .select('*, photos(count)')
        .order('event_date', { ascending: false, nullsFirst: false });
      if (error) throw error;
      return data;
    },
  });

  return (
    <div className="pt-24">
      <PageHero
        eyebrow="07 — Memories"
        title="Photo Gallery"
        accent="Gallery"
        watermark="FILM"
        lead="Albums from every chapter event — browse, relive, and download your favorites for free."
      />

      <section className="py-16 sm:py-20 bg-background">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {isLoading ? (
            <div className="flex justify-center py-16">
              <div className="w-8 h-8 border-4 border-muted border-t-primary rounded-full animate-spin" />
            </div>
          ) : albums.length === 0 ? (
            <div className="text-center py-16">
              <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mx-auto mb-5">
                <Camera className="h-8 w-8 text-primary" />
              </div>
              <h2 className="font-heading text-2xl font-bold text-foreground mb-2">Albums Coming Soon</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                Photos from our next event will land here — check back after the car show.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8">
              {albums.map((album, i) => {
                const cover = photoUrl(album.cover_path);
                const count = album.photos?.[0]?.count ?? 0;
                return (
                  <Reveal key={album.id} delay={(i % 3) * 0.08}>
                    <Link
                      to={`/gallery/${album.slug}`}
                      className="group block bg-card border border-border rounded-2xl overflow-hidden hover:border-accent/30 hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300"
                    >
                      <div className="relative h-56 overflow-hidden bg-[hsl(0,0%,7%)]">
                        {cover ? (
                          <div className="duotone-wrap h-full">
                            <img
                              src={cover}
                              alt={album.title}
                              loading="lazy"
                              className="duotone w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                            />
                          </div>
                        ) : (
                          <div className="h-full flex items-center justify-center">
                            <Images className="h-10 w-10 text-white/20" />
                          </div>
                        )}
                        <span className="absolute bottom-3 right-3 bg-black/70 text-white text-xs font-semibold px-3 py-1 rounded-full flex items-center gap-1.5">
                          <Images className="h-3 w-3" /> {count} photo{count === 1 ? '' : 's'}
                        </span>
                      </div>
                      <div className="p-5">
                        <h3 className="font-heading text-xl font-bold text-foreground leading-tight group-hover:text-primary transition-colors">
                          {album.title}
                        </h3>
                        {album.event_date && (
                          <p className="text-muted-foreground text-sm mt-1">
                            {format(new Date(album.event_date + 'T00:00:00'), 'MMMM d, yyyy')}
                          </p>
                        )}
                        {album.description && (
                          <p className="text-muted-foreground text-sm mt-2 line-clamp-2">{album.description}</p>
                        )}
                      </div>
                    </Link>
                  </Reveal>
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
}
