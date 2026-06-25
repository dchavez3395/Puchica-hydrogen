import {useEffect, useRef, useState, useCallback} from 'react';

/**
 * TiltCard — wraps children in a 3D tilt effect that follows the mouse.
 * Disabled on touch devices and when prefers-reduced-motion.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.className]
 * @param {number} [props.maxTilt] - max rotation in degrees (default 12)
 * @param {boolean} [props.glare] - show glare overlay (default true)
 * @param {Object} [props.style]
 */
export function TiltCard({
  children,
  className = '',
  maxTilt = 12,
  glare = true,
  style,
  ...rest
}) {
  const ref = useRef(null);
  const [transform, setTransform] = useState('');
  const [glarePos, setGlarePos] = useState({x: 50, y: 50});
  const [enabled, setEnabled] = useState(false);

  // Enable only on devices with fine pointer + no reduced motion
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const fine = window.matchMedia('(pointer: fine)');
    const reduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    setEnabled(fine.matches && !reduced.matches);
  }, []);

  const handleMove = useCallback((e) => {
    if (!enabled || !ref.current) return;
    const rect = ref.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    const pctX = (x / rect.width) * 100;
    const pctY = (y / rect.height) * 100;
    // Map 0-100% to -1..1, then scale by maxTilt
    const rotY = ((pctX / 100) - 0.5) * 2 * maxTilt;
    const rotX = (0.5 - (pctY / 100)) * 2 * maxTilt;
    setTransform(`perspective(800px) rotateX(${rotX.toFixed(2)}deg) rotateY(${rotY.toFixed(2)}deg)`);
    setGlarePos({x: pctX, y: pctY});
  }, [enabled, maxTilt]);

  const handleLeave = useCallback(() => {
    setTransform('');
    setGlarePos({x: 50, y: 50});
  }, []);

  return (
    <div
      ref={ref}
      className={`pk-tilt ${className}`.trim()}
      style={{
        ...(transform ? {transform} : {}),
        ...(glare ? {'--glare-x': `${glarePos.x}%`, '--glare-y': `${glarePos.y}%`} : {}),
        ...style,
      }}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      {...rest}
    >
      {glare && enabled && <div className="pk-tilt__glare" aria-hidden="true" />}
      {children}
    </div>
  );
}