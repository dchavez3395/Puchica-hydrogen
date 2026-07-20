import {Image, Money} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Store-first homepage hero. The job here is not brand poetry; it is
 * orientation: search, jump into departments, and see live products fast.
 *
 * @param {{products?: Array<object>, categories?: Array<object>}}
 */
export function HeroSplit({products = [], categories = []}) {
  const t = useT();
  const featuredProducts = products
    .filter((product) => product?.featuredImage)
    .slice(0, 4);
  const quickDepartments = categories.slice(0, 6);

  return (
    <section
      className="pk-section pk-section--hero-split"
      aria-label={t('hero_split_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-store-hero">
          <div className="pk-store-hero__intro">
            <span className="pk-eyebrow">{t('hero_split_eyebrow')}</span>
            <h1 className="pk-store-hero__heading">{t('hero_split_heading')}</h1>
            <p className="pk-store-hero__body">{t('hero_split_body')}</p>
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

          {featuredProducts.length ? (
            <div
              className="pk-store-hero__shelf"
              aria-label={t('hero_storefront_title')}
            >
              <div className="pk-store-hero__shelf-head">
                <strong>{t('hero_popular_heading')}</strong>
                <Link to="/collections/best-sellers" prefetch="intent">
                  {t('best_sellers_see_all')}
                </Link>
              </div>
              <ul className="pk-store-hero__products">
                {featuredProducts.map((product) => (
                  <li key={product.id}>
                    <Link to={`/products/${product.handle}`} prefetch="intent">
                      <Image
                        data={product.featuredImage}
                        alt={product.featuredImage.altText || product.title}
                        aspectRatio="1/1"
                        sizes="(min-width: 980px) 18vw, 45vw"
                        loading="eager"
                      />
                      <span>
                        <strong>{product.title}</strong>
                        {product.priceRange?.minVariantPrice ? (
                          <small>
                            <Money data={product.priceRange.minVariantPrice} />
                          </small>
                        ) : null}
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
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
