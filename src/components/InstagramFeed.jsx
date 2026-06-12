// src/components/InstagramFeed.jsx
import { useQuery } from '@tanstack/react-query';
import { Instagram, ArrowRight, Play } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Reveal from './Reveal';
import { mapBeholdPayload } from '../lib/instagramFeed';
import { INSTAGRAM_HANDLE, INSTAGRAM_URL } from '../lib/social';

const FEED_URL = import.meta.env.VITE_BEHOLD_FEED_URL;

function FollowButton({ size = 'default' }) {
  return (
    <Button
      asChild
      size={size}
      className="group rounded-full bg-primary hover:bg-primary/90 text-primary-foreground font-semibold gap-2 transition-transform hover:scale-[1.02] active:scale-[0.98]"
    >
      <a href={INSTAGRAM_URL} target="_blank" rel="noopener noreferrer">
        <Instagram className="h-4 w-4" /> Follow @{INSTAGRAM_HANDLE}
        <ArrowRight className="h-4 w-4 -ml-1 opacity-0 -translate-x-1 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
      </a>
    </Button>
  );
}

function FallbackCard() {
  return (
    <Reveal>
      <div className="relative overflow-hidden rounded-[2rem] bg-[hsl(0,0%,7%)] ring-1 ring-white/10 text-white px-8 py-12 sm:py-16 text-center">
        <Instagram className="h-8 w-8 text-primary mx-auto mb-4" />
        <h3 className="font-heading text-2xl sm:text-3xl font-bold mb-2">
          Life at Epsilon Alpha
        </h3>
        <p className="text-white/65 max-w-md mx-auto mb-7">
          Brotherhood, philanthropy, and everything in between — follow along on Instagram.
        </p>
        <FollowButton size="lg" />
      </div>
    </Reveal>
  );
}

export default function InstagramFeed({ title = 'Latest from Instagram' }) {
  const { data: tiles = [], isLoading, isError } = useQuery({
    queryKey: ['instagram-feed', FEED_URL],
    enabled: Boolean(FEED_URL),
    staleTime: 1000 * 60 * 30,
    queryFn: async () => {
      const res = await fetch(FEED_URL);
      if (!res.ok) throw new Error(`Behold feed ${res.status}`);
      return mapBeholdPayload(await res.json());
    },
  });

  if (FEED_URL && isLoading) return null;
  const showGrid = tiles.length > 0 && !isError;

  return (
    <section className="py-16 sm:py-20 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {showGrid ? (
          <>
            <Reveal className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-5 mb-10">
              <div>
                <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-3">
                  <Instagram className="inline h-4 w-4 mr-1.5 -mt-0.5" />
                  @{INSTAGRAM_HANDLE}
                </p>
                <h2 className="font-heading text-3xl sm:text-4xl font-bold text-foreground">
                  {title}
                </h2>
              </div>
              <FollowButton />
            </Reveal>

            <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 sm:gap-4">
              {tiles.slice(0, 6).map((t, i) => (
                <Reveal key={t.id} delay={(i % 3) * 0.08}>
                  <a
                    href={t.permalink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group relative block aspect-square overflow-hidden rounded-2xl bg-[hsl(0,0%,7%)]"
                  >
                    <img
                      src={t.imageUrl}
                      alt={t.caption ? t.caption.slice(0, 80) : 'Instagram post'}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    {t.isVideo && (
                      <span className="absolute top-3 left-3 w-7 h-7 rounded-full bg-black/60 flex items-center justify-center">
                        <Play className="h-3.5 w-3.5 text-white fill-white ml-0.5" />
                      </span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="absolute inset-x-0 bottom-0 p-4 translate-y-2 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-300">
                      {t.caption && (
                        <p className="text-white text-sm font-medium line-clamp-2">{t.caption}</p>
                      )}
                      {t.timestamp && (
                        <p className="text-white/60 text-xs mt-1">
                          {new Date(t.timestamp).toLocaleDateString('en-US', {
                            month: 'long', day: 'numeric', year: 'numeric',
                          })}
                        </p>
                      )}
                    </div>
                    <Instagram className="absolute top-3 right-3 h-4 w-4 text-white/80 drop-shadow opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                </Reveal>
              ))}
            </div>
          </>
        ) : (
          <FallbackCard />
        )}
      </div>
    </section>
  );
}
