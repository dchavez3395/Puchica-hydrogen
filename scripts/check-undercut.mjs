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
// RULE 25. A single search term is one slice of a category, not the category.
// Run 11 measured the pendant band eight ways and the medians ran $55 to $105 -
// so which keyword you happened to type decided whether an offer passed. Three
// is the floor for calling a spread a band.
export const MIN_BAND_KEYWORDS = 3;
export const MIN_CONTRIBUTION_USD = 12.0;

/**
 * The same floor for the Canadian market, added 2026-09-13.
 *
 * This is MIN_CONTRIBUTION_USD at the 1.352 planning rate, rounded up to the
 * cent, and it is DERIVED on purpose rather than chosen. The floor is a
 * statement about how thin a sale may be before it stops being worth
 * fulfilling, and that judgement does not change when the currency does. Two
 * independently chosen numbers would drift apart and nobody would notice which
 * market had quietly become the lenient one.
 *
 * launch-catalog.js mirrors MIN_CONTRIBUTION_USD by hand as
 * INCIDENCE_IMMUNITY_FLOOR_USD to avoid an import cycle, and a test asserts the
 * two match - so MIN_CONTRIBUTION_USD itself must stay put.
 */
export const PLANNING_FX_CAD_PER_USD = 1.352;
export const MIN_CONTRIBUTION_CAD =
  Math.ceil(MIN_CONTRIBUTION_USD * PLANNING_FX_CAD_PER_USD * 100) / 100;
export const LOCKED_CATEGORY_REVIEWS = 5000;

export const median = (xs) => {
  const s = [...xs].sort((a, b) => a - b);
  const m = Math.floor(s.length / 2);
  return s.length % 2 ? s[m] : (s[m - 1] + s[m]) / 2;
};

/**
 * RULE 25 - RESOLVE THE BAND FROM A BASKET OF KEYWORDS, NOT FROM ONE SEARCH.
 *
 * `bandMedian` is a NEW field and deliberately does NOT replace `competitors`.
 * Rule 9 reads per-listing review counts off that same array to decide whether
 * a category is locked; swapping 47 listing prices for 8 keyword medians would
 * throw the review evidence away and make every category read "open" at 0
 * reviews. The two fields answer different questions and both are needed.
 *
 * RULE 23 is enforced here rather than trusted: `medianUsd` must equal the
 * LOWEST of the recorded `readings`, so an evidence file cannot quietly adopt
 * the day the basket happened to read high. Run 12 watched the pendant basket
 * move 3.1% within a single day, and taking the looser reading would have made
 * a live breach disappear.
 *
 * Every failure below is a HARD failure. A malformed or too-thin bandMedian
 * must never fall back to the single-keyword median - that would make the
 * looser test the reward for writing bad evidence.
 */
export function resolveBand(handle, ev, prices, cur = 'Usd') {
  // `cur` is the currency suffix of the numeric fields ('Usd' or 'Cad'),
  // derived from the evidence's own `market` by the caller. Added 2026-09-13:
  // reading `medianUsd` out of a Canadian file would not throw, it would
  // return undefined, and every band check would then fail with a message
  // about malformed evidence rather than about the currency - which is how an
  // hour goes missing.
  const sym = cur === 'Cad' ? 'CA$' : '$';
  const raw = ev.bandMedian;
  if (raw === undefined || raw === null) {
    return {
      medianUsd: median(prices),
      how: 'SINGLE KEYWORD - no bandMedian on file',
      keywordCount: 0,
    };
  }
  if (typeof raw !== 'object' || Array.isArray(raw)) {
    return {error: `${handle}: bandMedian must be an object. Rule 25 needs the keywords and their medians, not a bare number.`};
  }

  const kws = Array.isArray(raw.keywords) ? raw.keywords : null;
  if (!kws) {
    return {error: `${handle}: bandMedian.keywords must be an array.`};
  }
  if (kws.length < MIN_BAND_KEYWORDS) {
    return {error: `${handle}: bandMedian carries ${kws.length} keyword(s), needs ${MIN_BAND_KEYWORDS}. One search term is a slice, not a band.`};
  }
  const kwMedians = kws.map((k) => Number(k && k[`median${cur}`]));
  if (kwMedians.some((n) => !(n > 0))) {
    return {error: `${handle}: every bandMedian.keywords entry needs a positive median${cur}.`};
  }

  const readings = Array.isArray(raw.readings) ? raw.readings : null;
  if (!readings || readings.length < 2) {
    return {error: `${handle}: bandMedian.readings needs at least 2 dated measurements - rule 23 is the LOWER of two different readings, which one reading cannot establish.`};
  }
  const readingMedians = readings.map((r) => Number(r && r[`median${cur}`]));
  if (readingMedians.some((n) => !(n > 0))) {
    return {error: `${handle}: every bandMedian.readings entry needs a positive median${cur}.`};
  }

  const declared = Number(raw[`median${cur}`]);
  if (!(declared > 0)) {
    return {error: `${handle}: bandMedian.median${cur} must be a positive number.`};
  }
  const lowest = Math.min(...readingMedians);
  if (Math.abs(declared - lowest) > 0.005) {
    return {error: `${handle}: bandMedian.median${cur} is ${sym}${declared.toFixed(2)} but the lowest recorded reading is ${sym}${lowest.toFixed(2)}. RULE 23 takes the LOWER - do not adopt the day the basket read high.`};
  }

  return {
    medianUsd: declared,
    how: `basket of ${kws.length} keywords, lowest of ${readings.length} readings`,
    keywordCount: kws.length,
  };
}

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
    const priceKey = String(ev.market || '').toUpperCase() === 'CA' ? 'priceCad' : 'priceUsd';
    const prices = (ev.competitors || []).map((c) => Number(c[priceKey])).filter((n) => n > 0);
    if (prices.length < MIN_COMPETITORS) {
      failures.push(`${handle}: only ${prices.length} competitor prices (need ${MIN_COMPETITORS}). One or two listings is an anecdote.`);
      continue;
    }
    // RULE 27, added 2026-09-13 with the switch to the Canadian market.
    //
    // `market` decides BOTH the currency and the duty basis, and it is read
    // rather than defaulted. The note under RULE 1 below used to say this gate
    // "is the Amazon US undercut test" and that the market was therefore US.
    // That stopped being true the day the catalogue moved, and the failure
    // mode was the worst kind: the gate went on PASSING while scoring US
    // retail against an amazon.com band for a store selling to Canadians. A
    // green gate measuring the wrong country is more dangerous than a red one.
    //
    // The currency is not a formatting detail here. contribution() applies
    // CA$50 / CA$5 thresholds on the CA branch and a converted US$4.99 flat on
    // the US branch, so feeding CAD numbers to a US market - or the reverse -
    // silently misprices every row. Requiring the market-matched field names
    // means an evidence file cannot be repointed at another country by editing
    // one string.
    const market = String(ev.market || '').toUpperCase();
    if (market !== 'CA' && market !== 'US') {
      failures.push(`${handle}: evidence has no usable \`market\` (got ${JSON.stringify(ev.market)}). It decides currency and duty basis and must not be defaulted.`);
      continue;
    }
    const cur = market === 'CA' ? 'Cad' : 'Usd';
    const sym = market === 'CA' ? 'CA$' : '$';
    const floor = market === 'CA' ? MIN_CONTRIBUTION_CAD : MIN_CONTRIBUTION_USD;
    const retail = Number(ev[`ourRetail${cur}`]);
    const itemCost = Number(ev[`itemCost${cur}`]);
    const supplierShip = Number(ev[`supplierShip${cur}`]);
    const dutyRate = Number(ev.dutyRate);

    if (!(retail > 0) || !(itemCost > 0) || !Number.isFinite(supplierShip)) {
      failures.push(`${handle}: needs ourRetail${cur}, itemCost${cur} and supplierShip${cur} for market ${market}. Landed cost alone cannot be split across duty bases.`);
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
    // $4.99, and $0 on an $85 offer that also collects $4.99.
    //
    // THE DUTY BASIS IS ALSO PER MARKET, and it is the deeper difference.
    // US_DUTY_INCIDENCE only ever described the US postal route - whether a
    // 41.4%-of-RETAIL charge is already inside the supplier price or lands on
    // top. Canada has no such question: CBSA assesses 7% MFN on VALUE FOR
    // DUTY, which is the supplier price, so the basis is 'wholesale' and the
    // incidence constant must not reach this calculation at all. Letting it
    // would import the single largest unknown in the US model into a market
    // that does not have it.
    const marketBasis = market === 'CA' ? 'wholesale' : basis;
    const perUnit = contribution({
      retail, itemCost, supplierShip, dutyRate,
      basis: marketBasis, carrier: CHOICE_LINE_DISBURSEMENT, market,
    });
    if (perUnit < floor) {
      failures.push(
        `${handle}: RULE 1 - contributes ${sym}${perUnit.toFixed(2)}/unit at ${sym}${retail.toFixed(2)} under the '${marketBasis}' duty basis (floor ${sym}${floor.toFixed(2)}).`,
      );
    } else {
      notes.push(`${handle}: contributes ${sym}${perUnit.toFixed(2)}/unit at ${sym}${retail.toFixed(2)} ('${marketBasis}' basis, ${market}).`);
    }

    // RULE 2, banded by RULE 25
    const band = resolveBand(handle, ev, prices, cur);
    if (band.error) {
      failures.push(band.error);
    } else {
      const mid = band.medianUsd;
      const ceiling = mid * BAND_TOLERANCE;
      if (retail > ceiling) {
        failures.push(
          `${handle}: RULE 2 - retail ${sym}${retail.toFixed(2)} is over the band (median ${sym}${mid.toFixed(2)}, ceiling ${sym}${ceiling.toFixed(2)}, ${band.how}).`,
        );
      } else {
        notes.push(
          `${handle}: RULE 2 - retail ${sym}${retail.toFixed(2)} is inside the band (median ${sym}${mid.toFixed(2)}, ceiling ${sym}${ceiling.toFixed(2)}, ${band.how}).`,
        );
      }
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
  // 2026-09-13: this whole section is a US question and it must say so when
  // no US offer is in scope. US_DUTY_INCIDENCE asks whether a 41.4%-of-retail
  // charge is inside the supplier price or lands on top; CBSA assesses 7% on
  // the supplier price and there is no second answer to be exposed to. Printing
  // "3 immune, 0 exposed" over a Canadian cohort is not wrong so much as
  // meaningless, and a meaningless green line is how a real exposure gets
  // missed later - it trains the reader to skip it.
  const usOffers = offers.filter((o) => (o.markets || []).includes('US'));
  if (!usOffers.length) {
    console.log('');
    console.log(
      'incidence exposure: NOT APPLICABLE - no approved offer sells into the US.',
    );
    console.log(
      '  US_DUTY_INCIDENCE asks whether the US duty is inside the supplier ' +
        'price or billed on top. Canada charges 7% MFN on value for duty, so ' +
        'there is no second basis for an offer to be exposed to.',
    );
    return {immune: [], exposed: []};
  }
  const {immune, exposed} = incidenceExposure(usOffers);
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
  const anyUs = APPROVED_CATALOG_OFFERS.some((o) => (o.markets || []).includes('US'));
  console.log(
    anyUs
      ? `duty incidence: ${US_DUTY_INCIDENCE} -> binding basis '${bindingBasis()}'`
      : "duty incidence: not consulted - no approved offer sells into the US. " +
        "Canadian offers score on the 'wholesale' basis (7% MFN on value for duty).",
  );
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
