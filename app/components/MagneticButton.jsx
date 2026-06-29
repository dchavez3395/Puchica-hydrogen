import {useRef, useEffect, useState} from 'react';

/**
 * MagneticButton — wraps a button in a magnetic attraction effect.
 *
 * On devices with fine pointer (mouse) and no reduced-motion preference,
 * the inner element translates toward the cursor as it approaches. CSS
 * transition smooths the motion. Touch / reduced-motion: renders as a
 * plain button.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {number} [props.strength] - 0-1, how strongly the button pulls (default 0.3)
 * @param {number} [props.range] - pixels of cursor-proximity trigger (default 80)
 * @param {string} [props.as] - 'button' | 'a' (default 'button')
 * @param {string} [props.className] - additional class
 * @param {Object} [props.rest] - any other button props
 */
export function MagneticButton({
  children,
  strength = 0.3,
  range = 80,
  as: Tag = 'button',
  className = '',
  ...rest
}) {
  const wrapRef = useRef(null);
  const innerRef = useRef(null);
  const [enabled, setEnabled] = useState(false);

  // Enable only on fine pointer + no reduced motion
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
    <Tag
      ref={wrapRef}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      className={`pk-magnetic ${className}`.trim()}
      style={{display: 'inline-block'}}
      {...rest}
    >
      <span ref={innerRef} className="pk-magnetic__inner" style={{display: 'inline-block'}}>
        {children}
      </span>
    </Tag>
  );
}
