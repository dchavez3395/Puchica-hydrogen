import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {
  ARCHIVED_CATALOG_OFFERS,
  CATALOG_IS_EMPTY,
} from '../app/lib/launch-catalog.js';
import {LAUNCH_COPY_PREFIX} from '../app/lib/product-presentation.js';

const predictiveSearch = await readFile(
  new URL('../app/components/SearchResultsPredictive.jsx', import.meta.url),
  'utf8',
);

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


/**
 * The hand-written denylist above went stale, and this is the fix.
 *
 * On 2026-09-08 the live search page and search drawer both rendered "Shop by
 * need" chips reading `watch roll`, `3 slot watch case`, `6 slot watch case`.
 * The cohort had been retired days earlier, every chip returned zero products
 * and re-rendered the same three chips, and the test above passed the whole
 * time because "watch" was never added to `cable|massage|LED|kettle|...`.
 *
 * Deriving the banned words from the archived handles means retiring a future
 * cohort tightens this by itself. Same split as tests/launch-meta.test.js: a
 * token in three or more distinct archived handles is a CATEGORY word (travel,
 * organizer, packing) and stays legal; a token in one or two identifies a
 * PRODUCT and does not.
 */
test('customer-facing chrome names no retired product, in any locale', () => {
  const handles = new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle));
  const frequency = new Map();
  for (const handle of handles) {
    for (const token of new Set(
      String(handle)
        .split('-')
        .filter((part) => part.length >= 5),
    )) {
      frequency.set(token, (frequency.get(token) ?? 0) + 1);
    }
  }
  const productWords = [...frequency]
    .filter(([, count]) => count < 3)
    .map(([token]) => token);

  assert.ok(
    productWords.includes('watch') && !productWords.includes('travel'),
    'the category split moved: re-read it before trusting this test',
  );

  /*
   * Widened 2026-09-08, second pass. The first version of this test checked
   * search_trending_terms ALONE, and while it was green the live
   * /collections/all hero still read "THE WATCH EDIT / Watch cases that travel
   * well / Roll cases in three, four and six slots" directly above "Nothing is
   * listed right now", on a page with zero product cards. A guard that covers
   * one key is a guard that moves the leak.
   *
   * Site-chrome keys only. product_copy_* is deliberately excluded: those are
   * the retired products' own descriptions, and they SHOULD name the product
   * they describe. They render only when that product is approved.
   */
  const CHROME_KEYS = [
    'search_trending_terms',
    'all_breadcrumb',
    'all_eyebrow',
    'all_title',
    'all_sub',
    'all_empty_title',
    'all_empty_body',
  ];

  /*
   * Widened again, third pass. The English word list above cannot see
   * "Étuis à montres" or "LA SÉLECTION MONTRES", which is what /fr/collections/all
   * actually served while this test was green. So each locale is also checked
   * against words derived from ITS OWN archived product titles.
   *
   * Same frequency split, applied per locale: a token appearing in three or
   * more archived titles is a category word - voyage, organisateur, viaje -
   * and stays legal; a token in one or two identifies a product - montres,
   * relojes, cuir - and does not.
   */
  const localeProductWords = (locale) => {
    const titles = [];
    for (const handle of new Set(ARCHIVED_CATALOG_OFFERS.map((o) => o.handle))) {
      const prefix = LAUNCH_COPY_PREFIX[handle];
      const title = prefix && DICTIONARIES[locale][`${prefix}_title`];
      if (title) titles.push(title);
    }
    const frequency = new Map();
    for (const title of titles) {
      for (const token of new Set(
        title
          .toLowerCase()
          .split(/[^\p{L}\p{N}]+/u)
          .filter((w) => w.length >= 5),
      )) {
        frequency.set(token, (frequency.get(token) ?? 0) + 1);
      }
    }
    /*
     * Titles carry adjectives and filler that handles do not - the first cut of
     * this derived "small" from an archived title and flagged the phrase "the
     * small things that get lost in a bag". So a candidate is only a PRODUCT
     * word if it is also absent from that locale's GENERAL vocabulary: every
     * dictionary value that is neither product copy nor one of the chrome keys
     * under test. "small" appears throughout ordinary copy and drops out;
     * "montres" appears only in watch product copy and stays.
     *
     * Chrome keys are excluded from the evidence deliberately. Counting them
     * would be circular - a bad string sitting in the hero would license the
     * very word that makes it bad.
     */
    const general = new Set();
    for (const [key, value] of Object.entries(DICTIONARIES[locale])) {
      if (typeof value !== 'string') continue;
      if (key.startsWith('product_copy_')) continue;
      if (CHROME_KEYS.includes(key)) continue;
      for (const token of value
        .toLowerCase()
        .split(/[^\p{L}\p{N}]+/u)
        .filter((w) => w.length >= 5)) {
        general.add(token);
      }
    }

    return {
      words: [...frequency]
        .filter(([, n]) => n < 3)
        .map(([w]) => w)
        .filter((w) => !general.has(w)),
      titleCount: titles.length,
    };
  };

  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    const {words: localeWords, titleCount} = localeProductWords(locale);
    assert.ok(
      titleCount >= 5,
      `${locale}: only ${titleCount} archived titles resolved - the mapping moved`,
    );
    assert.ok(
      localeWords.length > 0,
      `${locale}: derived no product words, so this check is inert`,
    );

    for (const key of CHROME_KEYS) {
      assert.ok(dictionary[key], `${locale} is missing ${key}`);
      for (const word of [...productWords, ...localeWords]) {
        assert.doesNotMatch(
          dictionary[key],
          new RegExp(`\\b${word}`, 'iu'),
          `${locale}.${key} names retired product "${word}"`,
        );
      }
    }
  }
});

/**
 * The structural half. Even correct terms are a dead end when nothing is
 * approved, because every search returns zero. Both surfaces must gate on the
 * catalogue rather than on STOREFRONT_CONTAINMENT_ACTIVE, which is false - the
 * store is empty, not contained, and those are different states.
 */
test('discovery chips are suppressed while the catalogue is empty', () => {
  assert.equal(CATALOG_IS_EMPTY, true, 'fixture assumes an empty catalogue');
  for (const [name, source] of [
    ['search route', searchRoute],
    ['predictive search', predictiveSearch],
  ]) {
    assert.match(
      source,
      /CATALOG_IS_EMPTY/,
      `${name} does not gate its trending chips on the catalogue`,
    );
    assert.match(
      source,
      /!CATALOG_IS_EMPTY &&/,
      `${name} imports the flag but does not gate on it`,
    );
  }
});
