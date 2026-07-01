import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {ScrollReveal} from '~/components/ScrollReveal';
import {TiltCard} from '~/components/TiltCard';
import {useT} from '~/lib/t';

const BADGE_TAG_MAP = {
  'new-arrival': {label: 'New Arrival', cls: 'pk-card__badge--new-arrival'},
  'top-pick':    {label: 'Top Pick',    cls: 'pk-card__badge--top-pick'},
  'trending':    {label: 'Trending',    cls: 'pk-card__badge--trending'},
  'staff-pick':  {label: 'Staff Pick',  cls: 'pk-card__badge--staff-pick'},
};

function resolveBadge(tags) {
  if (!tags?.length) return null;
  const normalized = tags.map((t) => t.toLowerCase().replace(/\s+/g, '-'));
  for (const key of Object.keys(BADGE_TAG_MAP)) {
    if (normalized.includes(key)) return BADGE_TAG_MAP[key];
  }
  return null;
}

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   index?: number;
 *   dark?: boolean;
 * }}
 */
export function ProductItem({product, loading, index, dark = false}) {
  const variantUrl = useVariantUrl(product.handle);
  const image = product.featuredImage;
  const t = useT();
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
  const badge = resolveBadge(product.tags);
  const cardClass = `pk-card pk-card--link${dark ? ' pk-card--dark' : ''}`;

  return (
    <ScrollReveal delay={delay} variant="up">
      <TiltCard className={cardClass} maxTilt={6}>
        {badge && (
          <span className={`pk-card__badge ${badge.cls}`} aria-label={badge.label}>
            {badge.label}
          </span>
        )}
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
                onClick={(e) => {
                  e.stopPropagation();
                  open('cart');
                }}
              >
                {variant.availableForSale ? t('product_add_to_cart') : t('product_sold_out')}
              </AddToCartButton>
            </div>
          ) : (
            <Link to={variantUrl} className="pk-card__viewbtn" prefetch="intent">
              {t('card_view_details')}
            </Link>
          )}
        </div>
      </TiltCard>
    </ScrollReveal>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
