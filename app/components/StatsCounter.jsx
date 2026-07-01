import {useEffect, useRef, useState} from 'react';
import {ScrollReveal} from '~/components/ScrollReveal';
import {useT} from '~/lib/t';

/**
 * StatsCounter — animated number counters that count up when scrolled
 * into view. Uses requestAnimationFrame for smooth animation.
 *
 * @param {Object} props
 * @param {Array<{value: number, label: string, suffix?: string}>} props.stats
 */
export function StatsCounter({stats = []}) {
  const t = useT();
  if (!stats.length) return null;

  return (
    <section className="pk-stats" aria-label={t('stats_aria')}>
      <div className="pk-inner">
        <ScrollReveal className="pk-stats__grid" variant="scale">
          {stats.map((stat, i) => (
            <Counter
              key={stat.label}
              value={stat.value}
              label={stat.label}
              suffix={stat.suffix || ''}
              delay={i * 150}
            />
          ))}
        </ScrollReveal>
      </div>
    </section>
  );
}

function Counter({value, label, suffix, delay}) {
  const ref = useRef(null);
  const [display, setDisplay] = useState(0);
  const [started, setStarted] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)');
    if (prefersReduced.matches) {
      setDisplay(value);
      setStarted(true);
      return;
    }

    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting && !started) {
            const startTime = performance.now() + delay;
            const duration = 1500;

            const tick = (now) => {
              const elapsed = now - startTime;
              if (elapsed < 0) {
                requestAnimationFrame(tick);
                return;
              }
              const progress = Math.min(elapsed / duration, 1);
              // Ease out cubic
              const eased = 1 - Math.pow(1 - progress, 3);
              setDisplay(Math.round(eased * value));
              if (progress < 1) {
                requestAnimationFrame(tick);
              }
            };
            requestAnimationFrame(tick);
            setStarted(true);
            observer.unobserve(entry.target);
          }
        }
      },
      {threshold: 0.3}
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [value, delay, started]);

  const formatted = display >= 1000 ? display.toLocaleString() : display;

  return (
    <div ref={ref} className="pk-stats__item">
      <span className="pk-stats__value">
        {formatted}{suffix}
      </span>
      <span className="pk-stats__label">{label}</span>
    </div>
  );
}