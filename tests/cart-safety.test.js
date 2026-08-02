import test from 'node:test';
import assert from 'node:assert/strict';
import {
  normalizeCartLines,
  parseCartPermalinkLines,
  safeInternalRedirect,
} from '../app/lib/cart-safety.js';

test('safeInternalRedirect only accepts same-site paths', () => {
  assert.equal(safeInternalRedirect('/cart?added=1'), '/cart?added=1');
  assert.equal(safeInternalRedirect('https://evil.example'), null);
  assert.equal(safeInternalRedirect('//evil.example'), null);
  assert.equal(safeInternalRedirect('/cart\\evil'), null);
  assert.equal(safeInternalRedirect('/cart\r\nX-Test: bad'), null);
});

test('parseCartPermalinkLines accepts bounded numeric variants and quantities', () => {
  assert.deepEqual(parseCartPermalinkLines('123:1,456:2'), [
    {merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1},
    {merchandiseId: 'gid://shopify/ProductVariant/456', quantity: 2},
  ]);
  assert.equal(parseCartPermalinkLines('123:0'), null);
  assert.equal(parseCartPermalinkLines('123:100'), null);
  assert.equal(parseCartPermalinkLines('abc:1'), null);
  assert.equal(parseCartPermalinkLines('123:1:2'), null);
});

test('normalizeCartLines rejects malformed direct add-to-cart payloads', () => {
  assert.deepEqual(
    normalizeCartLines([
      {merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 2},
    ]),
    [{merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 2}],
  );
  assert.equal(normalizeCartLines([]), null);
  assert.equal(
    normalizeCartLines([
      {merchandiseId: 'gid://shopify/Product/123', quantity: 1},
    ]),
    null,
  );
  assert.equal(
    normalizeCartLines([
      {merchandiseId: 'gid://shopify/ProductVariant/123', quantity: -1},
    ]),
    null,
  );
});
