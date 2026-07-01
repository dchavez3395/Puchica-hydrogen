import {useEffect, useState} from 'react';
import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';

/**
 * TrendingTicker — horizontal scrolling ticker of trending products.
 * Pauses on hover. Duplicates list for seamless loop.
 *
 * Respects prefers-reduced-motion: reduce (both via CSS media query and
 * via a JS state that removes the duplicated list from the DOM, so
 * screen readers and accessibility tools that ignore the media query
 * still don't read every product twice).
 *
 * @param {Object} props
 * @param {Array} props.products - product nodes from Storefront API
 */
export function TrendingTicker({products = []}) {
  const [reducedMotion, setReducedMotion] = useState(false);

  useEffect(() => {
    if (typeof window === 'undefined' || !window.matchMedia) return;
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)');
    const onChange = (e) => setReducedMotion(e.matches);
    setReducedMotion(mq.matches);
    if (mq.addEventListener) mq.addEventListener('change', onChange);
    else mq.addListener(onChange);
    return () => {
      if (mq.removeEventListener) mq.removeEventListener('change', onChange);
      else mq.removeListener(onChange);
    };
  }, []);

  if (!products.length) return null;

  // Duplicate for seamless loop (desktop only, and only when motion is
  // allowed). When the user prefers reduced motion, the CSS already
  // disables the animation, so we drop the duplicated set so screen
  // readers and a11y tools don't read every product twice.
  const items = reducedMotion ? products : [...products, ...products];

  return (
    <section className="pk-ticker" aria-label="Trending products">
      <div className="pk-ticker__label">
        <span className="pk-ticker__dot" aria-hidden="true" />
        Trending
      </div>

      {/* Desktop: horizontal auto-scroll */}
      <div className="pk-ticker__track">
        <div className="pk-ticker__scroll">
          {items.map((product, index) => {
            const image = product?.featuredImage;
            const price = product?.priceRange?.minVariantPrice;
            return (
              <Link
                key={`tt-${product.id}-${product.handle}-${index}`}
                to={`/products/${product.handle}`}
                className="pk-ticker__item"
                prefetch="intent"
              >
                {image && (
                  <Image
                    alt={image.altText || product.title}
                    data={image}
                    sizes="48px"
                    loading="lazy"
                    className="pk-ticker__img"
                    style={{width: 32, height: 32, flexShrink: 0}}
                  />
                )}
                <span className="pk-ticker__title">{product.title}</span>
                {price && (
                  <span className="pk-ticker__price">
                    ${parseFloat(price.amount).toFixed(0)}
                  </span>
                )}
              </Link>
            );
          })}
        </div>
      </div>

      {/* Mobile: vertical column list (no duplicates) */}
      <div className="pk-ticker__col">
        {products.slice(0, 6).map((product) => {
          const image = product?.featuredImage;
          const price = product?.priceRange?.minVariantPrice;
          return (
            <Link
              key={`ttm-${product.id}`}
              to={`/products/${product.handle}`}
              className="pk-ticker__col-item"
              prefetch="intent"
            >
              {image && (
                <img
                  src={image.url}
                  alt={image.altText || product.title}
                  width={44}
                  height={44}
                  loading="lazy"
                  className="pk-ticker__col-img"
                />
              )}
              <span className="pk-ticker__col-name">{product.title}</span>
              {price && (
                <span className="pk-ticker__col-price">
                  ${parseFloat(price.amount).toFixed(0)}
                </span>
              )}
            </Link>
          );
        })}
      </div>
    </section>
  );
}
