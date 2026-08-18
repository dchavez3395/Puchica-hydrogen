import {LocalizedLink as Link} from '~/components/LocalizedLink';
import {Image} from '@shopify/hydrogen';
import {CurrencyMoney} from '~/components/CurrencyMoney';
import {useVariantUrl} from '~/lib/variants';
import {AddToCartButton} from '~/components/AddToCartButton';
import {useAside} from '~/components/Aside';
import {useT} from '~/lib/t';
import {
  presentProductDepartment,
  presentProductTitle,
} from '~/lib/product-presentation';
import {useRouteLoaderData} from 'react-router';
import {isApprovedVariantSku} from '~/lib/launch-catalog';

const BADGE_TAG_MAP = {
  'new-arrival': {
    labelKey: 'badge_new_arrival',
    cls: 'pk-card__badge--new-arrival',
  },
  'top-pick': {labelKey: 'badge_top_pick', cls: 'pk-card__badge--top-pick'},
  trending: {labelKey: 'badge_trending', cls: 'pk-card__badge--trending'},
  'staff-pick': {
    labelKey: 'badge_staff_pick',
    cls: 'pk-card__badge--staff-pick',
  },
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
 * @param {Array<any> | undefined} options
 * @param {Array<any>} availableVariants
 * @returns {{name: string, values: Array<any>} | null}
 */
function resolvePrimaryOption(options, availableVariants = []) {
  if (!options?.length) return null;
  const first = options[0];
  if (!first?.name || /^(title|default title)$/i.test(first.name)) return null;

  let values = first.optionValues?.length
    ? first.optionValues
    : (first.values || []).map((name) => ({name, swatch: null}));

  if (availableVariants.length) {
    const availableValues = new Set(
      availableVariants.flatMap((variant) =>
        (variant.selectedOptions || [])
          .filter((option) => option.name === first.name)
          .map((option) => option.value),
      ),
    );
    values = values.filter((value) => availableValues.has(value.name));
  }

  if (values.length < 2) return null;

  return {
    name: first.name,
    values,
  };
}

/** @param {any} product @param {Array<any>} availableVariants */
function resolveOptionSummary(product, availableVariants) {
  const primaryOption = resolvePrimaryOption(
    product.options,
    availableVariants,
  );

  if (primaryOption || availableVariants.length > 1) {
    return 'Multiple options available';
  }
  return null;
}

/** @param {any} product @param {Array<any>} availableVariants */
function resolveAvailablePriceRange(product, availableVariants) {
  const priced = availableVariants
    .map((variant) => variant?.price)
    .filter((price) => price?.amount && price?.currencyCode);
  if (!priced.length) return product.priceRange;

  const sorted = [...priced].sort(
    (a, b) => Number(a.amount) - Number(b.amount),
  );
  return {
    minVariantPrice: sorted[0],
    maxVariantPrice: sorted[sorted.length - 1],
  };
}

/** @param {Array<any>} availableVariants */
function resolveAvailableCompareAtPrice(availableVariants) {
  const valid = availableVariants
    .filter(
      (variant) =>
        Number(variant?.compareAtPrice?.amount) >
        Number(variant?.price?.amount),
    )
    .map((variant) => variant.compareAtPrice)
    .sort((a, b) => Number(a.amount) - Number(b.amount));
  return valid[0] ?? null;
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
  const rootData = useRouteLoaderData('root');
  const market = rootData?.selectedLocale?.country || 'CA';

  const availableVariants = (product.variants?.nodes ?? []).filter(
    (node) =>
      node?.availableForSale && isApprovedVariantSku(node.sku, market),
  );
  const selectedVariant = product.selectedOrFirstAvailableVariant;
  const variant =
    selectedVariant?.availableForSale &&
    isApprovedVariantSku(selectedVariant.sku, market)
    ? selectedVariant
    : (availableVariants[0] ?? {availableForSale: false, selectedOptions: []});
  // Market approval is variant-specific. Product-level gallery covers and
  // hover images can depict colours or configurations that are not offered in
  // the active market, so discovery cards use only the approved variant image.
  const featured = variant?.image ?? null;
  const hoverImage = null;
  const priceRange = resolveAvailablePriceRange(product, availableVariants);
  const compareAtPrice = resolveAvailableCompareAtPrice(availableVariants);
  const hasChoices =
    availableVariants.length > 1 ||
    Boolean(resolvePrimaryOption(product.options, availableVariants));
  const hasHover = !!hoverImage && hoverImage.id !== featured?.id;
  const sale = resolveSaleBadge(priceRange?.minVariantPrice, compareAtPrice, t);
  const hasPriceRange =
    priceRange?.minVariantPrice?.amount &&
    priceRange?.maxVariantPrice?.amount &&
    Number(priceRange.minVariantPrice.amount) !==
      Number(priceRange.maxVariantPrice.amount);
  const tagBadge = resolveBadge(product.tags, t);
  const badge = sale ?? tagBadge; // sale takes priority over editorial badges
  const optionSummary = resolveOptionSummary(product, availableVariants);
  const displayTitle = presentProductTitle(
    product.title,
    variant,
    product.handle,
    t,
  );
  const department = presentProductDepartment(product, t);

  const cardClass = `pk-card pk-card--link${dark ? ' pk-card--dark' : ''}${
    hasHover ? ' pk-card--has-hover' : ''
  }`;

  return (
    <div className={cardClass}>
      {badge && (
        <span
          className={`pk-card__badge ${badge.cls}`}
          aria-label={badge.label}
        >
          {badge.label}
        </span>
      )}
      <Link
        className="pk-card__media"
        to={variantUrl}
        prefetch="intent"
        aria-label={displayTitle}
      >
        {featured ? (
          <>
            <Image
              className="pk-card__image pk-card__image--primary"
              alt={featured.altText || displayTitle}
              aspectRatio="1/1"
              data={featured}
              loading={loading}
              sizes="(min-width: 1280px) 25vw, (min-width: 700px) 33vw, 50vw"
            />
            {hasHover ? (
              <Image
                className="pk-card__image pk-card__image--hover"
                alt={hoverImage.altText || displayTitle}
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
          {displayTitle}
        </Link>
        <span className="pk-card__vendor">{department}</span>
        {optionSummary ? (
          <span className="pk-card__option-summary">{optionSummary}</span>
        ) : null}
        <div className="pk-card__price">
          {sale ? (
            <span className="pk-card__price-cluster">
              {hasPriceRange ? (
                <span className="pk-card__price-from">
                  {t('product_price_from')}
                </span>
              ) : null}
              <CurrencyMoney data={priceRange.minVariantPrice} />
              <s className="pk-card__price-compare">
                <CurrencyMoney data={compareAtPrice} />
              </s>
            </span>
          ) : (
            <>
              {hasPriceRange ? (
                <span className="pk-card__price-from">
                  {t('product_price_from')}
                </span>
              ) : null}
              <CurrencyMoney data={priceRange.minVariantPrice} />
            </>
          )}
        </div>
        {hasChoices ? (
          <Link to={variantUrl} className="pk-card__viewbtn" prefetch="intent">
            {t('card_choose_options')}
          </Link>
        ) : variant ? (
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
