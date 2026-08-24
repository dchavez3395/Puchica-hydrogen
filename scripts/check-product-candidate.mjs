#!/usr/bin/env node
/**
 * Can this product carry a store? Test a DSers candidate before importing it.
 *
 * Usage:
 *   npm run sourcing-spec
 *       Print the price band and cost ceiling to hunt for.
 *
 *   npm run sourcing-spec -- --retail 120 --cost 22 --ship 4
 *       Test one candidate: retail CA$120, supplier US$22 + US$4 shipping.
 *
 *   npm run sourcing-spec -- --retail 120 --cost 22 --no-prepay
 *       Same, but let the customer be billed duty at the door (not advised).
 */

import process from 'node:process';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import fs from 'node:fs';

import {
  CPA_MODEL,
  cpaFloorCrossover,
  DISQUALIFIERS,
  estimateCpa,
  evaluateCandidate,
  scoreCandidate,
  sourcingSpec,
} from './lib/sourcing-spec.mjs';

const scriptPath = fileURLToPath(import.meta.url);

function arg(flag, fallback = null) {
  const index = process.argv.indexOf(flag);
  if (index < 0) return fallback;
  const value = Number(process.argv[index + 1]);
  return Number.isFinite(value) ? value : fallback;
}

/** The current catalog, for contrast. Read from Shopify on 2026-08-24. */
const CURRENT = [
  ['Black Travel Tech Case', 34.99, 7.26, 2.17],
  ['White Jewelry Case', 22.99, 4.29, 1.99],
  ['Cable Organizer Case', 19.99, 4.05, 1.99],
  ['Charcoal Packing Cubes', 39.99, 12.45, 1.99],
];

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const retail = arg('--retail');
  const cost = arg('--cost');
  const prepay = !process.argv.includes('--no-prepay');

  console.log('Puchica product sourcing');
  console.log('='.repeat(76));
  console.log(
    `CPA model : max(CA$${CPA_MODEL.floorCad}, ${(CPA_MODEL.proportionOfAov * 100).toFixed(0)}% of order value)`,
  );
  console.log(
    `Crossover : CA$${cpaFloorCrossover().toFixed(2)} - below this the floor dominates and price cannot be rescued by margin`,
  );

  const csvIndex = process.argv.indexOf('--csv');
  if (csvIndex >= 0) {
    printBatch(process.argv[csvIndex + 1]);
  } else if (retail && cost) {
    const result = evaluateCandidate({
      name: 'candidate',
      retailCad: retail,
      supplierCostUsd: cost,
      supplierShippingUsd: arg('--ship', 0),
      prepayDuties: prepay,
    });
    printCandidate(result);
  } else {
    printSpec();
    printCurrentCatalog();
  }
}

function printSpec() {
  console.log('\nWhat to source');
  console.log('-'.repeat(76));
  console.table(
    sourcingSpec().map((row) => ({
      retail: `CA$${row.retailCad.toFixed(2)}`,
      'est. CPA': `CA$${row.estimatedCpa.toFixed(2)}`,
      'contribution needed': `CA$${row.requiredContribution.toFixed(2)}`,
      'max landed': `CA$${row.maxLandedCad.toFixed(2)}`,
      'max landed %': `${(row.maxLandedShare * 100).toFixed(0)}%`,
      'max supplier US$': `$${row.maxSupplierCostUsd.toFixed(2)}`,
    })),
  );
  console.log(
    'Rule of thumb: retail CA$90-150, supplier cost at or under about a third of retail,',
  );
  console.log(
    'duties prepaid by us. That is an ordinary dropshipping product - just not a cheap one.',
  );
}

function printCurrentCatalog() {
  console.log('\nWhy the current catalog cannot get there');
  console.log('-'.repeat(76));
  console.table(
    CURRENT.map(([name, retail, cost, ship]) => {
      const row = evaluateCandidate({
        name,
        retailCad: retail,
        supplierCostUsd: cost,
        supplierShippingUsd: ship,
      });
      return {
        product: name,
        retail: `CA$${row.retailCad.toFixed(2)}`,
        contribution: row.contribution.toFixed(2),
        margin: `${(row.margin * 100).toFixed(1)}%`,
        'est. CPA': `CA$${row.estimatedCpa.toFixed(2)}`,
        'floor-bound': row.cpaIsFloorBound ? 'yes' : 'no',
        'profit/order': row.profitPerOrder.toFixed(2),
        verdict: row.verdict,
      };
    }),
  );
  console.log(
    'Every one is floor-bound: priced below the crossover, so it pays the CA$28 minimum',
  );
  console.log(
    'CPA regardless of margin. The margins are fine. The prices are too low to survive them.',
  );
}

function printCandidate(row) {
  console.log('\nCandidate');
  console.log('-'.repeat(76));
  const lines = [
    ['Retail', `CA$${row.retailCad.toFixed(2)}`],
    ['Collected (incl. shipping)', `CA$${row.collected.toFixed(2)}`],
    [
      'Landed supplier cost',
      `CA$${row.landedCad.toFixed(2)}  (${(row.landedShareOfRetail * 100).toFixed(0)}% of retail)`,
    ],
    ['Payment fees', `CA$${row.payment.toFixed(2)}`],
    ['Exception reserve', `CA$${row.reserve.toFixed(2)}`],
    [
      'Duty + tax',
      row.dutiesAbsorbed > 0
        ? `CA$${row.dutiesAbsorbed.toFixed(2)}  (absorbed by us)`
        : row.importCharges.assessed
          ? `CA$${row.importCharges.total.toFixed(2)}  (NOT prepaid)`
          : 'none - under de minimis',
    ],
    ['Contribution', `CA$${row.contribution.toFixed(2)}`],
    ['Contribution margin', `${(row.margin * 100).toFixed(1)}%`],
    [
      'Estimated CPA',
      `CA$${row.estimatedCpa.toFixed(2)}${row.cpaIsFloorBound ? '  (floor-bound)' : ''}`,
    ],
    ['Contribution needed', `CA$${row.requiredContribution.toFixed(2)}`],
    ['Profit per order', `CA$${row.profitPerOrder.toFixed(2)}`],
  ];
  for (const [label, value] of lines) {
    console.log(`  ${label.padEnd(28)} ${value}`);
  }

  console.log(`\n  VERDICT: ${row.verdict}`);
  if (row.customerOwesAtDoor > 0) {
    console.log(
      `\n  WARNING: the customer would be billed CA$${row.customerOwesAtDoor.toFixed(2)} on delivery.`,
    );
    console.log(
      '  Prepay duties instead. Absorbing them costs less than the refunds a doorstep',
    );
    console.log('  surprise causes, and it is the honest thing to sell.');
  }
  if (row.cpaIsFloorBound) {
    console.log(
      `\n  NOTE: priced below the CA$${cpaFloorCrossover().toFixed(0)} crossover, so this pays the minimum CPA`,
    );
    console.log(
      '  no matter how good its margin is. Raising the price helps more than cutting cost.',
    );
  }
  if (row.verdict === 'FAIL') {
    const target = row.requiredContribution - row.contribution;
    console.log(
      `\n  Short by CA$${target.toFixed(2)}. Either find the same product cheaper, or sell a more expensive one.`,
    );
  }
}

/**
 * Batch mode: score a research worksheet and rank it.
 *
 * The workflow this is for - browse DSers, fill a row per candidate, score the
 * lot at once - is the only one that scales. Judging products one at a time in
 * a browser is how the previous catalog happened.
 */
export function parseWorksheet(text) {
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  if (!rows.length) return [];

  const header = rows[0].split(',').map((cell) => cell.trim());
  const flagKeys = Object.keys(DISQUALIFIERS);

  return rows.slice(1).map((line) => {
    const cells = line.split(',').map((cell) => cell.trim());
    const record = Object.fromEntries(header.map((key, i) => [key, cells[i]]));
    const flags = {};
    for (const key of flagKeys) {
      flags[key] = /^(y|yes|true|1)$/i.test(record[key] || '');
    }
    return {
      name: record.name || 'unnamed',
      retailCad: Number(record.retailCad),
      supplierCostUsd: Number(record.supplierCostUsd),
      supplierShippingUsd: Number(record.supplierShippingUsd || 0),
      flags,
    };
  });
}

function printBatch(csvPath) {
  if (!csvPath || !fs.existsSync(csvPath)) {
    console.error(`FAIL: worksheet not found: ${csvPath}`);
    process.exitCode = 1;
    return;
  }
  const candidates = parseWorksheet(fs.readFileSync(csvPath, 'utf8'));
  if (!candidates.length) {
    console.error('FAIL: worksheet has no candidate rows.');
    process.exitCode = 1;
    return;
  }

  const scored = candidates
    .map((candidate) => scoreCandidate(candidate))
    .sort((a, b) => b.score - a.score);

  console.log(`\nScored ${scored.length} candidates`);
  console.log('-'.repeat(76));
  console.table(
    scored.map((row) => ({
      product: row.name.slice(0, 30),
      retail: `CA$${row.retailCad.toFixed(2)}`,
      landed: `${(row.landedShareOfRetail * 100).toFixed(0)}%`,
      contribution: row.contribution.toFixed(2),
      'profit/order': row.profitPerOrder.toFixed(2),
      score: row.score.toFixed(1),
      recommendation: row.recommendation,
    })),
  );

  for (const row of scored) {
    if (!row.fatal.length && !row.penalties.length) continue;
    console.log(`\n  ${row.name}`);
    for (const item of row.fatal) console.log(`    REJECTED (${item.key}): ${item.why}`);
    for (const item of row.penalties)
      console.log(`    -${item.penalty} (${item.key}): ${item.why}`);
  }

  const shortlist = scored.filter((row) => row.recommendation === 'SHORTLIST');
  console.log(
    `\n${shortlist.length} of ${scored.length} reached SHORTLIST. Order a sample of each before importing.`,
  );
}

export {evaluateCandidate, estimateCpa, scoreCandidate, sourcingSpec};
