#!/usr/bin/env node
/**
 * Turn a scored shortlist into the launch-catalog gate block and a tag checklist.
 *
 * Swapping the catalog is where a store like this usually breaks. The gate in
 * app/lib/launch-catalog.js fails closed on an empty cohort - deliberately, so
 * a botched edit cannot quietly open the storefront to unreviewed products -
 * which means the swap has to be atomic: the new offers land in the same commit
 * the old ones leave. Hand-editing that block against a spreadsheet is exactly
 * the kind of task that produces a typo'd SKU, and a typo'd SKU is an order
 * shipped as the wrong item.
 *
 * So this generates the block instead. It also prints the Shopify tag checklist
 * each product needs, because the code gate and the Shopify tags are two
 * separate sources of truth that must agree before anything is buyable.
 *
 * Usage:
 *   node scripts/build-catalog-block.mjs --csv <shortlist.csv>
 *   node scripts/build-catalog-block.mjs --csv <shortlist.csv> --markets CA
 *
 * The CSV needs handle and sku columns; everything else is ignored, so the
 * sourcing worksheet can be used directly once handle/sku are filled in.
 */

import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {
  BUNDLE_REQUIRED_EVIDENCE_TAGS,
  MARKET_ROUTE_EVIDENCE_TAGS,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
} from '../app/lib/launch-catalog.js';

const scriptPath = fileURLToPath(import.meta.url);

export function parseShortlist(text) {
  const rows = text
    .split('\n')
    .map((line) => line.trim())
    .filter((line) => line && !line.startsWith('#'));
  if (rows.length < 2) return [];

  const header = rows[0].split(',').map((cell) => cell.trim());
  return rows
    .slice(1)
    .map((line) => {
      const cells = line.split(',').map((cell) => cell.trim());
      const record = Object.fromEntries(header.map((key, i) => [key, cells[i]]));
      return {
        handle: record.handle || '',
        sku: record.sku || '',
        name: record.name || record.handle || 'unnamed',
        bundle: /^(y|yes|true|1)$/i.test(record.bundle || ''),
      };
    })
    .filter((row) => row.handle && row.sku);
}

export function validateShortlist(rows) {
  const failures = [];
  if (!rows.length) {
    failures.push(
      'Shortlist is empty. The gate fails closed on an empty cohort, so a swap needs at least one approved offer.',
    );
  }

  const seenHandles = new Set();
  const seenSkus = new Set();
  for (const row of rows) {
    if (!/^[a-z0-9][a-z0-9-]*$/.test(row.handle)) {
      failures.push(
        `Handle "${row.handle}" is not a valid Shopify handle (lowercase, digits, hyphens).`,
      );
    }
    if (seenHandles.has(row.handle)) {
      failures.push(`Duplicate handle: ${row.handle}.`);
    }
    // A duplicated SKU across handles means two products map to one supplier
    // variant - the exact failure that shipped a 3-piece set at a 5-piece price.
    if (seenSkus.has(row.sku)) {
      failures.push(
        `Duplicate SKU across handles: ${row.sku}. Two storefront products cannot share one supplier variant.`,
      );
    }
    seenHandles.add(row.handle);
    seenSkus.add(row.sku);
  }
  return failures;
}

export function renderCatalogBlock(rows, markets = ['CA']) {
  const entries = rows
    .map((row) => {
      const marketList = markets.map((m) => `'${m}'`).join(', ');
      const bundleLine = row.bundle ? '\n    bundle: true,' : '';
      return `  Object.freeze({
    handle: '${row.handle}',
    sku: ${JSON.stringify(row.sku)},
    markets: Object.freeze([${marketList}]),${bundleLine}
  }),`;
    })
    .join('\n');

  return `export const APPROVED_CATALOG_OFFERS = Object.freeze([
${entries}
]);`;
}

export function tagChecklist(row, markets = ['CA']) {
  const base = row.bundle
    ? [
        ...REQUIRED_CATALOG_EVIDENCE_TAGS.filter((t) => t !== 'dsers-mapped'),
        ...BUNDLE_REQUIRED_EVIDENCE_TAGS,
      ]
    : [...REQUIRED_CATALOG_EVIDENCE_TAGS];
  const routes = markets.map((m) => MARKET_ROUTE_EVIDENCE_TAGS[m]).filter(Boolean);
  return [...base, ...routes];
}

if (path.resolve(process.argv[1] || '') === scriptPath) {
  const csvIndex = process.argv.indexOf('--csv');
  const marketIndex = process.argv.indexOf('--markets');
  const markets =
    marketIndex >= 0
      ? process.argv[marketIndex + 1].split(',').map((m) => m.trim().toUpperCase())
      : ['CA'];

  if (csvIndex < 0 || !fs.existsSync(process.argv[csvIndex + 1] || '')) {
    console.error('FAIL: pass --csv <shortlist.csv> with handle and sku columns.');
    process.exitCode = 1;
  } else {
    const rows = parseShortlist(
      fs.readFileSync(process.argv[csvIndex + 1], 'utf8'),
    );
    const failures = validateShortlist(rows);

    console.log('Puchica catalog swap');
    console.log('='.repeat(76));
    console.log(`Offers  : ${rows.length}`);
    console.log(`Markets : ${markets.join(', ')}`);

    if (failures.length) {
      for (const failure of failures) console.error(`FAIL: ${failure}`);
      process.exitCode = 1;
    } else {
      console.log(
        '\nReplace APPROVED_CATALOG_OFFERS in app/lib/launch-catalog.js with:\n',
      );
      console.log(renderCatalogBlock(rows, markets));

      console.log('\n\nShopify tags each product must carry before it is buyable');
      console.log('-'.repeat(76));
      for (const row of rows) {
        console.log(`\n  ${row.handle}`);
        for (const tag of tagChecklist(row, markets)) {
          console.log(`    [ ] ${tag}`);
        }
      }

      console.log(`
Then, in one commit:
  1. Replace the offers block above.
  2. Move every retired handle into RETIRED_CATALOG_HANDLES.
  3. Apply the tags in Shopify and set the old products to draft.
  4. npm test && npm run launch-check && npm run acquisition-gate
  5. Deploy. The live health check verifies the retired URLs stay closed.

The gate fails closed on an empty cohort, so steps 1 and 2 belong in the same
commit. Do not deploy a half-swapped catalog.`);
    }
  }
}
