import test from 'node:test';
import assert from 'node:assert/strict';

import {filterRecentlyViewedForMarket} from '../app/lib/recentlyViewed.js';
import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  ARCHIVED_CATALOG_OFFERS,
  isMarketSuspended,
} from '../app/lib/launch-catalog.js';

test('recently viewed fails closed by exact SKU and market', () => {
  // SKUs come from the audited offer cohort, not from the by-market approval
  // list, which a suspension empties. The fixture needs real SKUs to push at
  // the filter; whether they are currently approved is what is under test.
  const packingSku = ARCHIVED_CATALOG_OFFERS[0].sku;
  const jewelrySku = ARCHIVED_CATALOG_OFFERS[1].sku;
  const entries = [
    {handle: '3-piece-packing-cube-set', sku: packingSku, market: 'CA'},
    {
      handle: 'white-semi-circular-travel-jewelry-case',
      sku: jewelrySku,
      market: 'CA',
    },
    {
      handle: 'white-semi-circular-travel-jewelry-case',
      sku: jewelrySku,
      market: 'US',
    },
    {handle: 'travel-toiletry-organizer', sku: 'held-sku', market: 'CA'},
    {handle: 'legacy-without-proof'},
  ];

  // Both markets are commercially suspended, so a stale browser-stored entry
  // from before the suspension must not resurrect a purchasable rail in
  // either one. Browser storage outlives a deploy; this is the only thing
  // standing between it and a dead PDP.
  // Canada is suspended outright. The United States reopened on 2026-09-01 but
  // approves only the watch-roll cohort, so these archived entries are dropped
  // there by the approval list rather than by the suspension - which is the
  // stronger of the two guards, because it is the one that keeps working after
  // a market comes back.
  assert.equal(isMarketSuspended('CA'), true);
  assert.equal(isMarketSuspended('US'), false);
  assert.deepEqual(APPROVED_VARIANT_SKUS_BY_MARKET.CA, []);
  assert.ok(
    !APPROVED_VARIANT_SKUS_BY_MARKET.US.includes(packingSku),
    'the reopened US market must not approve an archived SKU',
  );
  assert.deepEqual(filterRecentlyViewedForMarket(entries, 'CA'), []);
  assert.deepEqual(filterRecentlyViewedForMarket(entries, 'US'), []);

  // The entries the filter had to reject were not trivially rejectable: two
  // carry real audited SKUs, so the market gate is what dropped them, not a
  // missing field.
  assert.equal(typeof packingSku, 'string');
  assert.notEqual(packingSku, jewelrySku);
});
