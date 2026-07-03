import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';

/**
 * Eyebrow + h2 + "See all →" + 4-up <ProductItem> grid.
 * Best-sellers come from the `best-sellers` collection sorted
 * by BEST_SELLING. The grid stays at 4 across on desktop, 2 across
 * on mobile — same layout the rest of the storefront uses.
 *
 * @param {{ products: Array<object> }}
 */
export function BestSellers({products = []}) {
  const t = useT();
  const items = products.slice(0, 4);

  if (!items.length) return null;

  return (
    <section
      className="pk-section pk-section--best-sellers"
      aria-label={t('best_sellers_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <div>
            <span className="pk-eyebrow">{t('best_sellers_eyebrow')}</span>
            <h2 className="pk-section__h">{t('best_sellers_heading')}</h2>
          </div>
          <Link
            to="/collections/best-sellers"
            prefetch="intent"
            className="pk-section__see-all"
          >
            {t('best_sellers_see_all')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="pk-product-grid">
          {items.map((p, i) => (
            <li key={p.id} className="pk-product-grid__item">
              <ProductItem product={p} loading={i < 2 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
