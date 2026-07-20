import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

const HERO_DEPARTMENTS = [
  ['Home & Kitchen', '/collections/home-kitchen', 'Everyday home'],
  ['Electronics', '/collections/electronics-accessories', 'Tech accessories'],
  ['Apparel', '/collections/apparel-accessories', 'Wearable finds'],
  ['Health & Wellness', '/collections/health-wellness', 'Care essentials'],
  ['Pet Supplies', '/collections/pet-supplies', 'Pet picks'],
  ['Sports & Outdoors', '/collections/sports-outdoors', 'Gear up'],
  ['Beauty & Grooming', '/collections/beauty-personal-care', 'Self care'],
  ['Tools & Home Improvement', '/collections/tools-home-improvement', 'Fix and upgrade'],
];

/**
 * Storefront hero: clear value prop, direct shopping paths, and a
 * department panel above the fold. Puchica is a broad ecommerce store,
 * so the hero should behave like a store entrance, not a brand poster.
 */
export function HeroSplit() {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner pk-hero-split">
        <div className="pk-hero-split__copy">
          <span className="pk-eyebrow">{t('hero_split_eyebrow')}</span>
          <h1 className="pk-hero-split__heading">{t('hero_split_heading')}</h1>
          <p className="pk-hero-split__body">{t('hero_split_body')}</p>
          <div className="pk-hero-split__ctas">
            <Link
              to="/collections"
              prefetch="viewport"
              className="pk-btn pk-btn--ink pk-btn--lg"
            >
              {t('hero_split_cta_secondary')}
            </Link>
            <Link
              to="/collections/sale"
              prefetch="viewport"
              className="pk-btn pk-btn--outline pk-btn--lg"
            >
              {t('nav_sale')}
            </Link>
          </div>
          <p className="pk-hero-split__trust">{t('hero_split_trust')}</p>
          <dl
            className="pk-hero-split__stats"
            aria-label={t('hero_store_stats_aria')}
          >
                <div>
                  <dt>Active</dt>
                  <dd>{t('hero_store_stat_products')}</dd>
                </div>
            <div>
                  <dt>12+</dt>
              <dd>{t('hero_store_stat_departments')}</dd>
            </div>
            <div>
              <dt>$0</dt>
              <dd>{t('hero_store_stat_shipping')}</dd>
            </div>
          </dl>
        </div>

        <div className="pk-hero-storefront">
          <div className="pk-hero-storefront__head">
            <span>{t('home_shop_dept_eyebrow')}</span>
            <Link to="/collections" prefetch="intent">
              {t('nav_all_products')}
            </Link>
          </div>
          <div className="pk-hero-storefront__quick">
            <Link to="/collections/new-arrivals" prefetch="intent">
              {t('nav_new_arrivals')}
            </Link>
            <Link to="/collections/sale" prefetch="intent">
              {t('nav_sale')}
            </Link>
            <Link to="/collections/best-sellers" prefetch="intent">
              {t('nav_best_sellers')}
            </Link>
            <Link to="/collections/gifts-under-25" prefetch="intent">
              {t('nav_gifts')}
            </Link>
          </div>
          <ul className="pk-hero-storefront__departments">
              {HERO_DEPARTMENTS.map(([label, href, hint]) => (
                <li key={href}>
                  <Link to={href} prefetch="intent">
                    <span>{label}</span>
                    <small>{hint}</small>
                  </Link>
                </li>
              ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
