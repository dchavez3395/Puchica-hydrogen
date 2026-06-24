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

  // Duplicate for seamless loop
  const items = [...products, ...products];

  return (
    <section className="pk-ticker" aria-label="Trending products">
      <div className="pk-ticker__label">
        <span className="pk-ticker__dot" aria-hidden="true" />
        Trending
      </div>
      <div className="pk-ticker__track">
        <div className="pk-ticker__scroll">
          {items.map((product, i) => {
            const image = product?.featuredImage;
            const price = product?.priceRange?.minVariantPrice;
            return (
              <Link
                key={`${product.id}-${i}`}
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
    </section>
  );
}