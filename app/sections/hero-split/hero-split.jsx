import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image, Money} from '@shopify/hydrogen';
import {useT} from '~/lib/t';

/**
 * Storefront hero: a merchandised store entrance. It leads with search,
 * but proves there are real products to browse with live product imagery.
 */
export function HeroSplit({products = []}) {
  const t = useT();
  const featuredProducts = products
    .filter((product) => product?.featuredImage)
    .slice(0, 1);
  const leadProduct = featuredProducts[0];

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner pk-hero-split">
        <div className="pk-hero-split__content">
          <div className="pk-hero-split__copy">
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
          </div>

          <div className="pk-hero-merch" aria-label={t('hero_storefront_title')}>
            <Link
              to={leadProduct ? `/products/${leadProduct.handle}` : '/collections/best-sellers'}
              prefetch="intent"
              className="pk-hero-merch__feature"
            >
              <span className="pk-hero-merch__badge">{t('nav_best_sellers')}</span>
              {leadProduct?.featuredImage ? (
                <Image
                  data={leadProduct.featuredImage}
                  alt={leadProduct.featuredImage.altText || leadProduct.title}
                  aspectRatio="4/3"
                  sizes="(min-width: 980px) 520px, 100vw"
                  loading="eager"
                  className="pk-hero-merch__feature-img"
                />
              ) : (
                <span className="pk-hero-merch__placeholder">Puchica</span>
              )}
              <span className="pk-hero-merch__feature-copy">
                <strong>{leadProduct?.title || t('best_sellers_heading')}</strong>
                {leadProduct?.priceRange?.minVariantPrice ? (
                  <small>
                    <Money data={leadProduct.priceRange.minVariantPrice} />
                  </small>
                ) : (
                  <small>{t('nav_best_sellers')}</small>
                )}
              </span>
            </Link>
          </div>

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
