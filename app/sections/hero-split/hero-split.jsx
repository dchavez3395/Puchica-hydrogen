import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Store-first homepage hero. The job here is not brand poetry; it is
 * orientation: search, jump into departments, and see live products fast.
 *
 * @param {{categories?: Array<object>}}
 */
export function HeroSplit({categories = []}) {
  const t = useT();
  const quickDepartments = categories.slice(0, 8);

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-store-hero">
          <div className="pk-store-hero__intro">
            <h1 className="pk-store-hero__heading">{t('hero_store_toolbar_heading')}</h1>
          </div>

          <form className="pk-store-hero__search" action="/search" method="get">
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

          <div className="pk-store-hero__actions">
            <Link to="/collections" prefetch="viewport" className="pk-btn pk-btn--ink">
              {t('hero_split_cta_secondary')}
            </Link>
            <Link to="/collections/sale" prefetch="viewport" className="pk-btn pk-btn--outline">
              {t('nav_sale')}
            </Link>
            <Link
              to="/collections/best-sellers"
              prefetch="viewport"
              className="pk-btn pk-btn--outline"
            >
              {t('nav_best_sellers')}
            </Link>
          </div>

          {quickDepartments.length ? (
            <nav
              className="pk-store-hero__departments"
              aria-label={t('shop_by_category_aria')}
            >
              {quickDepartments.map((collection) => (
                <Link
                  key={collection.id}
                  to={`/collections/${collection.handle}`}
                  prefetch="intent"
                >
                  {collection.title}
                </Link>
              ))}
            </nav>
          ) : null}

          <div className="pk-store-hero__trust" aria-label={t('hero_store_stats_aria')}>
            <span>{t('hero_trust_returns')}</span>
            <span>{t('hero_trust_checkout')}</span>
            <span>{t('hero_trust_canada')}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
