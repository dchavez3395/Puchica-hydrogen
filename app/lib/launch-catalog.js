/**
 * Temporary launch gate for the customer-facing catalog.
 *
 * Shopify's Storefront cache can retain a product after its Admin status is
 * changed. Until the catalog review is complete, this narrow allowlist makes
 * the storefront fail closed: an unreviewed product cannot surface in a
 * collection, search result, or merchandising rail just because it remains in
 * a cached collection response.
 */
// Keep the live edit deliberately narrow while supplier validation continues.
// The sweater is restored as the existing DSers-linked storefront product;
// do not add newly imported products here until they pass the launch review.
export const LAUNCH_PRODUCT_HANDLES = new Set([
  '2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops',
]);

export function isLaunchReadyProduct(product) {
  return Boolean(
    product?.availableForSale && LAUNCH_PRODUCT_HANDLES.has(product.handle),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
