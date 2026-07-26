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

export function isLaunchReadyProduct(product) {
  return Boolean(
    product?.availableForSale && product?.tags?.includes(LAUNCH_READY_TAG),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
