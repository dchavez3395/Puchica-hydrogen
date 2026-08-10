import fs from 'node:fs';
import path from 'node:path';
import process from 'node:process';
import {fileURLToPath} from 'node:url';

import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  MARKET_ROUTE_EVIDENCE_TAGS,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '../app/lib/launch-catalog.js';

const rootDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  '..',
);
const failures = [];

function source(...segments) {
  return fs.readFileSync(path.join(rootDir, ...segments), 'utf8');
}

function requireMatch(label, text, expression) {
  if (!expression.test(text)) failures.push(label);
}

if (STOREFRONT_CONTAINMENT_ACTIVE) {
  failures.push('Emergency storefront containment is still active.');
}

const expectedEvidenceTags = [
  'puchica-catalog-approved-v1',
  'dsers-mapped',
  'cost-verified',
  'margin-verified',
  'copy-verified',
  'imagery-verified',
];

for (const tag of expectedEvidenceTags) {
  if (!REQUIRED_CATALOG_EVIDENCE_TAGS.includes(tag)) {
    failures.push(`Catalog evidence gate is missing ${tag}.`);
  }
}

for (const market of ['CA', 'US']) {
  if (!MARKET_ROUTE_EVIDENCE_TAGS[market]) {
    failures.push(`Catalog route gate is missing the ${market} market.`);
  }
  if (!APPROVED_VARIANT_SKUS_BY_MARKET[market]?.length) {
    failures.push(`Exact supplier-SKU gate is empty for ${market}.`);
  }
}

if (APPROVED_VARIANT_SKUS_BY_MARKET.CA.length !== 10) {
  failures.push('Canada must expose exactly ten approved supplier SKUs.');
}

if (APPROVED_VARIANT_SKUS_BY_MARKET.US.length !== 9) {
  failures.push('United States must expose exactly nine approved supplier SKUs.');
}

const home = source('app', 'routes', '_index.jsx');
const landing = source('app', 'components', 'SmallSpaceLanding.jsx');
const header = source('app', 'components', 'Header.jsx');
const collection = source('app', 'routes', 'collections.all.jsx');
const product = source('app', 'routes', 'products.$handle.jsx');
const search = source('app', 'routes', 'search.jsx');

requireMatch(
  'Homepage does not query the approved launch catalog.',
  home,
  /SMALL_SPACE_QUERY[\s\S]*filterLaunchProducts/,
);
requireMatch(
  'Homepage is not positioned around the travel edit.',
  landing,
  /Pack with less rummaging/,
);
for (const handle of [
  '3-piece-packing-cube-set',
  'travel-cable-organizer-case',
]) {
  requireMatch(
    `Header is missing the launch route for ${handle}.`,
    header,
    new RegExp(handle),
  );
}
requireMatch(
  'Collection route does not filter launch products.',
  collection,
  /filterLaunchProducts/,
);
requireMatch(
  'Product route does not enforce the launch gate.',
  product,
  /isLaunchReadyProduct/,
);
requireMatch(
  'Search route does not filter launch products.',
  search,
  /filterLaunchProducts/,
);
for (const commerceControl of ['SearchToggle', 'CartToggle', '/account']) {
  if (!header.includes(commerceControl)) {
    failures.push(`Header commerce control is missing ${commerceControl}.`);
  }
}

console.log('Puchica travel storefront release readiness');
console.log('============================================');

if (failures.length) {
  for (const failure of failures) console.error(`FAIL: ${failure}`);
  process.exitCode = 1;
} else {
  console.log(
    'PASS: storefront release controls are coherent. This does not authorize paid ads.',
  );
}
