import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  ARCHIVED_CATALOG_OFFERS,
  DISCOVERABLE_PRODUCT_HANDLES,
  OPERATIONAL_HOLD_HANDLES,
  RETIRED_CATALOG_HANDLES,
} from '../app/lib/launch-catalog.js';
import {
  EXPECTED_HANDLES_BY_MARKET,
  extractFeedHandles,
  extractProductHandles,
  hasSecureDocumentHeaders,
  hasNoIndex,
  hasNoStore,
  sameMembers,
} from '../scripts/check-production-health.mjs';

test('production monitor shares the verified market cohorts', () => {
  // The monitor must expect exactly what the gate approves - one shared
  // object, never a second hand-maintained list that can drift from it. That
  // identity is the assertion; the contents follow from the suspension table.
  assert.equal(EXPECTED_HANDLES_BY_MARKET, APPROVED_PRODUCT_HANDLES_BY_MARKET);

  // Both markets are commercially suspended, so production monitoring expects
  // nothing sellable anywhere. If a product appears on the live storefront
  // while a suspension stands, the monitor fails - which is what caught the
  // empty Canadian catalogue in the first place.
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.CA, []);
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.US, []);

  // Nothing is discoverable either: the seven handles were deleted from
  // Shopify on 2026-08-28 and verified 404 in production on 2026-09-01, so
  // the monitor must not expect a live page, sitemap entry or feed item for
  // any of them. Their evidence lives in ARCHIVED_CATALOG_OFFERS.
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, []);
  assert.equal(ARCHIVED_CATALOG_OFFERS.length, 10);

  // Retirement is a separate, still-active rail: those handles must 404.
  assert.equal(RETIRED_CATALOG_HANDLES.size, 5);
});

test('production monitor requires the storefront security-header baseline', () => {
  const secure = new Headers({
    'content-security-policy':
      "base-uri 'self'; object-src 'none'; frame-ancestors 'none'",
    'strict-transport-security': 'max-age=31536000',
    'x-content-type-options': 'nosniff',
    'referrer-policy': 'strict-origin-when-cross-origin',
    'permissions-policy': 'camera=(), microphone=(), geolocation=()',
  });
  const missingFrameProtection = new Headers(secure);
  missingFrameProtection.set(
    'content-security-policy',
    "base-uri 'self'; object-src 'none'",
  );

  assert.equal(hasSecureDocumentHeaders(secure), true);
  assert.equal(hasSecureDocumentHeaders(missingFrameProtection), false);
});

test('server CSP explicitly blocks legacy plugin content', async () => {
  const source = await readFile(
    new URL('../app/entry.server.jsx', import.meta.url),
    'utf8',
  );
  assert.match(source, /objectSrc:\s*\["'none'"\]/);
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
