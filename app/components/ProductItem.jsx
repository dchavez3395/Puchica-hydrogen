import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 * }}
 */
export function ProductItem({product, loading}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  return (
    <Link
      className="pk-card pk-card--link"
      key={product.id}
      prefetch="intent"
      to={variantUrl}
    >
      <div className="pk-card__media">
        {image && (
          <Image
            alt={image.altText || product.title}
            aspectRatio="1/1"
            data={image}
            loading={loading}
            sizes="(min-width: 45em) 25vw, 50vw"
          />
        )}
      </div>
      <div className="pk-card__body">
        <span className="pk-card__title">{product.title}</span>
        <div className="pk-card__price">
          <Money data={product.priceRange.minVariantPrice} />
        </div>
        <div className="pk-card__rating" aria-label="Rated 4.5 of 5">
          <span className="pk-stars">★★★★½</span>
          <span className="pk-card__reviews">(120)</span>
        </div>
      </div>
    </Link>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
/** @typedef {import('storefrontapi.generated').CollectionItemFragment} CollectionItemFragment */
/** @typedef {import('storefrontapi.generated').RecommendedProductFragment} RecommendedProductFragment */
