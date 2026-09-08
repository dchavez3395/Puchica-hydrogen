#!/usr/bin/env node
/**
 * The market check, as a gate rather than a memory.
 *
 * Seven products have now died the same death: organizer cases, hockey straps,
 * cat trees, the rat zapper, the humane cage trap, the compression cubes, and
 * the 2026-09 watch-roll cohort. Every one of them was sourced, costed,
 * margin-modelled, imported and in several cases priced and published BEFORE
 * anyone compared it to what the same thing already sells for. The comparison
 * takes ten minutes and it has never once been the first step.
 *
 * So it is a gate now. No handle reaches APPROVED_CATALOG_OFFERS without a
 * dated evidence file recording what the market charges, and the two rules
 * below are the ones the corpses actually failed - not a general-purpose
 * pricing opinion.
 *
 *   RULE 1  Our LANDED COST must sit below the cheapest credible competitor's
 *           RETAIL. When it does not, there is no price that works and no
 *           amount of copy, imagery or bundling fixes it. The watch-roll
 *           3-slot cost $26.18 against competitors retailing at $18.99. CJ's
 *           entire US warehouse failed this in four unrelated categories.
 *
 *   RULE 2  Our RETAIL must sit inside the band. Above it we do not sell;
 *           at the bottom of it there is no margin. Rule 1 is what decides
 *           whether rule 2 has any room to move in.
 *
 * A third signal is recorded but never fatal: the largest review count in the
 * category. Victor's 13,800 in pest control means an incumbent owns the shelf.
 * The watch-roll category topped out at 707, which is why the finding there was
 * "our supply price is wrong" and not "this category is taken". That distinction
 * is the difference between changing product and changing supplier.
 */
import {readFileSync, existsSync, readdirSync} from 'node:fs';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {APPROVED_CATALOG_OFFERS} from '../app/lib/launch-catalog.js';

const DIR = fileURLToPath(new URL('../docs/undercut-evidence/', import.meta.url));
const MAX_AGE_DAYS = 90;
const MIN_COMPETITORS = 5;
const BAND_TOLERANCE = 1.15; // our retail may sit 15% over the median, no more
const LOCKED_CATEGORY_REVIEWS = 5000;

const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

export function auditUndercut(handles, load, now = new Date()) {
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
    const cheapest = Math.min(...prices);
    const mid = median(prices);
    const cost = Number(ev.ourLandedCostUsd);
    const retail = Number(ev.ourRetailUsd);

    if (!(cost > 0) || !(retail > 0)) {
      failures.push(`${handle}: ourLandedCostUsd and ourRetailUsd must both be recorded.`);
      continue;
    }
    // RULE 1
    if (cost >= cheapest) {
      failures.push(
        `${handle}: RULE 1 - landed cost $${cost.toFixed(2)} is at or above the cheapest competitor retail $${cheapest.toFixed(2)}. No price clears both the market and the cost.`,
      );
    }
    // RULE 2
    if (retail > mid * BAND_TOLERANCE) {
      failures.push(
        `${handle}: RULE 2 - retail $${retail.toFixed(2)} is over the band (median $${mid.toFixed(2)}, ceiling $${(mid * BAND_TOLERANCE).toFixed(2)}).`,
      );
    }
    const topReviews = Math.max(0, ...(ev.competitors || []).map((c) => Number(c.reviews) || 0));
    if (topReviews >= LOCKED_CATEGORY_REVIEWS) {
      notes.push(`${handle}: category may be locked - top competitor carries ${topReviews} reviews.`);
    } else {
      notes.push(`${handle}: category open - top competitor carries ${topReviews} reviews.`);
    }
  }
  return {failures, notes};
}

const loadFromDisk = (handle) => {
  const p = path.join(DIR, `${handle}.json`);
  return existsSync(p) ? JSON.parse(readFileSync(p, 'utf8')) : null;
};

if (process.argv[1] && process.argv[1].endsWith('check-undercut.mjs')) {
  const handles = [...new Set(APPROVED_CATALOG_OFFERS.map((o) => o.handle))];
  console.log('Puchica undercut gate');
  console.log('=====================');
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
    console.log(`\n${failures.length} handle-level failure(s). This gate exists because seven products died of exactly this.`);
    process.exit(1);
  }
  console.log('PASS: every approved handle carries current undercut evidence.');
}
