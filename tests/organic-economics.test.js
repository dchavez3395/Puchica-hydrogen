import test from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

import {
  auditBaseline,
  auditBaselineFilename,
  computeEconomicsRow,
  resolveBaselinePath,
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
      routes: {
        CA: {shippingUsd: 1.99, tracked: true},
        US: {shippingUsd: 0, tracked: true},
      },
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
      // Canada only: no United States route has been quoted for this variant.
      handle: 'black-travel-tech-case',
      sku: '14:29#Black',
      itemCostUsd: 7.26,
      routes: {
        CA: {shippingUsd: 2.17, tracked: true},
      },
    },
    {
      // Bundle: cost and shipping are the sum of the three component rows
      // above, because the kit ships as three separate supplier orders.
      handle: 'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
      sku: 'PUCHICA-KIT-CARRYON-01',
      itemCostUsd: 24.82,
      routes: {
        CA: {shippingUsd: 6.14, tracked: true},
        US: {shippingUsd: 4.15, tracked: true},
      },
    },
    // The live 2026-09-01 watch-roll cohort: United States only, cn-direct,
    // crossing the suspended route on a modelled duty contribution. Costs and
    // the $1.99 supplier ship match the dated evidence file on disk.
    ...[
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:496#3 Slot Black Red', 26.18],
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:865#3 Slot Green Gray', 26.18],
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:193#3 Slot Brown', 26.18],
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:173#6 Slot Brown', 43.64],
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:350686#6 Slot Green Gray', 43.64],
      ['pu-leather-watch-roll-travel-case-3-or-6-watches', '14:350850#6 Slot Black Red', 43.64],
      ['pu-leather-watch-roll-travel-case-4-watches', '14:173#4 Slot Black Gray', 30.52],
      ['pu-leather-watch-roll-travel-case-4-watches', '14:100013777#4 Slot Brown Black', 30.52],
    ].map(([handle, sku, itemCostUsd]) => ({
      handle,
      sku,
      itemCostUsd,
      routes: {US: {shippingUsd: 1.99, tracked: true}},
    })),
    // Canada only: no US route has been quoted for this supplier. Each colour
    // is its own row because the gate is per-SKU, and all four carry the same
    // cost because DSers quoted the product as a range rather than per-SKU.
    ...[
      '14:691;200007763:201336100',
      '14:1052;200007763:201336100',
      '14:771;200007763:201336100',
      '14:193;200007763:201336100',
    ].map((sku) => ({
      handle: 'compression-packing-cube-set-5-piece',
      sku,
      itemCostUsd: 27.94,
      routes: {CA: {shippingUsd: 0, tracked: true}},
    })),
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
  // Every offer now sells in both approved markets, so the negative case uses
  // a country the catalogue has never approved. This is the guard that matters
  // as more markets are considered: evidence for an unapproved market must not
  // quietly imply permission to sell there.
  const extraRouteBaseline = structuredClone(completeBaseline);
  extraRouteBaseline.offers[0].routes.GB = {
    shippingUsd: 1.99,
    tracked: true,
  };

  const failures = auditBaseline(
    extraRouteBaseline,
    new Date('2026-08-15T12:00:00Z'),
  );

  assert.equal(
    failures.some((failure) => failure.includes('Unexpected GB route')),
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

test('the newest dated baseline on disk is the one that gets read', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'puchica-baseline-'));
  for (const name of [
    'exact-offer-cost-route-baseline-2026-08-14.json',
    'exact-offer-cost-route-baseline-2026-08-25.json',
    'exact-offer-cost-route-baseline-2026-08-21.json',
    'unrelated-notes.json',
  ]) {
    fs.writeFileSync(path.join(dir, name), '{}');
  }

  assert.equal(
    path.basename(resolveBaselinePath(dir)),
    'exact-offer-cost-route-baseline-2026-08-25.json',
  );
});

test('an evidence directory with no baseline throws rather than passing', () => {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'puchica-baseline-empty-'));

  assert.throws(() => resolveBaselinePath(dir), /No exact cost\/route baseline/);
});

test('a baseline filename that disagrees with its evidenceDate fails closed', () => {
  const failures = auditBaselineFilename(
    'exact-offer-cost-route-baseline-2026-08-25.json',
    {evidenceDate: '2026-07-01'},
  );

  assert.equal(
    failures.some((failure) => failure.includes('filename and the observation date must match')),
    true,
  );
});

test('a matching baseline filename and evidenceDate pass', () => {
  assert.deepEqual(
    auditBaselineFilename('exact-offer-cost-route-baseline-2026-08-25.json', {
      evidenceDate: '2026-08-25',
    }),
    [],
  );
});

test('an undated baseline filename fails closed', () => {
  const failures = auditBaselineFilename('exact-offer-cost-route-baseline.json', {
    evidenceDate: '2026-08-25',
  });

  assert.equal(
    failures.some((failure) => failure.includes('does not carry an ISO observation date')),
    true,
  );
});

test('route evidence is demanded only for what can actually be sold', () => {
  // This asserted "the US market is suspended, so US routes are not demanded"
  // until 2026-09-01, when the de minimis evidence was rescoped from the US
  // MARKET to the cn-direct ROUTE into it. The principle it was protecting is
  // unchanged: the gate must not force a DSers trip for something nobody can
  // buy. What changed is which offers that covers. The archived cohort ships
  // cn-direct with no duty override and Canada is suspended outright, so
  // neither market may demand route evidence for them.
  const trimmed = structuredClone(completeBaseline);
  for (const offer of trimmed.offers) {
    if (offer.handle.startsWith('pu-leather-watch-roll')) continue;
    delete offer.routes.US;
    delete offer.routes.CA;
  }
  const failures = auditBaseline(trimmed, new Date('2026-08-15T00:00:00Z'));
  assert.deepEqual(
    failures.filter((f) => /route/.test(f)),
    [],
    `unsellable offers must not demand route evidence: ${failures.join('; ')}`,
  );

  // The other half of the same rule, which the old test could not express
  // while nothing was sellable: an offer that IS sellable must still produce
  // its route evidence, or the skip above would be a hole rather than a rule.
  const missing = structuredClone(completeBaseline);
  delete missing.offers.find(({sku}) => sku === '14:496#3 Slot Black Red')
    .routes.US;
  assert.ok(
    auditBaseline(missing, new Date('2026-08-15T00:00:00Z')).some((f) =>
      /Missing tracked US route/.test(f),
    ),
    'a sellable offer must still be required to carry its route evidence',
  );
});
