import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {ProductRail} from '~/components/ProductRail';
import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + "See all →" + horizontal <ProductItem> rail.
 * Sources products with product_type "Sports & Outdoors" sorted
 * by BEST_SELLING. The data shape is delivered by
 * `HOME_SPORTS_QUERY`; this component is pure presentation.
 *
 * The "See all" link points to `/collections/sports-outdoors`
 * even though that collection doesn't exist as a curated
 * Shopify smart collection yet -- the URL pattern is what the
 * user expects, and a future smart collection can be created
 * in Shopify admin without code changes.
 *
 * @param {{ products: Array<object> }}
 */
export function SportsOutdoors({products = []}) {
  const t = useT();

  // A single supplier image becomes a giant, visually dominant card in the
  // static grid. Keep this merchandising rail for an actual assortment only.
  if (products.length < 2) return null;

  if (products.length <= 4) {
    return (
      <section
        className="pk-section pk-section--sports pk-section--sports-static"
        aria-label={t('sports_aria')}
      >
        <div className="pk-section__inner">
          <div className="pk-section__head">
            <div>
              <span className="pk-eyebrow">{t('sports_eyebrow')}</span>
              <h2 className="pk-section__h">{t('sports_heading')}</h2>
            </div>
            <Link
              className="pk-section__link"
              to="/collections/sports-outdoors"
              prefetch="intent"
            >
              {t('sports_see_all')}
            </Link>
          </div>
          <ul className="pk-sports-static-grid">
            {products.map((product) => (
              <li key={product.id}>
                <ProductItem product={product} />
              </li>
            ))}
          </ul>
        </div>
      </section>
    );
  }

  return (
    <section
      className="pk-section pk-section--sports"
      aria-label={t('sports_aria')}
    >
      <div className="pk-section__inner">
        <ProductRail
          products={products}
          eyebrow={t('sports_eyebrow')}
          heading={t('sports_heading')}
          seeAllLabel={t('sports_see_all')}
          seeAllHref="/collections/sports-outdoors"
          scrollLeftAria={t('rail_scroll_left')}
          scrollRightAria={t('rail_scroll_right')}
        />
      </div>
    </section>
  );
}
