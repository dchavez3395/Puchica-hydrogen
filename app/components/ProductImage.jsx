import {useEffect, useState} from 'react';
import {Image} from '@shopify/hydrogen';
import {IconChevronLeft, IconChevronRight} from '~/components/Icons';

/**
 * Renders a vertical-thumbnail gallery on desktop and a swipeable
 * single-image carousel on mobile. If only one image is available,
 * falls back to a single full-bleed image.
 *
 * @param {{
 *   images: ProductVariantFragment['image'][];
 *   initialIndex?: number;
 *   productTitle?: string;  // used as a meaningful alt fallback for
 *                            // merchants who didn't set altText in
 *                            // Shopify admin. Without this the alt
 *                            // would either be empty (which Google
 *                            // treats as missing) or the literal
 *                            // "Product image" (low-quality alt).
 * }}
 */
export function ProductImage({images, initialIndex = 0, productTitle}) {
  const list = (images || []).filter(Boolean);
  const [index, setIndex] = useState(
    Math.min(Math.max(0, initialIndex), Math.max(0, list.length - 1)),
  );

  // Stable key for the images array — re-runs the effect only when the
  // underlying image ids actually change. We extract it to a variable so
  // eslint's react-hooks rule can statically verify the dep.
  const imageKey = list.map((i) => i.id || i.url).join('|');

  // If the variant image changes from the outside (parent passes a new
  // images array), snap to the first one. This keeps the gallery in sync
  // when the user picks a different option.
  useEffect(() => {
    setIndex(0);
  }, [imageKey]);

  if (list.length === 0) {
    return <div className="pk-product__hero" aria-hidden />;
  }

  const current = list[index];
  const go = (delta) => {
    setIndex((i) => (i + delta + list.length) % list.length);
  };

  return (
    <>
      <div className="pk-product__media">
        {list.length > 1 && (
          <ul className="pk-thumbs" aria-label="Product images">
            {list.map((img, i) => (
              <li key={img.id || i}>
                <button
                  type="button"
                  className="pk-thumbs__item"
                  aria-current={i === index ? 'true' : 'false'}
                  aria-label={`View image ${i + 1} of ${list.length}`}
                  onClick={() => setIndex(i)}
                >
                  <Image
                    alt={img.altText || productTitle || 'Product image'}
                    data={img}
                    aspectRatio="1/1"
                    sizes="80px"
                    loading={i < 4 ? 'eager' : 'lazy'}
                  />
                </button>
              </li>
            ))}
          </ul>
        )}

        <div className="pk-product__hero">
          <Image
            alt={current.altText || productTitle || 'Product image'}
            data={current}
            aspectRatio="1/1"
            sizes="(min-width: 60em) 600px, 100vw"
            loading={index === 0 ? 'eager' : 'lazy'}
          />
          {list.length > 1 && (
            <>
              <button
                type="button"
                className="pk-product__hero-nav pk-product__hero-nav--prev"
                aria-label="Previous image"
                onClick={() => go(-1)}
              >
                <IconChevronLeft size={18} />
              </button>
              <button
                type="button"
                className="pk-product__hero-nav pk-product__hero-nav--next"
                aria-label="Next image"
                onClick={() => go(1)}
              >
                <IconChevronRight size={18} />
              </button>
            </>
          )}
        </div>
      </div>

      {list.length > 1 && (
        <div className="pk-gallery-dots" aria-hidden>
          {list.map((img, i) => (
            <button
              key={img.id || img.url || `dot-${i}`}
              type="button"
              aria-label={`Go to image ${i + 1}`}
              aria-current={i === index ? 'true' : 'false'}
              onClick={() => setIndex(i)}
            />
          ))}
        </div>
      )}
    </>
  );
}

/** @typedef {import('storefrontapi.generated').ProductVariantFragment} ProductVariantFragment */
