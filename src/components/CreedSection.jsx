import { lazy, Suspense, useState } from 'react';
import Reveal from './Reveal';

// Three.js stays out of the main bundle — only fetched when this renders 3D.
const Triangle3D = lazy(() => import('./Triangle3D'));

const CREED = ['Love', 'Charity', 'Esteem'];

export default function CreedSection() {
  // 3D only on fine-pointer devices without reduced motion; everyone else
  // (phones from the car-show QR especially) gets the static crest.
  const [interactive] = useState(
    () =>
      typeof window !== 'undefined' &&
      window.matchMedia('(pointer: fine)').matches &&
      !window.matchMedia('(prefers-reduced-motion: reduce)').matches
  );

  const crestFallback = (
    <div className="h-full flex items-center justify-center">
      <img
        src="/assets/tke-crest.png"
        alt=""
        className="h-44 sm:h-60 w-auto object-contain drop-shadow-2xl"
      />
    </div>
  );

  return (
    <section className="py-10 sm:py-14 bg-background">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative overflow-hidden rounded-[2.5rem] bg-[hsl(0,0%,5%)] text-white px-6 sm:px-12 lg:px-16 py-16 sm:py-20">
          {/* Giant ΤΚΕ watermark */}
          <span
            aria-hidden="true"
            className="absolute -bottom-10 -right-4 font-heading font-bold text-outline-light select-none pointer-events-none leading-none"
            style={{ fontSize: 'clamp(9rem, 26vw, 22rem)' }}
          >
            ΤΚΕ
          </span>

          <div className="relative grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <div>
              <Reveal>
                <p className="text-accent font-semibold text-sm tracking-widest uppercase mb-5">
                  02 — Our Creed
                </p>
              </Reveal>
              {CREED.map((word, i) => (
                <Reveal key={word} delay={i * 0.1}>
                  <p
                    className="font-heading font-bold leading-[1.04]"
                    style={{ fontSize: 'clamp(3rem, 8vw, 6rem)' }}
                  >
                    {word}
                    <span className="text-primary">.</span>
                  </p>
                </Reveal>
              ))}
              <Reveal delay={0.35}>
                <p className="mt-6 text-white/70 max-w-md leading-relaxed">
                  The three pillars of the Declaration of Principles — the foundation every Teke
                  builds his life on, at Saint Louis University and beyond.
                </p>
              </Reveal>
            </div>

            <div className="h-[280px] sm:h-[380px] lg:h-[440px]">
              {interactive ? (
                <Suspense fallback={crestFallback}>
                  <Triangle3D className="h-full w-full" />
                </Suspense>
              ) : (
                crestFallback
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
