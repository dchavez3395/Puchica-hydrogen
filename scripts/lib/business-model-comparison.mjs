/**
 * What would have to be true for Puchica to fund paid acquisition?
 *
 * The acquisition gate answers "can this offer pay for its customer?" for the
 * offers that exist. This answers the prior question: what shape of business
 * could pay for a customer at all, and do the available paths reach it?
 *
 * The result is uncomfortable and worth stating plainly up front: at a CA$42
 * benchmark CPA, no single item under about CA$90 can fund cold paid traffic,
 * whatever it is and whoever makes it. That is arithmetic, not pessimism, and
 * it applies equally to AliExpress accessories, print-on-demand apparel, and
 * imported Salvadoran goods. Changing the product does not escape it. Only
 * three things do: a much larger basket, a much cheaper channel, or a customer
 * who comes back.
 *
 * Every figure here is a modelled assumption sourced in
 * docs/recovery-evidence/business-model-assumptions-2026-08-24.json. None is a
 * quote. Replace them with real numbers as real numbers arrive.
 */

/**
 * Contribution from one order, before acquisition cost.
 *
 * Same shape as the Canadian offer model in acquisition-economics.mjs so the
 * two cannot drift, but takes a landed cost directly rather than deriving it
 * from a supplier SKU - print-on-demand and wholesale import do not have one.
 */
export function contributionFor({
  retailCad,
  landedCad,
  shippingCollectedCad = 0,
  paymentPercentRate = 0.035,
  paymentFixedFee = 0.3,
  exceptionReserveRate = 0.05,
}) {
  const collected = Number(retailCad) + Number(shippingCollectedCad);
  const payment = collected * paymentPercentRate + paymentFixedFee;
  const reserve = collected * exceptionReserveRate;
  const contribution = collected - Number(landedCad) - payment - reserve;
  return {
    collected,
    landedCad: Number(landedCad),
    payment,
    reserve,
    contribution,
    margin: collected > 0 ? contribution / collected : 0,
  };
}

/**
 * Contribution a single order must produce to fund a given CPA and still leave
 * a real profit. Breaking even on acquisition is not a business.
 */
export function requiredContribution({targetCpaCad, profitShare = 0.3}) {
  return Number(targetCpaCad) / (1 - Number(profitShare));
}

/**
 * The average order value that implies, at a given contribution margin.
 *
 * This is the number that reframes the strategy question. At a CA$42 CPA and a
 * 30% profit share, contribution must reach CA$60 - which at a healthy 55%
 * margin means an AOV near CA$109. Puchica's current AOV is about CA$35.
 */
export function requiredAov({
  targetCpaCad,
  contributionMargin,
  profitShare = 0.3,
}) {
  const needed = requiredContribution({targetCpaCad, profitShare});
  const margin = Number(contributionMargin);
  if (!(margin > 0)) return Infinity;
  return needed / margin;
}

/**
 * Orders a customer must place before their lifetime contribution covers the
 * cost of acquiring them plus the required profit.
 *
 * This is the escape hatch a consumable has and a suitcase organizer does not.
 * A CA$24 bag of coffee cannot fund a CA$42 CPA on the first order and never
 * will; four bags a year can. Returns Infinity when the first-order
 * contribution is not positive, because no amount of repetition rescues an
 * order that loses money.
 */
export function ordersToFundAcquisition({
  firstOrderContribution,
  targetCpaCad,
  profitShare = 0.3,
  repeatContribution = firstOrderContribution,
}) {
  const needed = requiredContribution({targetCpaCad, profitShare});
  const first = Number(firstOrderContribution);
  if (!(first > 0)) return Infinity;
  if (first >= needed) return 1;

  const repeat = Number(repeatContribution);
  if (!(repeat > 0)) return Infinity;
  return 1 + Math.ceil((needed - first) / repeat);
}

/**
 * Whether a path can fund paid acquisition, and by which of the three routes.
 *
 * `basketRoute`  - one order already clears the bar.
 * `repeatRoute`  - it clears within a plausible number of repeat orders.
 * `neitherRoute` - it does not clear, and paid acquisition is not available
 *                  to this path at this price. That is not the same as the
 *                  path being bad; it means the channel must be organic.
 */
export function evaluatePath({
  name,
  retailCad,
  landedCad,
  shippingCollectedCad = 0,
  targetCpaCad = 42,
  profitShare = 0.3,
  plausibleAnnualOrders = 1,
  capitalRequiredCad = 0,
  autonomy,
  deliveryDays,
  differentiation,
  notes = '',
}) {
  const economics = contributionFor({
    retailCad,
    landedCad,
    shippingCollectedCad,
  });
  const needed = requiredContribution({targetCpaCad, profitShare});
  const orders = ordersToFundAcquisition({
    firstOrderContribution: economics.contribution,
    targetCpaCad,
    profitShare,
  });

  let route;
  if (orders === 1) route = 'basketRoute';
  else if (Number.isFinite(orders) && orders <= plausibleAnnualOrders)
    route = 'repeatRoute';
  else route = 'neitherRoute';

  return {
    name,
    ...economics,
    requiredContribution: needed,
    shortfall: Math.max(0, needed - economics.contribution),
    ordersToFund: orders,
    plausibleAnnualOrders,
    route,
    fundsPaidAcquisition: route !== 'neitherRoute',
    capitalRequiredCad,
    autonomy,
    deliveryDays,
    differentiation,
    notes,
  };
}
