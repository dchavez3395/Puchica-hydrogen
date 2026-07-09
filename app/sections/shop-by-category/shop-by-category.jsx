import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Department "stalls" — the signature of the mercadito-moderno
 * homepage. Each of the 8 top-level departments is a bold, solid
 * color block (no photo dependency), rotating through the market
 * palette: clay / jade / cobalt / marigold / rosa / violet. This
 * replaces the old photo-tile grid, so it never renders a broken
 * or empty image well.
 *
 * @param {{
 *   collections: Array<{id: string; handle: string; title: string}>;
 * }}
 */
export function ShopByCategory({collections = []}) {
  const t = useT();
  const stalls = collections.slice(0, 8);

  if (!stalls.length) return null;

  return (
    <section
      className="pk-section pk-section--shop-by-category"
      aria-label={t('shop_by_category_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head">
          <span className="pk-eyebrow">{t('shop_by_category_eyebrow')}</span>
          <h2 className="pk-section__h">{t('shop_by_category_heading')}</h2>
          <p className="pk-section__sub">{t('shop_by_category_sub')}</p>
        </div>
        <ul className="pk-stalls">
          {stalls.map((col) => (
            <li key={col.id} className="pk-stall">
              <Link
                to={`/collections/${col.handle}`}
                className="pk-stall__link"
                prefetch="intent"
                aria-label={col.title}
              >
                <span className="pk-stall__label">
                  {t('shop_by_category_shop_cta')}
                </span>
                <h3 className="pk-stall__title">{col.title}</h3>
                <span className="pk-stall__arrow" aria-hidden="true">
                  →
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
