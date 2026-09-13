/**
 * RULE 26 - THE FILED CONTRIBUTION PAIR MUST BE DERIVABLE FROM THE EVIDENCE.
 *
 * `dutyPrepaidContributionUsd` and `dutyBilledContributionUsd` in
 * APPROVED_CATALOG_OFFERS are hand-written numbers that nothing in the repo
 * derives. `scripts/check-undercut.mjs` reads them as trusted input and
 * `tests/launch-catalog.test.js` only asserts they are positive. So a stale
 * pair is invisible to every test and every gate.
 *
 * That is not hypothetical. On 2026-09-11 the saucer was repriced CA$136.00 ->
 * CA$133.00 ($101.00 -> $98.00), the evidence file was updated and the
 * catalogue was not. The gates stayed green for three runs while
 * check-undercut printed "contributes $66.06/unit at $101.00" for a product the
 * store was selling at $98.00. Nothing on earth contradicted it. Run 14 caught
 * it by hand; run 15 wrote the rule as a COMMENT next to the numbers, which
 * does not fail a build.
 *
 * This gate derives both figures from the evidence file with the real
 * contribution() - never the collapsed screening form - and fails if either
 * filed number drifts by more than a cent.
 *
 * WHAT IT DOES NOT DO. It cannot see Shopify, so it proves the catalogue agrees
 * with the evidence file, not that the evidence file agrees with the live
 * price. Keeping ourRetailUsd equal to what contextualPricing serves is still a
 * reading somebody takes by hand. The half this closes is the half that was
 * being skipped silently.
 *
 * Every failure is hard. A missing or malformed evidence file fails rather than
 * skipping the offer - rule 25's lesson, that a silent fallback makes the
 * looser test the reward for writing bad evidence.
 */
import {readFileSync, existsSync} from 'node:fs';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';
import {contribution, CHOICE_LINE_DISBURSEMENT} from './us-duty-impact.mjs';

const DIR = fileURLToPath(new URL('../docs/undercut-evidence/', import.meta.url));

// A cent. The figures are filed to two decimal places, so anything larger is a
// real disagreement rather than floating-point noise.
export const DERIVATION_TOLERANCE_USD = 0.01;

export const loadEvidence = (handle) => {
  const path = `${DIR}${handle}.json`;
  if (!existsSync(path)) return null;
  return JSON.parse(readFileSync(path, 'utf8'));
};

/**
 * The prepaid figure is scenario E: the duty is already inside the supplier
 * price, so nothing is added. The billed figure is scenario D-: duty on the
 * retail transaction value with no billback, which is the line this catalogue
 * actually ships on. Both must be computed with the same market, because
 * contribution() collects the US delivery profile's flat shipping on every US
 * order and the Canadian free-over rule otherwise.
 */
export function deriveContributions(ev) {
  const retail = Number(ev.ourRetailUsd);
  const itemCost = Number(ev.itemCostUsd);
  const supplierShip = Number(ev.supplierShipUsd);
  const dutyRate = Number(ev.dutyRate);
  const market = ev.market;
  const base = {retail, itemCost, supplierShip, dutyRate, market};
  return {
    prepaid: contribution({...base, basis: 'prepaid', carrier: 0}),
    billed: contribution({...base, basis: 'retail', carrier: CHOICE_LINE_DISBURSEMENT}),
  };
}

export function auditDerivation(offers = APPROVED_CATALOG_OFFERS, load = loadEvidence) {
  const failures = [];
  const notes = [];

  for (const offer of offers) {
    const {handle} = offer;
    const ev = load(handle);
    if (!ev) {
      failures.push(`${handle}: no undercut evidence on file, so the filed contribution pair cannot be derived from anything.`);
      continue;
    }

    const required = ['ourRetailUsd', 'itemCostUsd', 'supplierShipUsd', 'dutyRate'];
    const missing = required.filter((k) => !Number.isFinite(Number(ev[k])));
    if (missing.length) {
      failures.push(`${handle}: evidence is missing ${missing.join(', ')} - cannot derive the contribution pair.`);
      continue;
    }
    if (!ev.market) {
      failures.push(`${handle}: evidence has no market. contribution() collects different shipping per market, so omitting it silently changes both figures.`);
      continue;
    }

    const derived = deriveContributions(ev);
    const filed = {
      prepaid: Number(offer.dutyPrepaidContributionUsd),
      billed: Number(offer.dutyBilledContributionUsd),
    };

    for (const basis of ['prepaid', 'billed']) {
      if (!Number.isFinite(filed[basis])) {
        failures.push(`${handle}: duty${basis === 'prepaid' ? 'Prepaid' : 'Billed'}ContributionUsd is not a number.`);
        continue;
      }
      const drift = Math.abs(filed[basis] - derived[basis]);
      if (drift > DERIVATION_TOLERANCE_USD) {
        failures.push(
          `${handle}: ${basis} contribution is filed as $${filed[basis].toFixed(2)} but derives to $${derived[basis].toFixed(2)} from the evidence ` +
            `(retail $${Number(ev.ourRetailUsd).toFixed(2)}, cost $${Number(ev.itemCostUsd).toFixed(2)}). ` +
            `A price moved and the pair did not move with it - fix the pair in the same edit, do not widen the tolerance.`,
        );
      }
    }

    if (!failures.some((f) => f.startsWith(`${handle}:`))) {
      notes.push(`${handle}: prepaid $${derived.prepaid.toFixed(2)} / billed $${derived.billed.toFixed(2)} at $${Number(ev.ourRetailUsd).toFixed(2)} - matches the catalogue.`);
    }
  }

  return {failures, notes};
}

const IS_CLI = process.argv[1] && process.argv[1].endsWith('check-contribution-derivation.mjs');

if (IS_CLI) {
  console.log('Puchica contribution derivation gate');
  console.log('====================================');
  const {failures, notes} = auditDerivation();
  for (const n of notes) console.log(`  note: ${n}`);
  if (failures.length) {
    console.log('');
    for (const f of failures) console.log(`FAIL: ${f}`);
    console.log('');
    console.log(`${failures.length} offer figure(s) do not derive from their evidence.`);
    process.exit(1);
  }
  console.log('');
  console.log('PASS: every approved offer\'s contribution pair derives from its evidence file.');
}
