/**
 * Free-shipping threshold shown before checkout.
 *
 * This is a shipping *promise* made while the shopper is still browsing, so it
 * is deliberately driven by one constant that mirrors the live Shopify
 * delivery profile rather than by anything inferred at runtime.
 *
 * Read from the live "General profile" on 2026-08-22:
 *   Canada zone (CA only)
 *     - "Standard Shipping"        CA$5.00, TOTAL_PRICE 0.00 – 49.99, active
 *     - "Free Shipping Over $50"   CA$0.00, TOTAL_PRICE >= 50.00,     active
 * Shopify evaluates both against the merchandise subtotal, which is the same
 * figure the cart shows, so the two cannot drift apart within a single market.
 *
 * Any market absent from this map gets no promise at all. That is the point:
 * the United States is commercially suspended and has no verified rate, so it
 * must fail closed rather than inherit Canada's threshold. If the delivery
 * profile changes, change this constant and the shipping policy page together.
 */
export const FREE_SHIPPING_THRESHOLDS = Object.freeze({CA: 50});

/**
 * Describe how close a subtotal is to free shipping.
 *
 * Returns `null` — meaning "say nothing" — for any market without a verified
 * threshold, and for a subtotal that is missing or not a finite number. A
 * caller that renders nothing on `null` can never invent a promise.
 *
 * @param {number|string} subtotal merchandise subtotal in the market's currency
 * @param {string} market ISO country code, e.g. 'CA'
 * @returns {{threshold: number, remaining: number, qualified: boolean, percent: number}|null}
 */
export function freeShippingProgress(subtotal, market) {
  const threshold =
    FREE_SHIPPING_THRESHOLDS[String(market || '').toUpperCase()];
  if (!(threshold > 0)) return null;

  // `Number(null)` and `Number('')` are both 0, which would quietly render a
  // full-threshold nudge for a cart whose subtotal simply failed to load. Only
  // a real number or a non-empty numeric string counts as a reading.
  if (typeof subtotal !== 'number' && typeof subtotal !== 'string') return null;
  const raw = typeof subtotal === 'number' ? subtotal : subtotal.trim();
  if (raw === '') return null;

  const amount = Number(raw);
  if (!Number.isFinite(amount) || amount < 0) return null;

  const remaining = Math.max(0, threshold - amount);
  return {
    threshold,
    // Round to cents so the copy never renders 2.0000000000000018.
    remaining: Math.round(remaining * 100) / 100,
    qualified: remaining <= 0,
    percent: Math.max(0, Math.min(100, Math.round((amount / threshold) * 100))),
  };
}
