#!/usr/bin/env node
/**
 * Which shape of business can actually fund a customer?
 *
 * The acquisition gate proved no current offer can. This asks the prior
 * question - what would have to be true - and tests the three paths that are
 * genuinely available to this owner: keep dropshipping accessories, print on
 * demand from a Canadian facility, or import Salvadoran goods.
 *
 * Run: npm run compare-models
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {
  evaluatePath,
  requiredAov,
  requiredContribution,
} from './lib/business-model-comparison.mjs';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const assumptions = JSON.parse(
  fs.readFileSync(
    path.join(
      rootDir,
      'docs',
      'recovery-evidence',
      'business-model-assumptions-2026-08-24.json',
    ),
    'utf8',
  ),
);

const {targetCpaCad, profitShare} = assumptions;
const needed = requiredContribution({targetCpaCad, profitShare});

console.log('Puchica business model comparison');
console.log('='.repeat(78));
console.log(`Target CPA          : CA$${targetCpaCad.toFixed(2)} (benchmark, never measured on this store)`);
console.log(`Profit share kept   : ${(profitShare * 100).toFixed(0)}%`);
console.log(`Contribution needed : CA$${needed.toFixed(2)} per acquired customer`);

console.log('\nThe constraint, before any product is chosen');
console.log('-'.repeat(78));
console.log('  Required AOV to fund that CPA, by contribution margin:');
for (const margin of [0.35, 0.45, 0.55, 0.65]) {
  const aov = requiredAov({targetCpaCad, contributionMargin: margin, profitShare});
  console.log(`    ${(margin * 100).toFixed(0)}% margin  ->  AOV CA$${aov.toFixed(2)}`);
}
console.log(
  '\n  Puchica today: AOV about CA$35 at roughly 46% margin. The gap is structural,',
);
console.log(
  '  not a merchandising detail - no single item under about CA$90 clears the bar,',
);
console.log('  whatever it is and whoever makes it.');

const results = Object.values(assumptions.paths).map((config) =>
  evaluatePath({
    name: config.label,
    retailCad: config.retailCad,
    landedCad: config.landedCad,
    shippingCollectedCad: config.shippingCollectedCad,
    targetCpaCad,
    profitShare,
    plausibleAnnualOrders: config.plausibleAnnualOrders,
    capitalRequiredCad: config.capitalRequiredCad,
    autonomy: config.autonomy,
    deliveryDays: config.deliveryDays,
    differentiation: config.differentiation,
    notes: config.notes,
  }),
);

console.log('\nThe three paths');
console.log('-'.repeat(78));
console.table(
  results.map((row) => ({
    path: row.name,
    AOV: `CA$${row.collected.toFixed(2)}`,
    landed: row.landedCad.toFixed(2),
    contribution: row.contribution.toFixed(2),
    margin: `${(row.margin * 100).toFixed(1)}%`,
    short: row.shortfall > 0 ? `CA$${row.shortfall.toFixed(2)}` : '—',
    'orders to fund': Number.isFinite(row.ordersToFund)
      ? row.ordersToFund
      : 'never',
    route: row.route,
  })),
);

console.log('Non-financial trade-offs');
console.log('-'.repeat(78));
console.table(
  results.map((row) => ({
    path: row.name,
    capital: row.capitalRequiredCad
      ? `CA$${row.capitalRequiredCad.toLocaleString()}`
      : 'none',
    autonomy: row.autonomy,
    delivery: `${row.deliveryDays} days`,
    differentiation: row.differentiation,
  })),
);

const fundable = results.filter((row) => row.fundsPaidAcquisition);
const basket = results.filter((row) => row.route === 'basketRoute');
const repeat = results.filter((row) => row.route === 'repeatRoute');

console.log('Reading this');
console.log('-'.repeat(78));
console.log(
  `  ${fundable.length} of ${results.length} paths can fund paid acquisition at all.`,
);
if (basket.length) {
  console.log(
    `  On the first order: ${basket.map((r) => r.name).join('; ')}`,
  );
}
if (repeat.length) {
  console.log(
    `  Only through repeat purchase: ${repeat.map((r) => r.name).join('; ')}`,
  );
}

console.log(`
  Notice what separates the winners from the losers. It is not the product and
  it is not the supplier - it is the basket and the repeat rate. A POD tee on
  its own fails by almost as much as an AliExpress cable case; three of them in
  one order passes. A bag of coffee fails permanently on a single order and
  works comfortably on four.

  That leaves three real strategies, and only three:

    1. Sell baskets, not items. Sets, kits and multi-packs, priced near CA$100
       and merchandised so the second and third item are the default rather
       than an upsell.
    2. Sell something people re-buy. Consumables turn a first-order loss into a
       lifetime profit. Travel organizers are bought once and never again,
       which is the quiet reason this catalog was always going to struggle.
    3. Do not buy the customer. Every figure above assumes a CA$42 CPA. Content
       and community cost time rather than money, and at a CA$0 CPA every path
       here is profitable on the first order.

  Strategy 3 is the one the current catalog can actually execute today, and it
  is what the seven-day organic test in CURRENT-SCOPE.md was already reaching
  for. The others require changing what Puchica sells.

  Nothing here is a quote. Printful base costs come from public 2026 pricing
  summaries rather than the owner's account; import costs and repeat rates are
  category norms. Ranking is informative, absolutes are provisional.
`);
