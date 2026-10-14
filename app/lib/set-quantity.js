/**
 * Pairs and trios on the product page.
 *
 * A single lamp clears about CA$27 after duty, fees and the returns reserve,
 * under the CA$42-48 an ad pays to win an order; two or three lamps on one
 * order clear it. The set is the same lamp at the same price per lamp - no
 * discount, no new Shopify variant, so DSers mapping is untouched.
 * See work/sourcing/2026-10-14-sourcing-pass.md.
 */

/** Pendants hang in twos and threes; sconces go either side of a bed. */
export function setSizesFor(isPendant) {
  return isPendant ? [1, 2, 3] : [1, 2];
}

/**
 * Quantity to start the form on. `?qty=` only counts when it names one of the
 * offered set sizes, so a stray or hostile value falls back to one.
 *
 * @param {string | null} raw
 * @param {number[]} setSizes
 */
export function initialSetQuantity(raw, setSizes) {
  const n = Number(raw);
  return Number.isInteger(n) && setSizes.includes(n) ? n : 1;
}

/**
 * Total for n units, in integer cents so 74.99 x 3 reads 224.97.
 *
 * @param {{amount: string, currencyCode: string}} price
 * @param {number} n
 */
export function setTotal(price, n) {
  const cents = Math.round(Number(price.amount) * 100) * n;
  return {amount: (cents / 100).toFixed(2), currencyCode: price.currencyCode};
}
