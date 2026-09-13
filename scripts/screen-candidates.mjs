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
 * ACQUISITION BENCHMARKS. Corrected twice on 2026-09-08 - read why.
 *
 * FIRST correction: this advisory imported CPA_MODEL from ./lib/sourcing-spec.mjs,
 * a CA$28 floor or 40% of order value with no campaign behind it.
 *
 * SECOND correction, same day: the numbers that replaced it were worse. Three
 * of the four came from a table (MHI, claiming 1,247 accounts and $87M spend)
 * that is DERIVED ARITHMETIC, not measurement - every CPA in it reproduces to
 * the cent from its own CPC divided by CVR columns, Home & Garden and Jewelry
 * land within $0.12 of each other across all three quantiles with the
 * top-decile ordering inverted, and the site is agency lead-gen SEO. Those
 * figures are gone. Do not reinstate them.
 *
 * The remaining source is Triple Whale, 40,000+ brands, Aug 2025-Jul 2026,
 * which publishes per-industry medians and no Gifts, Jewelry or Personalized
 * category at all:
 *
 *   Overall (17 industries)   $38.99 CPA, 1.53% CVR, AOV $73.36
 *   Home & Garden             $47.93 CPA, 1.24% CVR, AOV $110.41
 *   Toys, Art & Collectibles  $34.85 CPA, 1.53% CVR, AOV $69.61
 *   Lifestyle & Boutique      $31.16 CPA, 1.62% CVR, AOV $64.87
 *
 * `average` below is the ALL-INDUSTRY median, which is the honest default for
 * a store whose category nobody publishes. Home & Garden is kept only as the
 * pessimistic bound and is the WRONG proxy for a low-ticket impulse gift: it
 * carries the lowest CVR of all seventeen industries precisely because it is
 * considered, high-ticket furniture.
 *
 * TWO CAVEATS THAT MATTER MORE THAN THE NUMBERS.
 *
 * These are spend divided by ALL orders, not cost per NEW customer - the
 * identity ROAS = AOV / CPA holds exactly at the overall level, which proves
 * it. True new-customer CAC runs roughly 1.5-2.5x these figures. A candidate
 * that clears `average` has not necessarily paid for a new buyer.
 *
 * And CPA is measured per ORDER, not per unit. Every operator studied in this
 * category engineers a multi-unit cart rather than a higher unit price - see
 * AOV_THRESHOLD_MULTIPLE below. Comparing a single unit's contribution against
 * a per-order CPA understates the business by roughly 3x, and that mistake is
 * the whole reason this file previously reported nothing could ever clear.
 *
 * Still ADVISORY. The verdict stays identical to CI; a test asserts the gate
 * cannot see any of this. The $12 floor in check-undercut.mjs is unchanged: it
 * answers whether a UNIT makes money, which is a different question.
 */
export const CPA_BENCHMARKS_USD = Object.freeze({
  lifestyleBoutique: 31.16,
  toysArtCollectibles: 34.85,
  average: 38.99,
  homeAndGarden: 47.93,
});

/**
 * Observed offer architecture in this category, 2026-09-08. Ten stores running
 * continuous Meta ads were torn down; every one that publishes a free-shipping
 * threshold sets it at roughly THREE units of its own modal price:
 *
 *   febworld        $59.00 threshold / $21.96 modal = 2.7 units
 *   trendingcustom  $70.00 / $24.99 = 2.8
 *   barods          $69.99 / $21.99 = 3.2
 *   happary         $79.00 / $21.99 = 3.6
 *
 * Nobody sets a $79 threshold on a $21.99 product by accident. It is
 * calibrated so the shipping concession only pays out on a three-item cart,
 * which is what turns a $22 ticket into a $66-70 order and makes a $31-39 CPA
 * survivable. Size ladders do more work than the multi-buy codes: barods runs
 * $21.99 / $25.29 / $29.69 by size, +35% on one click, against a 10% code.
 *
 * DO NOT APPLY THIS BLINDLY. It is a property of MULTI-UNIT-NATURAL goods -
 * one ornament per grandchild, one keychain per teammate. Nobody buys three
 * coffee grinders. The report prints the cart line as CONDITIONAL for exactly
 * this reason: tripling a single-purchase durable is the same class of error
 * as comparing a per-order CPA to a single unit, just pointing the other way.
 * The condition is a judgement about the product and this file cannot make it.
 */
export const AOV_THRESHOLD_MULTIPLE = 3;



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
    // `market` decides the currency and the duty basis downstream (RULE 27).
    // It defaults to CA because that is the market the store sells into as of
    // 2026-09-13 - a screener that silently scores candidates for a market we
    // do not sell in is worse than one that refuses, because it produces
    // confident numbers nobody can act on. Put `market` in the CSV to override.
    market: String(row.market || 'CA').toUpperCase(),
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
    market: ev.market || 'CA',
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
      cartContribution: null,
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
    // CPA is per ORDER. Comparing it to one unit's contribution understates
    // the business by the cart multiple every operator in this category
    // engineers deliberately. Both figures are reported; the tier check uses
    // the cart, because that is what an order actually is.
    row.cartContribution = row.contribution * AOV_THRESHOLD_MULTIPLE;
    row.profitAfterCpa = row.cartContribution - row.cpaUsd;
    row.clearsCpa = Object.fromEntries(
      Object.entries(CPA_BENCHMARKS_USD).map(([k, v]) => [k, row.cartContribution >= v]),
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
  lines.push(`  $${CPA_BENCHMARKS_USD.lifestyleBoutique.toFixed(2)} lifestyle · $${CPA_BENCHMARKS_USD.toysArtCollectibles.toFixed(2)} toys/art · $${CPA_BENCHMARKS_USD.average.toFixed(2)} all-industry · $${CPA_BENCHMARKS_USD.homeAndGarden.toFixed(2)} home & garden`);
  lines.push(`  compared against a ${AOV_THRESHOLD_MULTIPLE}-unit cart, since CPA is per order; true new-customer CAC runs 1.5-2.5x these.\n`);

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
        `    advisory: ${money(r.contribution)}/unit clears no benchmark alone` +
          (tiers.length === 0
            ? `; even a ${AOV_THRESHOLD_MULTIPLE}-unit cart (${money(r.cartContribution)}) clears none.`
            : `. IF this is a multi-unit-natural gift, a ${AOV_THRESHOLD_MULTIPLE}-unit cart is ${money(r.cartContribution)} and clears ${tiers.join(', ')}, leaving ${money(r.profitAfterCpa)} against the all-industry benchmark. If nobody buys three, ignore this line.`),
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
