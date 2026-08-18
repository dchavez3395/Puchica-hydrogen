/**
 * Temporary launch gate for the customer-facing catalog.
 *
 * Shopify's Storefront cache can retain a product after its Admin status is
 * changed. Until the catalog review is complete, an explicit Shopify tag makes
 * the storefront fail closed: an unreviewed product cannot surface in a
 * collection, search result, or merchandising rail just because it remains in
 * a cached collection response.
 */
// Add this tag in Shopify only after a product passes the launch review. Using
// a tag rather than a hard-coded list lets approved batches scale without a
// deploy, while preserving the same customer-facing safety gate.
export const LEGACY_LAUNCH_READY_TAG = 'puchica-launch-ready';

// Emergency storefront containment. While true, cart and checkout entry routes
// remain closed even if a stale browser cart or shared Shopify cart permalink
// exists. Remove only after the preview and catalog launch gates are approved.
export const STOREFRONT_CONTAINMENT_ACTIVE = false;

/**
 * A versioned, final approval tag prevents the legacy launch tag from
 * accidentally reopening the catalog. The legacy tag is present on the
 * current unverified catalog and therefore is not evidence of readiness.
 */
export const CATALOG_APPROVAL_TAG = 'puchica-catalog-approved-v1';

/**
 * Evidence required before a product can be discovered or purchased.
 *
 * These tags represent completed checks, not marketing claims. Product truth,
 * mapping, cost, margin, copy, and imagery are shared gates. Delivery evidence
 * is market-specific: a Canadian route must not be treated as proof that the
 * same supplier/variant can ship to the United States (or vice versa).
 */
export const REQUIRED_CATALOG_EVIDENCE_TAGS = Object.freeze([
  CATALOG_APPROVAL_TAG,
  'dsers-mapped',
  'cost-verified',
  'margin-verified',
  'copy-verified',
  'imagery-verified',
]);

export const MARKET_ROUTE_EVIDENCE_TAGS = Object.freeze({
  CA: 'ca-route-verified',
  US: 'us-route-verified',
});

/**
 * Exact supplier offers that passed the route, cost, copy, and imagery review.
 * Product-level approval is not permission to sell every colour or size in a
 * supplier listing. Keep the product handle and exact SKU together here so
 * storefront gates and production monitoring cannot drift into different
 * market cohorts.
 */
export const APPROVED_CATALOG_OFFERS = Object.freeze([
  Object.freeze({
    handle: '3-piece-packing-cube-set',
    sku: '14:1052#S3007 Black;5:200004186#3PCS L M S Set',
    markets: Object.freeze(['CA']),
  }),
  Object.freeze({
    handle: 'white-semi-circular-travel-jewelry-case',
    sku: '14:29',
    markets: Object.freeze(['CA', 'US']),
  }),
  Object.freeze({
    handle: 'black-hanging-travel-toiletry-organizer',
    sku: '14:771#Black',
    markets: Object.freeze(['CA', 'US']),
  }),
]);

// Products removed from the deliberately small first-sale cohort. Keeping this
// list explicit lets production checks prove that stale Shopify data cannot
// make an old product buyable again.
export const RETIRED_CATALOG_HANDLES = new Set([
  'travel-cable-organizer-case',
  'white-luggage-id-tag',
  'ten-hole-white-cable-organizer-clips',
  'large-blue-handled-clothes-storage-bag',
  'black-knitted-luggage-wheel-covers-set-of-4',
  'soft-luggage-handle-wrap-black-coffee-brown',
]);

function offersForMarket(market) {
  return APPROVED_CATALOG_OFFERS.filter((offer) =>
    offer.markets.includes(market),
  );
}

export const APPROVED_VARIANT_SKUS_BY_MARKET = Object.freeze({
  CA: Object.freeze(offersForMarket('CA').map((offer) => offer.sku)),
  US: Object.freeze(offersForMarket('US').map((offer) => offer.sku)),
});

export const APPROVED_PRODUCT_HANDLES_BY_MARKET = Object.freeze({
  CA: Object.freeze([
    ...new Set(offersForMarket('CA').map((offer) => offer.handle)),
  ]),
  US: Object.freeze([
    ...new Set(offersForMarket('US').map((offer) => offer.handle)),
  ]),
});

// Retain this export name for callers that construct Storefront API queries.
// It now means final approval, not the unsafe legacy tag.
export const LAUNCH_READY_TAG = CATALOG_APPROVAL_TAG;

// Temporary operational hold: the exact mapped 24-piece variant returned no
// United States shipping route in DSers on 2026-08-01. Keep it out of every
// customer-facing launch surface until a replacement route passes the quote
// and fulfillment gates.
export const OPERATIONAL_HOLD_HANDLES = new Set([
  '24-piece-drawer-organizer-tray-set',
  // Brand/IP authorization has not been established for the supplier-branded
  // Toocki listing. It cannot enter organic or paid discovery while held.
  'toocki-five-clip-cable-organizer',
  // Battery type, transport constraints, accuracy, instructions, and claims
  // remain unverified for this scale.
  'pocket-luggage-scale-50kg',
  // The customer-facing media visibly uses the Naturehike brand, but seller
  // authorization and exact-brand permission are not documented.
  'travel-toiletry-organizer',
]);

export function isLaunchReadyProduct(product, market = 'CA') {
  const tags = new Set(
    Array.isArray(product?.tags)
      ? product.tags.map((tag) => String(tag).trim().toLowerCase())
      : [],
  );

  const routeTag =
    MARKET_ROUTE_EVIDENCE_TAGS[String(market || 'CA').toUpperCase()] ||
    MARKET_ROUTE_EVIDENCE_TAGS.CA;

  return Boolean(
    product?.availableForSale &&
    REQUIRED_CATALOG_EVIDENCE_TAGS.every((tag) => tags.has(tag)) &&
    tags.has(routeTag) &&
    !RETIRED_CATALOG_HANDLES.has(product?.handle) &&
    !OPERATIONAL_HOLD_HANDLES.has(product?.handle),
  );
}

export function filterLaunchProducts(products = [], market = 'CA') {
  return products.filter(
    (product) =>
      isLaunchReadyProduct(product, market) &&
      Boolean(findApprovedVariant(product, market)),
  );
}

export function isApprovedVariantSku(sku, market = 'CA') {
  const country = String(market || 'CA').toUpperCase();
  const approved =
    APPROVED_VARIANT_SKUS_BY_MARKET[country] ||
    APPROVED_VARIANT_SKUS_BY_MARKET.CA;
  return typeof sku === 'string' && approved.includes(sku);
}

export function findApprovedVariant(product, market = 'CA') {
  return findApprovedVariants(product, market)[0];
}

export function findApprovedVariants(product, market = 'CA') {
  return (product?.variants?.nodes || []).filter(
    (variant) =>
      variant?.availableForSale && isApprovedVariantSku(variant.sku, market),
  );
}

/**
 * Build the small option matrix used on an approved PDP without re-exposing
 * unreviewed supplier variants. Hydrogen's full product option matrix can
 * contain colours and configurations that never passed the market gate; this
 * mapper derives customer controls exclusively from approved exact SKUs.
 */
export function buildApprovedProductOptions(
  product,
  approvedVariants,
  selectedVariant,
) {
  const variants = Array.isArray(approvedVariants) ? approvedVariants : [];
  if (variants.length <= 1) return [];

  return (product?.options || [])
    .map((option) => {
      const values = new Map();

      for (const variant of variants) {
        const selectedOption = variant?.selectedOptions?.find(
          (entry) => entry?.name === option?.name,
        );
        if (!selectedOption?.value || values.has(selectedOption.value))
          continue;

        const sourceValue = option?.optionValues?.find(
          (entry) => entry?.name === selectedOption.value,
        );
        const query = new URLSearchParams();
        for (const entry of variant.selectedOptions || []) {
          if (entry?.name && entry?.value) query.set(entry.name, entry.value);
        }

        values.set(selectedOption.value, {
          name: selectedOption.value,
          handle: product.handle,
          variantUriQuery: query.toString(),
          selected: variant.id === selectedVariant?.id,
          available: Boolean(variant.availableForSale),
          exists: true,
          isDifferentProduct: false,
          swatch: sourceValue?.swatch || null,
        });
      }

      return {name: option.name, optionValues: [...values.values()]};
    })
    .filter(
      (option) =>
        option.name &&
        !/^(title|default title)$/i.test(option.name) &&
        option.optionValues.length > 1,
    );
}
