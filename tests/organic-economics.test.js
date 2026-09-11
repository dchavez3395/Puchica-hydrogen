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
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

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
    // The live cohort: five bamboo lighting offers approved for the United
    // States. All cn-direct, all crossing the suspended route on a positive
    // per-offer duty contribution. Costs and the $1.99 supplier ship match
    // exact-offer-cost-route-baseline-2026-09-10.json on disk.
    //
    // Two of these rows changed on 2026-09-10 rather than being added. The
    // 36cm pendant was re-mapped off a wide-brim hat shade its own photography
    // never showed, which halved its cost; and the dome came off the voltage
    // hold onto a 90-260V listing of the same shade. So a handle moving
    // between the approved and held blocks here is expected, and the fixture
    // has to move with it or auditBaseline reports the drift as missing rows.
    ...[
      ['hand-woven-bamboo-pendant-light', '200000531:200004889#Style F - Wood Base;200007763:201336100;5:100014064#Ship with 24h', 23.49],
      ['plug-in-bamboo-sconce-swing-arm', '200000795:175#US PLUG-DIM switch;249:200006305#no light', 23.91],
      ['woven-bamboo-dome-pendant', '200000531:365458#Style F-Wood Base;5:361386#No bulb', 30.4],
      ['slatted-bamboo-lantern-pendant-20cm', '200000531:350852#20x23cm', 13.38],
      ['woven-rattan-petal-pendant-30cm', '200000531:175#30CM;136:200003939#Warm Light', 39.59],
    ].map(([handle, sku, itemCostUsd, shippingUsd = 1.99]) => ({
      handle,
      sku,
      itemCostUsd,
      routes: {US: {shippingUsd, tracked: true}},
    })),
    // The six offers still held on the 220 V reading. They carry cost and
    // route evidence so that releasing them needs a supplier confirmation
    // rather than a re-audit; what auditBaseline must NOT do is demand
    // anything fresh of them while they are held, which is asserted below.
    // Seven until the dome moved up into the approved block above.
    ...[
      ['woven-bamboo-lantern-pendant-26cm', '200000531:1052#C-black base;136:200006153#NO light bulb', 36.48],
      ['woven-bamboo-column-pendant-37cm', '200000531:29#D-wood base;136:200006153#NO light bulb', 37.1],
      ['woven-bamboo-mini-pendant-18cm', '200000531:200002984#style G;136:200006153#NO light bulb', 21.65],
      ['woven-bamboo-wave-chandelier-35cm', '200000531:200006154#style K;136:200006153#NO light bulb', 54.58],
      ['woven-bamboo-drum-chandelier-30cm', '200000531:365016#style H;136:200006153#NO light bulb', 56.82],
      ['woven-bamboo-wide-brim-chandelier-30cm', '200000531:366#style E;136:200006153#NO light bulb', 47.3],
    ].map(([handle, sku, itemCostUsd]) => ({
      handle,
      sku,
      itemCostUsd,
      routes: {US: {shippingUsd: 1.99, tracked: true}},
    })),
    // The retired 2026-09-01 watch-roll cohort: United States only, cn-direct,
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
  // As of 2026-09-09 the United States is open with exactly two approved
  // offers, so this test finally gets to assert BOTH halves of its rule in one
  // place instead of one half here and the other in launch-catalog.test.js.
  //
  // NEGATIVE HALF: strip the routes from everything that is not approved -
  // the archived cn-direct cohort, the Canada-only compression rows, the
  // retired watch rolls, the seven offers on voltage hold - and the gate must
  // ask nothing of any of them. Demanding a DSers trip for something nobody
  // can buy is the failure this guards.
  const approved = new Set(
    APPROVED_CATALOG_OFFERS.map((offer) => `${offer.handle}\u0000${offer.sku}`),
  );
  const trimmed = structuredClone(completeBaseline);
  for (const offer of trimmed.offers) {
    if (approved.has(`${offer.handle}\u0000${offer.sku}`)) continue;
    delete offer.routes.US;
    delete offer.routes.CA;
  }
  const failures = auditBaseline(trimmed, new Date('2026-08-15T00:00:00Z'));
  assert.deepEqual(
    failures.filter((f) => /route/.test(f)),
    [],
    `unsellable offers must not demand route evidence: ${failures.join('; ')}`,
  );

  // POSITIVE HALF: an offer that IS sellable must produce route evidence.
  // Strip the route from an approved one and the gate has to notice.
  const gutted = structuredClone(completeBaseline);
  const live = gutted.offers.find((offer) =>
    approved.has(`${offer.handle}\u0000${offer.sku}`),
  );
  assert.ok(live, 'fixture must contain an approved offer to gut');
  delete live.routes.US;
  const gapped = auditBaseline(gutted, new Date('2026-08-15T00:00:00Z'));
  assert.ok(
    gapped.some((f) => f.includes(`Missing tracked US route for ${live.handle}`)),
    `a sellable offer with no route must fail: ${gapped.join('; ')}`,
  );

  // The positive half above was parked in tests/launch-catalog.test.js between
  // 2026-09-08 and 2026-09-09, because with every market suspended there was
  // no sellable offer to build a fixture from and the assertion here could
  // only have been vacuous. The United States reopening brought it back, so
  // this test asserts both halves again and the note is history rather than
  // instruction. If the catalogue ever empties again, park it the same way and
  // say so here - do not delete it, or the skip above becomes a hole.
  assert.ok(
    APPROVED_CATALOG_OFFERS.length > 0,
    'the positive half above needs at least one sellable offer to be real',
  );
});
