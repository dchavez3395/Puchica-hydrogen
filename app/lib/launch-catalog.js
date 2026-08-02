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
export const LAUNCH_READY_TAG = 'puchica-launch-ready';

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
  return Boolean(
    product?.availableForSale &&
    product?.tags?.includes(LAUNCH_READY_TAG) &&
    !OPERATIONAL_HOLD_HANDLES.has(product?.handle),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
