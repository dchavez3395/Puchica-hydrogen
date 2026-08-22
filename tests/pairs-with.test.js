import test from 'node:test';
import assert from 'node:assert/strict';

import {pairsWith, PAIRS_WITH_LIMIT} from '../app/lib/pairs-with.js';
import {BUNDLE_CATALOG_HANDLES} from '../app/lib/launch-catalog.js';
import {DICTIONARIES} from '../app/lib/dictionaries.js';

const priced = (handle, amount) => ({
  handle,
  priceRange: {minVariantPrice: {amount: String(amount), currencyCode: 'CAD'}},
});

// The live Canadian catalogue, cheapest first.
const CATALOG = [
  priced('travel-cable-organizer-case', 19.99),
  priced('white-semi-circular-travel-jewelry-case', 22.99),
  priced('black-hanging-travel-toiletry-organizer', 27.99),
  priced('black-travel-tech-case', 34.99),
  priced('3-piece-packing-cube-set', 39.99),
  priced('the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case', 69),
];

test('the product being viewed is never recommended alongside itself', () => {
  const result = pairsWith('black-travel-tech-case', CATALOG, 'CA');
  assert.ok(!result.some((p) => p.handle === 'black-travel-tech-case'));
});

test('bundles stay out of the rail', () => {
  // A bundle can contain the product on screen and there is no component map
  // to detect that, so none of them are eligible.
  assert.ok(
    BUNDLE_CATALOG_HANDLES.has(
      'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
    ),
  );
  for (const handle of ['black-travel-tech-case', 'travel-cable-organizer-case']) {
    const result = pairsWith(handle, CATALOG, 'CA');
    assert.ok(
      !result.some((p) => BUNDLE_CATALOG_HANDLES.has(p.handle)),
      `bundle surfaced on ${handle}`,
    );
  }
});

test('items that carry the cart over the free-shipping threshold come first', () => {
  // Viewing the CA$19.99 cable case: CA$30.01 more is needed to reach CA$50,
  // so the tech case and the cube set qualify and the cheaper pair does not.
  const result = pairsWith('travel-cable-organizer-case', CATALOG, 'CA');
  assert.deepEqual(
    result.map((p) => p.handle),
    [
      'black-travel-tech-case', // 34.99 -> 54.98, cheapest that clears
      '3-piece-packing-cube-set', // 39.99 -> 59.98
      'white-semi-circular-travel-jewelry-case', // 22.99 -> 42.98, does not clear
    ],
  );
});

test('when everything clears, the cheapest add wins', () => {
  // Viewing the CA$34.99 tech case: every remaining item clears CA$50, so the
  // ordering collapses to plain ascending price.
  const result = pairsWith('black-travel-tech-case', CATALOG, 'CA');
  assert.deepEqual(
    result.map((p) => p.handle),
    [
      'travel-cable-organizer-case',
      'white-semi-circular-travel-jewelry-case',
      'black-hanging-travel-toiletry-organizer',
    ],
  );
});

test('a market with no verified threshold falls back to cheapest first', () => {
  const result = pairsWith('black-travel-tech-case', CATALOG, 'US');
  assert.deepEqual(result.map((p) => p.handle), [
    'travel-cable-organizer-case',
    'white-semi-circular-travel-jewelry-case',
    'black-hanging-travel-toiletry-organizer',
  ]);
});

test('unreadable prices are dropped rather than rendered as broken cards', () => {
  const messy = [
    ...CATALOG,
    {handle: 'no-price'},
    {handle: 'zero-price', priceRange: {minVariantPrice: {amount: '0'}}},
    {handle: 'nan-price', priceRange: {minVariantPrice: {amount: 'abc'}}},
  ];
  const result = pairsWith('black-travel-tech-case', messy, 'CA', 10);
  for (const bad of ['no-price', 'zero-price', 'nan-price']) {
    assert.ok(!result.some((p) => p.handle === bad), `${bad} leaked`);
  }
});

test('an empty or unusable catalogue yields an empty rail', () => {
  assert.deepEqual(pairsWith('x', [], 'CA'), []);
  assert.deepEqual(pairsWith('x', null, 'CA'), []);
  assert.deepEqual(pairsWith('x', undefined, 'CA'), []);
  // A catalogue of one product has nothing to pair with.
  assert.deepEqual(pairsWith('only', [priced('only', 20)], 'CA'), []);
});

test('the rail is capped', () => {
  assert.equal(PAIRS_WITH_LIMIT, 3);
  assert.equal(pairsWith('black-travel-tech-case', CATALOG, 'CA').length, 3);
});

test('the rail claims nothing about other shoppers', () => {
  // There are no completed orders. "Customers also bought" would be invented
  // social proof, so the copy must stay descriptive in every locale.
  const banned = /frequently bought|customers also|others bought|best.?sell|popular with/i;
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    const dict = DICTIONARIES[locale];
    assert.ok(dict.pairs_title, `${locale}/pairs_title missing`);
    assert.ok(dict.pairs_sub, `${locale}/pairs_sub missing`);
    assert.doesNotMatch(dict.pairs_title, banned);
    assert.doesNotMatch(dict.pairs_sub, banned);
  }
});
