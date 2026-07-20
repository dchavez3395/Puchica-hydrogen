import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Storefront hero: a broad-store entrance, not a split promo panel.
 * The first decision should be search or shop, with departments
 * handled by the dedicated section immediately below.
 */
export function HeroSplit() {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner pk-hero-split">
        <div className="pk-hero-split__content">
          <span className="pk-eyebrow">{t('hero_split_eyebrow')}</span>
          <h1 className="pk-hero-split__heading">{t('hero_split_heading')}</h1>
          <p className="pk-hero-split__body">{t('hero_split_body')}</p>

          <form className="pk-hero-search" action="/search" method="get">
            <label className="visually-hidden" htmlFor="hero-search">
              {t('search_submit_label')}
            </label>
            <input
              id="hero-search"
              type="search"
              name="q"
              placeholder={t('search_placeholder')}
              autoComplete="off"
            />
            <button type="submit">{t('search_submit_label')}</button>
          </form>

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

          <nav className="pk-hero-quick" aria-label={t('hero_storefront_title')}>
            <Link to="/collections/new-arrivals" prefetch="intent">
              {t('nav_new_arrivals')}
            </Link>
            <Link to="/collections/best-sellers" prefetch="intent">
              {t('nav_best_sellers')}
            </Link>
            <Link to="/collections/gifts-under-25" prefetch="intent">
              {t('nav_gifts')}
            </Link>
            <Link to="/collections/home-kitchen" prefetch="intent">
              Home & Kitchen
            </Link>
          </nav>

          <div className="pk-hero-split__trust" aria-label={t('hero_store_stats_aria')}>
            <span>{t('hero_trust_returns')}</span>
            <span>{t('hero_trust_checkout')}</span>
            <span>{t('hero_trust_canada')}</span>
          </div>
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
      </div>
    </section>
  );
}
