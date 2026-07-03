import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/t';

const BADGE_TAG_MAP = {
  'new-arrival': {labelKey: 'badge_new_arrival', cls: 'pk-card__badge--new-arrival'},
  'top-pick':    {labelKey: 'badge_top_pick',    cls: 'pk-card__badge--top-pick'},
  'trending':    {labelKey: 'badge_trending',    cls: 'pk-card__badge--trending'},
  'staff-pick':  {labelKey: 'badge_staff_pick',  cls: 'pk-card__badge--staff-pick'},
};

function resolveBadge(tags, t) {
  if (!tags?.length) return null;
  const normalized = tags.map((tag) => tag.toLowerCase().replace(/\s+/g, '-'));
  for (const key of Object.keys(BADGE_TAG_MAP)) {
    if (normalized.includes(key)) {
      const entry = BADGE_TAG_MAP[key];
      return {label: t(entry.labelKey), cls: entry.cls};
    }
  }
  return null;
}

/**
 * Detect a sale from compareAtPriceRange. The fragment fetches
 * compareAtPriceRange.minVariantPrice; if it's strictly greater
 * than priceRange.minVariantPrice the product is on sale.
 */
function resolveSaleBadge(price, compareAt, t) {
  if (!price || !compareAt) return null;
  const p = Number(price.amount);
  const c = Number(compareAt.amount);
  if (!p || !c || c <= p) return null;
  return {label: t('badge_sale'), cls: 'pk-card__badge--sale'};
}

/**
 * Returns up to 6 color swatch dots for the first option when
 * it looks like a color option. Returns [] otherwise so callers
 * can `null`-check and skip rendering the row entirely.
 */
function resolveSwatches(options) {
  if (!options?.length) return [];
  const first = options[0];
  if (!first?.name || !/color|colour/i.test(first.name)) return [];
  const values = first.optionValues?.length
    ? first.optionValues
    : (first.values || []).map((name) => ({name, swatch: null}));
  return values.slice(0, 6);
}

/**
 * @param {{
 *   product:
 *     | CollectionItemFragment
 *     | ProductItemFragment
 *     | RecommendedProductFragment;
 *   loading?: 'eager' | 'lazy';
 *   dark?: boolean;
 * }}
 */
export function ProductItem({product, loading, dark = false}) {
  const variantUrl = useVariantUrl(product.handle);
  const t = useT();
  const {open} = useAside();

  const variant = product.variants?.nodes?.[0];
  const featured = product.featuredImage;
  const hoverImage = product.images?.nodes?.[1] ?? null;
  const hasHover = !!hoverImage && hoverImage.id !== featured?.id;
  const sale = resolveSaleBadge(
    product.priceRange?.minVariantPrice,
    product.compareAtPriceRange?.minVariantPrice,
    t,
  );
  const tagBadge = resolveBadge(product.tags, t);
  const badge = sale ?? tagBadge; // sale takes priority over editorial badges
  const swatches = resolveSwatches(product.options);

  const cardClass = `pk-card pk-card--link${dark ? ' pk-card--dark' : ''}${
    hasHover ? ' pk-card--has-hover' : ''
  }`;

  return (
    <div className={cardClass}>
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
        {featured ? (
          <>
            <Image
              className="pk-card__image pk-card__image--primary"
              alt={featured.altText || product.title}
              aspectRatio="1/1"
              data={featured}
              loading={loading}
              sizes="(min-width: 1280px) 25vw, (min-width: 700px) 33vw, 50vw"
            />
            {hasHover ? (
              <Image
                className="pk-card__image pk-card__image--hover"
                alt={hoverImage.altText || product.title}
                aspectRatio="1/1"
                data={hoverImage}
                loading="lazy"
                sizes="(min-width: 1280px) 25vw, (min-width: 700px) 33vw, 50vw"
                aria-hidden="true"
              />
            ) : null}
          </>
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
        {swatches.length ? (
          <ul
            className="pk-card__swatches"
            aria-label={t('card_swatches_aria')}
          >
            {swatches.map((sw, i) => {
              const color = sw.swatch?.color;
              const style = color
                ? {backgroundColor: color}
                : undefined;
              return (
                <li
                  key={sw.name ?? i}
                  className="pk-card__swatch"
                  style={style}
                  title={sw.name}
                  aria-label={sw.name}
                />
              );
            })}
          </ul>
        ) : null}
        <div className="pk-card__price">
          {sale ? (
            <span className="pk-card__price-cluster">
              <Money data={product.priceRange.minVariantPrice} />
              <s className="pk-card__price-compare">
                <Money
                  data={product.compareAtPriceRange.minVariantPrice}
                />
              </s>
            </span>
          ) : (
            <Money data={product.priceRange.minVariantPrice} />
          )}
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
              {variant.availableForSale
                ? t('product_add_to_cart')
                : t('product_sold_out')}
            </AddToCartButton>
          </div>
        ) : (
          <Link to={variantUrl} className="pk-card__viewbtn" prefetch="intent">
            {t('card_view_details')}
          </Link>
        )}
      </div>
    </div>
  );
}

/** @typedef {import('storefrontapi.generated').ProductItemFragment} ProductItemFragment */
