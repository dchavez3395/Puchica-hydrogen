import {useRef, useEffect, useState} from 'react';

/**
 * MagneticSurface — applies the magnetic-pull transform to an existing
 * child element without rendering its own button. Use this when the
 * child is itself a real <button> (e.g. an ATC submit button) and you
 * can't nest another button inside.
 *
 * The child must accept a `ref` (forwardRef). The wrapper listens for
 * mouse movement over its bounding box, computes a translation toward
 * the cursor, and writes that transform to the inner span. The child
 * is rendered inside the span so the transform naturally pulls it.
 *
 * On touch / reduced motion, this renders as a plain wrapper with no
 * mouse handlers — the child looks and behaves identically.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.strength] - 0-1, how strongly it pulls (default 0.25)
 * @param {number} [props.range] - pixel trigger radius (default 80)
 * @param {string} [props.className]
 */
export function MagneticSurface({
  children,
  strength = 0.25,
  range = 80,
  className = '',
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    const check = () => setEnabled(fine.matches && !reduced.matches);
    check();
    fine.addEventListener('change', check);
    reduced.addEventListener('change', check);
    return () => {
      fine.removeEventListener('change', check);
      reduced.removeEventListener('change', check);
    };
  }, []);

  const handleMove = (e) => {
    if (!enabled || !wrapRef.current || !innerRef.current) return;
    const rect = wrapRef.current.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const dx = e.clientX - cx;
    const dy = e.clientY - cy;
    const dist = Math.hypot(dx, dy);
    if (dist > range) {
      innerRef.current.style.transform = '';
      return;
    }
    const factor = (1 - dist / range) * strength;
    innerRef.current.style.transform = `translate(${(dx * factor).toFixed(1)}px, ${(dy * factor).toFixed(1)}px)`;
  };

  const handleLeave = () => {
    if (innerRef.current) innerRef.current.style.transform = '';
  };

  return (
    <span
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`pk-magnetic ${className}`.trim()}
      style={{display: 'inline-block'}}
    >
      <span
        ref={innerRef}
        className="pk-magnetic__inner"
        style={{display: 'inline-block'}}
      >
        {children}
      </span>
    </span>
  );
}