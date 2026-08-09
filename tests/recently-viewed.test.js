import test from 'node:test';
import assert from 'node:assert/strict';

import {filterRecentlyViewedForMarket} from '../app/lib/recentlyViewed.js';
import {APPROVED_VARIANT_SKUS_BY_MARKET} from '../app/lib/launch-catalog.js';

test('recently viewed fails closed by exact SKU and market', () => {
  const packingSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  const cableSku = APPROVED_VARIANT_SKUS_BY_MARKET.US[0];
  const entries = [
    {handle: '3-piece-packing-cube-set', sku: packingSku, market: 'CA'},
    {handle: 'travel-cable-organizer-case', sku: cableSku, market: 'CA'},
    {handle: 'travel-cable-organizer-case', sku: cableSku, market: 'US'},
    {handle: 'travel-toiletry-organizer', sku: 'held-sku', market: 'CA'},
    {handle: 'legacy-without-proof'},
  ];

  assert.deepEqual(
    filterRecentlyViewedForMarket(entries, 'CA').map(({handle}) => handle),
    ['3-piece-packing-cube-set', 'travel-cable-organizer-case'],
  );
  assert.deepEqual(
    filterRecentlyViewedForMarket(entries, 'US').map(({handle}) => handle),
    ['travel-cable-organizer-case'],
  );
});
