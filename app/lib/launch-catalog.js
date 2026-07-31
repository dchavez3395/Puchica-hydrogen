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

export const FEATURED_LAUNCH_HANDLES = [
  'pocket-luggage-scale-50kg',
  'travel-cable-organizer-pouch',
  'gray-8-piece-packing-organizer-set',
  '24-piece-drawer-organizer-tray-set',
  'wheeled-under-sink-organizer-bin',
  'double-layer-cable-organizer-case',
  'red-5-piece-compression-packing-cubes',
  'stainless-steel-tube-squeezer',
  'white-five-slot-cable-organizer-strip',
  'toocki-five-clip-cable-organizer',
];

const FEATURED_LAUNCH_RANK = new Map(
  FEATURED_LAUNCH_HANDLES.map((handle, index) => [handle, index]),
);

export function isLaunchReadyProduct(product) {
  return Boolean(
    product?.availableForSale && product?.tags?.includes(LAUNCH_READY_TAG),
  );
}

export function filterLaunchProducts(products = []) {
  return products.filter(isLaunchReadyProduct);
}

export function sortLaunchProducts(products = []) {
  return [...products].sort((left, right) => {
    const leftRank = FEATURED_LAUNCH_RANK.get(left?.handle) ?? Number.MAX_SAFE_INTEGER;
    const rightRank = FEATURED_LAUNCH_RANK.get(right?.handle) ?? Number.MAX_SAFE_INTEGER;
    return leftRank - rightRank;
  });
}
