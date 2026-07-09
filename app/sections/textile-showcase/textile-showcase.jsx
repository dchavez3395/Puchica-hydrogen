import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * "Shop by Department" showcase — a full-width marigold-amber band
 * that highlights the store's biggest real categories with bold
 * color tiles and direct links. Replaces the textile showcase
 * (which referenced products we don't sell).
 *
 * Uses the store's actual top collections: Home & Kitchen, Electronics,
 * Apparel, Health & Wellness, Pet Supplies, Sports & Outdoors.
 * Pure presentational — no GraphQL. Copy from i18n (home_shop_dept_*).
 */
const DEPARTMENTS = [
  {handle: 'home-kitchen', color: 'ember', labelKey: 'home_dept_home'},
  {handle: 'electronics-accessories', color: 'cobalt', labelKey: 'home_dept_electronics'},
  {handle: 'apparel-accessories', color: 'rosa', labelKey: 'home_dept_apparel'},
  {handle: 'health-wellness', color: 'jade', labelKey: 'home_dept_health'},
  {handle: 'pet-supplies', color: 'marigold', labelKey: 'home_dept_pet'},
  {handle: 'sports-outdoors', color: 'violet', labelKey: 'home_dept_sports'},
];

export function TextileShowcase() {
  const t = useT();
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
            {DEPARTMENTS.map((dept) => (
              <li key={dept.handle} className="pk-dept-tile">
                <Link
                  to={`/collections/${dept.handle}`}
                  prefetch="intent"
                  className={`pk-dept-tile__link pk-dept-tile__link--${dept.color}`}
                >
                  <span className="pk-dept-tile__label">
                    {t(dept.labelKey)}
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