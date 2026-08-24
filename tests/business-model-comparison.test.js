import test from 'node:test';
import assert from 'node:assert/strict';

import {
  contributionFor,
  evaluatePath,
  ordersToFundAcquisition,
  requiredAov,
  requiredContribution,
} from '../scripts/lib/business-model-comparison.mjs';

test('contribution matches the acquisition gate on a known offer', () => {
  // Black Travel Tech Case: CA$34.99 + CA$5 shipping, landed CA$13.20.
  const row = contributionFor({
    retailCad: 34.99,
    landedCad: 13.2,
    shippingCollectedCad: 5,
  });
  assert.ok(
    Math.abs(row.contribution - 23.09) < 0.01,
    `expected CA$23.09, got ${row.contribution}`,
  );
});

test('funding a CPA requires more than breaking even on it', () => {
  const needed = requiredContribution({targetCpaCad: 42, profitShare: 0.3});
  assert.ok(Math.abs(needed - 60) < 1e-9);
  assert.ok(needed > 42, 'break-even is not a business');
});

test('a zero profit share reduces the bar to plain break-even', () => {
  assert.equal(
    requiredContribution({targetCpaCad: 42, profitShare: 0}),
    42,
  );
});

test('required AOV falls as margin improves', () => {
  const thin = requiredAov({targetCpaCad: 42, contributionMargin: 0.35});
  const fat = requiredAov({targetCpaCad: 42, contributionMargin: 0.65});
  assert.ok(fat < thin);
  assert.ok(
    Math.abs(fat - 92.31) < 0.05,
    `expected ~CA$92.31 at 65% margin, got ${fat}`,
  );
});

test('no sub-CA$90 single item can fund a CA$42 CPA at any plausible margin', () => {
  for (const margin of [0.35, 0.45, 0.55, 0.65]) {
    const aov = requiredAov({targetCpaCad: 42, contributionMargin: margin});
    assert.ok(
      aov > 90,
      `margin ${margin} implies AOV ${aov}, which would break the finding`,
    );
  }
});

test('a zero or negative margin can never fund acquisition', () => {
  assert.equal(requiredAov({targetCpaCad: 42, contributionMargin: 0}), Infinity);
});

test('an order that already clears the bar needs exactly one', () => {
  assert.equal(
    ordersToFundAcquisition({
      firstOrderContribution: 100,
      targetCpaCad: 42,
      profitShare: 0.3,
    }),
    1,
  );
});

test('a small positive contribution funds acquisition only across repeats', () => {
  const orders = ordersToFundAcquisition({
    firstOrderContribution: 18.23,
    targetCpaCad: 42,
    profitShare: 0.3,
  });
  assert.ok(orders > 1 && Number.isFinite(orders));
  assert.equal(orders, 4, 'coffee should need four bags');
});

test('a loss-making order can never be rescued by repetition', () => {
  assert.equal(
    ordersToFundAcquisition({
      firstOrderContribution: -5,
      targetCpaCad: 42,
    }),
    Infinity,
  );
});

test('the basket route is what rescues print-on-demand', () => {
  const single = evaluatePath({
    name: 'tee',
    retailCad: 55,
    landedCad: 27.19,
    plausibleAnnualOrders: 2,
  });
  const basket = evaluatePath({
    name: 'three tees',
    retailCad: 145,
    landedCad: 71.99,
    plausibleAnnualOrders: 2,
  });

  assert.equal(single.route, 'neitherRoute');
  assert.equal(basket.route, 'basketRoute');
  assert.ok(basket.fundsPaidAcquisition);
  assert.equal(basket.shortfall, 0);
  // The margin barely moves; the basket is doing the work, not the product.
  assert.ok(Math.abs(single.margin - basket.margin) < 0.02);
});

test('a repeat-purchase path is credited only within a plausible order count', () => {
  const plausible = evaluatePath({
    name: 'coffee, realistic repeat',
    retailCad: 24,
    landedCad: 8,
    shippingCollectedCad: 5,
    plausibleAnnualOrders: 4,
  });
  assert.equal(plausible.route, 'repeatRoute');

  const optimistic = evaluatePath({
    name: 'coffee, one order a year',
    retailCad: 24,
    landedCad: 8,
    shippingCollectedCad: 5,
    plausibleAnnualOrders: 1,
  });
  assert.equal(
    optimistic.route,
    'neitherRoute',
    'a repeat thesis with no repeats is not a thesis',
  );
});

test('the current catalog funds acquisition by neither route', () => {
  const current = evaluatePath({
    name: 'tech case',
    retailCad: 34.99,
    landedCad: 13.2,
    shippingCollectedCad: 5,
    plausibleAnnualOrders: 1,
  });
  assert.equal(current.route, 'neitherRoute');
  assert.ok(current.shortfall > 30);
});
