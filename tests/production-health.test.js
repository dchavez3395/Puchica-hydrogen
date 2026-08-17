import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  OPERATIONAL_HOLD_HANDLES,
} from '../app/lib/launch-catalog.js';
import {
  EXPECTED_HANDLES_BY_MARKET,
  extractFeedHandles,
  extractProductHandles,
  hasNoIndex,
  hasNoStore,
  sameMembers,
} from '../scripts/check-production-health.mjs';

test('production monitor shares the verified market cohorts', () => {
  assert.equal(EXPECTED_HANDLES_BY_MARKET, APPROVED_PRODUCT_HANDLES_BY_MARKET);
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.CA, [
    '3-piece-packing-cube-set',
    'travel-cable-organizer-case',
    'white-luggage-id-tag',
    'ten-hole-white-cable-organizer-clips',
    'white-semi-circular-travel-jewelry-case',
    'large-blue-handled-clothes-storage-bag',
    'black-hanging-travel-toiletry-organizer',
    'black-knitted-luggage-wheel-covers-set-of-4',
    'soft-luggage-handle-wrap-black-coffee-brown',
  ]);
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.US, [
    'travel-cable-organizer-case',
    'white-luggage-id-tag',
    'ten-hole-white-cable-organizer-clips',
    'white-semi-circular-travel-jewelry-case',
    'black-hanging-travel-toiletry-organizer',
    'black-knitted-luggage-wheel-covers-set-of-4',
    'soft-luggage-handle-wrap-black-coffee-brown',
  ]);
});

test('production monitor excludes the retired TikTok channel', async () => {
  const source = await readFile(
    new URL('../scripts/check-production-health.mjs', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(source, /TikTok bio destination|utm_source=tiktok/i);
});

test('feed and sitemap extractors find product handles', () => {
  assert.deepEqual(
    extractFeedHandles(
      '<g:link>https://puchica.ca/products/one</g:link>\n<g:link>https://puchica.ca/products/two</g:link>',
    ),
    ['one', 'two'],
  );
  assert.deepEqual(
    extractProductHandles(
      '<loc>https://puchica.ca/products/one</loc><loc>https://puchica.ca/pages/about</loc>',
    ),
    ['one'],
  );
});

test('exact-set comparison rejects substitutions and duplicates', () => {
  assert.equal(sameMembers(['a', 'b'], ['b', 'a']), true);
  assert.equal(sameMembers(['a', 'a'], ['a', 'b']), false);
  assert.equal(sameMembers(['a'], ['a', 'b']), false);
});

test('held routes require both no-store and noindex response controls', () => {
  const safe = new Headers({
    'cache-control': 'no-store, max-age=0',
    'x-robots-tag': 'noindex, nofollow',
  });
  const unsafe = new Headers({'cache-control': 'public, max-age=3600'});

  assert.equal(hasNoStore(safe), true);
  assert.equal(hasNoIndex(safe), true);
  assert.equal(hasNoStore(unsafe), false);
  assert.equal(hasNoIndex(unsafe), false);
});

test('organic release cohort cannot retain operationally held products', async () => {
  const source = await readFile(
    new URL('../scripts/manage-organic-release.mjs', import.meta.url),
    'utf8',
  );
  const start = source.indexOf('const cohort = [');
  const end = source.indexOf('\n];', start);
  assert.ok(start >= 0 && end > start, 'organic cohort definition is missing');
  const cohortSource = source.slice(start, end);

  for (const handle of OPERATIONAL_HOLD_HANDLES) {
    const exactHandleDeclaration = `handle: '${handle}'`;
    assert.doesNotMatch(
      cohortSource,
      new RegExp(exactHandleDeclaration.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')),
      `${handle} must stay out of the organic release cohort`,
    );
  }
});
