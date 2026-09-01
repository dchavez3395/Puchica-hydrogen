import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {DICTIONARIES} from '../app/lib/dictionaries.js';

const header = await readFile(
  new URL('../app/components/Header.jsx', import.meta.url),
  'utf8',
);
const searchRoute = await readFile(
  new URL('../app/routes/search.jsx', import.meta.url),
  'utf8',
);
const collectionIndexRoute = await readFile(
  new URL('../app/routes/collections._index.jsx', import.meta.url),
  'utf8',
);
const exploreRoute = await readFile(
  new URL('../app/routes/explore.jsx', import.meta.url),
  'utf8',
);
const legacyCollectionRoute = await readFile(
  new URL('../app/routes/collections.$handle.jsx', import.meta.url),
  'utf8',
);
const collectionRoute = await readFile(
  new URL('../app/routes/collections.all.jsx', import.meta.url),
  'utf8',
);
const notFoundRoute = await readFile(
  new URL('../app/routes/$.jsx', import.meta.url),
  'utf8',
);

// Rewritten 2026-09-01. These previously asserted that the nav linked to three
// specific product handles. Those products were deleted from the catalog on
// 2026-08-28, so the assertions were pinning the nav to three 404s. The intent
// was always "navigation stays inside the current assortment" - that is what is
// asserted now. Restore direct product shortcuts only for handles verified to
// resolve, and re-pin them here at the same time.
test('shop navigation links to no retired product handles', () => {
  for (const handle of [
    '3-piece-packing-cube-set',
    'black-hanging-travel-toiletry-organizer',
    'white-semi-circular-travel-jewelry-case',
  ]) {
    assert.doesNotMatch(
      header,
      new RegExp(`/products/${handle}`),
      `header still links to retired handle ${handle}`,
    );
  }

  assert.doesNotMatch(
    header,
    /under sink organizer|cable organizer|collections\/best-sellers/i,
  );
});

test('navigation labels come from the dictionary, never hardcoded strings', async () => {
  const source = await readFile(
    new URL('../app/components/Header.jsx', import.meta.url),
    'utf8',
  );
  for (const key of ['nav_shop', 'nav_about']) {
    assert.match(source, new RegExp(`title: t\\('${key}'\\)`));
  }
  assert.doesNotMatch(source, /title: '(Packing cubes|Toiletry organizer|Jewelry case)'/);
});

test('collection and recovery navigation make no unsupported sales ranking claim', () => {
  assert.doesNotMatch(collectionRoute, /BEST_SELLING|value="best-selling"/);
  assert.doesNotMatch(
    notFoundRoute,
    /collections\/best-sellers|collections\/new|notfound_best|notfound_new/,
  );
  assert.match(notFoundRoute, /to="\/collections\/all"/);
  assert.match(notFoundRoute, /to="\/pages\/contact"/);
});

test('empty search prompts stay localized and inside the current assortment', () => {
  assert.match(searchRoute, /t\('search_trending_terms'\)/);
  assert.doesNotMatch(searchRoute, /Under sink organizer|Cable organizer/);

  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    for (const key of [
      'search_trending_terms',
      'pred_empty_body',
      'pred_no_results_body',
    ]) {
      assert.ok(dictionary[key], `${locale} is missing ${key}`);
      assert.doesNotMatch(
        dictionary[key],
        /cable|massage|LED|kettle|bouilloire|chaleira|under.?sink/i,
        `${locale}.${key} still promotes retired inventory`,
      );
    }
  }

  assert.match(searchRoute, /items\.articles = \{\.\.\.items\.articles, nodes: \[\]\}/);
  assert.match(searchRoute, /items\.pages = \{\.\.\.items\.pages, nodes: \[\]\}/);
  assert.match(searchRoute, /items\.queries = \[\]/);
});

test('retired discovery hubs permanently redirect into the localized catalog', () => {
  for (const source of [
    collectionIndexRoute,
    exploreRoute,
    legacyCollectionRoute,
  ]) {
    assert.match(source, /localizePath\(destination, params\?\.locale \|\| 'en'\)/);
    assert.match(source, /return redirect\([^;]+, 301\)/s);
    assert.match(source, /\/collections\/all/);
  }

  assert.doesNotMatch(
    exploreRoute,
    /phone-case|electronics-accessories|pet-supplies|PRODUCT_CATEGORIES/,
  );
});
