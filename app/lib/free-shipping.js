/**
 * Free-shipping threshold shown before checkout.
 *
 * This is a shipping *promise* made while the shopper is still browsing, so it
 * is deliberately driven by one constant that mirrors the live Shopify
 * delivery profile rather than by anything inferred at runtime.
 *
 * Read from the live "General profile", re-read 2026-09-03:
 *   Canada zone (CA only)
 *     - "Standard Shipping"        CA$5.00, TOTAL_PRICE 0.00 – 49.99, active
 *     - "Free Shipping Over $50"   CA$0.00, TOTAL_PRICE >= 50.00,     active
 *   United States zone (US only)
 *     - "Standard Shipping"        CA$6.99, NO conditions,            active
 * Shopify evaluates the Canadian pair against the merchandise subtotal, which
 * is the same figure the cart shows, so the two cannot drift apart within a
 * single market.
 *
 * The United States is deliberately absent from this map, and the reason has
 * changed. It used to be absent because the market was suspended and no US
 * rate had been verified. Neither is true now: the US is the only market this
 * store sells into, and it has a verified rate. It stays absent because that
 * rate is FLAT - CA$6.99 on every order, with no free tier at any subtotal -
 * so there is no threshold to promise and no progress to report. A US entry
 * here would invent a free-shipping tier that the delivery profile does not
 * offer.
 *
 * If a US free-shipping tier is ever added to the profile, add it here and to
 * the shipping policy page in the same change. Note the US rate is denominated
 * in CAD because that is the store currency, so the USD the customer sees
 * moves with Shopify's conversion rate - about $4.99 at the 1.40 planning
 * rate used in scripts/us-duty-impact.mjs.
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
