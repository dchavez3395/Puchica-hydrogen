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

  // Browser storage outlives a deploy, and it outlives a market change too.
  // These entries were written while the travel cohort was live in Canada;
  // neither market may resurrect them, and the two markets reject them for
  // different reasons, which is what makes asserting both worthwhile:
  //
  //   CA is OPEN as of 2026-09-13 and rejects them by the APPROVAL LIST. That
  //   is the stronger guard, because it is the one that has to keep working
  //   after a market comes back - a suspension does the job for free and stops
  //   proving anything the moment it is lifted.
  //   US is SHUT as of 2026-09-13 and rejects them by SUSPENSION.
  assert.equal(isMarketSuspended('CA'), false);
  assert.equal(isMarketSuspended('US'), true);
  assert.deepEqual(APPROVED_VARIANT_SKUS_BY_MARKET.US, []);
  assert.ok(
    APPROVED_VARIANT_SKUS_BY_MARKET.CA.length > 0,
    'the open market must have a non-empty list, or the check below is vacuous',
  );
  assert.ok(
    !APPROVED_VARIANT_SKUS_BY_MARKET.CA.includes(packingSku),
    'the open CA market must not approve an archived SKU',
  );
  assert.deepEqual(filterRecentlyViewedForMarket(entries, 'CA'), []);
  assert.deepEqual(filterRecentlyViewedForMarket(entries, 'US'), []);

  // The entries the filter had to reject were not trivially rejectable: two
  // carry real audited SKUs, so the market gate is what dropped them, not a
  // missing field.
  assert.equal(typeof packingSku, 'string');
  assert.notEqual(packingSku, jewelrySku);
});
