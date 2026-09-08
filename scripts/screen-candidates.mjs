#!/usr/bin/env node
/**
 * Batch screener: run many candidate products through the SAME undercut gate
 * that CI runs, and say why each one dies.
 *
 * WHY THIS EXISTS. Eight products were sourced, costed and margin-modelled one
 * at a time, and each took days to reach a verdict the market could have given
 * in ten minutes. scripts/check-undercut.mjs fixed the ORDER of that work. It
 * did not fix the THROUGHPUT: it reads evidence files for handles already
 * approved into the catalogue, which means a product has to be half committed
 * to before the gate will look at it. This screens a list before anything is
 * committed to at all.
 *
 * WHAT IT DOES NOT DO. It does not re-implement the economics. The pass/fail
 * verdict comes from auditUndercut() itself, called with an in-memory loader
 * over the CSV rows, so a candidate this screener passes is a candidate CI
 * passes. If the two ever disagree it is a bug in this file, and there is a
 * test asserting they agree.
 *
 * WHAT IT ADDS. Three things the gate has no reason to compute:
 *
 *   HEADROOM. Not whether a unit clears the floor but by how much. The coffee
 *   grinder cleared by $0.31 under the DDP scenario, which is not a margin, it
 *   is a rounding error with a supplier attached. Rank by headroom and that
 *   distinction is the first thing you see.
 *
 *   BREAKEVENS. For a failing candidate, the supplier cost that would clear
 *   the floor at the recorded retail, and the retail that would clear it at
 *   the recorded cost. This turns "no" into "no, unless you can buy it for
 *   $6.10" - which is a question you can actually take to a supplier.
 *
 *   THE SCISSOR, NUMERICALLY. Contribution is evaluated at the TOP of the
 *   market band. If a unit cannot clear the floor even priced at the band
 *   ceiling, no legal price exists and the product is dead at any price, not
 *   merely at the price that was tried. That verdict is the one worth having
 *   early, and it is the shape every one of the eight failures actually had.
 *
 * BREAKEVEN MATHS. contribution() is linear in both retail and itemCost, so
 * two evaluations give the exact slope and one division gives the crossing.
 * The slope is measured from the model rather than derived from its
 * coefficients, so this file never has to know what the payment rate or the
 * returns reserve are - only that they exist. Linearity is VERIFIED with a
 * third point on every solve; if the model stops being linear this refuses to
 * print a breakeven instead of printing a wrong one.
 *
 * INPUT. A CSV, one row per candidate:
 *
 *   handle,ourRetailUsd,itemCostUsd,supplierShipUsd,dutyRate,competitorPricesUsd,competitorReviews,checkedOn
 *   my-product,49.99,9.29,18.35,0.167,19.99;24.99;29.99;34.99;39.99,120;340;88;12;900,2026-09-08
 *
 * competitorPricesUsd is semicolon-separated. competitorReviews is optional
 * and positional against it. checkedOn defaults to today. A .json file
 * containing an array of evidence-shaped objects is also accepted, which is
 * what docs/undercut-evidence/ already holds.
 *
 * USAGE
 *   node scripts/screen-candidates.mjs candidates.csv
 *   node scripts/screen-candidates.mjs candidates.csv --json
 *   node scripts/screen-candidates.mjs candidates.csv --basis retail
 */
import {readFileSync} from 'node:fs';
import {
  auditUndercut,
  bindingBasis,
  median,
  MIN_CONTRIBUTION_USD,
  BAND_TOLERANCE,
} from './check-undercut.mjs';
import {contribution, CHOICE_LINE_DISBURSEMENT} from './us-duty-impact.mjs';
/**
 * ACQUISITION BENCHMARKS, corrected 2026-09-08.
 *
 * This advisory previously imported CPA_MODEL from ./lib/sourcing-spec.mjs -
 * a CA$28 floor or 40% of order value, with no campaign behind it. Measured
 * category data says that figure is roughly what the BEST DECILE of advertisers
 * achieves, not a norm, so every earlier reading of this gate was generous by
 * two to three times.
 *
 * Meta, US, Home & Garden:
 *   $47.93 CPA, 1.24% conversion (down 3.57% YoY) while CPA rose 6.71%,
 *          category AOV $110.41 - Triple Whale, 40,000+ brands, Aug 25-Jul 26
 *   $37.20 average / $26.84 top quartile / $20.37 top decile
 *          - MHI, 1,247 accounts, $87M spend
 *
 * These are CATEGORY benchmarks from third-party studies, not this store's
 * measured CPA, and they stay ADVISORY for the same reason as before: the
 * pass/fail verdict must remain identical to what CI enforces. A test asserts
 * the gate cannot see them.
 *
 * The $12 contribution floor in check-undercut.mjs is deliberately unchanged.
 * It answers whether a unit makes money, which is a different question from
 * whether it can also buy the buyer.
 */
export const CPA_BENCHMARKS_USD = Object.freeze({
  topDecile: 20.37,
  topQuartile: 26.84,
  average: 37.20,
  homeAndGarden: 47.93,
});



/** Tolerance for the linearity check, in dollars. */
const LINEARITY_EPSILON = 1e-6;

/**
 * Minimal CSV reader. Handles quoted fields and embedded commas, which is as
 * much as a hand-maintained candidate list needs. It deliberately does not
 * handle embedded newlines: a row that spans lines is far more likely to be a
 * broken export than an intentional one, and silently stitching it together
 * would hide that.
 */
export function parseCsv(text) {
  const rows = [];
  for (const rawLine of String(text).split(/\r?\n/)) {
    if (!rawLine.trim()) continue;
    const cells = [];
    let cell = '';
    let quoted = false;
    for (let i = 0; i < rawLine.length; i += 1) {
      const ch = rawLine[i];
      if (quoted) {
        if (ch === '"' && rawLine[i + 1] === '"') { cell += '"'; i += 1; }
        else if (ch === '"') quoted = false;
        else cell += ch;
      } else if (ch === '"') quoted = true;
      else if (ch === ',') { cells.push(cell); cell = ''; }
      else cell += ch;
    }
    cells.push(cell);
    rows.push(cells.map((c) => c.trim()));
  }
  if (rows.length === 0) return [];
  const header = rows[0];
  return rows.slice(1).map((cells) => {
    const row = {};
    header.forEach((key, i) => { row[key] = cells[i] ?? ''; });
    return row;
  });
}

const splitList = (value) =>
  String(value || '')
    .split(';')
    .map((s) => s.trim())
    .filter(Boolean);

/** Turn a CSV row into the evidence shape auditUndercut already understands. */
export function rowToEvidence(row, today = new Date()) {
  const prices = splitList(row.competitorPricesUsd).map(Number);
  const reviews = splitList(row.competitorReviews).map(Number);
  return {
    handle: row.handle,
    checkedOn: row.checkedOn || today.toISOString().slice(0, 10),
    ourRetailUsd: Number(row.ourRetailUsd),
    itemCostUsd: Number(row.itemCostUsd),
    supplierShipUsd: Number(row.supplierShipUsd),
    // An absent duty rate must stay absent. Coercing '' to 0 would hand a
    // candidate a free pass on the exact field that went unsourced for weeks.
    dutyRate: row.dutyRate === '' || row.dutyRate == null ? undefined : Number(row.dutyRate),
    competitors: prices.map((priceUsd, i) => ({
      priceUsd,
      reviews: Number.isFinite(reviews[i]) ? reviews[i] : 0,
    })),
    note: row.note || '',
    supplier: row.supplier || '',
  };
}

const evaluate = (ev, basis, overrides = {}) =>
  contribution({
    retail: overrides.retail ?? ev.ourRetailUsd,
    itemCost: overrides.itemCost ?? ev.itemCostUsd,
    supplierShip: ev.supplierShipUsd,
    dutyRate: ev.dutyRate,
    basis,
    carrier: CHOICE_LINE_DISBURSEMENT,
    market: 'US',
  });

/**
 * Solve f(x) = target for a variable contribution() is linear in, measuring
 * the slope from the model itself. Returns null rather than a number whenever
 * the answer would be untrustworthy: a flat or wrong-signed slope, or a model
 * that is no longer linear.
 */
export function solveLinear(f, x0, target) {
  const a = f(x0);
  const b = f(x0 + 1);
  const c = f(x0 + 2);
  const slope = b - a;
  const secondDifference = c - 2 * b + a;
  if (Math.abs(secondDifference) > LINEARITY_EPSILON) return null;
  if (Math.abs(slope) < LINEARITY_EPSILON) return null;
  return x0 + (target - a) / slope;
}

export function screen(rows, {now = new Date(), basis = bindingBasis()} = {}) {
  const evidence = rows.map((row) => rowToEvidence(row, now));
  const byHandle = new Map(evidence.map((ev) => [ev.handle, ev]));
  const handles = [...byHandle.keys()];

  // The verdict comes from the gate, not from here.
  const results = handles.map((handle) => {
    const {failures, notes} = auditUndercut([handle], (h) => byHandle.get(h), now, {basis});
    const ev = byHandle.get(handle);
    const row = {
      handle,
      supplier: ev.supplier,
      note: ev.note,
      retail: ev.ourRetailUsd,
      itemCost: ev.itemCostUsd,
      passed: failures.length === 0,
      failures,
      notes,
      contribution: null,
      headroom: null,
      bandCeiling: null,
      contributionAtCeiling: null,
      cpaUsd: null,
      profitAfterCpa: null,
      clearsCpa: null,
      maxItemCost: null,
      maxItemCostAtCeiling: null,
      minRetail: null,
      deadAtAnyPrice: null,
    };

    const prices = (ev.competitors || []).map((c) => Number(c.priceUsd)).filter((n) => n > 0);
    const usable =
      ev.ourRetailUsd > 0 && ev.itemCostUsd > 0 &&
      Number.isFinite(ev.supplierShipUsd) && Number.isFinite(ev.dutyRate);
    if (!usable || prices.length === 0) return row;

    row.contribution = evaluate(ev, basis);
    row.headroom = row.contribution - MIN_CONTRIBUTION_USD;
    row.bandCeiling = median(prices) * BAND_TOLERANCE;

    // Dead at any price: the best a unit can do inside the band still misses.
    // Advisory only - never feeds row.passed.
    row.cpaUsd = CPA_BENCHMARKS_USD.average;
    row.profitAfterCpa = row.contribution - row.cpaUsd;
    row.clearsCpa = Object.fromEntries(
      Object.entries(CPA_BENCHMARKS_USD).map(([k, v]) => [k, row.contribution >= v]),
    );

    row.contributionAtCeiling = evaluate(ev, basis, {retail: row.bandCeiling});
    row.deadAtAnyPrice = row.contributionAtCeiling < MIN_CONTRIBUTION_USD;

    row.maxItemCost = solveLinear(
      (itemCost) => evaluate(ev, basis, {itemCost}),
      ev.itemCostUsd,
      MIN_CONTRIBUTION_USD,
    );
    // Solved at the BAND CEILING, not at the recorded retail. When a product
    // is dead at any legal price the recorded retail is by definition not a
    // legal price, so a cost target computed there answers a question nobody
    // asked. The watch roll made this concrete: $32.41 at its $49.00 ask,
    // versus $20.33 at the $35.03 the market actually supports.
    row.maxItemCostAtCeiling = solveLinear(
      (itemCost) => evaluate(ev, basis, {itemCost, retail: row.bandCeiling}),
      ev.itemCostUsd,
      MIN_CONTRIBUTION_USD,
    );
    row.minRetail = solveLinear(
      (retail) => evaluate(ev, basis, {retail}),
      ev.ourRetailUsd,
      MIN_CONTRIBUTION_USD,
    );
    return row;
  });

  results.sort((a, b) => {
    if (a.headroom == null && b.headroom == null) return a.handle.localeCompare(b.handle);
    if (a.headroom == null) return 1;
    if (b.headroom == null) return -1;
    return b.headroom - a.headroom;
  });
  return {basis, results};
}

const money = (n) => (n == null || !Number.isFinite(n) ? '   —  ' : `$${n.toFixed(2)}`);

export function formatReport({basis, results}) {
  const lines = [];
  lines.push('Puchica candidate screen');
  lines.push('========================');
  lines.push(`binding duty basis: '${basis}'   contribution floor: $${MIN_CONTRIBUTION_USD.toFixed(2)}`);
  lines.push(`${results.length} candidate(s)`);
  lines.push(`acquisition lines are ADVISORY - measured CATEGORY benchmarks, not this store's CPA:`);
  lines.push(`  $${CPA_BENCHMARKS_USD.topDecile.toFixed(2)} top decile · $${CPA_BENCHMARKS_USD.topQuartile.toFixed(2)} top quartile · $${CPA_BENCHMARKS_USD.average.toFixed(2)} average · $${CPA_BENCHMARKS_USD.homeAndGarden.toFixed(2)} Home & Garden\n`);

  const pass = results.filter((r) => r.passed);
  const fail = results.filter((r) => !r.passed);

  lines.push(`CLEARS THE GATE (${pass.length})`);
  if (pass.length === 0) lines.push('  none');
  for (const r of pass) {
    const thin = r.headroom != null && r.headroom < 3 ? '   <- thin' : '';
    lines.push(`  ${r.handle}`);
    lines.push(`    contributes ${money(r.contribution)}/unit at ${money(r.retail)}, headroom ${money(r.headroom)}${thin}`);
    if (r.maxItemCost != null) {
      lines.push(`    dies if supplier cost passes ${money(r.maxItemCost)} (now ${money(r.itemCost)})`);
    }
    if (r.profitAfterCpa != null) {
      const tiers = Object.entries(r.clearsCpa).filter(([, ok]) => ok).map(([k]) => k);
      lines.push(
        tiers.length === 0
          ? `    advisory: clears NO acquisition benchmark - ${money(r.contribution)} against ${money(CPA_BENCHMARKS_USD.topDecile)} at the very best`
          : `    advisory: clears ${tiers.join(', ')} (${money(r.contribution)}/order); average benchmark leaves ${money(r.profitAfterCpa)}`,
      );
    }
  }

  lines.push(`\nBLOCKED (${fail.length})`);
  if (fail.length === 0) lines.push('  none');
  for (const r of fail) {
    lines.push(`  ${r.handle}`);
    for (const f of r.failures) lines.push(`    ${f.replace(`${r.handle}: `, '')}`);
    if (r.contribution != null) {
      lines.push(`    contributes ${money(r.contribution)}/unit at the asked ${money(r.retail)}, headroom ${money(r.headroom)}`);
    }
    if (r.deadAtAnyPrice) {
      lines.push(`    DEAD AT ANY PRICE: at the band ceiling ${money(r.bandCeiling)} it contributes ${money(r.contributionAtCeiling)}, under the ${money(MIN_CONTRIBUTION_USD)} floor.`);
      lines.push(`    Only a cheaper supplier changes this - under ${money(r.maxItemCostAtCeiling)} item cost, against ${money(r.itemCost)} today.`);
    } else if (r.minRetail != null && r.bandCeiling != null && r.minRetail <= r.bandCeiling) {
      lines.push(`    Clears at ${money(r.minRetail)} retail, which is inside the band (ceiling ${money(r.bandCeiling)}).`);
    }
  }
  return lines.join('\n');
}

export function loadCandidates(file, text) {
  if (file.endsWith('.json')) {
    const parsed = JSON.parse(text);
    const list = Array.isArray(parsed) ? parsed : [parsed];
    return list.map((ev) => ({
      handle: ev.handle,
      ourRetailUsd: ev.ourRetailUsd,
      itemCostUsd: ev.itemCostUsd,
      supplierShipUsd: ev.supplierShipUsd,
      dutyRate: ev.dutyRate === undefined ? '' : ev.dutyRate,
      competitorPricesUsd: (ev.competitors || []).map((c) => c.priceUsd).join(';'),
      competitorReviews: (ev.competitors || []).map((c) => c.reviews ?? 0).join(';'),
      checkedOn: ev.checkedOn,
      supplier: ev.supplier || '',
      note: ev.note || '',
    }));
  }
  return parseCsv(text);
}

if (process.argv[1] && process.argv[1].endsWith('screen-candidates.mjs')) {
  const args = process.argv.slice(2);
  const file = args.find((a) => !a.startsWith('--'));
  if (!file) {
    console.error('usage: node scripts/screen-candidates.mjs <candidates.csv|.json> [--json] [--basis prepaid|wholesale|retail]');
    process.exit(2);
  }
  const basisFlag = args.indexOf('--basis');
  const basis = basisFlag === -1 ? bindingBasis() : args[basisFlag + 1];
  const report = screen(loadCandidates(file, readFileSync(file, 'utf8')), {basis});
  if (args.includes('--json')) console.log(JSON.stringify(report, null, 2));
  else console.log(formatReport(report));
}
