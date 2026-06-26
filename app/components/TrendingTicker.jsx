import {Link} from 'react-router';
import {Image} from '@shopify/hydrogen';

/**
 * TrendingTicker — horizontal scrolling ticker of trending products.
 * Pauses on hover. Duplicates list for seamless loop.
 *
 * @param {Object} props
 * @param {Array} props.products - product nodes from Storefront API
 */
export function TrendingTicker({products = []}) {
  if (!products.length) return null;

  // Duplicate for seamless loop (desktop only)
  const items = [...products, ...products];

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
