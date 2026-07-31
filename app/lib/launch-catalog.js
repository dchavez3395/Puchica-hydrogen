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
  'lcd-digital-luggage-scale-50kg-x-10g-portable-electronic-scale-weight-balance-suitcase-travel-bag-hanging-steelyard-hook-scale',
  'travel-cable-organizer-pouch',
  '6-8p-travel-bag-set-organizer-clothes-luggage-travel-organizer-blanket-shoes-organizers-suitcase-pouch-packing-cubes-storage-bag',
  '24-piece-drawer-organizer-tray-set',
  'wheeled-under-sink-organizer-bin',
  'double-layer-cable-organizer-case',
  'travel-compression-packing-cubes-suitcase-luggage-organizer-set-zipper-foldable-storage-bag-for-clothes-shoes-travel-accessories',
  '1pc-creative-toothpaste-tube-squeezer-simple-toothpaste-roller-stainless-steel-labor-saving-toothpaste-tube-wringer-presser',
  'cable-organizer-cord-management-wire-holder-flexible-usb-cable-winder-tidy-silicone-clips-for-mouse-keyboard-earphone-protector',
  'toocki-cable-organizer-management-wire-holder-flexible-usb-cable-silicone-winder-clip-for-mouse-keyboard-earphone-cord-protector',
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
