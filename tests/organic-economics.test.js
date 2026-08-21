import test from 'node:test';
import assert from 'node:assert/strict';

import {
  auditBaseline,
  computeEconomicsRow,
} from '../scripts/check-organic-economics.mjs';

const completeBaseline = {
  evidenceDate: '2026-08-14',
  planningFxCadPerUsd: 1.4,
  paymentPercentRate: 0.035,
  paymentFixedFee: 0.3,
  exceptionReserveRate: 0.05,
  singleItemCheckoutShipping: {CA: 5, US: 8},
  offers: [
    {
      handle: '3-piece-packing-cube-set',
      sku: '14:1052#S3007 Black;5:200004186#3PCS L M S Set',
      itemCostUsd: 12.45,
      routes: {CA: {shippingUsd: 1.99, tracked: true}},
    },
    {
      handle: 'white-semi-circular-travel-jewelry-case',
      sku: '14:29',
      itemCostUsd: 4.29,
      routes: {
        CA: {shippingUsd: 1.99, tracked: true},
        US: {shippingUsd: 1.99, tracked: true},
      },
    },
    {
      handle: 'black-hanging-travel-toiletry-organizer',
      sku: '14:771#Black',
      itemCostUsd: 8.32,
      routes: {
        CA: {shippingUsd: 2.16, tracked: true},
        US: {shippingUsd: 2.16, tracked: true},
      },
    },
    {
      handle: 'travel-cable-organizer-case',
      sku: '14:193#Double Layers',
      itemCostUsd: 4.05,
      routes: {
        CA: {shippingUsd: 1.99, tracked: true},
        US: {shippingUsd: 1.99, tracked: true},
      },
    },
    {
      // Bundle: cost and shipping are the sum of the three component rows
      // above, because the kit ships as three separate supplier orders.
      handle: 'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
      sku: 'PUCHICA-KIT-CARRYON-01',
      itemCostUsd: 24.82,
      routes: {CA: {shippingUsd: 6.14, tracked: true}},
    },
  ],
};

test('exact DSers baseline covers every approved market and SKU', () => {
  assert.deepEqual(
    auditBaseline(completeBaseline, new Date('2026-08-15T12:00:00Z')),
    [],
  );
});

test('economics use collected shipping, landed cost, fees, and reserve', () => {
  const row = computeEconomicsRow({
    offer: completeBaseline.offers[1],
    route: completeBaseline.offers[1].routes.CA,
    market: 'CA',
    variant: {
      id: 'gid://shopify/ProductVariant/50041043681530',
      price: {amount: '22.99', currencyCode: 'CAD'},
    },
    baseline: completeBaseline,
  });

  assert.equal(row.collectedTotal, 27.99);
  assert.equal(row.landedCost, 8.792);
  assert.equal(Number(row.preAdContribution.toFixed(4)), 16.5189);
  assert.equal(row.organicTier, 'PRIORITY');
  assert.equal(row.paidAdsDecision, 'HOLD');
});

test('stale exact-cost evidence fails closed', () => {
  const failures = auditBaseline(
    completeBaseline,
    new Date('2026-08-23T12:00:00Z'),
  );

  assert.equal(
    failures.some((failure) => failure.includes('older than seven days')),
    true,
  );
});

test('a route outside the approved market cohort fails closed', () => {
  const extraRouteBaseline = structuredClone(completeBaseline);
  extraRouteBaseline.offers[0].routes.US = {
    shippingUsd: 1.99,
    tracked: true,
  };

  const failures = auditBaseline(
    extraRouteBaseline,
    new Date('2026-08-15T12:00:00Z'),
  );

  assert.equal(
    failures.some((failure) => failure.includes('Unexpected US route')),
    true,
  );
});

test('a duplicate exact offer/SKU baseline row fails closed', () => {
  const duplicateBaseline = structuredClone(completeBaseline);
  duplicateBaseline.offers.push(structuredClone(completeBaseline.offers[1]));

  const failures = auditBaseline(
    duplicateBaseline,
    new Date('2026-08-15T12:00:00Z'),
  );

  assert.equal(
    failures.some((failure) => failure.includes('duplicate offer/SKU row')),
    true,
  );
});
