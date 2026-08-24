#!/usr/bin/env node
/**
 * What CBSA does to the Canadian route, per offer.
 *
 * The Canadian counterpart to scripts/us-duty-impact.mjs. That script exists
 * because the end of US de minimis made the US market unprofitable; this one
 * exists because nobody ever asked the same question about the market Puchica
 * actually sells into. Every margin figure in the repo assumes CBSA assesses
 * nothing, and that assumption has never been written down, let alone tested.
 *
 * Costs and supplier shipping:
 *   docs/recovery-evidence/exact-offer-cost-route-baseline-2026-08-21.json
 * Policy, rates and thresholds:
 *   docs/canada-landed-cost-2026-08-24.md
 *
 * Headline: Canada is in far better shape than the United States, and for a
 * structural reason rather than a lucky one. Canada applies no Section 301
 * equivalent to Chinese travel goods - its surtaxes on Chinese imports cover
 * electric vehicles, steel and aluminium. What is left is ordinary MFN duty
 * plus sales tax, on a declared value that is usually the supplier's price.
 *
 * The exposure is not the duty. It is the CAD$20 / CAD$40 de minimis pair,
 * which is low enough that an assessed parcel is entirely possible, and the
 * carrier handling fee that lands on the customer's doorstep when it happens.
 * We never pay that fee. We pay for the customer who refuses the parcel.
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  assessParcel,
  blendedCanadianTaxRate,
  CA_CARRIER_HANDLING_FEE,
  CA_DUTY_DE_MINIMIS_CAD,
  CA_MODELLED_DUTY_RATES,
  CA_TAX_DE_MINIMIS_CAD,
  computeCanadianOffer,
  expectedAssessmentCost,
} from './lib/acquisition-economics.mjs';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

const baseline = JSON.parse(
  fs.readFileSync(
    path.join(
      rootDir,
      'docs',
      'recovery-evidence',
      'exact-offer-cost-route-baseline-2026-08-21.json',
    ),
    'utf8',
  ),
);
const benchmark = JSON.parse(
  fs.readFileSync(
    path.join(
      rootDir,
      'docs',
      'recovery-evidence',
      'acquisition-benchmark-2026-08-24.json',
    ),
    'utf8',
  ),
);

// Live Canadian retail, read from the Shopify Admin API on 2026-08-24.
const CA_RETAIL = {
  '3-piece-packing-cube-set': 39.99,
  'white-semi-circular-travel-jewelry-case': 22.99,
  'black-hanging-travel-toiletry-organizer': 27.99,
  'travel-cable-organizer-case': 19.99,
  'black-travel-tech-case': 34.99,
  'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case': 69.0,
};

const offers = baseline.offers
  .filter((offer) => offer.routes?.CA && CA_RETAIL[offer.handle] != null)
  .map((offer) => ({
    handle: offer.handle,
    sku: offer.sku,
    retailCad: CA_RETAIL[offer.handle],
    itemCostUsd: Number(offer.itemCostUsd),
    shippingUsd: Number(offer.routes.CA.shippingUsd),
    dutyRate:
      CA_MODELLED_DUTY_RATES[benchmark.dutyCategory[offer.handle]] ??
      CA_MODELLED_DUTY_RATES.textileTravelGoods,
  }));

const shared = {
  fxCadPerUsd: baseline.planningFxCadPerUsd,
  checkoutShippingCad: baseline.singleItemCheckoutShipping.CA,
  paymentPercentRate: baseline.paymentPercentRate,
  paymentFixedFee: baseline.paymentFixedFee,
  exceptionReserveRate: baseline.exceptionReserveRate,
};

const taxRate = blendedCanadianTaxRate();

const SCENARIOS = [
  [
    'A. What the storefront assumes today (CBSA never assesses)',
    {declaredValueBasis: 'wholesale', assessmentProbability: 0},
  ],
  [
    'B. Assessed on declared supplier value, at the modelled 15% rate',
    {declaredValueBasis: 'wholesale', assessmentProbability: 0.15},
  ],
  [
    'C. Assessed on declared supplier value, every parcel',
    {declaredValueBasis: 'wholesale', assessmentProbability: 1},
  ],
  [
    'D. Assessed on retail transaction value, every parcel',
    {declaredValueBasis: 'retail', assessmentProbability: 1},
  ],
];

const pad = (value, width) => String(value).padEnd(width);
const num = (value) =>
  (value < 0 ? '-' : ' ') + 'CA$' + Math.abs(value).toFixed(2).padStart(6);

console.log('Puchica Canadian landed-cost impact');
console.log('===================================');
console.log(`Supplier cost evidence : ${baseline.evidenceDate}`);
console.log(
  `De minimis             : CAD$${CA_DUTY_DE_MINIMIS_CAD} duty / CAD$${CA_TAX_DE_MINIMIS_CAD} tax (non-US/MX origin)`,
);
console.log(
  `Blended sales tax      : ${(taxRate * 100).toFixed(2)}% (population-weighted)`,
);
console.log(
  `Modelled duty          : ${(CA_MODELLED_DUTY_RATES.textileTravelGoods * 100).toFixed(0)}% textile travel goods, ${(CA_MODELLED_DUTY_RATES.smallAccessories * 100).toFixed(0)}% small accessories`,
);
console.log(
  `Carrier handling       : CA$${CA_CARRIER_HANDLING_FEE.canadaPost.toFixed(2)} Canada Post, billed to the customer`,
);

for (const [label, options] of SCENARIOS) {
  console.log('\n' + label);
  console.log('-'.repeat(78));
  let total = 0;
  for (const offer of offers) {
    const row = computeCanadianOffer({...offer, ...shared, ...options});
    total += row.contribution;
    const flag = row.contribution < 0 ? '  LOSS' : '';
    console.log(
      `  ${pad(offer.handle.slice(0, 44), 46)} ${pad('CA$' + offer.retailCad.toFixed(2), 10)} ${num(row.contribution)}${flag}`,
    );
  }
  console.log(
    `  ${pad('', 46)} ${pad('mean', 10)} ${num(total / offers.length)}`,
  );
}

console.log('\nWhat a customer is asked for when a parcel IS assessed');
console.log('-'.repeat(78));
for (const offer of offers) {
  const landedCad =
    (offer.itemCostUsd + offer.shippingUsd) * shared.fxCadPerUsd;
  const wholesale = assessParcel({
    declaredValueCad: landedCad,
    dutyRate: offer.dutyRate,
  });
  const retail = assessParcel({
    declaredValueCad: offer.retailCad,
    dutyRate: offer.dutyRate,
  });
  console.log(
    `  ${pad(offer.handle.slice(0, 44), 46)} declared CA$${landedCad.toFixed(2).padStart(6)} -> owes CA$${wholesale.customerOwes.toFixed(2).padStart(6)}   |   at retail -> owes CA$${retail.customerOwes.toFixed(2).padStart(6)}`,
  );
}

const worstCase = offers.reduce((worst, offer) => {
  const landedCad =
    (offer.itemCostUsd + offer.shippingUsd) * shared.fxCadPerUsd;
  const assessment = assessParcel({
    declaredValueCad: landedCad,
    dutyRate: offer.dutyRate,
  });
  const cost = expectedAssessmentCost({
    assessment,
    collectedTotal: offer.retailCad + shared.checkoutShippingCad,
    landedCost: landedCad,
  });
  return Math.max(worst, cost);
}, 0);

console.log(`
Reading this:
  A is the model every existing gate uses. It is not wrong today - low-declared
    Cainiao parcels usually do clear - but it was never a decision, just an
    omission.
  B is the planning case: assessment is uncommon but real.
  C and D are what a tightening would look like, and they are not survivable as
    priced: the mean goes to roughly break-even and then slightly negative.

  The difference from the United States is one of shape, not comfort. There,
  every offer turns negative and the market had to close. Here the damage is
  concentrated: the offers that declare over the CAD$${CA_TAX_DE_MINIMIS_CAD} tax threshold - the
  packing cubes and the Carry-On Kit - absorb nearly all of it, while the
  cheaper accessories declare under it and are untouched. That is a pricing and
  packaging problem, which can be fixed, rather than a market-wide one.

  The exposure is also asymmetric and does not show up in a mean. A parcel that
  clears costs nothing; a parcel that is assessed can cost the entire order, up
  to CA$${worstCase.toFixed(2)}, because a customer asked for an unexpected payment on the
  doorstep refunds rather than pays. Disclose the possibility at checkout: a
  disclosed CA$${CA_CARRIER_HANDLING_FEE.canadaPost.toFixed(2)} fee is an inconvenience, an undisclosed one is a chargeback.

  Duty rates here are modelled from HS headings, not ruled. Confirm the exact
  classification with CBSA or a broker before pricing against them.
`);
