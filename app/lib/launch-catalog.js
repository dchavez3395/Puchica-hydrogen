/**
 * Temporary launch gate for the customer-facing catalog.
 *
 * Shopify's Storefront cache can retain a product after its Admin status is
 * changed. Until the catalog review is complete, this narrow allowlist makes
 * the storefront fail closed: an unreviewed product cannot surface in a
 * collection, search result, or merchandising rail just because it remains in
 * a cached collection response.
 */
// Keep this deliberately empty until at least one product has a complete
// DSers variant map, a selected-variant Canadian delivery quote, and a
// verified storefront record. An empty set is safer than exposing a product
// that cannot be fulfilled.
export const LAUNCH_PRODUCT_HANDLES = new Set();

export function isLaunchReadyProduct(product) {
  return Boolean(
    product?.availableForSale && LAUNCH_PRODUCT_HANDLES.has(product.handle),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
