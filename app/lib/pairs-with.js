import {BUNDLE_CATALOG_HANDLES} from './launch-catalog.js';
import {FREE_SHIPPING_THRESHOLDS} from './free-shipping.js';

/** Three keeps the rail to one row on desktop and one swipe on mobile. */
export const PAIRS_WITH_LIMIT = 3;

function priceOf(product) {
  const amount = Number(product?.priceRange?.minVariantPrice?.amount);
  return Number.isFinite(amount) && amount > 0 ? amount : null;
}

/**
 * Choose which other products to show beside the one being viewed.
 *
 * The store's only real lever on order value is getting a second full-price
 * item into the cart: two items contribute more than any discounted bundle we
 * could assemble, and free shipping over CA$50 is the incentive that already
 * exists. So the ordering is not "related" in any editorial sense — it is
 * "cheapest item that would carry this cart over the free-shipping threshold,
 * first". Everything else follows, ascending by price.
 *
 * This deliberately makes no behavioural claim. There are no completed orders,
 * so "frequently bought together" or "customers also bought" would be invented
 * social proof. The rail is labelled as what it is: other things in the edit.
 *
 * Bundles are excluded. A bundle can contain the very product being viewed and
 * the storefront has no component map to detect that, so recommending one
 * risks telling a shopper to buy the same item twice.
 *
 * @param {string} currentHandle handle of the product being viewed
 * @param {Array<any>} candidates already gated by filterLaunchProducts
 * @param {string} market ISO country code
 * @param {number} limit
 * @returns {Array<any>}
 */
export function pairsWith(
  currentHandle,
  candidates,
  market,
  limit = PAIRS_WITH_LIMIT,
) {
  if (!Array.isArray(candidates) || !candidates.length) return [];

  const current = candidates.find(
    (product) => product?.handle === currentHandle,
  );
  const currentPrice = priceOf(current);

  const others = candidates.filter(
    (product) =>
      product?.handle &&
      product.handle !== currentHandle &&
      !BUNDLE_CATALOG_HANDLES.has(product.handle) &&
      priceOf(product) !== null,
  );

  const byPrice = (a, b) => priceOf(a) - priceOf(b);

  const threshold =
    FREE_SHIPPING_THRESHOLDS[String(market || '').toUpperCase()];

  // Without a verified threshold, or without a readable price for the product
  // on screen, there is nothing to sort toward. Fall back to cheapest first,
  // which is the likeliest add either way.
  if (!(threshold > 0) || currentPrice === null) {
    return [...others].sort(byPrice).slice(0, limit);
  }

  const clears = [];
  const rest = [];
  for (const product of others) {
    (currentPrice + priceOf(product) >= threshold ? clears : rest).push(
      product,
    );
  }

  return [...clears.sort(byPrice), ...rest.sort(byPrice)].slice(0, limit);
}
