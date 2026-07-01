import {useState, useEffect, useMemo} from 'react';
import {geoEqualEarth, geoPath} from 'd3-geo';
import {useT} from '~/lib/t';
import StarGlyph from '~/components/StarGlyph';
import {ScrollReveal} from '~/components/ScrollReveal';
import {SHIPPING_DESTINATIONS} from '~/lib/shippingDestinations';

// SVG viewBox in projected units. The SVG scales fluidly with
// width: 100% / height: auto, so this is internal coordinate space.
const VIEW_W = 1000;
const VIEW_H = 580;
const PROJECTION = geoEqualEarth().scale(160).translate([VIEW_W / 2, VIEW_H / 2]);

/**
 * ShippingMap — interactive world map for the homepage "Where we ship"
 * section. Major-tier cities pulse (suppressed under
 * prefers-reduced-motion); all cities show a tooltip on hover/focus/click.
 *
 * Implementation: d3-geo (geoEqualEarth projection) renders country
 * paths and projected marker positions. The country `world`
 * FeatureCollection is loaded by the homepage loader (see
 * `app/lib/shippingDestinations.js#getWorld`) and passed in as a prop,
 * so country paths are part of the SSR HTML on first paint.
 *
 * @param {{world?: object | null}} props
 *   `world` is a GeoJSON FeatureCollection of countries, or null if
 *   the loader couldn't fetch the TopoJSON (in which case only the
 *   destination dots render).
 */
export function ShippingMap({world = null} = {}) {
  const t = useT();
  const [active, setActive] = useState(null);
  const [reducedMotion, setReducedMotion] = useState(false);

  // Subscribe to motion preference.
  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return undefined;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    setReducedMotion(mq.matches);
    const handler = (e) => setReducedMotion(e.matches);
    mq.addEventListener('change', handler);
    return () => mq.removeEventListener('change', handler);
  }, []);

  // Path generator is constant for a given projection.
  const path = useMemo(() => geoPath(PROJECTION), []);

  // Pre-project the destinations so each render is cheap. Coordinates
  // are rounded to integers to keep the SSR HTML compact.
  const projectedDots = useMemo(
    () =>
      SHIPPING_DESTINATIONS.map((d) => {
        const xy = PROJECTION([d.lng, d.lat]);
        if (!xy || !Number.isFinite(xy[0]) || !Number.isFinite(xy[1])) return null;
        return {
          d,
          x: Math.round(xy[0] * 10) / 10,
          y: Math.round(xy[1] * 10) / 10,
        };
      }).filter(Boolean),
    [],
  );

  // Country paths — precomputed once when world changes. Each path
  // string has its numbers rounded to integers to keep the SSR HTML
  // compact. At our 1000×580 viewBox, integer precision is 1px —
  // coarser than I'd like, but acceptable for a decorative world map.
  // Bump to 1 decimal if you want crisper country borders.
  const countryPaths = useMemo(() => {
    if (!world?.features) return [];
    return world.features
      .map((f) => ({
        key: f.id ?? f.properties?.name ?? Math.random(),
        d: roundPath(path(f) || '', 1),
      }))
      .filter((p) => p.d);
  }, [world, path]);

  return (
    <ScrollReveal variant="up">
      <section className="pk-ship" aria-label={t('ship_section_aria')}>
        <div className="pk-inner pk-ship__head">
          <p className="pk-ship__eye">
            <StarGlyph /> {t('ship_eyebrow')}
          </p>
          <h2 className="pk-ship__title">{t('ship_title')}</h2>
          <p className="pk-ship__sub">{t('ship_sub')}</p>
        </div>

        <div className="pk-ship__canvas">
          <svg
            viewBox={`0 0 ${VIEW_W} ${VIEW_H}`}
            xmlns="http://www.w3.org/2000/svg"
            className="pk-ship__svg"
            role="img"
            aria-label={t('ship_section_aria')}
          >
            <g className="pk-ship__geo-group">
              {countryPaths.map((c) => (
                <path key={c.key} d={c.d} className="pk-ship__geo" />
              ))}
            </g>

            <g className="pk-ship__markers">
              {projectedDots.map(({d, x, y}) => {
                const r = d.tier === 'major' ? 5 : 2.5;
                const cls =
                  d.tier === 'major' && !reducedMotion
                    ? 'pk-ship__dot pk-ship__dot--major'
                    : 'pk-ship__dot';
                return (
                  <circle
                    key={`${d.city}-${d.country}`}
                    cx={x}
                    cy={y}
                    r={r}
                    className={cls}
                    tabIndex={0}
                    role="button"
                    aria-label={`${d.city}, ${d.country}`}
                    onMouseEnter={() => setActive(d)}
                    onMouseLeave={() => setActive(null)}
                    onFocus={() => setActive(d)}
                    onBlur={() => setActive(null)}
                    onClick={() =>
                      setActive((prev) => (prev === d ? null : d))
                    }
                  />
                );
              })}
            </g>
          </svg>

          {active ? (
            <div className="pk-ship__tooltip" role="status">
              {active.city}, {active.country}
            </div>
          ) : null}
        </div>
      </section>
    </ScrollReveal>
  );
}

/**
 * Round every number in an SVG path string to `dp` decimal places.
 * d3-geo's default output is "123.456789012345,-45.6789012345" per
 * coordinate pair; rounding saves ~50% of the path string length.
 * Numbers inside command letters (M, L, etc.) and negative numbers
 * are handled correctly because we use a regex that captures any
 * number preceded by a non-digit-or-letter boundary.
 */
function roundPath(d, dp) {
  if (!d) return d;
  const factor = 10 ** dp;
  return d.replace(/-?\d*\.\d+(?:e[+-]?\d+)?/gi, (m) => {
    const n = parseFloat(m);
    if (!Number.isFinite(n)) return m;
    return String(Math.round(n * factor) / factor);
  });
}
