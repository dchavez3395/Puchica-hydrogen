import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * 8-collection grid. Each cell shows a real product photo (the
 * first best-selling product in the collection), with the
 * category title and a "Shop →" affordance below. The route
 * hard-codes the 8 category handles (the Storefront API does
 * not sort Collection by product count, so the visual order
 * is pinned).
 *
 * The `Collection.image` field is often null in this store
 * because no merchandiser has uploaded collection images yet.
 * The loader's `HomeCategoryTile` fragment also pulls the
 * first product's `featuredImage` as a fallback so the tile
 * is always a real photo. If both are missing, the section
 * renders a calm monogram tile instead of the old
 * text-twice placeholder.
 *
 * @param {{
 *   collections: Array<{
 *     id: string;
 *     handle: string;
 *     title: string;
 *     image?: { url: string; altText?: string; width?: number; height?: number } | null;
 *     products?: { nodes?: Array<{ featuredImage?: { url: string; altText?: string; width?: number; height?: number } | null }> };
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
          {tiles.map((col) => {
            // Prefer the first product's featured image (the
            // collection's `image` field is null for most of the
            // 8 top-level categories in this store). Both come
            // from `HomeCategoryTile`.
            const tileImage =
              col.products?.nodes?.[0]?.featuredImage ?? col.image ?? null;
            return (
              <li key={col.id} className="pk-cat-tile">
                <Link
                  to={`/collections/${col.handle}`}
                  className="pk-cat-tile__link"
                  prefetch="intent"
                  aria-label={col.title}
                >
                  <div className="pk-cat-tile__media">
                    {tileImage ? (
                      <Image
                        data={tileImage}
                        alt={tileImage.altText || col.title}
                        aspectRatio="1/1"
                        sizes="(min-width: 1024px) 25vw, (min-width: 700px) 33vw, 50vw"
                      />
                    ) : (
                      <div
                        className="pk-cat-tile__monogram"
                        aria-hidden="true"
                      >
                        <span className="pk-cat-tile__monogram-glyph">
                          {initials(col.title)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pk-cat-tile__body">
                    <h3 className="pk-cat-tile__title">{col.title}</h3>
                    <span className="pk-cat-tile__cta">
                      {t('shop_by_category_shop_cta')}
                      <span aria-hidden="true"> →</span>
                    </span>
                  </div>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}

/**
 * First letter of the first two words of a category title, e.g.
 * "Home & Kitchen" → "H&", "Pet Supplies" → "PS". Used only when
 * the loader gave us neither a product image nor a collection
 * image — a graceful "we have nothing" mark, not a fake picture.
 */
function initials(title) {
  const words = String(title).split(/\s+/).filter(Boolean);
  if (!words.length) return '·';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}
