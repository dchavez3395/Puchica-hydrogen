import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * Department cards should feel like shopping entrances, not empty labels.
 * Collection images are preferred; when Shopify collections have no image,
 * the homepage query provides the first best-selling product image.
 *
 * @param {{
 *   collections: Array<{
 *     id: string;
 *     handle: string;
 *     title: string;
 *     image?: {id: string; url: string; altText?: string; width?: number; height?: number} | null;
 *     products?: {nodes?: Array<{featuredImage?: {id: string; url: string; altText?: string; width?: number; height?: number} | null}>};
 *   }>;
 * }}
 */
export function ShopByCategory({collections = []}) {
  const t = useT();
  const departments = collections.slice(0, 8);

  if (!departments.length) return null;

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
          {departments.map((collection) => {
            const image =
              collection.image ?? collection.products?.nodes?.[0]?.featuredImage;

            return (
              <li key={collection.id} className="pk-stall">
                <Link
                  to={`/collections/${collection.handle}`}
                  className="pk-stall__link"
                  prefetch="intent"
                  aria-label={collection.title}
                >
                  {image ? (
                    <span className="pk-stall__media" aria-hidden="true">
                      <Image
                        data={image}
                        alt={image.altText || collection.title}
                        aspectRatio="4/3"
                        sizes="(min-width: 980px) 22vw, 50vw"
                        loading="lazy"
                      />
                    </span>
                  ) : null}
                  <span className="pk-stall__content">
                    <span className="pk-stall__label">
                      {t('shop_by_category_shop_cta')}
                    </span>
                    <h3 className="pk-stall__title">{collection.title}</h3>
                  </span>
                  <span className="pk-stall__arrow" aria-hidden="true">
                    -&gt;
                  </span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
