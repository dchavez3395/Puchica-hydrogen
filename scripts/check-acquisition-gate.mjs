#!/usr/bin/env node
/**
 * The gate that was missing: can an offer pay for its own customer?
 *
 * Every existing catalog gate asks whether a product is truthful, mapped,
 * costed and routed. None of them asks whether the contribution it produces
 * can cover the cost of acquiring the buyer. An offer can carry every evidence
 * tag in launch-catalog.js, pass the storefront release gate, deploy cleanly,
 * and still lose money on every ad-driven sale.
 *
 * That is not a hypothetical. On 2026-08-24 the live Canadian catalog produced
 * a mean contribution of CA$17.92 against a benchmark Meta CPA of CA$42.
 *
 * This gate is deliberately advisory while paid acquisition is off, and
 * blocking the moment it is switched on. Run it with --paid (or set
 * PUCHICA_PAID_ACQUISITION=1) to make an unfundable offer fail the build.
 *
 * Usage:
 *   node scripts/check-acquisition-gate.mjs          # report, never fails
 *   node scripts/check-acquisition-gate.mjs --paid   # fails on any FAIL row
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_CATALOG_OFFERS,
  isMarketSuspended,
} from '../app/lib/launch-catalog.js';
import {
  CA_MODELLED_DUTY_RATES,
  checkPriceDrift,
  collectedCheckoutShipping,
  computeCanadianOffer,
  evaluateAcquisition,
} from './lib/acquisition-economics.mjs';
import {resolveBaselinePath} from './check-organic-economics.mjs';

const scriptPath = fileURLToPath(import.meta.url);
const rootDir = path.resolve(path.dirname(scriptPath), '..');
const MAX_BENCHMARK_AGE_DAYS = 90;

/**
 * Live Canadian retail, read from the Shopify Admin API on 2026-08-25 (post-audit reprice: cubes 32.99, kit restored to 89.00).
 *
 * Hardcoded rather than fetched so the gate runs in CI without Storefront
 * credentials. checkPriceDrift below is what catches this going stale against
 * a documented price; check-organic-economics.mjs is the live-price check.
 */
const CA_RETAIL = {
  '3-piece-packing-cube-set': 32.99,
  'white-semi-circular-travel-jewelry-case': 22.99,
  'black-hanging-travel-toiletry-organizer': 27.99,
  'travel-cable-organizer-case': 19.99,
  'black-travel-tech-case': 34.99,
  'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case': 89.0,
  // The first offer priced above the CA$70 CPA crossover, and so the first
  // that paid acquisition can fund rather than subsidise.
  'compression-packing-cube-set-5-piece': 139.0,
};

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const paidMode =
    process.argv.includes('--paid') ||
    process.env.PUCHICA_PAID_ACQUISITION === '1';
  const result = runAcquisitionGate({paidMode});
  printResult(result);
  process.exitCode = result.blocking.length ? 1 : 0;
}

export function runAcquisitionGate({
  paidMode = false,
  now = new Date(),
  retail = CA_RETAIL,
} = {}) {
  // Resolve the newest baseline rather than naming one. This was pinned to the
  // 2026-08-21 file, so the gate kept costing offers against that evidence
  // after the 08-25 and 08-27 baselines were added beside it - precisely what
  // resolveBaselinePath exists to prevent. It throws on a missing or
  // unparseable file rather than defaulting to something permissive.
  const baseline = JSON.parse(fs.readFileSync(resolveBaselinePath(), 'utf8'));
  const benchmark = readJson(
    'docs',
    'recovery-evidence',
    'acquisition-benchmark-2026-08-24.json',
  );

  const failures = auditBenchmark(benchmark, now);
  const rows = [];
  const driftWarnings = [];

  for (const approved of APPROVED_CATALOG_OFFERS) {
    if (!approved.markets.includes('CA') || isMarketSuspended('CA')) continue;

    const evidence = baseline.offers.find(
      ({handle, sku}) => handle === approved.handle && sku === approved.sku,
    );
    const retailCad = retail[approved.handle];

    if (!evidence?.routes?.CA) {
      failures.push(`Missing Canadian cost evidence for ${approved.handle}.`);
      continue;
    }
    if (!(retailCad > 0)) {
      failures.push(`Missing Canadian retail price for ${approved.handle}.`);
      continue;
    }

    const documented = benchmark.documentedBundlePrices?.[approved.handle];
    if (documented != null) {
      const drift = checkPriceDrift({
        handle: approved.handle,
        livePriceCad: retailCad,
        documentedPriceCad: documented,
      });
      if (drift.drifted) driftWarnings.push(drift);
    }

    const economics = computeCanadianOffer({
      handle: approved.handle,
      sku: approved.sku,
      retailCad,
      itemCostUsd: evidence.itemCostUsd,
      shippingUsd: evidence.routes.CA.shippingUsd,
      fxCadPerUsd: baseline.planningFxCadPerUsd,
      checkoutShippingCad: collectedCheckoutShipping({
        retailCad,
        singleItemShippingCad: baseline.singleItemCheckoutShipping.CA,
      }),
      paymentPercentRate: baseline.paymentPercentRate,
      paymentFixedFee: baseline.paymentFixedFee,
      exceptionReserveRate: baseline.exceptionReserveRate,
      dutyRate:
        CA_MODELLED_DUTY_RATES[benchmark.dutyCategory?.[approved.handle]] ??
        CA_MODELLED_DUTY_RATES.textileTravelGoods,
      declaredValueBasis: benchmark.declaredValueBasis,
      assessmentProbability: benchmark.assessmentProbability,
    });

    const acquisition = evaluateAcquisition({
      contribution: economics.contribution,
      targetCpaCad: benchmark.targetCpaCad,
      requiredProfitShare: benchmark.requiredProfitShare,
    });

    rows.push({...economics, ...acquisition, bundle: Boolean(approved.bundle)});
  }

  if (!rows.length) failures.push('No Canadian offer was evaluated.');

  const unfundable = rows.filter((row) => row.verdict === 'FAIL');
  // Advisory until paid acquisition is switched on. Evidence problems block
  // either way - a gate that cannot read its own inputs is broken, not lenient.
  const blocking = paidMode
    ? [
        ...failures,
        ...unfundable.map(
          (row) =>
            `${row.handle} cannot fund acquisition: contribution CA$${row.contribution.toFixed(2)} against a CA$${row.targetCpaCad.toFixed(2)} target CPA (short by CA$${row.requiredRetailUplift.toFixed(2)}).`,
        ),
      ]
    : failures;

  return {
    paidMode,
    benchmarkDate: benchmark.evidenceDate,
    targetCpaCad: benchmark.targetCpaCad,
    rows: rows.sort((a, b) => b.contribution - a.contribution),
    driftWarnings,
    failures,
    blocking,
  };
}

export function auditBenchmark(benchmark, now = new Date()) {
  const failures = [];
  const observed = new Date(`${benchmark?.evidenceDate}T23:59:59Z`);
  const ageDays = (now.getTime() - observed.getTime()) / 86400000;

  if (!Number.isFinite(ageDays) || ageDays > MAX_BENCHMARK_AGE_DAYS) {
    failures.push(
      `Acquisition benchmark is missing, invalid, or older than ${MAX_BENCHMARK_AGE_DAYS} days.`,
    );
  }
  if (!(Number(benchmark?.targetCpaCad) > 0)) {
    failures.push('Acquisition benchmark has no positive target CPA.');
  }
  const share = Number(benchmark?.requiredProfitShare);
  if (!(share >= 0 && share < 1)) {
    failures.push('requiredProfitShare must be between 0 and 1.');
  }
  const probability = Number(benchmark?.assessmentProbability);
  if (!(probability >= 0 && probability <= 1)) {
    failures.push('assessmentProbability must be between 0 and 1.');
  }
  if (!benchmark?.sources?.length) {
    failures.push('Acquisition benchmark cites no sources.');
  }
  return failures;
}

function readJson(...segments) {
  return JSON.parse(fs.readFileSync(path.join(rootDir, ...segments), 'utf8'));
}

function printResult(result) {
  console.log('Puchica acquisition gate — can an offer buy its own customer?');
  console.log('='.repeat(74));
  console.log(`Benchmark date : ${result.benchmarkDate}`);
  console.log(
    `Target CPA     : CA$${result.targetCpaCad.toFixed(2)} (benchmark, not measured)`,
  );
  console.log(
    `Mode           : ${result.paidMode ? 'PAID — unfundable offers fail the build' : 'advisory — paid acquisition is off'}`,
  );
  console.table(
    result.rows.map((row) => ({
      offer: row.handle.slice(0, 44),
      price: `CA$${row.retailCad.toFixed(2)}`,
      landed: row.landedCost.toFixed(2),
      contribution: row.contribution.toFixed(2),
      margin: `${(row.margin * 100).toFixed(1)}%`,
      'break-even CPA': row.breakEvenCpa.toFixed(2),
      'max viable CPA': row.maxViableCpa.toFixed(2),
      short: row.requiredRetailUplift ? row.requiredRetailUplift.toFixed(2) : '—',
      verdict: row.verdict,
    })),
  );

  for (const drift of result.driftWarnings) {
    console.warn(
      `WARN: ${drift.handle} is live at CA$${drift.livePriceCad.toFixed(2)} but documented at CA$${drift.documentedPriceCad.toFixed(2)} (drift CA$${drift.drift.toFixed(2)}).`,
    );
  }

  const worst = result.rows.reduce(
    (max, row) => Math.max(max, row.requiredRetailUplift),
    0,
  );
  // Count the funded offers before describing the gap. This line used to read
  // "No Canadian offer can fund ..." whenever ANY offer fell short, which was
  // true only while the whole catalog sat under the CPA crossover. The moment
  // one offer cleared it, the summary contradicted its own table.
  const funded = result.rows.filter(
    (row) => !(row.requiredRetailUplift > 0),
  ).length;
  if (worst > 0) {
    console.log(
      funded
        ? `\n${funded} of ${result.rows.length} Canadian offers fund a CA$${result.targetCpaCad.toFixed(2)} CPA. The largest remaining gap is CA$${worst.toFixed(2)}.`
        : `\nNo Canadian offer can fund a CA$${result.targetCpaCad.toFixed(2)} CPA. The largest gap is CA$${worst.toFixed(2)}.`,
    );
    console.log(
      'Closing it needs a higher AOV or a cheaper channel, not a better ad.',
    );
  }

  for (const failure of result.failures) console.error(`FAIL: ${failure}`);
  for (const blocker of result.blocking) {
    if (!result.failures.includes(blocker)) console.error(`BLOCK: ${blocker}`);
  }
  if (!result.paidMode && result.rows.some((row) => row.verdict === 'FAIL')) {
    console.log(
      '\nAdvisory only. Re-run with --paid before enabling ad spend; these rows will then fail the build.',
    );
  }
}
