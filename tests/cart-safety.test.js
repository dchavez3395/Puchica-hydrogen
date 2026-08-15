import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarketSafeCart,
  isUsableCart,
  normalizeCartLines,
  parseCartPermalinkLines,
  rejectedCartLineIds,
  safeInternalRedirect,
} from '../app/lib/cart-safety.js';
import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  MARKET_ROUTE_EVIDENCE_TAGS,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
} from '../app/lib/launch-catalog.js';

test('stale or error-shaped cart reads are recoverable', () => {
  assert.equal(
    isUsableCart({id: 'gid://shopify/Cart/active-token?key=secret'}),
    true,
  );
  assert.equal(isUsableCart(null), false);
  assert.equal(isUsableCart({errors: [{message: 'Cart not found'}]}), false);
  assert.equal(isUsableCart({id: 'gid://shopify/Product/123'}), false);
});

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

function storefrontWithVariant(variant) {
  return {
    i18n: {country: 'CA', language: 'EN'},
    CacheNone: () => null,
    query: async () => ({nodes: [variant]}),
  };
}

function approvedVariant(sku, routeTag = MARKET_ROUTE_EVIDENCE_TAGS.CA) {
  return {
    __typename: 'ProductVariant',
    id: 'gid://shopify/ProductVariant/123',
    sku,
    availableForSale: true,
    product: {
      handle: 'verified-organizer',
      availableForSale: true,
      tags: [...REQUIRED_CATALOG_EVIDENCE_TAGS, routeTag],
    },
  };
}

test('existing Canada-only lines are rejected after switching to the US', async () => {
  const packingSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  const storefront = storefrontWithVariant(approvedVariant(packingSku));
  const cart = {
    lines: {
      nodes: [
        {
          id: 'gid://shopify/CartLine/line-ca',
          merchandise: {id: 'gid://shopify/ProductVariant/123'},
        },
      ],
    },
  };

  assert.deepEqual(await rejectedCartLineIds(storefront, cart, 'CA'), []);
  assert.deepEqual(await rejectedCartLineIds(storefront, cart, 'US'), [
    'gid://shopify/CartLine/line-ca',
  ]);
});

test('market-safe cart sync purges invalid lines before checkout is exposed', async () => {
  const packingSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  const storefront = storefrontWithVariant(approvedVariant(packingSku));
  const caLine = {
    id: 'gid://shopify/CartLine/line-ca',
    merchandise: {id: 'gid://shopify/ProductVariant/123'},
  };
  let reads = 0;
  let removed = [];
  const cartApi = {
    getCartId: () => 'gid://shopify/Cart/cart-token',
    get: async () => {
      reads += 1;
      if (reads === 1) {
        return {buyerIdentity: {countryCode: 'CA'}, lines: {nodes: [caLine]}};
      }
      if (reads === 2) {
        return {buyerIdentity: {countryCode: 'US'}, lines: {nodes: [caLine]}};
      }
      return {buyerIdentity: {countryCode: 'US'}, lines: {nodes: []}};
    },
    updateBuyerIdentity: async () => ({
      cart: {buyerIdentity: {countryCode: 'US'}},
      errors: [],
    }),
    removeLines: async (lineIds) => {
      removed = lineIds;
      return {errors: []};
    },
  };

  const safeCart = await getMarketSafeCart(cartApi, storefront, 'US');
  assert.deepEqual(removed, ['gid://shopify/CartLine/line-ca']);
  assert.deepEqual(safeCart.lines.nodes, []);
  assert.equal(safeCart.buyerIdentity.countryCode, 'US');
});
