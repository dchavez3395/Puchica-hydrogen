import test from 'node:test';
import assert from 'node:assert/strict';

import {
  parseCsv,
  rowToEvidence,
  solveLinear,
  screen,
  formatReport,
} from '../scripts/screen-candidates.mjs';
import {auditUndercut, MIN_CONTRIBUTION_USD} from '../scripts/check-undercut.mjs';
import {CPA_BENCHMARKS_USD, AOV_THRESHOLD_MULTIPLE} from '../scripts/screen-candidates.mjs';
import {contribution, CHOICE_LINE_DISBURSEMENT} from '../scripts/us-duty-impact.mjs';

const NOW = new Date('2026-09-08T00:00:00Z');

/**
 * Synthetic throughout. Pointing these at docs/undercut-evidence/ would mean a
 * sourcing correction silently rewrites the test's expectations, which is how
 * the 0.38 duty rate survived as long as it did.
 */
const row = (over = {}) => ({
  handle: 'fixture',
  ourRetailUsd: '49.99',
  itemCostUsd: '9.29',
  supplierShipUsd: '18.35',
  dutyRate: '0.167',
  competitorPricesUsd: '39.99;44.99;49.99;54.99;59.99',
  competitorReviews: '10;20;30;40;50',
  checkedOn: '2026-09-08',
  ...over,
});

test('the screener returns exactly the gate verdict, candidate by candidate', () => {
  const rows = [
    row({handle: 'clears'}),
    row({handle: 'too-dear', itemCostUsd: '38.00'}),
    row({handle: 'over-band', ourRetailUsd: '140.00'}),
    row({handle: 'thin-evidence', competitorPricesUsd: '39.99;44.99'}),
    row({handle: 'no-duty-rate', dutyRate: ''}),
    row({handle: 'stale', checkedOn: '2025-01-01'}),
  ];
  const {results} = screen(rows, {now: NOW});
  assert.equal(results.length, rows.length);

  for (const result of results) {
    const evidence = rowToEvidence(
      rows.find((r) => r.handle === result.handle),
      NOW,
    );
    const gate = auditUndercut([result.handle], () => evidence, NOW);
    assert.equal(
      result.passed,
      gate.failures.length === 0,
      `${result.handle}: screener and gate disagree`,
    );
    assert.deepEqual(result.failures, gate.failures, `${result.handle}: reasons differ`);
  }

  // and the fixtures are not all the same verdict, or the check above is empty
  assert.ok(results.some((r) => r.passed), 'no fixture passes');
  assert.ok(results.some((r) => !r.passed), 'no fixture fails');
});

test('an absent duty rate fails closed instead of becoming zero', () => {
  const evidence = rowToEvidence(row({dutyRate: ''}), NOW);
  assert.equal(evidence.dutyRate, undefined);

  const {results} = screen([row({handle: 'no-duty-rate', dutyRate: ''})], {now: NOW});
  assert.equal(results[0].passed, false);
  assert.match(results[0].failures.join(' '), /no dutyRate recorded/);
  assert.equal(results[0].contribution, null, 'scored a candidate with no duty rate');
});

test('a zero duty rate is honoured, since duty-free is a real answer', () => {
  const {results} = screen([row({handle: 'duty-free', dutyRate: '0'})], {now: NOW});
  assert.equal(rowToEvidence(row({dutyRate: '0'}), NOW).dutyRate, 0);
  assert.ok(results[0].contribution > 0);
});

test('dead at any price is decided at the band ceiling, not at the asking price', () => {
  // Priced well above a cheap market: profitable where it is asked, and
  // unprofitable anywhere the market would actually pay.
  const dead = row({
    handle: 'priced-out',
    ourRetailUsd: '49.00',
    itemCostUsd: '26.18',
    supplierShipUsd: '1.99',
    dutyRate: '0.551',
    competitorPricesUsd: '24.99;28.99;30.46;32.99;35.99',
  });
  const {results} = screen([dead], {now: NOW});
  const r = results[0];

  assert.equal(r.passed, false);
  assert.ok(r.contribution > MIN_CONTRIBUTION_USD, 'should look fine at the asking price');
  assert.ok(r.contributionAtCeiling < MIN_CONTRIBUTION_USD, 'should fail at the ceiling');
  assert.equal(r.deadAtAnyPrice, true);
  assert.ok(
    r.maxItemCostAtCeiling < r.itemCost,
    'the cost target must be below what is being paid, or it is not a constraint',
  );
});

test('a candidate that only needs a price move is not called dead', () => {
  const fixable = row({handle: 'underpriced', ourRetailUsd: '30.00'});
  const {results} = screen([fixable], {now: NOW});
  assert.equal(results[0].deadAtAnyPrice, false);
});

test('the solved break-evens land on the floor when fed back through the model', () => {
  const {results} = screen([row()], {now: NOW});
  const r = results[0];
  const ev = rowToEvidence(row(), NOW);
  const at = (over) =>
    contribution({
      retail: ev.ourRetailUsd,
      itemCost: ev.itemCostUsd,
      supplierShip: ev.supplierShipUsd,
      dutyRate: ev.dutyRate,
      basis: 'prepaid',
      carrier: CHOICE_LINE_DISBURSEMENT,
      market: 'US',
      ...over,
    });

  assert.ok(Number.isFinite(r.maxItemCost));
  assert.ok(
    Math.abs(at({itemCost: r.maxItemCost}) - MIN_CONTRIBUTION_USD) < 0.01,
    'maxItemCost does not reproduce the floor',
  );
  assert.ok(
    Math.abs(at({retail: r.minRetail}) - MIN_CONTRIBUTION_USD) < 0.01,
    'minRetail does not reproduce the floor',
  );
});

test('solveLinear refuses rather than guessing when the model is not linear', () => {
  assert.equal(solveLinear((x) => x * x, 3, 10), null, 'solved a quadratic');
  assert.equal(solveLinear(() => 5, 3, 10), null, 'solved a flat function');
  assert.ok(Math.abs(solveLinear((x) => 2 * x + 1, 0, 11) - 5) < 1e-9);
});

test('the CSV reader keeps quoted commas out of the columns', () => {
  const rows = parseCsv('handle,note\nx,"a, b"\ny,plain');
  assert.deepEqual(rows, [
    {handle: 'x', note: 'a, b'},
    {handle: 'y', note: 'plain'},
  ]);
});

test('results are ranked by headroom, with unscorable candidates last', () => {
  const {results} = screen(
    [
      row({handle: 'thin', itemCostUsd: '20.00'}),
      row({handle: 'fat', itemCostUsd: '4.00'}),
      row({handle: 'unscorable', dutyRate: ''}),
    ],
    {now: NOW},
  );
  assert.deepEqual(results.map((r) => r.handle), ['fat', 'thin', 'unscorable']);
});


/**
 * Corrected 2026-09-08. The advisory previously used a CA$28 floor or 40% of
 * order value inherited from sourcing-spec.mjs with no campaign behind it.
 * Measured category data puts that at roughly the BEST DECILE rather than a
 * norm, so every earlier reading was generous by two to three times.
 */
/**
 * Corrected twice on 2026-09-08. The first replacement pulled three of four
 * figures from a table whose CPAs reproduce exactly from its own CPC/CVR
 * columns - derived arithmetic presented as measurement. Only the Triple Whale
 * medians survive.
 */
test('acquisition benchmarks are the surviving measured ones', () => {
  const {lifestyleBoutique, toysArtCollectibles, average, homeAndGarden} = CPA_BENCHMARKS_USD;
  assert.ok(
    lifestyleBoutique < toysArtCollectibles && toysArtCollectibles < average && average < homeAndGarden,
    'benchmark tiers are out of order',
  );

  // The retired fabricated figures. If any reappears, the derived table has
  // been reinstated.
  const retired = [20.37, 26.84, 37.2];
  for (const v of Object.values(CPA_BENCHMARKS_USD)) {
    assert.ok(!retired.includes(v), `retired fabricated benchmark ${v} is back`);
  }

  // Home & Garden is the pessimistic bound, not the default. The default must
  // be the all-industry median.
  assert.equal(average, 38.99);
  assert.equal(homeAndGarden, 47.93);
});

test('the cart line is computed per order, and never moves the verdict', () => {
  const {results} = screen([row({handle: 'clears'})], {now: NOW});
  const r = results[0];

  assert.equal(r.passed, true, 'fixture should clear the margin gate');
  assert.equal(r.cpaUsd, CPA_BENCHMARKS_USD.average);
  assert.ok(
    Math.abs(r.cartContribution - r.contribution * AOV_THRESHOLD_MULTIPLE) < 1e-9,
    'cart contribution must be the unit contribution times the cart multiple',
  );
  assert.ok(
    Math.abs(r.profitAfterCpa - (r.cartContribution - r.cpaUsd)) < 1e-9,
    'CPA is per order, so it must be subtracted from the cart, not the unit',
  );

  // The unit alone must still fail, or the advisory has stopped being a
  // meaningful signal for single-purchase goods.
  assert.ok(
    r.contribution < CPA_BENCHMARKS_USD.lifestyleBoutique,
    'fixture unit should not clear even the cheapest benchmark on its own',
  );

  const gate = auditUndercut(['clears'], () => rowToEvidence(row({handle: 'clears'}), NOW), NOW);
  assert.equal(gate.failures.length, 0, 'the gate must not see the CPA at all');
});

test('the report states the cart line is conditional, not a verdict', () => {
  const report = formatReport(screen([row({handle: 'clears'})], {now: NOW}));
  assert.match(report, /IF this is a multi-unit-natural gift/);
  assert.match(report, /If nobody buys three, ignore this line/);
  assert.match(report, /clears no benchmark alone/);
});
