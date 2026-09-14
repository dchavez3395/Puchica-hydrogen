import assert from 'node:assert/strict';
import test from 'node:test';

import {
  auditCostDrift,
  loadReadings,
  MAX_READING_AGE_DAYS,
  DRIFT_TOLERANCE_CAD,
} from '../scripts/check-cost-drift.mjs';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

const offer = {
  handle: 'woven-bamboo-gourd-pendant-23cm',
  sku: '200000531:1052#32cm-M;249:200006305#1pcs',
  supplierProductId: '1005007626643748',
};
const evidence = {
  market: 'CA',
  ourRetailCad: 74.99,
  itemCostCad: 36.32,
  supplierShipCad: 0,
  dutyRate: 0.07,
};
const reading = (over) => ({
  readings: [
    {
      supplierProductId: offer.supplierProductId,
      sku: offer.sku,
      listCad: 36.32,
      saleCad: 34.14,
      stock: 876,
      shipCad: 0,
      readOn: '2026-09-14',
      ...over,
    },
  ],
});
const run = (readings, now = new Date('2026-09-14T12:00:00Z')) =>
  auditCostDrift({offers: [offer], load: () => evidence, readings, now});

/**
 * THE REGRESSION CASE - the gourd, 2026-09-13. Live at CA$74.99 on a C$36.32
 * list cost; the seller repriced the variant to C$65.90 the same day. Every
 * gate in the repo stayed green because every gate reads the evidence file.
 * This one reads the listing, and it must name the live cost, the filed cost
 * and the resulting contribution so the next person can act on the message.
 */
test('a live list cost that takes the contribution under the floor fails and names both costs', () => {
  const {failures} = run(reading({listCad: 65.9, saleCad: 61.95}));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /C\$65\.90/);
  assert.match(failures[0], /C\$36\.32/);
  assert.match(failures[0], /CA\$-8\.64/);
  assert.match(failures[0], /COST_HOLD/);
});

test('a reading that matches the evidence passes with a note', () => {
  const {failures, notes} = run(reading({}));
  assert.deepEqual(failures, []);
  assert.equal(notes.length, 1);
});

test('a drift that still clears the floor fails as an unfiled reading, not a hold', () => {
  const {failures} = run(reading({listCad: 36.32 + DRIFT_TOLERANCE_CAD + 0.01}));
  assert.equal(failures.length, 1);
  assert.match(failures[0], /File the new reading/);
  assert.doesNotMatch(failures[0], /COST_HOLD/);
});

test('a stale reading fails on age, and a missing one fails by name', () => {
  const stale = run(reading({}), new Date(Date.UTC(2026, 8, 14 + MAX_READING_AGE_DAYS + 1)));
  assert.match(stale.failures[0], /days old/);
  const missing = auditCostDrift({offers: [offer], load: () => evidence, readings: {readings: []}});
  assert.match(missing.failures[0], /no live reading for listing 1005007626643748/);
});

test('every approved SKU has a reading on file, whatever its age', () => {
  // The file is a session artefact and goes stale between sessions; the
  // check that it is FRESH is `npm run cost-drift`, run before a push, not
  // this test. What the test holds is coverage: a SKU that is approved
  // without ever having been read is the state the gourd was in.
  const readings = loadReadings();
  assert.ok(readings && Array.isArray(readings.readings));
  const keys = new Set(readings.readings.map((r) => `${r.supplierProductId}|${r.sku}`));
  for (const o of APPROVED_CATALOG_OFFERS) {
    assert.ok(keys.has(`${o.supplierProductId}|${o.sku}`), `${o.handle} has no live cost reading`);
  }
});
