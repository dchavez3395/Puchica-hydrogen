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
export const STOREFRONT_CONTAINMENT_ACTIVE = true;

/**
 * A versioned, final approval tag prevents the legacy launch tag from
 * accidentally reopening the catalog. The legacy tag is present on the
 * current unverified catalog and therefore is not evidence of readiness.
 */
export const CATALOG_APPROVAL_TAG = 'puchica-catalog-approved-v1';

/**
 * Evidence required before a product can be discovered or purchased.
 *
 * These tags represent completed checks, not marketing claims. A product must
 * pass every check for both launch markets. If a future product is intentionally
 * sold in only one market, make this gate market-aware before approving it;
 * never weaken the shared rule with a one-off exception.
 */
export const REQUIRED_CATALOG_EVIDENCE_TAGS = Object.freeze([
  CATALOG_APPROVAL_TAG,
  'dsers-mapped',
  'cost-verified',
  'margin-verified',
  'copy-verified',
  'imagery-verified',
  'ca-route-verified',
  'us-route-verified',
]);

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
]);

export function isLaunchReadyProduct(product) {
  const tags = new Set(
    Array.isArray(product?.tags)
      ? product.tags.map((tag) => String(tag).trim().toLowerCase())
      : [],
  );

  return Boolean(
    product?.availableForSale &&
    REQUIRED_CATALOG_EVIDENCE_TAGS.every((tag) => tags.has(tag)) &&
    !OPERATIONAL_HOLD_HANDLES.has(product?.handle),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
