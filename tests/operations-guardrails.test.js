import test from 'node:test';
import assert from 'node:assert/strict';
import {existsSync, readFileSync, readdirSync} from 'node:fs';

import {shouldLog} from '../app/lib/logger.js';

test('production server diagnostics remain visible while browser logs are quiet', () => {
  assert.equal(shouldLog({prod: true, browser: false}), true);
  assert.equal(shouldLog({prod: true, browser: true}), false);
  assert.equal(shouldLog({prod: false, browser: true}), true);
});

test('deployment is gated by tests, release checks, build, deploy, and live health', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  const commands = [
    'npm run lint',
    'npm test',
    'npm run launch-check',
    'npm run build',
    'shopify hydrogen deploy',
    'npm run production-health',
    'npm run metadata-health',
    'npm run link-health',
  ];
  let previousIndex = -1;

  for (const command of commands) {
    const index = workflow.indexOf(command);
    assert.ok(index > previousIndex, `${command} must exist in deployment order`);
    previousIndex = index;
  }
});

test('deployment uses current Node 24 actions with least-privilege access', () => {
  const workflow = readFileSync('.github/workflows/deploy.yml', 'utf8');
  assert.match(workflow, /permissions:\s*\n\s*contents: read/);
  assert.match(workflow, /actions\/checkout@v7/);
  assert.match(workflow, /actions\/setup-node@v7/);
  assert.doesNotMatch(workflow, /actions\/(?:checkout|setup-node)@v4/);
});

test('React Router lazy manifest stays disabled while Hydrogen pins 7.16', () => {
  const config = readFileSync('react-router.config.js', 'utf8');
  const monitor = readFileSync('scripts/check-production-health.mjs', 'utf8');
  assert.match(config, /routeDiscovery:\s*\{mode:\s*['"]initial['"]\}/);
  assert.match(monitor, /Lazy route manifest disabled/);
  assert.match(monitor, /\/__manifest/);
});

test('customer search navigation encodes input and preserves the locale', () => {
  const searchForm = readFileSync(
    'app/components/SearchFormPredictive.jsx',
    'utf8',
  );
  const layout = readFileSync('app/components/PageLayout.jsx', 'utf8');

  assert.match(searchForm, /new URLSearchParams\(\{q: normalizedTerm\}\)/);
  assert.match(searchForm, /navigate\(localize\(getSearchHref\(term\)\)\)/);
  assert.match(searchForm, /action: localize\(SEARCH_ENDPOINT\)/);
  assert.doesNotMatch(searchForm, /`\?q=\$\{term\}`/);
  assert.match(layout, /to=\{getSearchHref\(term\.current\)\}/);
});

test('canonical operating scope matches the three-offer automated release', () => {
  const scope = readFileSync('docs/CURRENT-SCOPE.md', 'utf8');
  const readme = readFileSync('README.md', 'utf8');

  assert.match(scope, /three exact\s+products/);
  assert.match(scope, /Black Hanging Travel Toiletry Organizer \| `14:771#Black` \| No \| Yes/);
  assert.doesNotMatch(scope, /9 Active product pages|10 exact approved SKUs/);
  assert.match(readme, /Production deployment is intentionally automated from `main`/);
  assert.doesNotMatch(readme, /Do not enable or assume automatic production deployment/);
});

test('retired broad-catalog homepage sections stay removed', () => {
  const files = existsSync('app/sections')
    ? readdirSync('app/sections', {recursive: true}).filter((entry) =>
        /\.(?:js|jsx)$/.test(String(entry)),
      )
    : [];
  assert.deepEqual(files, []);
});
