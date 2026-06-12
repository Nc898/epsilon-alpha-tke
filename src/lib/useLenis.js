import { useEffect } from 'react';
import Lenis from 'lenis';

// Module-level handle so route-change scroll resets can go through Lenis
// (calling window.scrollTo while Lenis is animating causes a fight).
let lenisInstance = null;
export const getLenis = () => lenisInstance;

/**
 * Smooth scroll via Lenis. No-op when the user prefers reduced motion —
 * native scrolling is left untouched.
 */
export default function useLenis() {
  useEffect(() => {
    if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;

    const lenis = new Lenis({
      duration: 1.1,
      easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
    });
    lenisInstance = lenis;

    let rafId;
    const raf = (time) => {
      lenis.raf(time);
      rafId = requestAnimationFrame(raf);
    };
    rafId = requestAnimationFrame(raf);

    return () => {
      cancelAnimationFrame(rafId);
      lenis.destroy();
      lenisInstance = null;
    };
  }, []);
}
