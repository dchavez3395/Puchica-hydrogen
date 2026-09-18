import {useLocation} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * The shared top of every collection page: breadcrumb, eyebrow, title, sub,
 * and the All / Pendants / Wall sconces chips. /collections/all and the two
 * smart collections (pendant-lights, wall-sconces) render this identically so
 * moving between them feels like filtering one range, not visiting three
 * pages. The chips are plain links, so they work without JS and the current
 * one carries aria-current for assistive tech and the dark chip style.
 *
 * @param {{eyebrow: string, title: string, sub?: string, crumb: string}} props
 */
export function CollectionHero({eyebrow, title, sub, crumb}) {
  const t = useT();
  return (
    <header className="pk-col-hero pk-col-hero--bold">
      <div className="pk-collection__inner">
        <nav className="pk-breadcrumbs" aria-label={t('breadcrumb_aria')}>
          <Link to="/">{t('breadcrumb_home')}</Link>
          <span className="pk-breadcrumbs__sep">/</span>
          <span className="pk-breadcrumbs__current">{crumb}</span>
        </nav>
        <span className="pk-col-hero__eyebrow">{eyebrow}</span>
        <h1 className="pk-col-hero__title">{title}</h1>
        {sub ? <p className="pk-col-hero__sub">{sub}</p> : null}
        <CollectionChips />
      </div>
    </header>
  );
}

const CHIPS = [
  {to: '/collections/all', key: 'col_chip_all'},
  {to: '/collections/pendant-lights', key: 'nav_pendants'},
  {to: '/collections/wall-sconces', key: 'nav_sconces'},
];

export function CollectionChips() {
  const t = useT();
  const {pathname} = useLocation();
  // Locale prefixes (/fr/collections/all) still end with the chip's path.
  const current = (to) => pathname.replace(/\/$/, '').endsWith(to);
  return (
    <nav className="wr-chips" aria-label={t('col_filter_aria')}>
      {CHIPS.map((chip) => (
        <Link
          key={chip.to}
          className="wr-chip"
          to={chip.to}
          prefetch="intent"
          aria-current={current(chip.to) ? 'page' : undefined}
        >
          {t(chip.key)}
        </Link>
      ))}
    </nav>
  );
}
