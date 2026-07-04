import {ProductRail} from '~/components/ProductRail';
import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + "See all →" + horizontal <ProductItem> rail, 8 cards.
 * Sources the top-level `products` connection sorted by CREATED_AT
 * desc (so "new" means store-wide, not one category). The actual
 * data shape is delivered by `HOME_NEW_ARRIVALS_QUERY` in the
 * loader; this component is pure presentation.
 *
 * The rail chrome (scroll-state, vendor diversification, card
 * layout) lives in <ProductRail> so the sports and world-cup
 * sections can share it without copy-pasting the JSX.
 *
 * @param {{ products: Array<object> }}
 */
export function NewArrivals({products = []}) {
  const t = useT();

  return (
    <section
      className="pk-section pk-section--new-arrivals"
      aria-label={t('new_arrivals_aria')}
    >
      <div className="pk-section__inner">
        <ProductRail
          products={products}
          eyebrow={t('new_arrivals_eyebrow')}
          heading={t('new_arrivals_heading')}
          seeAllLabel={t('new_arrivals_see_all')}
          seeAllHref="/collections/all"
          scrollLeftAria={t('new_arrivals_scroll_left')}
          scrollRightAria={t('new_arrivals_scroll_right')}
        />
      </div>
    </section>
  );
}
