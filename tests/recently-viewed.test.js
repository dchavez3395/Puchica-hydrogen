import test from 'node:test';
import assert from 'node:assert/strict';

import {filterRecentlyViewedForMarket} from '../app/lib/recentlyViewed.js';
import {APPROVED_VARIANT_SKUS_BY_MARKET} from '../app/lib/launch-catalog.js';

test('recently viewed fails closed by exact SKU and market', () => {
  const packingSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  const jewelrySku = APPROVED_VARIANT_SKUS_BY_MARKET.US[0];
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

  assert.deepEqual(
    filterRecentlyViewedForMarket(entries, 'CA').map(({handle}) => handle),
    ['3-piece-packing-cube-set', 'white-semi-circular-travel-jewelry-case'],
  );
  assert.deepEqual(
    filterRecentlyViewedForMarket(entries, 'US').map(({handle}) => handle),
    ['white-semi-circular-travel-jewelry-case'],
  );
});
