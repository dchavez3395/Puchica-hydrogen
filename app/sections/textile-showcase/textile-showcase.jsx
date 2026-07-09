import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * "Shop by Department" showcase — a full-width marigold-amber band
 * that highlights the store's biggest real categories with bold
 * color tiles and direct links.
 *
 * When `collections` are passed (from the homepage loader), uses the
 * real store collections. Falls back to hardcoded departments so the
 * section always renders even if the query is still loading.
 *
 * @param {{ collections?: Array<{id: string; handle: string; title: string}> }}
 */
const FALLBACK_DEPARTMENTS = [
  {handle: 'home-kitchen', color: 'ember', labelKey: 'home_dept_home'},
  {handle: 'electronics-accessories', color: 'cobalt', labelKey: 'home_dept_electronics'},
  {handle: 'apparel-accessories', color: 'rosa', labelKey: 'home_dept_apparel'},
  {handle: 'health-wellness', color: 'jade', labelKey: 'home_dept_health'},
  {handle: 'pet-supplies', color: 'violet', labelKey: 'home_dept_pet'},
  {handle: 'sports-outdoors', color: 'ember', labelKey: 'home_dept_sports'},
];

// No marigold — the band itself is marigold, so a marigold tile would vanish.
const PALETTE = ['ember', 'cobalt', 'rosa', 'jade', 'violet'];

export function TextileShowcase({collections = []}) {
  const t = useT();

  const stalls = collections.length > 0
    ? collections.slice(0, 8).map((col, i) => ({
        handle: col.handle,
        title: col.title,
        color: PALETTE[i % PALETTE.length],
      }))
    : FALLBACK_DEPARTMENTS.map((d) => ({
        ...d,
        title: t(d.labelKey),
      }));

  return (
    <section
      className="pk-section pk-section--textile-showcase"
      aria-label={t('home_shop_dept_aria')}
    >
      <div className="pk-section__inner pk-textile-showcase">
        <div className="pk-textile-showcase__content">
          <span className="pk-eyebrow">{t('home_shop_dept_eyebrow')}</span>
          <h2 className="pk-textile-showcase__heading">
            {t('home_shop_dept_heading')}
          </h2>
          <p className="pk-textile-showcase__body">
            {t('home_shop_dept_body')}
          </p>
          <ul className="pk-dept-tiles" aria-label={t('home_shop_dept_aria')}>
            {stalls.map((dept) => (
              <li key={dept.handle} className="pk-dept-tile">
                <Link
                  to={`/collections/${dept.handle}`}
                  prefetch="intent"
                  className={`pk-dept-tile__link pk-dept-tile__link--${dept.color}`}
                >
                  <span className="pk-dept-tile__label">
                    {dept.title}
                  </span>
                  <span className="pk-dept-tile__arrow" aria-hidden="true">→</span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}