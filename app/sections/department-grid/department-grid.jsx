import {Image} from '@shopify/hydrogen';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {useT} from '~/lib/t';

/**
 * DepartmentGrid — 15 department tiles in a responsive grid.
 *
 * Replaces the old ShopByCategory (which showed only 8). This version
 * shows all 15 departments with real product images, handles, and a
 * "Shop →" affordance. The grid is dense and compact — department
 * store energy, not editorial blocks.
 *
 * Product counts are hard-coded from the known catalog (the Storefront
 * API doesn't expose productsCount on Collection). If a count changes,
 * update DEPARTMENT_COUNTS below.
 */
const DEPARTMENT_COUNTS = {
  'phone-case': 2038,
  'home-kitchen': 1300,
  'electronics-accessories': 694,
  'apparel-accessories': 527,
  'health-wellness': 386,
  'sports-outdoors': 199,
  'pet-supplies': 192,
  'automotive': 119,
  'tools-home-improvement': 110,
  'beauty-personal-care': 106,
  'toys-games': 96,
  'home-decor': 86,
  'office-school': 73,
  'baby-nursery': 70,
  'outdoor-garden': 60,
};

export function DepartmentGrid({collections = []}) {
  const t = useT();

  if (!collections.length) return null;

  return (
    <section
      className="pk-section pk-section--departments"
      aria-label={t('shop_by_category_aria')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <div>
            <span className="pk-eyebrow">{t('dept_grid_eyebrow')}</span>
            <h2 className="pk-section__h">{t('dept_grid_heading')}</h2>
          </div>
          <Link
            to="/collections/all"
            prefetch="intent"
            className="pk-section__see-all"
          >
            {t('dept_grid_see_all')} <span aria-hidden="true">→</span>
          </Link>
        </div>
        <ul className="pk-dept-grid">
          {collections.map((col) => {
            const tileImage =
              col.products?.nodes?.[0]?.featuredImage ?? col.image ?? null;
            const count = DEPARTMENT_COUNTS[col.handle];
            return (
              <li key={col.id} className="pk-dept-tile">
                <Link
                  to={`/collections/${col.handle}`}
                  className="pk-dept-tile__link"
                  prefetch="intent"
                  aria-label={col.title}
                >
                  <div className="pk-dept-tile__media">
                    {tileImage ? (
                      <Image
                        data={tileImage}
                        alt={tileImage.altText || col.title}
                        aspectRatio="1/1"
                        sizes="(min-width: 1024px) 20vw, (min-width: 700px) 25vw, 33vw"
                        loading="lazy"
                      />
                    ) : (
                      <div className="pk-dept-tile__monogram" aria-hidden="true">
                        <span className="pk-dept-tile__monogram-glyph">
                          {initials(col.title)}
                        </span>
                      </div>
                    )}
                  </div>
                  <div className="pk-dept-tile__body">
                    <h3 className="pk-dept-tile__title">{col.title}</h3>
                    {count ? (
                      <span className="pk-dept-tile__count">
                        {count.toLocaleString()} products
                      </span>
                    ) : null}
                    <span className="pk-dept-tile__cta">
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

function initials(title) {
  const words = String(title).split(/\s+/).filter(Boolean);
  if (!words.length) return '·';
  if (words.length === 1) return words[0].slice(0, 2).toUpperCase();
  return (words[0][0] + words[1][0]).toUpperCase();
}