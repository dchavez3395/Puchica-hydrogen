import {Link} from 'react-router';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   index?: number;
 * }}
 */
export function ProductItem({product, loading, index}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  // For products with options (size/color/etc.) we don't have a single
  // variant ID we can add to cart without going to the PDP — the
  // CollectionItemFragment only asks for `variants(first: 1)` as a probe.
  // If the product has any variant, we use its id; otherwise we send the
  // user to the PDP to pick options.
  const variant = product.variants?.nodes?.[0];
  // Open the cart drawer when adding from a collection card so the
  // shopper gets immediate visual feedback. (The PDP already does this
  // in ProductForm — this closes the gap for collection/grid adds.)
  const {open} = useAside();

  const delay = typeof index === 'number' ? Math.min(index * 40, 320) : 0;

  return (
    <ScrollReveal delay={delay} variant="up">
      <TiltCard className="pk-card pk-card--link" maxTilt={6}>
        <Link
          className="pk-card__media"
          to={variantUrl}
          prefetch="intent"
          aria-label={product.title}
        >
          {image ? (
            <Image
              alt={image.altText || product.title}
              aspectRatio="1/1"
              data={image}
              loading={loading}
              sizes="(min-width: 45em) 25vw, 50vw"
            />
          ) : (
            <div className="pk-card__placeholder" aria-hidden="true">
              <span className="pk-card__placeholder-text">Puchica</span>
            </div>
          )}
        </Link>
        <div className="pk-card__body">
          <Link to={variantUrl} className="pk-card__title" prefetch="intent">
            {product.title}
          </Link>
          {product.productType ? (
            <span className="pk-card__vendor">{product.productType}</span>
          ) : null}
          <div className="pk-card__price">
            <Money data={product.priceRange.minVariantPrice} />
          </div>
          {variant ? (
            <div className="pk-card__cart">
              <AddToCartButton
                lines={[{merchandiseId: variant.id, quantity: 1}]}
                disabled={!variant.availableForSale}
                onClick={() => open('cart')}
              >
                {variant.availableForSale ? 'Add to Cart' : 'Sold out'}
              </AddToCartButton>
            </div>
          ) : (
            <Link to={variantUrl} className="pk-card__viewbtn" prefetch="intent">
              View details
            </Link>
          )}
        </div>
      </TiltCard>
    </ScrollReveal>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
