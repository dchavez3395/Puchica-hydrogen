import test from 'node:test';
import assert from 'node:assert/strict';

import {
  assessParcel,
  blendedCanadianTaxRate,
  CA_DUTY_DE_MINIMIS_CAD,
  CA_MODELLED_DUTY_RATES,
  CA_TAX_DE_MINIMIS_CAD,
  checkPriceDrift,
  collectedCheckoutShipping,
  computeCanadianOffer,
  evaluateAcquisition,
  expectedAssessmentCost,
} from '../scripts/lib/acquisition-economics.mjs';
import {
  auditBenchmark,
  runAcquisitionGate,
} from '../scripts/check-acquisition-gate.mjs';
import {
  ARCHIVED_CATALOG_OFFERS,
  isMarketSuspended,
} from '../app/lib/launch-catalog.js';

// The audited Canadian cohort, injected explicitly so these tests exercise the
// gate's scoring logic rather than whatever the market's suspension state
// happens to be. CA is suspended while the catalog is empty; the rail these
// tests guard must still be provably working when it is switched back on.
const CA_COHORT = ARCHIVED_CATALOG_OFFERS.filter((offer) =>
  offer.markets.includes('CA'),
);

const baseOffer = {
  handle: 'test-offer',
  sku: '14:1',
  retailCad: 39.99,
  itemCostUsd: 12.45,
  shippingUsd: 1.99,
  fxCadPerUsd: 1.4,
  checkoutShippingCad: 5,
  paymentPercentRate: 0.035,
  paymentFixedFee: 0.3,
  exceptionReserveRate: 0.05,
};

test('blended tax rate sits between the lowest and highest provincial rates', () => {
  const rate = blendedCanadianTaxRate();
  assert.ok(rate > 0.05, 'must exceed the GST-only floor');
  assert.ok(rate < 0.15, 'must fall below the highest HST rate');
});

test('blended tax rate is population-weighted, not a plain average', () => {
  const rate = blendedCanadianTaxRate([
    {code: 'BIG', rate: 0.05, populationM: 99},
    {code: 'SMALL', rate: 0.15, populationM: 1},
  ]);
  assert.ok(
    Math.abs(rate - 0.051) < 0.0005,
    `expected the large low-rate province to dominate, got ${rate}`,
  );
});

test('a parcel under both de minimis thresholds is assessed nothing', () => {
  const assessment = assessParcel({declaredValueCad: 15});
  assert.equal(assessment.assessed, false);
  assert.equal(assessment.duty, 0);
  assert.equal(assessment.tax, 0);
  assert.equal(assessment.handlingFee, 0);
  assert.equal(assessment.customerOwes, 0);
});

test('duty applies above CAD$20 while tax still does not', () => {
  const assessment = assessParcel({
    declaredValueCad: 30,
    dutyRate: CA_MODELLED_DUTY_RATES.textileTravelGoods,
  });
  assert.ok(assessment.declaredValueCad > CA_DUTY_DE_MINIMIS_CAD);
  assert.ok(assessment.declaredValueCad < CA_TAX_DE_MINIMIS_CAD);
  assert.equal(assessment.dutyApplies, true);
  assert.equal(assessment.taxApplies, false);
  assert.ok(assessment.duty > 0);
  assert.equal(assessment.tax, 0);
});

test('tax is charged on the duty-paid value, not the bare declared value', () => {
  const rate = blendedCanadianTaxRate();
  const assessment = assessParcel({
    declaredValueCad: 100,
    dutyRate: 0.11,
    taxRate: rate,
  });
  assert.ok(Math.abs(assessment.duty - 11) < 1e-9);
  assert.ok(
    Math.abs(assessment.tax - 111 * rate) < 1e-9,
    'tax base must include duty',
  );
});

test('a duty-free heading can still be assessed tax above CAD$40', () => {
  const assessment = assessParcel({
    declaredValueCad: 60,
    dutyRate: CA_MODELLED_DUTY_RATES.smallAccessories,
  });
  assert.equal(assessment.duty, 0);
  assert.ok(assessment.tax > 0);
  assert.equal(assessment.assessed, true);
  assert.ok(assessment.handlingFee > 0, 'handling still applies once assessed');
});

test('assessParcel rejects a nonsense declared value', () => {
  assert.throws(() => assessParcel({declaredValueCad: -1}), /non-negative/);
  assert.throws(() => assessParcel({declaredValueCad: 'abc'}), /non-negative/);
});

test('an unassessed parcel costs the merchant nothing', () => {
  const assessment = assessParcel({declaredValueCad: 10});
  assert.equal(
    expectedAssessmentCost({assessment, collectedTotal: 45, landedCost: 20}),
    0,
  );
});

test('an assessed parcel costs the order, not the handling fee', () => {
  const assessment = assessParcel({declaredValueCad: 100, dutyRate: 0.11});
  const cost = expectedAssessmentCost({
    assessment,
    collectedTotal: 45,
    landedCost: 20,
    refundRate: 0.5,
  });
  assert.equal(cost, 0.5 * 65);
  assert.ok(
    cost > assessment.handlingFee,
    'the refund, not the fee, is the real exposure',
  );
});

test('zero assessment probability reproduces the existing organic model', () => {
  const row = computeCanadianOffer({...baseOffer, assessmentProbability: 0});
  // Matches computeEconomicsRow() in check-organic-economics.mjs for the
  // packing cubes: collected 44.99, landed 20.22, contribution 20.65.
  assert.ok(Math.abs(row.collectedTotal - 44.99) < 1e-9);
  assert.ok(Math.abs(row.landedCost - 20.216) < 1e-6);
  assert.ok(Math.abs(row.contribution - 20.65) < 0.01);
  assert.equal(row.assessmentCost, 0);
});

test('assessment risk reduces contribution below the organic model', () => {
  const clean = computeCanadianOffer({...baseOffer, assessmentProbability: 0});
  const risky = computeCanadianOffer({
    ...baseOffer,
    assessmentProbability: 0.15,
  });
  assert.ok(
    risky.contribution < clean.contribution,
    'ignoring CBSA cannot be the more conservative model',
  );
});

test('the retail valuation basis is never cheaper than the wholesale one', () => {
  const wholesale = computeCanadianOffer({
    ...baseOffer,
    declaredValueBasis: 'wholesale',
    assessmentProbability: 1,
  });
  const retail = computeCanadianOffer({
    ...baseOffer,
    declaredValueBasis: 'retail',
    assessmentProbability: 1,
  });
  assert.ok(retail.assessment.customerOwes >= wholesale.assessment.customerOwes);
});

test('an offer whose contribution clears the target CPA passes', () => {
  const result = evaluateAcquisition({
    contribution: 100,
    targetCpaCad: 42,
    requiredProfitShare: 0.3,
  });
  assert.equal(result.verdict, 'PASS');
  assert.equal(result.breakEvenCpa, 100);
  assert.ok(Math.abs(result.maxViableCpa - 70) < 1e-9);
  assert.equal(result.requiredRetailUplift, 0);
});

test('an offer that covers CPA but leaves no profit is MARGINAL, not PASS', () => {
  const result = evaluateAcquisition({
    contribution: 50,
    targetCpaCad: 42,
    requiredProfitShare: 0.3,
  });
  assert.equal(result.verdict, 'MARGINAL');
  assert.ok(result.headroom < 0);
});

test('an offer that cannot reach break-even fails', () => {
  const result = evaluateAcquisition({
    contribution: 17.92,
    targetCpaCad: 42,
    requiredProfitShare: 0.3,
  });
  assert.equal(result.verdict, 'FAIL');
  assert.ok(result.requiredRetailUplift > 0);
});

test('a negative contribution can never pass', () => {
  const result = evaluateAcquisition({
    contribution: -5,
    targetCpaCad: 1,
    requiredProfitShare: 0,
  });
  assert.equal(result.verdict, 'FAIL');
});

test('price drift is detected in both directions and ignored when absent', () => {
  const under = checkPriceDrift({
    handle: 'kit',
    livePriceCad: 69,
    documentedPriceCad: 89,
  });
  assert.equal(under.drifted, true);
  assert.equal(under.drift, -20);

  const over = checkPriceDrift({
    handle: 'kit',
    livePriceCad: 99,
    documentedPriceCad: 89,
  });
  assert.equal(over.drifted, true);
  assert.equal(over.drift, 10);

  const aligned = checkPriceDrift({
    handle: 'kit',
    livePriceCad: 89,
    documentedPriceCad: 89,
  });
  assert.equal(aligned.drifted, false);
});

test('the gate evaluates every approved Canadian offer', () => {
  const result = runAcquisitionGate({
    offers: CA_COHORT,
    now: new Date('2026-08-25T00:00:00Z'),
  });
  assert.ok(result.rows.length >= 5, 'expected the audited Canadian cohort');
  assert.deepEqual(result.failures, [], 'evidence must read cleanly');
  for (const row of result.rows) {
    assert.ok(Number.isFinite(row.contribution));
    assert.ok(['PASS', 'MARGINAL', 'FAIL'].includes(row.verdict));
  }
});

test('the gate is advisory when paid acquisition is off', () => {
  const result = runAcquisitionGate({
    offers: CA_COHORT,
    paidMode: false,
    now: new Date('2026-08-25T00:00:00Z'),
  });
  assert.ok(
    result.rows.some((row) => row.verdict === 'FAIL'),
    'the current catalog cannot fund a benchmark CPA',
  );
  assert.deepEqual(result.blocking, [], 'advisory mode must not block');
});

test('the gate blocks an unfundable offer once paid acquisition is on', () => {
  const result = runAcquisitionGate({
    offers: CA_COHORT,
    paidMode: true,
    now: new Date('2026-08-25T00:00:00Z'),
  });
  assert.ok(
    result.blocking.length > 0,
    'an offer that cannot fund its own acquisition must fail the build',
  );
  assert.match(result.blocking[0], /cannot fund acquisition/);
});

test('the Carry-On Kit price drift is resolved, and the gate would catch a new one', () => {
  // The CA$69 vs CA$89 drift this test used to pin was closed on 2026-08-25
  // by restoring the documented price. The gate must now be clean for the
  // kit — and must still surface a drift if the live table diverges again.
  const clean = runAcquisitionGate({
    offers: CA_COHORT,
    now: new Date('2026-08-25T00:00:00Z'),
  });
  assert.equal(
    clean.driftWarnings.find((row) => row.handle.startsWith('the-carry-on-kit')),
    undefined,
    'live CA$89 matches the documented CA$89',
  );

  const drifted = runAcquisitionGate({
    offers: CA_COHORT,
    now: new Date('2026-08-25T00:00:00Z'),
    retail: {
      'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case': 69,
    },
  });
  const drift = drifted.driftWarnings.find((row) =>
    row.handle.startsWith('the-carry-on-kit'),
  );
  assert.ok(drift, 'a diverging live price must surface as drift');
  assert.equal(drift.documentedPriceCad, 89);
});

test('a suspended market gives the gate nothing to score', () => {
  // Suspension is a commerce kill switch, not a way to quiet the gate. With
  // no injected cohort the gate reads the live market state, and CA is
  // suspended, so there are no rows and nothing can block. The cohort-injected
  // tests above prove the scoring itself still works.
  const result = runAcquisitionGate({
    paidMode: true,
    now: new Date('2026-08-25T00:00:00Z'),
  });
  assert.equal(isMarketSuspended('CA'), true, 'CA is suspended while empty');
  assert.deepEqual(result.rows, [], 'a suspended market has no sellable rows');
  assert.deepEqual(result.blocking, [], 'nothing to sell cannot block a build');
});

test('a stale or unsourced benchmark fails the audit', () => {
  const fresh = {
    evidenceDate: '2026-08-24',
    targetCpaCad: 42,
    requiredProfitShare: 0.3,
    assessmentProbability: 0.15,
    sources: ['benchmark'],
  };
  assert.deepEqual(auditBenchmark(fresh, new Date('2026-08-25T00:00:00Z')), []);

  assert.ok(
    auditBenchmark(fresh, new Date('2027-08-25T00:00:00Z')).some((f) =>
      /older than/.test(f),
    ),
    'a year-old benchmark must fail',
  );
  assert.ok(
    auditBenchmark({...fresh, sources: []}, new Date('2026-08-25T00:00:00Z'))
      .length > 0,
    'an unsourced benchmark must fail',
  );
  assert.ok(
    auditBenchmark(
      {...fresh, targetCpaCad: 0},
      new Date('2026-08-25T00:00:00Z'),
    ).length > 0,
    'a zero target CPA must fail',
  );
  assert.ok(
    auditBenchmark(
      {...fresh, requiredProfitShare: 1},
      new Date('2026-08-25T00:00:00Z'),
    ).length > 0,
    'a 100% profit share must fail',
  );
});

test('checkout shipping is not credited above the free-shipping threshold', () => {
  // The 2026-08-25 pricing audit found the gate crediting CA$5 shipping
  // revenue on the CA$69 bundle, overstating its contribution (15.27 printed
  // vs 11.07 true). The model must mirror the live delivery profile: CA$5
  // under CA$50, CA$0 at or above it.
  assert.equal(
    collectedCheckoutShipping({retailCad: 39.99, singleItemShippingCad: 5}),
    5,
  );
  assert.equal(
    collectedCheckoutShipping({retailCad: 69, singleItemShippingCad: 5}),
    0,
  );
  assert.equal(
    collectedCheckoutShipping({retailCad: 50, singleItemShippingCad: 5}),
    0,
    'the threshold itself ships free (>= 50)',
  );
});
