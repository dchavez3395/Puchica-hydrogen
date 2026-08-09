import {useState, useEffect} from 'react';
import {useRouteLoaderData} from 'react-router';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {getRecentlyViewed} from '~/lib/recentlyViewed';
import {useT} from '~/lib/t';

/**
 * Recently Viewed rail — shows products the shopper has previously
 * visited, pulled from localStorage. Renders on the PDP below the
 * recommendations section. Client-only (reads localStorage).
 *
 * @param {{ currentHandle?: string }} props
 */
export function RecentlyViewed({currentHandle}) {
  const t = useT();
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country || 'CA';
  const [recent, setRecent] = useState([]);

  useEffect(() => {
    const list = getRecentlyViewed(market).filter(
      (p) => p.handle !== currentHandle,
    );
    setRecent(list.slice(0, 8));
  }, [currentHandle, market]);

  if (recent.length === 0) return null;

  return (
    <section
      className="pk-section pk-section--recently-viewed"
      aria-label={t('product_recently_viewed_title')}
    >
      <div className="pk-section__inner">
        <div className="pk-section__head pk-section__head--row">
          <h2 className="pk-section__h">
            {t('product_recently_viewed_title')}
          </h2>
        </div>
        <ul className="pk-rail__track pk-recently-viewed__track">
          {recent.map((item) => (
            <li key={item.handle} className="pk-rail__item pk-recently-viewed__item">
              <Link
                to={`/products/${item.handle}`}
                prefetch="intent"
                className="pk-recently-viewed__link"
              >
                {item.image && (
                  <div className="pk-recently-viewed__media">
                    <Image
                      data={{
                        url: item.image.url,
                        alt: item.image.altText || item.title,
                        width: item.image.width || 200,
                        height: item.image.height || 200,
                      }}
                      alt={item.image.altText || item.title}
                      aspectRatio="1/1"
                      sizes="200px"
                      loading="lazy"
                    />
                  </div>
                )}
                <span className="pk-recently-viewed__title">{item.title}</span>
                {item.price && (
                  <span className="pk-recently-viewed__price">
                    <CurrencyMoney data={item.price} />
                  </span>
                )}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
