import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image, Money} from '@shopify/hydrogen';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/t';
import {formatProductOptionLabel} from '~/lib/product-options';

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

const COLOR_NAME_MAP = {
  beige: '#D8C3A5',
  black: '#111827',
  blue: '#2563EB',
  brown: '#8B5E34',
  clear: '#F8FAFC',
  gold: '#C89116',
  gray: '#6B7280',
  green: '#15803D',
  grey: '#6B7280',
  ivory: '#FFF7E6',
  navy: '#1E3A8A',
  orange: '#EA580C',
  pink: '#DB2777',
  purple: '#7C3AED',
  red: '#DC2626',
  silver: '#A7ADB5',
  tan: '#C19A6B',
  white: '#FFFFFF',
  yellow: '#CA8A04',
};

function resolveOptionColor(name, swatchColor) {
  if (swatchColor) return swatchColor;
  if (!name) return null;

  const normalized = name.toLowerCase();
  const match = Object.keys(COLOR_NAME_MAP).find((colorName) =>
    normalized.includes(colorName),
  );

  return match ? COLOR_NAME_MAP[match] : null;
}

/**
 * Returns compact option chips for the first real option. Product cards
 * used to show anonymous dots when Shopify had values but no swatch
 * color. Labels are the reliable fallback: shoppers need to know whether
 * "more options" means Black/White, S/M/L, pack size, etc.
 */
function resolveOptionChips(options) {
  if (!options?.length) return [];
  const first = options[0];
  if (!first?.name || /^(title|default title)$/i.test(first.name)) return [];

  const values = first.optionValues?.length
    ? first.optionValues
    : (first.values || []).map((name) => ({name, swatch: null}));

  if (values.length < 2) return [];

  return values.slice(0, 4).map((value) => ({
    name: formatProductOptionLabel(value.name),
    rawName: value.name,
    color: resolveOptionColor(value.name, value.swatch?.color),
    isColorOption: /color|colour/i.test(first.name),
  }));
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

  const variant =
    product.selectedOrFirstAvailableVariant ??
    product.variants?.nodes?.find((node) => node?.availableForSale) ??
    product.variants?.nodes?.[0];
  const featured = product.featuredImage;
  const hoverImage = product.images?.nodes?.[1] ?? null;
  const hasHover = !!hoverImage && hoverImage.id !== featured?.id;
  const sale = resolveSaleBadge(
    product.priceRange?.minVariantPrice,
    product.compareAtPriceRange?.minVariantPrice,
    t,
  );
  const hasPriceRange =
    product.priceRange?.minVariantPrice?.amount &&
    product.priceRange?.maxVariantPrice?.amount &&
    Number(product.priceRange.minVariantPrice.amount) !==
      Number(product.priceRange.maxVariantPrice.amount);
  const tagBadge = resolveBadge(product.tags, t);
  const badge = sale ?? tagBadge; // sale takes priority over editorial badges
  const optionChips = resolveOptionChips(product.options);
  const extraOptionCount = Math.max(
    0,
    (product.options?.[0]?.optionValues?.length ||
      product.options?.[0]?.values?.length ||
      0) - optionChips.length,
  );

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
        {optionChips.length ? (
          <ul
            className="pk-card__swatches"
            aria-label={t('card_swatches_aria')}
          >
            {optionChips.map((chip, i) => {
              const style = chip.color
                ? {'--pk-chip-color': chip.color}
                : undefined;
              return (
                <li
                  key={chip.name ?? i}
                  className={`pk-card__swatch${
                    chip.color ? ' pk-card__swatch--color' : ''
                  }${
                    chip.isColorOption ? ' pk-card__swatch--color-option' : ''
                  }`}
                  style={style}
                  title={chip.rawName}
                  aria-label={chip.rawName}
                >
                  <span className="pk-card__swatch-label">{chip.name}</span>
                </li>
              );
            })}
            {extraOptionCount > 0 ? (
              <li
                className="pk-card__swatch pk-card__swatch--more"
                aria-label={`${extraOptionCount} more options`}
              >
                +{extraOptionCount}
              </li>
            ) : null}
          </ul>
        ) : null}
        <div className="pk-card__price">
          {sale ? (
            <span className="pk-card__price-cluster">
              {hasPriceRange ? (
                <span className="pk-card__price-from">{t('product_price_from')}</span>
              ) : null}
              <Money data={product.priceRange.minVariantPrice} />
              <s className="pk-card__price-compare">
                <Money
                  data={product.compareAtPriceRange.minVariantPrice}
                />
              </s>
            </span>
          ) : (
            <>
              {hasPriceRange ? (
                <span className="pk-card__price-from">{t('product_price_from')}</span>
              ) : null}
              <Money data={product.priceRange.minVariantPrice} />
            </>
          )}
        </div>
        {variant ? (
          <div className="pk-card__cart">
            <AddToCartButton
              lines={[
                {
                  merchandiseId: variant.id,
                  quantity: 1,
                  selectedVariant: variant,
                },
              ]}
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
