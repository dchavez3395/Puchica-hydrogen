/**
 * Canadian landed cost and acquisition-funding model.
 *
 * Two questions the storefront gates never asked:
 *
 *   1. What does a parcel from China actually cost to land in Canada once CBSA
 *      is in the picture? `scripts/us-duty-impact.mjs` answers this for the
 *      United States and is the reason the US market is suspended. There has
 *      never been a Canadian equivalent, so every margin figure in the repo
 *      silently assumes CBSA assesses nothing.
 *
 *   2. Can an offer pay for its own customer? The catalog gate proves a product
 *      is truthful, mapped, and routed. It has no opinion on whether the
 *      contribution it produces can cover a cost per acquisition. An offer can
 *      pass every existing gate and still lose money on every ad-driven sale.
 *
 * Everything here is a model, not a quote. Duty rates are modelled from HS
 * headings and must be confirmed against the CBSA tariff or a customs broker
 * before they are used to justify a price. The tax and threshold figures are
 * policy, and are sourced in docs/canada-landed-cost-2026-08-24.md.
 */

import {FREE_SHIPPING_THRESHOLDS} from '../../app/lib/free-shipping.js';

/**
 * Canada's de minimis for goods originating outside the United States and
 * Mexico. The CUSMA increase to CAD$40 tax / CAD$150 duty applies only to
 * courier shipments from those two countries, so a Chinese-origin parcel keeps
 * the historic thresholds regardless of which carrier moves it.
 */
export const CA_DUTY_DE_MINIMIS_CAD = 20;
export const CA_TAX_DE_MINIMIS_CAD = 40;

/**
 * Checkout shipping the store actually collects for a single-offer order.
 *
 * The live delivery profile charges CA$5 under the free-shipping threshold
 * and CA$0 at or above it. Passing the flat CA$5 into the model for a
 * CA$69 bundle credits revenue the store never collects and overstates its
 * contribution (found by the 2026-08-25 pricing audit: kit printed 15.27,
 * true figure 11.07). The threshold is imported from the storefront's own
 * constant so the model and the shipping promise cannot drift apart.
 */
export function collectedCheckoutShipping({
  retailCad,
  singleItemShippingCad,
  freeShippingThresholdCad = FREE_SHIPPING_THRESHOLDS.CA,
}) {
  return Number(retailCad) >= Number(freeShippingThresholdCad)
    ? 0
    : Number(singleItemShippingCad);
}

/**
 * Sales tax CBSA collects at the border, by province.
 *
 * CBSA collects the full HST in participating provinces and GST alone
 * elsewhere; provincial sales tax in BC, SK, MB and QC is generally
 * self-assessed rather than collected on a courier import, so it is modelled
 * as absent. Populations are 2026 estimates and exist only to weight the
 * blended rate below - a single national number is what an offer-level gate
 * can actually use, since we do not know a buyer's province at approval time.
 */
export const CA_TAX_BY_PROVINCE = Object.freeze([
  {code: 'ON', rate: 0.13, populationM: 15.9},
  {code: 'QC', rate: 0.05, populationM: 9.0},
  {code: 'BC', rate: 0.05, populationM: 5.6},
  {code: 'AB', rate: 0.05, populationM: 4.9},
  {code: 'MB', rate: 0.05, populationM: 1.5},
  {code: 'SK', rate: 0.05, populationM: 1.2},
  {code: 'NS', rate: 0.15, populationM: 1.07},
  {code: 'NB', rate: 0.15, populationM: 0.85},
  {code: 'NL', rate: 0.15, populationM: 0.54},
  {code: 'PE', rate: 0.15, populationM: 0.18},
  {code: 'TERR', rate: 0.05, populationM: 0.13},
]);

/**
 * Population-weighted sales tax rate. Derived rather than hardcoded so that
 * changing a provincial rate cannot leave a stale constant behind.
 */
export function blendedCanadianTaxRate(table = CA_TAX_BY_PROVINCE) {
  const population = table.reduce((sum, row) => sum + row.populationM, 0);
  if (!(population > 0)) return 0;
  return (
    table.reduce((sum, row) => sum + row.rate * row.populationM, 0) / population
  );
}

/**
 * Modelled MFN duty rates by product family.
 *
 * Canada does not apply a Section 301-style surtax stack to Chinese travel
 * goods, which is the single biggest reason Canada remains viable while the
 * United States does not. The surtaxes Canada does impose on Chinese imports
 * cover electric vehicles, steel and aluminium - none of which we sell.
 *
 * `textileTravelGoods` covers HS 4202.92 (bags with an outer surface of
 * textile or plastic sheeting): packing cubes, toiletry organizers, cable
 * cases. `smallAccessories` covers low-duty or duty-free accessory headings.
 * Confirm the exact classification per SKU before pricing against it.
 */
export const CA_MODELLED_DUTY_RATES = Object.freeze({
  textileTravelGoods: 0.11,
  smallAccessories: 0.0,
});

/**
 * Fee the carrier bills the recipient for fronting duty and tax on an assessed
 * parcel. It never appears on our P&L - it appears on the customer's doorstep,
 * which is why it is modelled as a refund trigger rather than a cost line.
 */
export const CA_CARRIER_HANDLING_FEE = Object.freeze({
  canadaPost: 9.95,
  courier: 12.0,
});

/**
 * Share of customers who refuse, refund or charge back after being asked for
 * an unexpected duty payment on delivery. Deliberately conservative: the loss
 * on such an order is the whole order, not the fee.
 */
export const ASSESSED_PARCEL_REFUND_RATE = 0.5;

/**
 * What CBSA assesses on one parcel.
 *
 * `declaredValueCad` is the value on the customs declaration, which for an
 * AliExpress parcel is normally the supplier's price rather than what the
 * customer paid. Both bases are modelled because which one is used is the
 * biggest swing factor and we do not control it - the same reason the US
 * script models both.
 */
export function assessParcel({
  declaredValueCad,
  dutyRate = CA_MODELLED_DUTY_RATES.textileTravelGoods,
  taxRate = blendedCanadianTaxRate(),
  handlingFee = CA_CARRIER_HANDLING_FEE.canadaPost,
}) {
  const value = Number(declaredValueCad);
  if (!Number.isFinite(value) || value < 0) {
    throw new Error('declaredValueCad must be a non-negative number.');
  }

  const dutyApplies = value > CA_DUTY_DE_MINIMIS_CAD;
  const taxApplies = value > CA_TAX_DE_MINIMIS_CAD;
  const duty = dutyApplies ? value * dutyRate : 0;
  // Tax is charged on the duty-paid value, not the bare declared value.
  const tax = taxApplies ? (value + duty) * taxRate : 0;
  const assessed = duty > 0 || tax > 0;

  return {
    declaredValueCad: value,
    dutyApplies,
    taxApplies,
    duty,
    tax,
    handlingFee: assessed ? handlingFee : 0,
    customerOwes: assessed ? duty + tax + handlingFee : 0,
    assessed,
  };
}

/**
 * Expected merchant cost of a parcel being assessed.
 *
 * We do not pay the duty. We pay for the fraction of surprised customers who
 * refund - and a refunded dropship order loses the retail price and the landed
 * cost, because the goods are already in transit and are not worth recovering.
 */
export function expectedAssessmentCost({
  assessment,
  collectedTotal,
  landedCost,
  refundRate = ASSESSED_PARCEL_REFUND_RATE,
}) {
  if (!assessment?.assessed) return 0;
  return refundRate * (Number(collectedTotal) + Number(landedCost));
}

/**
 * Contribution for one Canadian offer, before any acquisition cost.
 *
 * Mirrors computeEconomicsRow() in check-organic-economics.mjs so the two
 * cannot drift, then adds the CBSA exposure that model omits.
 */
export function computeCanadianOffer({
  handle,
  sku,
  retailCad,
  itemCostUsd,
  shippingUsd,
  fxCadPerUsd,
  checkoutShippingCad,
  paymentPercentRate,
  paymentFixedFee,
  exceptionReserveRate,
  dutyRate = CA_MODELLED_DUTY_RATES.textileTravelGoods,
  declaredValueBasis = 'wholesale',
  assessmentProbability = 0,
}) {
  const collectedTotal = Number(retailCad) + Number(checkoutShippingCad);
  const landedCost =
    (Number(itemCostUsd) + Number(shippingUsd)) * Number(fxCadPerUsd);
  const paymentFee =
    collectedTotal * Number(paymentPercentRate) + Number(paymentFixedFee);
  const exceptionReserve = collectedTotal * Number(exceptionReserveRate);

  const declaredValueCad =
    declaredValueBasis === 'retail' ? Number(retailCad) : landedCost;
  const assessment = assessParcel({declaredValueCad, dutyRate});
  const assessmentCost =
    Number(assessmentProbability) *
    expectedAssessmentCost({assessment, collectedTotal, landedCost});

  const contribution =
    collectedTotal -
    landedCost -
    paymentFee -
    exceptionReserve -
    assessmentCost;

  return {
    handle,
    sku,
    retailCad: Number(retailCad),
    collectedTotal,
    landedCost,
    paymentFee,
    exceptionReserve,
    assessment,
    assessmentCost,
    contribution,
    margin: collectedTotal > 0 ? contribution / collectedTotal : 0,
  };
}

/**
 * Can this offer buy its own customer?
 *
 * `breakEvenCpa` is the whole contribution: pay that for a customer and the
 * order is worth exactly nothing. `maxViableCpa` keeps a share of contribution
 * as actual profit, because breaking even is not a business.
 */
export function evaluateAcquisition({
  contribution,
  targetCpaCad,
  requiredProfitShare = 0.3,
}) {
  const breakEvenCpa = Number(contribution);
  const maxViableCpa = breakEvenCpa * (1 - Number(requiredProfitShare));
  const target = Number(targetCpaCad);
  const headroom = maxViableCpa - target;

  let verdict;
  if (!(breakEvenCpa > 0)) verdict = 'FAIL';
  else if (headroom >= 0) verdict = 'PASS';
  else if (breakEvenCpa >= target) verdict = 'MARGINAL';
  else verdict = 'FAIL';

  return {
    breakEvenCpa,
    maxViableCpa,
    targetCpaCad: target,
    headroom,
    /** Retail price that would make this offer fundable at the target CPA. */
    requiredRetailUplift: headroom >= 0 ? 0 : -headroom,
    verdict,
  };
}

/**
 * Bundles are the usual escape from a CPA that single products cannot fund, so
 * the gate has to know when a bundle's live price has drifted away from the
 * price its fulfilment runbook was costed at. The Carry-On Kit shipped at
 * CA$69 against a runbook written for CA$89, which halved its contribution and
 * made it earn less than a single-order product while costing three manual
 * supplier orders.
 */
export function checkPriceDrift({handle, livePriceCad, documentedPriceCad}) {
  const live = Number(livePriceCad);
  const documented = Number(documentedPriceCad);
  const drift = live - documented;
  return {
    handle,
    livePriceCad: live,
    documentedPriceCad: documented,
    drift,
    drifted: Math.abs(drift) >= 0.01,
  };
}
