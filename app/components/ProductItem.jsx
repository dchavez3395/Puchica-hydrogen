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

function resolveOptionSummary(variant) {
  const values = variant?.selectedOptions
    ?.filter(
      ({name, value}) =>
        value &&
        !/^(title|default title)$/i.test(name || '') &&
        !/^default title$/i.test(value),
    )
    .map(({value}) => value);

  return values?.length ? values.join(' / ') : null;
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
  const availableVariants =
    product.variants?.nodes?.filter((node) => node?.availableForSale) ?? [];
  const hasChoices = availableVariants.length > 1;
  const hasHover = !!hoverImage && hoverImage.id !== featured?.id;
  const displayPrice = variant?.price ?? product.priceRange?.minVariantPrice;
  const displayCompareAtPrice =
    variant?.compareAtPrice ?? product.compareAtPriceRange?.minVariantPrice;
  const sale = resolveSaleBadge(displayPrice, displayCompareAtPrice, t);
  const hasFallbackPriceRange =
    !variant?.price &&
    product.priceRange?.minVariantPrice?.amount &&
    product.priceRange?.maxVariantPrice?.amount &&
    Number(product.priceRange.minVariantPrice.amount) !==
      Number(product.priceRange.maxVariantPrice.amount);
  const tagBadge = resolveBadge(product.tags, t);
  const badge = sale ?? tagBadge; // sale takes priority over editorial badges
  const optionSummary = resolveOptionSummary(variant);

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
        {optionSummary ? (
          <span className="pk-card__option-summary">{optionSummary}</span>
        ) : null}
        <div className="pk-card__price">
          {sale ? (
            <span className="pk-card__price-cluster">
              {hasFallbackPriceRange ? (
                <span className="pk-card__price-from">{t('product_price_from')}</span>
              ) : null}
              <Money data={displayPrice} />
              <s className="pk-card__price-compare">
                <Money data={displayCompareAtPrice} />
              </s>
            </span>
          ) : (
            <>
              {hasFallbackPriceRange ? (
                <span className="pk-card__price-from">{t('product_price_from')}</span>
              ) : null}
              <Money data={displayPrice} />
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
              {variant.availableForSale ? (
                <>
                  {t('product_add_to_cart')}
                  <span className="sr-only">: {product.title}</span>
                </>
              ) : (
                t('product_sold_out')
              )}
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
