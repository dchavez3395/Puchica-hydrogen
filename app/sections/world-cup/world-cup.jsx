import {ProductRail} from '~/components/ProductRail';
import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + "See all →" + horizontal <ProductItem> rail.
 * Sources products tagged "world cup" sorted by BEST_SELLING.
 * The data shape is delivered by `HOME_WORLD_CUP_QUERY`; this
 * component is pure presentation.
 *
 * The "See all" link points to `/collections/world-cup` even
 * though that collection doesn't exist as a curated Shopify
 * smart collection yet -- the URL pattern is what the user
 * expects, and a future smart collection can be created in
 * Shopify admin without code changes.
 *
 * The section uses cream background with a thin ember accent
 * stripe under the heading. World Cup 2026 is a campaign, and
 * the audit's design system allows ember for "commercial
 * meaning" -- one token application keeps it on-brand without
 * over-saturating the page.
 *
 * @param {{ products: Array<object> }}
 */
export function WorldCup({products = []}) {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--world-cup"
      aria-label={t('world_cup_aria')}
    >
      <div className="pk-section__inner">
        <ProductRail
          products={products}
          eyebrow={t('world_cup_eyebrow')}
          heading={t('world_cup_heading')}
          seeAllLabel={t('world_cup_see_all')}
          seeAllHref="/collections/world-cup"
          scrollLeftAria={t('rail_scroll_left')}
          scrollRightAria={t('rail_scroll_right')}
        />
      </div>
    </section>
  );
}
