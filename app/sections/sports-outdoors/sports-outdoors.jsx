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
