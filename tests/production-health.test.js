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

  // The United States is empty from 2026-09-13: the store moved to Canada, so
  // the US market is suspended and the monitor must expect nothing there. If a
  // product appears on the live storefront for a suspended market the monitor
  // fails, which is what caught the empty Canadian catalogue on 2026-09-01.
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.US, []);

  // Canada carries three handles as of 2026-09-13. The monitor will now fail
  // post-deploy unless all three are live on the storefront, and that is the
  // point: the 2026-09-01 failure was the monitor expecting handles that were
  // not live, and the mirror of it is a monitor expecting nothing while the
  // storefront serves something. Publishing state and this list move together.
  //
  // Three again. The lantern spent 2026-09-13 on FULFILMENT_HOLD while it
  // had no DSers mapping (DRAFT in Shopify, so the monitor rightly expected a
  // 404). It was mapped the same day through My Products -> Import Products
  // From Shopify, tagged dsers-mapped and set ACTIVE, and came back here.
  // This list and the live storefront must agree; if the lantern ever drops
  // out of Shopify again, move it to a hold list rather than editing this.
  //
  // Five, later on 2026-09-13. The pear and the tiered pendant were approved
  // from the Canadian-gateway sourcing sweep and are NOT yet in Shopify, so
  // the monitor WILL fail post-deploy until both are imported, mapped in
  // DSers, tagged and set ACTIVE. That is the intended order: the repo states
  // the cohort first and the storefront is brought up to it, exactly as the
  // lantern was earlier the same day.
  //
  // Eleven, later still on 2026-09-13: six shapes from listing
  // 1005007626643748 (gourd, egg, bell, nest, segmented pumpkin, globe), all
  // approved on the same reading and all NOT yet in Shopify. The monitor
  // stays red until all eleven are imported, mapped, tagged and ACTIVE.
  assert.deepEqual(EXPECTED_HANDLES_BY_MARKET.CA, [
    'hand-woven-bamboo-pendant-light',
    'woven-bamboo-dome-pendant',
    'slatted-bamboo-lantern-pendant-20cm',
    'slatted-bamboo-pear-pendant-20cm',
    'tiered-bamboo-pendant-30cm',
    'woven-bamboo-egg-pendant-15cm',
    'woven-bamboo-bell-pendant-26cm',
    'woven-bamboo-nest-pendant-30cm',
    'bamboo-slat-pumpkin-pendant-18cm',
    'woven-bamboo-globe-pendant-25cm',
    // Twelve: the rattan cone wall sconce, first non-pendant, 2026-09-13.
    'rattan-cone-wall-sconce-15cm',
    'woven-bamboo-column-pendant-37cm',
    'iron-cage-pendant-15cm',
    'woven-bamboo-wide-brim-chandelier-30cm',
    'bamboo-slat-drum-pendant-30cm',
    'bamboo-hat-nest-pendant-30cm',
  ]);

  // Discovery follows the live cohort. The seven previous handles were deleted
  // from Shopify on 2026-08-28 and verified 404 in production on 2026-09-01,
  // so the monitor must not expect a page, sitemap entry or feed item for any
  // of them; their evidence lives in ARCHIVED_CATALOG_OFFERS.
  assert.deepEqual(
    DISCOVERABLE_PRODUCT_HANDLES,
    EXPECTED_HANDLES_BY_MARKET.CA,
    'discovery and the monitor must expect the same live handles',
  );
  for (const retired of RETIRED_CATALOG_HANDLES) {
    assert.ok(
      !DISCOVERABLE_PRODUCT_HANDLES.includes(retired),
      `${retired} is retired and must not be discoverable`,
    );
  }
  // 10 from the 2026-08 travel cohort plus the 8 retired watch-roll offers.
  assert.equal(ARCHIVED_CATALOG_OFFERS.length, 18);

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
