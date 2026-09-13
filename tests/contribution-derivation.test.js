import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditDerivation,
  deriveContributions,
  loadEvidence,
  DERIVATION_TOLERANCE_USD,
} from '../scripts/check-contribution-derivation.mjs';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

test('the live catalogue derives cleanly from its own evidence', () => {
  const {failures} = auditDerivation();
  assert.deepEqual(failures, []);
});

/**
 * THE REGRESSION CASE. This replays the real 2026-09-11 state rather than an
 * invented one: the saucer was repriced to $98.00, the evidence file was
 * updated, and the catalogue kept the pair computed at $101.00. Every one of
 * the 383 tests stayed green and both gate scripts passed for three runs.
 *
 * A gate that cannot fail on the defect it was built for is decoration, so this
 * asserts the failure names BOTH numbers - the filed one and the derived one -
 * because a message that only says "mismatch" sends the next person to read the
 * function instead of the diff.
 */
test('a stale pair after a reprice fails, and the message names both figures', () => {
  const stale = [
    Object.freeze({
      handle: 'hand-woven-bamboo-pendant-light',
      dutyPrepaidContributionUsd: 66.06, // computed at the old $101.00
      dutyBilledContributionUsd: 21.55,
    }),
  ];
  const {failures} = auditDerivation(stale);
  assert.equal(failures.length, 2);
  assert.ok(failures.some((f) => f.includes('66.06') && f.includes('63.46')), failures.join('\n'));
  assert.ok(failures.some((f) => f.includes('21.55') && f.includes('20.20')), failures.join('\n'));
});

test('missing evidence is a failure, never a skip', () => {
  const {failures} = auditDerivation(
    [Object.freeze({handle: 'no-such-handle', dutyPrepaidContributionUsd: 1, dutyBilledContributionUsd: 1})],
    () => null,
  );
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no undercut evidence/);
});

test('evidence without a market fails rather than defaulting', () => {
  // contribution() collects the US delivery profile's flat shipping on every US
  // order and the Canadian free-over rule otherwise, so a missing market moves
  // both figures silently. Guessing here would be the same class of error the
  // gate exists to catch.
  const ev = {ourRetailUsd: 98, itemCostUsd: 23.49, supplierShipUsd: 1.99, dutyRate: 0.414};
  const {failures} = auditDerivation(
    [Object.freeze({handle: 'x', dutyPrepaidContributionUsd: 1, dutyBilledContributionUsd: 1})],
    () => ev,
  );
  assert.equal(failures.length, 1);
  assert.match(failures[0], /no market/);
});

test('the tolerance is a cent, and it is not a place to hide a real drift', () => {
  assert.equal(DERIVATION_TOLERANCE_USD, 0.01);
  const ev = loadEvidence('hand-woven-bamboo-pendant-light');
  const derived = deriveContributions(ev);
  const live = APPROVED_CATALOG_OFFERS.find((o) => o.handle === 'hand-woven-bamboo-pendant-light');
  assert.ok(Math.abs(derived.prepaid - live.dutyPrepaidContributionUsd) <= DERIVATION_TOLERANCE_USD);
  assert.ok(Math.abs(derived.billed - live.dutyBilledContributionUsd) <= DERIVATION_TOLERANCE_USD);
  // A half-dollar drift must NOT pass.
  const {failures} = auditDerivation(
    [Object.freeze({
      handle: 'hand-woven-bamboo-pendant-light',
      dutyPrepaidContributionUsd: derived.prepaid + 0.5,
      dutyBilledContributionUsd: derived.billed,
    })],
  );
  assert.equal(failures.length, 1);
});
