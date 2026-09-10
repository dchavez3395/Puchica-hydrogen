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

test('discount redirects use the shared same-site guard and preserve locale', () => {
  const route = readFileSync('app/routes/discount.$code.jsx', 'utf8');

  assert.match(route, /safeInternalRedirect\(requestedRedirect\) \|\| ['"]\/['"]/);
  assert.match(route, /localizePath\(/);
  assert.match(route, /new URL\(redirectParam, ['"]https:\/\/puchica\.invalid['"]\)/);
  assert.doesNotMatch(route, /redirectParam\.includes\(['"]\/\/['"]\)/);
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

test('page sections carry no retired broad-catalog vocabulary', () => {
  // This guardrail used to assert `app/sections` was EMPTY. That was the right
  // shape while the directory's only history was the retired broad-catalog
  // homepage — hardcoded departments for phone cases, pet supplies and
  // electronics that the store no longer sells and could not fill.
  //
  // The directory now holds a metaobject-driven section system, which is the
  // opposite thing: it hardcodes no departments at all, because every section's
  // content is fetched from Shopify at request time and a section whose
  // referenced collection disappears renders nothing. Banning the directory
  // would ban the fix along with the problem.
  //
  // The assertion therefore moves to the property that actually mattered: no
  // section component may name a retired department or embed a catalogue
  // taxonomy of its own.
  const files = existsSync('app/sections')
    ? readdirSync('app/sections', {recursive: true}).filter((entry) =>
        /\.(?:js|jsx)$/.test(String(entry)),
      )
    : [];

  for (const file of files) {
    const source = readFileSync(`app/sections/${file}`, 'utf8');
    assert.doesNotMatch(
      source,
      /phone-case|electronics-accessories|pet-supplies|PRODUCT_CATEGORIES/,
      `${file} reintroduces retired broad-catalog vocabulary`,
    );
  }
});

test('the homepage falls back to its built-in layout when no sections exist', () => {
  // Replacing a live homepage is only safe while it is reversible without a
  // deploy. The route renders metaobject sections when a `page_layout` entry
  // with handle `home` carries any, and the compiled-in landing otherwise, so
  // deleting the entry in admin restores the old homepage immediately.
  //
  // The layout lookup also has to fail on its own. If an unreachable or
  // misconfigured metaobject could reject the loader, a content system would be
  // able to take the front door down, which is strictly worse than having no
  // content system.
  const route = readFileSync('app/routes/_index.jsx', 'utf8');

  assert.match(route, /sections\.length \? \(/);
  assert.match(route, /<SmallSpaceLanding products=\{products\} \/>/);
  assert.match(route, /\.catch\(\(error\) => \{/);
  assert.match(route, /handle: 'home'/);
});

test('legacy bulk Shopify tools fail closed unless writes are explicit', () => {
  const packageJson = JSON.parse(readFileSync('package.json', 'utf8'));
  assert.match(packageJson.scripts['reset-inventory'], /--dry-run/);
  assert.match(packageJson.scripts['update-images'], /--dry-run/);

  const inventory = readFileSync('scripts/reset-inventory.mjs', 'utf8');
  const images = readFileSync('scripts/batch-update-images.mjs', 'utf8');
  const channel = readFileSync('scripts/align-hydrogen-channel.mjs', 'utf8');
  assert.match(inventory, /--confirm-inventory-reset/);
  assert.match(inventory, /const dryRun = !applyRequested/);
  assert.match(images, /--confirm-image-write/);
  assert.match(images, /const dryRun = !applyRequested/);
  assert.match(channel, /--confirm-channel-alignment/);
  assert.match(channel, /const DRY_RUN = !APPLY/);

  for (const path of [
    'scripts/image_alt_apply.py',
    'scripts/image_alt_apply_batched.py',
    'scripts/image_alt_overwrite.py',
  ]) {
    const source = readFileSync(path, 'utf8');
    assert.doesNotMatch(source, /action=['"]store_true['"], default=True/);
    assert.match(source, /if not args\.apply:/);
  }

  for (const [path, confirmation] of [
    ['scripts/create-collection.mjs', '--confirm-create-collection'],
    ['scripts/publish-collection.mjs', '--confirm-publish-collection'],
    ['scripts/tag-products.mjs', '--confirm-bulk-tag'],
    ['scripts/revert-catalog.mjs', '--confirm-delete-generated-media'],
    ['scripts/process-image.mjs', '--confirm-image-upload'],
  ]) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /--apply/);
    assert.ok(source.includes(confirmation), `${path} lacks ${confirmation}`);
  }
});

test('paid image generators require explicit cost confirmation', () => {
  const paidScripts = readdirSync('scripts')
    .filter((name) => /\.(?:js|mjs)$/.test(name))
    .map((name) => `scripts/${name}`)
    .filter((path) =>
      /REPLICATE_API_TOKEN|GEMINI_BANANA_PRO/.test(readFileSync(path, 'utf8')),
    );

  assert.ok(paidScripts.length > 0, 'expected paid generator scripts');
  for (const path of paidScripts) {
    const source = readFileSync(path, 'utf8');
    assert.match(source, /requirePaidGenerationConfirmation\(\)/);
    assert.match(source, /paid-action-guard\.mjs/);
    const guardIndex = source.indexOf('requirePaidGenerationConfirmation();');
    const credentialReadIndex = source.search(
      /process\.env\.(?:REPLICATE_API_TOKEN|GEMINI_BANANA_PRO)/,
    );
    assert.ok(
      guardIndex < credentialReadIndex,
      `${path} must confirm before reading its paid API credential`,
    );
  }

  const guard = readFileSync('scripts/lib/paid-action-guard.mjs', 'utf8');
  assert.match(guard, /--apply/);
  assert.match(guard, /--confirm-paid-generation/);
});
