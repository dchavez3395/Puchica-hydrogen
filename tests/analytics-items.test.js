import assert from 'node:assert/strict';
import test from 'node:test';
import {analyticsItemId, cartAnalyticsItems} from '../app/lib/analytics-items.js';

test('analytics item IDs prefer the selected Shopify variant', () => {
  assert.equal(
    analyticsItemId({
      id: 'gid://shopify/Product/1',
      variantId: 'gid://shopify/ProductVariant/2',
    }),
    'gid://shopify/ProductVariant/2',
  );
});

test('analytics item IDs fall back to product ID', () => {
  assert.equal(
    analyticsItemId({id: 'gid://shopify/Product/1'}),
    'gid://shopify/Product/1',
  );
});

test('checkout analytics use variant IDs and line quantities', () => {
  assert.deepEqual(
    cartAnalyticsItems({
      lines: {
        nodes: [
          {
            quantity: 2,
            merchandise: {
              id: 'gid://shopify/ProductVariant/2',
              title: '5PCS Set Red',
              product: {title: 'Red 5-Piece Compression Packing Cube Set'},
              price: {amount: '71.45'},
            },
          },
        ],
      },
    }),
    [
      {
        item_id: 'gid://shopify/ProductVariant/2',
        item_name: 'Red 5-Piece Compression Packing Cube Set',
        item_variant: '5PCS Set Red',
        price: 71.45,
        quantity: 2,
      },
    ],
  );
});
