import {useState} from 'react';
import {useT} from '~/lib/t';
import {WORLD_LAND_PATH, WORLD_VIEWBOX, COUNTRY_PINS} from './world-land-path';

/**
 * Interactive world map — shows countries Puchica does business with.
 * Uses a real Natural Earth 110m world landmass SVG path (projected
 * with d3.geoEquirectangular). Hovering/clicking a pin reveals the
 * country name + what connects us.
 *
 * Pin types:
 * - roots (ember): Guatemala, Honduras — brand heritage
 * - base  (jade):  Canada — curated in Toronto
 * - ships (cobalt): shipping destinations worldwide
 */

const TYPE_COLORS = {
  roots: 'var(--pk-ember)',
  base: 'var(--pk-jade)',
  ships: 'var(--pk-cobalt)',
};

const TYPE_LABELS = {
  roots: 'Roots',
  base: 'Home base',
  ships: 'Ships to',
};

export function WorldMap() {
  const t = useT();
  const [active, setActive] = useState(null);

  return (
    <section
      className="pk-section pk-section--world-map"
      aria-label={t('world_map_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--center">
          <span className="pk-eyebrow">{t('world_map_eyebrow')}</span>
          <h2 className="pk-section__h">{t('world_map_heading')}</h2>
          <p className="pk-section__sub">{t('world_map_sub')}</p>
        </div>

        <div className="pk-world-map">
          {/* Legend */}
          <div className="pk-world-map__legend">
            {Object.entries(TYPE_LABELS).map(([key, label]) => (
              <span key={key} className="pk-world-map__legend-item">
                <span
                  className="pk-world-map__legend-dot"
                  style={{background: TYPE_COLORS[key]}}
                  aria-hidden="true"
                />
                {label}
              </span>
            ))}
          </div>

          {/* Map */}
          <div className="pk-world-map__svg-wrap">
            <svg
              className="pk-world-map__svg"
              viewBox={WORLD_VIEWBOX}
              role="img"
              aria-label={t('world_map_aria')}
            >
              {/* Real world landmass */}
              <path
                d={WORLD_LAND_PATH}
                fill="rgba(252, 247, 238, 0.08)"
                stroke="rgba(252, 247, 238, 0.3)"
                strokeWidth="0.5"
              />

              {/* Pins */}
              {COUNTRY_PINS.map((c) => {
                const isActive = active === c.id;
                return (
                  <g
                    key={c.id}
                    className={`pk-world-map__pin ${isActive ? 'is-active' : ''}`}
                    onMouseEnter={() => setActive(c.id)}
                    onMouseLeave={() => setActive(null)}
                    onClick={() => setActive(isActive ? null : c.id)}
                    role="button"
                    tabIndex={0}
                    aria-label={c.name}
                    onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setActive(isActive ? null : c.id); } }}
                  >
                    {/* Pulse ring */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isActive ? 14 : 8}
                      fill="none"
                      stroke={TYPE_COLORS[c.type]}
                      strokeWidth="1.5"
                      opacity={isActive ? 0.5 : 0.25}
                      className="pk-world-map__pulse"
                    />
                    {/* Pin dot */}
                    <circle
                      cx={c.x}
                      cy={c.y}
                      r={isActive ? 6 : 4.5}
                      fill={TYPE_COLORS[c.type]}
                      stroke="#fff"
                      strokeWidth="1.5"
                    />
                    {/* Tooltip */}
                    {isActive && (
                      <g className="pk-world-map__tooltip">
                        <rect
                          x={c.x + 12}
                          y={c.y - 24}
                          width={Math.max(c.name.length, c.blurb.length) * 6 + 16}
                          height={42}
                          rx="6"
                          fill="rgba(30,23,18,0.95)"
                        />
                        <text x={c.x + 20} y={c.y - 9} fill="#fff" fontSize="11" fontWeight="700">{c.name}</text>
                        <text x={c.x + 20} y={c.y + 5} fill="rgba(255,255,255,0.65)" fontSize="8.5">{c.blurb}</text>
                      </g>
                    )}
                  </g>
                );
              })}
            </svg>
          </div>

          {/* Mobile fallback: list of countries */}
          <div className="pk-world-map__list">
            {COUNTRY_PINS.map((c) => (
              <button
                key={c.id}
                type="button"
                className={`pk-world-map__list-item ${active === c.id ? 'is-active' : ''}`}
                onMouseEnter={() => setActive(c.id)}
                onMouseLeave={() => setActive(null)}
                onClick={() => setActive(active === c.id ? null : c.id)}
              >
                <span className="pk-world-map__list-dot" style={{background: TYPE_COLORS[c.type]}} />
                <span className="pk-world-map__list-name">{c.name}</span>
                {active === c.id && (
                  <span className="pk-world-map__list-blurb">{c.blurb}</span>
                )}
              </button>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}