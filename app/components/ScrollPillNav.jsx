import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useEffect, useRef, useState} from 'react';
import {useT} from '~/lib/t';

// PILL definition uses translation keys, not literal labels — the render
// passes t() in and resolves them to the active locale. Section ids are
// hard-coded because they have to match the DOM, but labels are per-locale.
const PILLS = [
  {id: 'section-discover',     labelKey: 'pillnav_trending'},
  {id: 'section-rack',         labelKey: 'pillnav_home_kitchen'},
  {id: 'section-new-arrivals', labelKey: 'pillnav_outdoor'},
  {id: 'section-categories',   labelKey: 'pillnav_categories'},
  {id: 'section-best-sellers', labelKey: 'pillnav_best_sellers'},
  {id: null,                   labelKey: 'pillnav_about_us', href: '/pages/about'},
];

export function ScrollPillNav({heroId = 'hero-anchor'}) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(null);
  const spyRef = useRef(null);
  const t = useT();

  useEffect(() => {
    const hero = document.getElementById(heroId);
    if (!hero) return;
    const obs = new IntersectionObserver(
      ([entry]) => setShown(!entry.isIntersecting),
      {threshold: 0},
    );
    obs.observe(hero);
    return () => obs.disconnect();
  }, [heroId]);

  useEffect(() => {
    const targets = PILLS
      .filter((p) => p.id)
      .map((p) => document.getElementById(p.id))
      .filter(Boolean);
    if (!targets.length) return;
    const obs = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) setActive(entry.target.id);
        });
      },
      {rootMargin: '-30% 0px -60% 0px', threshold: 0},
    );
    targets.forEach((t) => obs.observe(t));
    spyRef.current = obs;
    return () => obs.disconnect();
  }, []);

  function handleAnchorClick(e, id) {
    e.preventDefault();
    document.getElementById(id)?.scrollIntoView({behavior: 'smooth', block: 'start'});
  }

  return (
    <nav
      className="pk-pill-nav"
      aria-label={t('pillnav_aria')}
      data-shown={shown ? 'true' : 'false'}
    >
      <ul className="pk-pill-nav__list">
        {PILLS.map(({id, labelKey, href}) => {
          const label = t(labelKey);
          return href ? (
            <li key={label}>
              <Link to={href} className="pk-pill-nav__pill">
                {label}
              </Link>
            </li>
          ) : (
            <li key={id}>
              <a
                href={`#${id}`}
                className="pk-pill-nav__pill"
                data-active={active === id ? 'true' : 'false'}
                onClick={(e) => handleAnchorClick(e, id)}
              >
                {label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
