import {useEffect, useRef, useState} from 'react';

/**
 * ScrollReveal — wraps children in an IntersectionObserver that adds
 * `is-visible` when the element enters the viewport.
 *
 * @param {Object} props
 * @param {React.ReactNode} props.children
 * @param {string} [props.as] - element type to render (default 'div')
 * @param {number} [props.delay] - delay in ms before reveal
 * @param {boolean} [props.once] - only animate once (default true)
 * @param {number} [props.threshold] - visibility threshold 0-1 (default 0.15)
 * @param {string} [props.variant] - 'up' | 'left' | 'right' | 'scale' (default 'up')
 * @param {string} [props.className] - additional classes
 */
export function ScrollReveal({
  children,
  as: Tag = 'div',
  delay = 0,
  once = true,
  threshold = 0.15,
  variant = 'up',
  className = '',
  ...rest
}) {
  const ref = useRef(null);
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    // Respect reduced motion — show immediately
    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      setVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) {
            if (delay > 0) {
              setTimeout(() => setVisible(true), delay);
            } else {
              setVisible(true);
            }
            if (once) observer.unobserve(entry.target);
          } else if (!once) {
            setVisible(false);
          }
        }
      },
      {threshold, rootMargin: '0px 0px -50px 0px'}
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, once, threshold]);

  const variantClass = variant !== 'up' ? `pk-reveal--${variant}` : '';
  const visibleClass = visible ? 'is-visible' : '';

  return (
    <Tag
      ref={ref}
      className={`pk-reveal ${variantClass} ${visibleClass} ${className}`.trim()}
      {...rest}
    >
      {children}
    </Tag>
  );
}