/**
 * Temporary launch gate for the customer-facing catalog.
 *
 * Shopify's Storefront cache can retain a product after its Admin status is
 * changed. Until the catalog review is complete, this narrow allowlist makes
 * the storefront fail closed: an unreviewed product cannot surface in a
 * collection, search result, or merchandising rail just because it remains in
 * a cached collection response.
 */
export const LAUNCH_PRODUCT_HANDLES = new Set([
  '2026-new-mens-high-neck-sweater-solid-color-pullover-knitted-warm-casual-turtleneck-sweatwear-woolen-mens-winter-outdoor-tops',
  'pet-supplies-cat-bowls-water-bowls-dog-bowls-tip-over-resistant-pet-bowls-height-adjustable',
]);

export function isLaunchReadyProduct(product) {
  return Boolean(
    product?.availableForSale && LAUNCH_PRODUCT_HANDLES.has(product.handle),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}
