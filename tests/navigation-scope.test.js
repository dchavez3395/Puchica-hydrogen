import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {DICTIONARIES} from '../app/lib/dictionaries.js';

const megaMenu = await readFile(
  new URL('../app/components/MegaMenu.jsx', import.meta.url),
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

test('shop navigation links directly to the exact three-offer scope', () => {
  for (const handle of [
    '3-piece-packing-cube-set',
    'black-hanging-travel-toiletry-organizer',
    'white-semi-circular-travel-jewelry-case',
  ]) {
    assert.match(megaMenu, new RegExp(`/products/${handle}`));
  }

  assert.doesNotMatch(
    megaMenu,
    /under sink organizer|cable organizer|collections\/best-sellers/i,
  );
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
});

test('retired discovery hubs permanently redirect into the localized catalog', () => {
  for (const source of [collectionIndexRoute, exploreRoute]) {
    assert.match(source, /localizePath\(destination, params\?\.locale \|\| 'en'\)/);
    assert.match(source, /return redirect\([^;]+, 301\)/s);
    assert.match(source, /\/collections\/all/);
  }

  assert.doesNotMatch(
    exploreRoute,
    /phone-case|electronics-accessories|pet-supplies|PRODUCT_CATEGORIES/,
  );
});
