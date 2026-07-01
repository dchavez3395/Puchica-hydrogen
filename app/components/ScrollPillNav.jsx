import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useEffect, useRef, useState} from 'react';

const PILLS = [
  {id: 'section-discover',     label: 'Trending'},
  {id: 'section-rack',         label: 'Home & Kitchen'},
  {id: 'section-new-arrivals', label: 'Outdoor'},
  {id: 'section-categories',   label: 'Categories'},
  {id: 'section-best-sellers', label: 'Best Sellers'},
  {id: null,                   label: 'About us', href: '/pages/about'},
];

export function ScrollPillNav({heroId = 'hero-anchor'}) {
  const [shown, setShown] = useState(false);
  const [active, setActive] = useState(null);
  const spyRef = useRef(null);

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
      aria-label="Page sections"
      data-shown={shown ? 'true' : 'false'}
    >
      <ul className="pk-pill-nav__list">
        {PILLS.map(({id, label, href}) =>
          href ? (
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
          ),
        )}
      </ul>
    </nav>
  );
}
