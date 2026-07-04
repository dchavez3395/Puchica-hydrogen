import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';

/**
 * Best Sellers grid — 12 products in a 4-up (desktop) / 2-up (mobile)
 * grid. This is the densest product section on the homepage, meant
 * to feel like real shopping shelves.
 *
 * @param {{ products: Array<object> }}
 */
export function BestSellersGrid({products = []}) {
  const t = useT();
  const items = products.slice(0, 12);

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
              <ProductItem product={p} loading={i < 4 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}

// Keep the old export name for backward compat (any imports that
// still reference BestSellers).
export const BestSellers = BestSellersGrid;