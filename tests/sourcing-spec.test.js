import test from 'node:test';
import assert from 'node:assert/strict';

import {
  CPA_MODEL,
  cpaFloorCrossover,
  estimateCpa,
  evaluateCandidate,
  importCharges,
  sourcingSpec,
} from '../scripts/lib/sourcing-spec.mjs';

test('CPA is floor-bound below the crossover and proportional above it', () => {
  const crossover = cpaFloorCrossover();
  assert.equal(crossover, 70, 'CA$28 floor at 40% implies a CA$70 crossover');

  assert.equal(estimateCpa(35), CPA_MODEL.floorCad, 'cheap orders pay the floor');
  assert.equal(estimateCpa(69), CPA_MODEL.floorCad);
  assert.ok(
    estimateCpa(150) > CPA_MODEL.floorCad,
    'expensive orders pay more than the floor',
  );
  assert.equal(estimateCpa(150), 60);
});

test('the floor is what defeats the current catalog, not the margin', () => {
  const techCase = evaluateCandidate({
    name: 'tech case',
    retailCad: 34.99,
    supplierCostUsd: 7.26,
    supplierShippingUsd: 2.17,
  });

  // The margin is genuinely healthy - better than many working stores.
  assert.ok(
    techCase.margin > 0.55,
    `expected a strong margin, got ${techCase.margin}`,
  );
  // And it still loses money, because CPA cannot shrink to match the price.
  assert.equal(techCase.cpaIsFloorBound, true);
  assert.ok(techCase.profitPerOrder < 0);
  assert.equal(techCase.verdict, 'FAIL');
});

test('the same margin at a higher price passes', () => {
  const cheap = evaluateCandidate({
    retailCad: 35,
    supplierCostUsd: 8,
    supplierShippingUsd: 2,
  });
  const dear = evaluateCandidate({
    retailCad: 140,
    supplierCostUsd: 32,
    supplierShippingUsd: 4,
  });

  assert.ok(
    Math.abs(cheap.margin - dear.margin) < 0.12,
    'the two should have broadly comparable margins',
  );
  assert.ok(cheap.profitPerOrder < 0, 'the cheap one loses');
  assert.ok(dear.profitPerOrder > 0, 'the dear one profits');
});

test('parcels under de minimis attract nothing', () => {
  const charges = importCharges(15);
  assert.equal(charges.assessed, false);
  assert.equal(charges.total, 0);
  assert.equal(charges.customerOwesIfNotPrepaid, 0);
});

test('duty applies above CAD$20 and tax only above CAD$40', () => {
  const middle = importCharges(30);
  assert.ok(middle.duty > 0);
  assert.equal(middle.tax, 0);

  const high = importCharges(60);
  assert.ok(high.duty > 0);
  assert.ok(high.tax > 0);
});

test('prepaying duties costs us margin but spares the customer', () => {
  const prepaid = evaluateCandidate({
    retailCad: 129,
    supplierCostUsd: 26,
    supplierShippingUsd: 4,
    prepayDuties: true,
  });
  const billed = evaluateCandidate({
    retailCad: 129,
    supplierCostUsd: 26,
    supplierShippingUsd: 4,
    prepayDuties: false,
  });

  assert.ok(prepaid.contribution < billed.contribution);
  assert.equal(prepaid.customerOwesAtDoor, 0);
  assert.ok(
    billed.customerOwesAtDoor > 15,
    'an unprepaid parcel hands the customer a real bill',
  );
});

test('the sourcing spec keeps landed cost near a third of retail', () => {
  for (const row of sourcingSpec()) {
    assert.ok(
      row.maxLandedShare > 0.2 && row.maxLandedShare < 0.4,
      `unexpected landed share ${row.maxLandedShare} at CA$${row.retailCad}`,
    );
    assert.ok(row.maxSupplierCostUsd > 0);
  }
});

test('a candidate at the spec ceiling clears the bar', () => {
  const [spec] = sourcingSpec({retailBandCad: [120]});
  const candidate = evaluateCandidate({
    retailCad: 120,
    supplierCostUsd: spec.maxSupplierCostUsd,
    supplierShippingUsd: 0,
  });
  assert.notEqual(candidate.verdict, 'FAIL');
  assert.ok(candidate.contribution >= spec.requiredContribution - 0.5);
});

test('a candidate above the ceiling fails', () => {
  const candidate = evaluateCandidate({
    retailCad: 120,
    supplierCostUsd: 55,
    supplierShippingUsd: 5,
  });
  assert.equal(candidate.verdict, 'FAIL');
});

test('raising price helps a floor-bound product more than cutting cost', () => {
  const base = evaluateCandidate({retailCad: 40, supplierCostUsd: 10});
  const cheaper = evaluateCandidate({retailCad: 40, supplierCostUsd: 5});
  const dearer = evaluateCandidate({retailCad: 100, supplierCostUsd: 10});

  assert.ok(base.cpaIsFloorBound && cheaper.cpaIsFloorBound);
  assert.ok(
    dearer.profitPerOrder > cheaper.profitPerOrder,
    'price is the lever below the crossover, not cost',
  );
});

test('a fatal flag rejects a candidate however good the margin', async () => {
  const {scoreCandidate} = await import('../scripts/lib/sourcing-spec.mjs');
  const excellent = scoreCandidate({
    retailCad: 125,
    supplierCostUsd: 18,
    supplierShippingUsd: 3,
    flags: {brandedOrLicensed: true},
  });
  assert.ok(
    excellent.profitPerOrder > 25,
    'this candidate should look financially attractive',
  );
  assert.equal(excellent.recommendation, 'REJECT');
  assert.equal(excellent.score, 0);
  assert.equal(excellent.fatal[0].key, 'brandedOrLicensed');
});

test('non-fatal flags reduce the score without rejecting', async () => {
  const {scoreCandidate} = await import('../scripts/lib/sourcing-spec.mjs');
  const clean = scoreCandidate({retailCad: 139, supplierCostUsd: 28, supplierShippingUsd: 6});
  const bulky = scoreCandidate({
    retailCad: 139,
    supplierCostUsd: 28,
    supplierShippingUsd: 6,
    flags: {bulky: true},
  });
  assert.ok(bulky.score < clean.score);
  assert.equal(bulky.fatal.length, 0);
  assert.equal(bulky.penalties[0].key, 'bulky');
});

test('domestic retail saturation is the heaviest non-fatal penalty', async () => {
  // It outweighs sizing because a 20-40% return rate is survivable, whereas
  // competing on price against a two-day Home Depot delivery is the trap the
  // previous catalog fell into - repeated at a higher price point.
  const {DISQUALIFIERS} = await import('../scripts/lib/sourcing-spec.mjs');
  const nonFatal = Object.entries(DISQUALIFIERS).filter(([, r]) => !r.fatal);
  const ranked = nonFatal.sort((a, b) => b[1].penalty - a[1].penalty);
  assert.equal(ranked[0][0], 'domesticRetailSaturated');
  assert.equal(ranked[1][0], 'sized');
  assert.ok(
    DISQUALIFIERS.domesticRetailSaturated.penalty >
      DISQUALIFIERS.sized.penalty,
  );
});

test('every fatal disqualifier explains itself', async () => {
  const {DISQUALIFIERS} = await import('../scripts/lib/sourcing-spec.mjs');
  for (const [key, rule] of Object.entries(DISQUALIFIERS)) {
    assert.ok(rule.why && rule.why.length > 30, `${key} needs a real reason`);
    if (!rule.fatal) assert.ok(rule.penalty > 0, `${key} needs a penalty`);
  }
});

test('the worksheet parses flags and skips comments', async () => {
  const {parseWorksheet} = await import('../scripts/check-product-candidate.mjs');
  const rows = parseWorksheet(
    [
      '# a comment line',
      'name,retailCad,supplierCostUsd,supplierShippingUsd,wireless,bulky',
      'Good thing,129,26,4,n,y',
      'Bad thing,95,14,2,y,n',
    ].join('\n'),
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].name, 'Good thing');
  assert.equal(rows[0].retailCad, 129);
  assert.equal(rows[0].flags.bulky, true);
  assert.equal(rows[0].flags.wireless, false);
  assert.equal(rows[1].flags.wireless, true);
});

test('the shipped worksheet template scores without error', async () => {
  const fs = await import('node:fs');
  const {parseWorksheet} = await import('../scripts/check-product-candidate.mjs');
  const {scoreCandidate} = await import('../scripts/lib/sourcing-spec.mjs');

  const rows = parseWorksheet(
    fs.readFileSync('docs/recovery-evidence/sourcing-worksheet-template.csv', 'utf8'),
  );
  assert.ok(rows.length >= 10, 'template should carry worked examples');

  const scored = rows.map((row) => scoreCandidate(row));
  assert.ok(
    scored.some((row) => row.recommendation === 'REJECT'),
    'template must demonstrate a rejection',
  );
  assert.ok(
    scored.some((row) => row.fatal.length > 0),
    'template must demonstrate a fatal flag',
  );
  for (const row of scored) assert.ok(Number.isFinite(row.score));
});
