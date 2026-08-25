#!/usr/bin/env node
/**
 * What the account's own DSers history says about the CA$90-150 band.
 *
 * `docs/recovery-evidence/dsers-mapping-verification-2026-08-08.csv` holds 29
 * real DSers readings - native cost, Canadian landed cost, Canadian retail -
 * captured from the logged-in account before the catalog was cut. The products
 * are gone but the cost structure is evidence, and it is the only real supplier
 * pricing reachable from a session that cannot open DSers.
 *
 * It answers a question the sourcing spec could not: is a landed cost at or
 * under a third of retail actually achievable on AliExpress, or is that a
 * number invented at a desk?
 *
 * The answer is yes, and it comes with a catch that matters more than the
 * answer. Run it and see.
 *
 * Usage: npm run historical-dsers
 */

import fs from 'node:fs';
import path from 'node:path';
import {fileURLToPath} from 'node:url';

import {scoreCandidate} from './lib/sourcing-spec.mjs';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);

/**
 * Hard-filter classification of the band, done by reading each product title
 * against the disqualifiers. A trimmer is branded and battery-powered; a desk
 * lamp plugs into mains; a pet camera is branded, wireless and battery-powered.
 * None of this is a judgement call - it is what the product is.
 */
const CLASSIFIED = [
  ['Japanese knife set', 100.2, 11.29, {fragile: true}],
  ['USB desk lamp (dimmable)', 138.22, 18.32, {mainsElectrical: true}],
  [
    'VGR hair trimmer',
    159.82,
    21.8,
    {brandedOrLicensed: true, lithiumBattery: true},
  ],
  ['Solar air purifier', 89.77, 15.01, {regulatedGoods: true}],
  [
    'Lenovo GM2 Pro earbuds',
    107.8,
    19.53,
    {brandedOrLicensed: true, wireless: true, lithiumBattery: true},
  ],
  [
    'USB water flosser',
    129.65,
    26.35,
    {lithiumBattery: true, regulatedGoods: true},
  ],
  ['Fingerprint smart padlock', 103.92, 22.45, {lithiumBattery: true}],
  ['Thermos cup 500ML', 127.33, 37.32, {}],
  [
    'Boykeep pet camera',
    98.79,
    31.88,
    {brandedOrLicensed: true, wireless: true, lithiumBattery: true},
  ],
];

export function analyse(rows = CLASSIFIED) {
  return rows.map(([name, retailCad, landedCad, flags]) => {
    // landedCad is already Canadian; divide by the planning FX so the model
    // reconstructs the same landed figure rather than double-converting.
    const scored = scoreCandidate({
      retailCad,
      supplierCostUsd: landedCad / 1.4,
      supplierShippingUsd: 0,
      flags,
    });
    return {
      name,
      landedShare: landedCad / retailCad,
      fatal: scored.fatal.map((f) => f.key),
      recommendation: scored.recommendation,
    };
  });
}

if (
  path.resolve(process.argv[1] || '') ===
  fileURLToPath(import.meta.url)
) {
  const source = path.join(
    rootDir,
    'docs',
    'recovery-evidence',
    'dsers-mapping-verification-2026-08-08.csv',
  );
  const available = fs.existsSync(source);

  console.log('What the account\'s own DSers history says');
  console.log('='.repeat(78));
  console.log(
    `Source: dsers-mapping-verification-2026-08-08.csv ${available ? '(present)' : '(MISSING)'}`,
  );
  console.log(
    '29 real readings; 16 products landed in the CA$85-160 band; 9 of those met',
  );
  console.log('the spec ceiling of a third of retail or less.\n');

  const results = analyse();
  console.table(
    results.map((r) => ({
      product: r.name,
      'landed %': `${(r.landedShare * 100).toFixed(0)}%`,
      verdict: r.recommendation,
      'fatal flags': r.fatal.join(', ') || '—',
    })),
  );

  const clean = results.filter((r) => !r.fatal.length);
  console.log(`
Reading this:

  The cost ceiling is real. Nine of sixteen products in the band landed at or
  under a third of retail, several far under. The spec is not a fantasy.

  But ${results.length - clean.length} of those ${results.length} are fatally disqualified, and they fail for the
  same reason: they are electronics. Cheap to land, high perceived value, large
  markup - and a plug, a radio, a battery or a brand mark on every one.

  That is the structural tension in this price band. On AliExpress the products
  that hit the cost ratio are overwhelmingly the ones a Canadian one-person
  store legally cannot sell: mains gear needs CSA or cUL, anything wireless
  needs ISED and an IC ID, lithium carries shipping and fire liability, and a
  supplier's own brand mark is an IP problem.

  What survives here is ${clean.length}: ${clean.map((c) => c.name).join(' and ')}. One is
  fragile over a three-week route; the other is a vacuum flask that was priced
  at CA$127 during the period this store was pricing things badly.

  So expect a low hit rate in DSers. That is the terrain, not a bad search. If
  fifteen candidates yield two or three clean ones, that is normal and it is
  what the shortlist is for. Concluding "I searched badly" and relaxing a
  filter would be the expensive mistake - those filters are legal requirements,
  not preferences.

  Caveat: these were product-level mappings, which this project already knows
  are untrustworthy for exact variant cost. Treat the ratios as indicative of
  the terrain, never as a quote for any specific product.
`);
}
