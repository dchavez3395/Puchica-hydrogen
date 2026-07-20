import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {ProductItem} from '~/components/ProductItem';
import {useT} from '~/lib/t';

/**
 * Top-of-page retail shelf. Sale products deserve a fixed grid here:
 * shoppers can immediately scan real merchandise without carousel chrome.
 *
 * @param {{products: Array<object>}}
 */
export function TodayDeals({products = []}) {
  const t = useT();
  const items = products.slice(0, 4);

  if (!items.length) return null;

  return (
    <section
      className="pk-section pk-section--today-deals"
      aria-label={t('today_deals_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <div>
            <span className="pk-eyebrow">{t('today_deals_eyebrow')}</span>
            <h2 className="pk-section__h">{t('today_deals_heading')}</h2>
          </div>
          <Link
            to="/collections/sale"
            prefetch="intent"
            className="pk-section__see-all"
          >
            {t('today_deals_see_all')}
          </Link>
        </div>
        <ul className="pk-product-grid pk-product-grid--deals">
          {items.map((product, index) => (
            <li key={product.id} className="pk-product-grid__item">
              <ProductItem product={product} loading={index < 2 ? 'eager' : 'lazy'} />
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
