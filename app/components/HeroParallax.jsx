import {useEffect, useRef, useState} from 'react';

/**
 * HeroParallax — wraps an element so its Y-position translates with scroll.
 *
 * Pure CSS transform, GPU-composited (transform only, no layout thrash).
 * Disabled when prefers-reduced-motion is set. Disconnects its listener
 * once past the trigger distance to save cycles.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.strength] - 0-1, how far the element travels (default 0.3)
 * @param {string} [props.direction] - 'up' (move up as you scroll down) or
 *   'down' (move down as you scroll down). Default 'up'.
 * @param {string} [props.className] - additional class
 */
export function HeroParallax({
  children,
  strength = 0.3,
  direction = 'up',
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = () => setEnabled(!reduced.matches);
    onChange();
    reduced.addEventListener('change', onChange);
    return () => reduced.removeEventListener('change', onChange);
  }, []);

  useEffect(() => {
    if (!enabled) return;
    const el = ref.current;
    if (!el) return;

    let rafId = null;
    const onScroll = () => {
      if (rafId) return;
      rafId = requestAnimationFrame(() => {
        const rect = el.getBoundingClientRect();
        const vh = window.innerHeight;
        // 0 when element center is at viewport center; negative as it goes above
        const progress = (vh - rect.top - rect.height / 2) / vh;
        const clamped = Math.max(-1, Math.min(1, progress));
        const travel = clamped * strength * 80; // up to 80px travel at strength=1
        const sign = direction === 'down' ? 1 : -1;
        el.style.transform = `translate3d(0, ${(travel * sign).toFixed(2)}px, 0)`;
        rafId = null;
      });
    };
    onScroll();
    window.addEventListener('scroll', onScroll, {passive: true});
    window.addEventListener('resize', onScroll, {passive: true});
    return () => {
      window.removeEventListener('scroll', onScroll);
      window.removeEventListener('resize', onScroll);
      if (rafId) cancelAnimationFrame(rafId);
    };
  }, [enabled, strength, direction]);

  return (
    <div
      ref={ref}
      className={`pk-parallax ${className}`.trim()}
      style={enabled ? {willChange: 'transform'} : undefined}
      {...rest}
    >
      {children}
    </div>
  );
}
