/**
 * COST DRIFT - does every live SKU still cost what its evidence says?
 *
 * Added 2026-09-14 after the gourd. It went live on 2026-09-13 at CA$74.99
 * on a C$36.32 list cost, and a re-read of the same listing that evening
 * found the seller had repriced that one variant to C$65.90 - a loss of
 * CA$8.64 on every unit, on a product that was ACTIVE and selling. Nothing in
 * the repo could have noticed: the undercut gate reads the evidence FILE, the
 * derivation gate checks the catalogue against the evidence FILE, and the
 * evidence file is a reading taken once. A supplier's price is not a
 * contract, and a live catalogue needs its costs re-read on a clock.
 *
 * HOW IT READS. AliExpress renders the SKU table client-side, so a plain HTTP
 * fetch of the item page carries no prices (tried 2026-09-14: 77 KB of shell,
 * `window.runParams` empty). The readings therefore come from a browser
 * session: `scripts/browser/collect-live-costs.js` is pasted into an
 * AliExpress item tab with a Canadian destination and returns the listing's
 * per-SKU `originalPrice` (rule 22: the LIST price is the cost basis),
 * `salePriceString`, `skuStock` and the shipping panel's charge. The
 * collected rows are merged into docs/sourcing-evidence/live-cost-readings.json.
 *
 * WHAT IT CHECKS, for every offer in APPROVED_CATALOG_OFFERS:
 *   1. a reading exists for its supplierProductId + sku (exact string);
 *   2. the reading is no older than MAX_READING_AGE_DAYS;
 *   3. the read LIST price is within DRIFT_TOLERANCE_CAD of the evidence
 *      file's itemCostCad (either direction - a fall is a repricing
 *      opportunity that should be filed, not ignored);
 *   4. the contribution recomputed at the READ cost and freight still clears
 *      MIN_CONTRIBUTION_CAD. This is the one that would have caught the gourd.
 *
 * Runs as part of `npm run launch-check`, so a stale or drifted reading
 * blocks a deploy the same way missing undercut evidence does. Refresh the
 * readings before pushing; the runbook line is "re-read before any paid push"
 * and this makes it "re-read before ANY push".
 */
import {existsSync, readFileSync} from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';
import {deriveContributions, loadEvidence} from './check-contribution-derivation.mjs';
import {MIN_CONTRIBUTION_CAD} from './check-undercut.mjs';

const HERE = path.dirname(fileURLToPath(import.meta.url));
export const READINGS_PATH = path.resolve(HERE, '../docs/sourcing-evidence/live-cost-readings.json');

/** A week. Prices moved 80% inside a day once; a week is the longest a reading should stand. */
export const MAX_READING_AGE_DAYS = 7;
/** Half a dollar either way. The seller families round in cents; anything more is a decision. */
export const DRIFT_TOLERANCE_CAD = 0.5;

export const loadReadings = (file = READINGS_PATH) => {
  if (!existsSync(file)) return null;
  return JSON.parse(readFileSync(file, 'utf8'));
};

const key = (supplierProductId, sku) => `${supplierProductId}|${sku}`;

/**
 * Pure audit so the test can drive it with inline offers, evidence and
 * readings. `readings` is the parsed readings file: `{readings: [{supplierProductId,
 * sku, listCad, saleCad, stock, shipCad, readOn, source}]}`.
 */
export function auditCostDrift({
  offers = APPROVED_CATALOG_OFFERS,
  load = loadEvidence,
  readings = loadReadings(),
  now = new Date(),
  floor = MIN_CONTRIBUTION_CAD,
} = {}) {
  const failures = [];
  const notes = [];
  if (!readings || !Array.isArray(readings.readings)) {
    failures.push(`no live cost readings on file at ${READINGS_PATH}. Collect them with scripts/browser/collect-live-costs.js before pushing.`);
    return {failures, notes};
  }
  const byKey = new Map();
  for (const r of readings.readings) {
    byKey.set(key(r.supplierProductId, r.sku), r);
  }

  for (const offer of offers) {
    const {handle} = offer;
    const ev = load(handle);
    if (!ev) {
      failures.push(`${handle}: no undercut evidence, so there is nothing to compare a live reading against.`);
      continue;
    }
    const r = byKey.get(key(offer.supplierProductId, offer.sku));
    if (!r) {
      failures.push(`${handle}: no live reading for listing ${offer.supplierProductId} SKU ${offer.sku}. Every approved SKU needs one.`);
      continue;
    }
    const readOn = new Date(r.readOn);
    if (Number.isNaN(readOn.getTime())) {
      failures.push(`${handle}: reading has no usable readOn date.`);
      continue;
    }
    const ageDays = (now - readOn) / 86400000;
    if (ageDays > MAX_READING_AGE_DAYS) {
      failures.push(`${handle}: live reading is ${Math.round(ageDays)} days old (limit ${MAX_READING_AGE_DAYS}). Re-read the listing.`);
      continue;
    }
    const listCad = Number(r.listCad);
    const shipCad = Number(r.shipCad ?? ev.supplierShipCad ?? 0);
    if (!(listCad > 0)) {
      failures.push(`${handle}: reading has no positive listCad.`);
      continue;
    }
    if (Number.isFinite(Number(r.stock)) && Number(r.stock) < 25) {
      failures.push(`${handle}: live per-SKU stock reads ${r.stock}, under the rule 4 floor of 25.`);
    }

    const evCost = Number(ev.itemCostCad);
    const drift = listCad - evCost;
    const derived = deriveContributions({...ev, itemCostCad: listCad, supplierShipCad: shipCad});
    const contribution = derived.wholesale;

    if (Number.isFinite(contribution) && contribution < floor) {
      failures.push(
        `${handle}: at the LIVE list cost of C$${listCad.toFixed(2)} (evidence says C$${evCost.toFixed(2)}) plus C$${shipCad.toFixed(2)} freight, ` +
          `the contribution at CA$${Number(ev.ourRetailCad).toFixed(2)} is CA$${contribution.toFixed(2)}, under the CA$${floor.toFixed(2)} floor. ` +
          `Hold it (COST_HOLD) or re-source it before the next order.`,
      );
      continue;
    }
    if (Math.abs(drift) > DRIFT_TOLERANCE_CAD) {
      failures.push(
        `${handle}: live list cost C$${listCad.toFixed(2)} is ${drift > 0 ? 'up' : 'down'} C$${Math.abs(drift).toFixed(2)} from the evidence file's C$${evCost.toFixed(2)} ` +
          `(still clears the floor at CA$${contribution.toFixed(2)}). File the new reading: update itemCostCad, the contribution, and the baseline row in one edit.`,
      );
      continue;
    }
    notes.push(`${handle}: live list C$${listCad.toFixed(2)} vs evidence C$${evCost.toFixed(2)}, contribution CA$${contribution.toFixed(2)}, read ${r.readOn}.`);
  }
  return {failures, notes};
}

const IS_CLI = process.argv[1] && process.argv[1].endsWith('check-cost-drift.mjs');
if (IS_CLI) {
  const {failures, notes} = auditCostDrift();
  for (const n of notes) console.log(`  ok: ${n}`);
  if (failures.length) {
    console.error('FAIL: live supplier costs have drifted from the evidence on file.');
    for (const f of failures) console.error(`  - ${f}`);
    process.exit(1);
  }
  console.log(`PASS: every approved SKU's live list cost matches its evidence within C$${DRIFT_TOLERANCE_CAD.toFixed(2)} and clears the floor.`);
}
