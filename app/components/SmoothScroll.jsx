import {useEffect} from 'react';

/**
 * SmoothScroll — wraps the page in Lenis smooth-scroll behavior.
 *
 * Respects prefers-reduced-motion (no smoothing, native scroll).
 * Safe to use once at the root layout. Lenis does not block native scroll
 * — keyboard, anchor links, and accessibility tools all still work.
 */
export function SmoothScroll({children}) {
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (reduced.matches) return;

    let lenis;
    let rafId;

    (async () => {
      const Lenis = (await import('lenis')).default;
      lenis = new Lenis({
        duration: 1.1,
        easing: (t) => Math.min(1, 1.001 - Math.pow(2, -10 * t)),
        smoothWheel: true,
      });

      const raf = (time) => {
        lenis.raf(time);
        rafId = requestAnimationFrame(raf);
      };
      rafId = requestAnimationFrame(raf);
    })();

    return () => {
      if (rafId) cancelAnimationFrame(rafId);
      if (lenis) lenis.destroy();
    };
  }, []);

  return children;
}
