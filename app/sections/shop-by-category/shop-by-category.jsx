import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * 8-collection grid. Each cell: 1:1 image + title + product count.
 * Ordering is hard-coded at the query level (the Storefront API
 * does not sort Collection by product count, so the route pins
 * the 8 handles in display order). If a collection has no image
 * we fall back to a placeholder.
 *
 * @param {{
 *   collections: Array<{
 *     id: string;
 *     handle: string;
 *     title: string;
 *     image?: { url: string; altText?: string; width?: number; height?: number } | null;
 *   }>;
 * }}
 */
export function ShopByCategory({collections = []}) {
  const t = useT();
  const tiles = collections.slice(0, 8);

  if (!tiles.length) return null;

  return (
    <section
      className="pk-section pk-section--shop-by-category"
      aria-label={t('shop_by_category_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head">
          <span className="pk-eyebrow">{t('shop_by_category_eyebrow')}</span>
          <h2 className="pk-section__h">{t('shop_by_category_heading')}</h2>
        </div>
        <ul className="pk-cat-grid">
          {tiles.map((col) => (
            <li key={col.id} className="pk-cat-tile">
              <Link
                to={`/collections/${col.handle}`}
                className="pk-cat-tile__link"
                prefetch="intent"
              >
                <div className="pk-cat-tile__media">
                  {col.image ? (
                    <Image
                      data={col.image}
                      alt={col.image.altText || col.title}
                      aspectRatio="1/1"
                      sizes="(min-width: 1024px) 25vw, (min-width: 700px) 33vw, 50vw"
                    />
                  ) : (
                    <div
                      className="pk-cat-tile__placeholder"
                      aria-hidden="true"
                    >
                      {col.title}
                    </div>
                  )}
                </div>
                <div className="pk-cat-tile__body">
                  <h3 className="pk-cat-tile__title">{col.title}</h3>
                </div>
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
