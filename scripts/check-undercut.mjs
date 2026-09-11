#!/usr/bin/env node
/**
 * The market check, as a gate rather than a memory.
 *
 * Eight products have now died the same death: organizer cases, hockey straps,
 * cat trees, the rat zapper, the humane cage trap, the compression cubes, the
 * 2026-09 watch-roll cohort, and a 1688 coffee grinder. Every one was sourced,
 * costed and margin-modelled BEFORE anyone compared it to what the same thing
 * already sells for. The comparison takes ten minutes and it kept being the
 * last step instead of the first.
 *
 * REWRITTEN 2026-09-08, same day it was first written, because the first
 * version tested the wrong things.
 *
 * v1 had two price-proxy rules: landed cost had to sit under the CHEAPEST
 * competitor, and retail had to sit under 1.15x the median. Both were standing
 * in for the only question that matters - does a unit make money - and the
 * cheapest-competitor rule was actively bad, because in a category running
 * $19.99 to $199.99 the cheapest listing is one floor product with 4.2 stars,
 * not the market. It rejected a grinder whose real contribution was positive.
 *
 * So the gate now COMPUTES the number. scripts/us-duty-impact.mjs already had
 * the maths - payment fees, returns reserve, duty basis, MPF, carrier
 * disbursement - and this imports it rather than approximating it.
 *
 *   RULE 1  CONTRIBUTION. At the recorded retail, under the binding duty
 *           scenario, a unit must clear MIN_CONTRIBUTION_USD after landed
 *           cost, payment fees and the returns reserve. This is strictly
 *           harder than either v1 rule for a thin product and correctly
 *           permissive for a cheap-to-source one in an expensive category.
 *
 *   RULE 2  BAND. Retail must still sit inside what the market charges. A
 *           product can clear rule 1 by being priced at $200 in a $40
 *           category; nobody would buy it. Kept from v1.
 *
 * The duty rate is per-product and must be recorded per evidence file. The
 * watch rolls were HTS 4202.92.97 at 55.1%; an electrical item with a lithium
 * cell is a different code with different rules, and assuming otherwise is how
 * the 0.38 rate got inherited and went unsourced for weeks.
 *
 * Top review count is recorded and NEVER fatal. Victor's 13,800 in pest
 * control means an incumbent owns the shelf; the watch rolls topped out at 707
 * and the grinders at 565. That distinction decides whether the answer is a
 * different product or a different supplier.
 */
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {
  APPROVED_CATALOG_OFFERS,
  US_DUTY_INCIDENCE,
  US_DUTY_INCIDENCE_STATES,
  incidenceExposure,
  INCIDENCE_IMMUNITY_FLOOR_USD,
} from '../app/lib/launch-catalog.js';
import {contribution, CHOICE_LINE_DISBURSEMENT} from './us-duty-impact.mjs';

const DIR = fileURLToPath(new URL('../docs/undercut-evidence/', import.meta.url));

// Exported so scripts/screen-candidates.mjs reports headroom against the same
// numbers this gate enforces. A screener that carries its own copy of the
// floor is a screener that quietly disagrees with CI, which is the whole
// failure this file was written to stop.
export const MAX_AGE_DAYS = 90;
export const MIN_COMPETITORS = 5;
export const BAND_TOLERANCE = 1.15;
export const MIN_CONTRIBUTION_USD = 12.0;
export const LOCKED_CATEGORY_REVIEWS = 5000;

export const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * Which duty scenario binds follows US_DUTY_INCIDENCE, exactly as
 * isOfferSellable does. 'unverified' binds the PREPAID case and the DSers
 * Tax&Fee reading before a supplier is paid is what makes that safe.
 */
export function bindingBasis(incidence = US_DUTY_INCIDENCE) {
  return incidence === US_DUTY_INCIDENCE_STATES.BILLED ? 'retail' : 'prepaid';
}

export function auditUndercut(handles, load, now = new Date(), opts = {}) {
  const basis = opts.basis ?? bindingBasis();
  const failures = [];
  const notes = [];
  for (const handle of handles) {
    const ev = load(handle);
    if (!ev) {
      failures.push(`${handle}: no undercut evidence. Run the market check BEFORE the margin model, not after.`);
      continue;
    }
    const checked = new Date(ev.checkedOn);
    if (Number.isNaN(checked.getTime())) {
      failures.push(`${handle}: checkedOn is not a date.`);
      continue;
    }
    const ageDays = (now - checked) / 86400000;
    if (ageDays > MAX_AGE_DAYS) {
      failures.push(`${handle}: evidence is ${Math.round(ageDays)} days old (limit ${MAX_AGE_DAYS}). Competitor pricing moves.`);
    }
    const prices = (ev.competitors || []).map((c) => Number(c.priceUsd)).filter((n) => n > 0);
    if (prices.length < MIN_COMPETITORS) {
      failures.push(`${handle}: only ${prices.length} competitor prices (need ${MIN_COMPETITORS}). One or two listings is an anecdote.`);
      continue;
    }
    const retail = Number(ev.ourRetailUsd);
    const itemCost = Number(ev.itemCostUsd);
    const supplierShip = Number(ev.supplierShipUsd);
    const dutyRate = Number(ev.dutyRate);

    if (!(retail > 0) || !(itemCost > 0) || !Number.isFinite(supplierShip)) {
      failures.push(`${handle}: needs ourRetailUsd, itemCostUsd and supplierShipUsd. Landed cost alone cannot be split across duty bases.`);
      continue;
    }
    if (!Number.isFinite(dutyRate)) {
      failures.push(`${handle}: no dutyRate recorded. It is per-product - do not inherit another product's rate, source the HTS code.`);
      continue;
    }

    // RULE 1
    //
    // `market` is required, not optional. contribution() collects the US
    // delivery profile's flat CA$6.99 (about $4.99) on every US order and the
    // Canadian free-over-CA$50 rule otherwise, and the two disagree in both
    // directions: omitting it credits $5 on a $49 offer that actually collects
    // $4.99, and $0 on an $85 offer that also collects $4.99. This gate is the
    // Amazon US undercut test - every field in the evidence is USD and every
    // competitor is a US listing - so the market is US. If it ever scores
    // another market, the evidence needs a market field rather than a default.
    const perUnit = contribution({
      retail, itemCost, supplierShip, dutyRate,
      basis, carrier: CHOICE_LINE_DISBURSEMENT, market: 'US',
    });
    if (perUnit < MIN_CONTRIBUTION_USD) {
      failures.push(
        `${handle}: RULE 1 - contributes $${perUnit.toFixed(2)}/unit at $${retail.toFixed(2)} under the '${basis}' duty basis (floor $${MIN_CONTRIBUTION_USD.toFixed(2)}).`,
      );
    } else {
      notes.push(`${handle}: contributes $${perUnit.toFixed(2)}/unit at $${retail.toFixed(2)} ('${basis}' basis).`);
    }

    // RULE 2
    const mid = median(prices);
    if (retail > mid * BAND_TOLERANCE) {
      failures.push(
        `${handle}: RULE 2 - retail $${retail.toFixed(2)} is over the band (median $${mid.toFixed(2)}, ceiling $${(mid * BAND_TOLERANCE).toFixed(2)}).`,
      );
    }

    const topReviews = Math.max(0, ...(ev.competitors || []).map((c) => Number(c.reviews) || 0));
    notes.push(
      topReviews >= LOCKED_CATEGORY_REVIEWS
        ? `${handle}: category may be LOCKED - top competitor carries ${topReviews} reviews.`
        : `${handle}: category open - top competitor carries ${topReviews} reviews.`,
    );
  }
  return {failures, notes};
}

/**
 * WHICH OFFERS SURVIVE THE DUTY QUESTION, AND WHICH ONLY SURVIVE ONE ANSWER TO IT.
 *
 * This gate's RULE 1 scores every offer on the BINDING basis, which is whichever
 * one US_DUTY_INCIDENCE currently points at. That is the right test for "may we
 * sell this today". It is the wrong test for "what happens if the incidence
 * question resolves the other way", and that second question is the one that
 * has actually cost this catalogue products.
 *
 * incidenceExposure() partitions the cohort on BOTH bases at once: an offer is
 * immune when it clears the floor whether the duty is prepaid inside the
 * supplier price or billed on top. Anything else is carrying a bet on an
 * unverified fact.
 *
 * Printed as advisory notes, never as a failure. An exposed offer is not an
 * illegal offer - the live sconce has been one for the whole life of this
 * cohort - it is an offer whose margin depends on an answer nobody has checked.
 * Turning that into a hard failure would block the store on a question the gate
 * cannot itself settle.
 */
export function reportIncidenceExposure(offers = APPROVED_CATALOG_OFFERS) {
  const {immune, exposed} = incidenceExposure(offers);
  console.log('');
  console.log(
    `incidence exposure (floor $${INCIDENCE_IMMUNITY_FLOOR_USD.toFixed(2)} on BOTH bases): ` +
      `${immune.length} immune, ${exposed.length} exposed`,
  );
  for (const o of exposed) {
    const prepaid = Number(o.dutyPrepaidContributionUsd);
    const billed = Number(o.dutyBilledContributionUsd);
    const worst = Math.min(prepaid, billed);
    console.log(
      `  EXPOSED: ${o.handle} - $${worst.toFixed(2)} on the weaker basis ` +
        `(prepaid $${prepaid.toFixed(2)} / billed $${billed.toFixed(2)}). ` +
        'Price is not the lever here; cost is. Re-source or accept the bet.',
    );
  }
  if (!exposed.length) {
    console.log('  every approved offer clears the floor on both bases.');
  }
  return {immune, exposed};
}

const loadFromDisk = (handle) => {
  const p = path.join(DIR, `${handle}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
};

if (process.argv[1] && process.argv[1].endsWith('check-undercut.mjs')) {
  const handles = [...new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))];
  console.log('Puchica undercut gate');
  console.log('=====================');
  console.log(`duty incidence: ${US_DUTY_INCIDENCE} -> binding basis '${bindingBasis()}'`);
  if (handles.length === 0) {
    const files = existsSync(DIR) ? readdirSync(DIR).filter((f) => f.endsWith('.json')) : [];
    console.log(`No approved handles to check. ${files.length} evidence file(s) on record.`);
    console.log('PASS: nothing is approved, so nothing is unchecked.');
    process.exit(0);
  }
  const {failures, notes} = auditUndercut(handles, loadFromDisk);
  for (const n of notes) console.log(`  note: ${n}`);
  if (failures.length) {
    console.log('');
    for (const f of failures) console.log(`  FAIL: ${f}`);
    console.log(`\n${failures.length} handle-level failure(s). This gate exists because eight products died of exactly this.`);
    process.exit(1);
  }
  reportIncidenceExposure();
  console.log('PASS: every approved handle carries current undercut evidence.');
}
