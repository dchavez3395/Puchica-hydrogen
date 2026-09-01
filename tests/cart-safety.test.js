import test from 'node:test';
import assert from 'node:assert/strict';
import {
  getMarketSafeCart,
  isUsableCart,
  normalizeCartLines,
  parseCartPermalinkLines,
  rejectedCartLineIds,
  safeInternalRedirect,
  shouldRecreateEmptyCartAfterFailedAdd,
} from '../app/lib/cart-safety.js';
import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  ARCHIVED_CATALOG_OFFERS,
  isMarketSuspended,
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

test('a failed add to a valid-looking empty cart is recreated once', () => {
  const line = {
    merchandiseId: 'gid://shopify/ProductVariant/123',
    quantity: 1,
  };
  const emptyCart = {
    id: 'gid://shopify/Cart/stale-token',
    totalQuantity: 0,
    lines: {nodes: []},
  };

  assert.equal(
    shouldRecreateEmptyCartAfterFailedAdd(
      emptyCart,
      {
        cart: {id: emptyCart.id, totalQuantity: 0},
        errors: [{message: 'The cart could not be updated.'}],
      },
      [line],
    ),
    true,
  );

  assert.equal(
    shouldRecreateEmptyCartAfterFailedAdd(
      emptyCart,
      {cart: {id: emptyCart.id, totalQuantity: 1}, errors: []},
      [line],
    ),
    false,
  );
});

test('failed adds never replace a cart that contains shopper lines', () => {
  const line = {
    merchandiseId: 'gid://shopify/ProductVariant/123',
    quantity: 1,
  };
  const populatedCart = {
    id: 'gid://shopify/Cart/active-token',
    totalQuantity: 1,
    lines: {
      nodes: [
        {
          quantity: 1,
          merchandise: {id: 'gid://shopify/ProductVariant/999'},
        },
      ],
    },
  };

  assert.equal(
    shouldRecreateEmptyCartAfterFailedAdd(
      populatedCart,
      {
        cart: {id: populatedCart.id, totalQuantity: 1},
        errors: [{message: 'Merchandise is unavailable.'}],
      },
      [line],
    ),
    false,
  );
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

test('normalizeCartLines strips client-only selectedVariant data', () => {
  assert.deepEqual(
    normalizeCartLines([
      {
        merchandiseId: 'gid://shopify/ProductVariant/123',
        quantity: 1,
        selectedVariant: {
          id: 'gid://shopify/ProductVariant/123',
          availableForSale: true,
          title: 'Optimistic UI only',
        },
      },
    ]),
    [{merchandiseId: 'gid://shopify/ProductVariant/123', quantity: 1}],
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

// A concrete SKU from the audited Canadian offer cohort. Read from the offer
// list rather than APPROVED_VARIANT_SKUS_BY_MARKET, which a market suspension
// empties - these tests need a real SKU to push through the gate, not whatever
// the gate currently approves.
const AUDITED_CA_SKU = ARCHIVED_CATALOG_OFFERS.find((offer) =>
  offer.markets.includes('CA'),
).sku;

test('a suspended market rejects even its own formerly approved SKU', async () => {
  // This asserted the CA-approved / US-rejected asymmetry until CA was
  // suspended on 2026-09-01. The line below carries an SKU that was approved
  // for Canada, and it must now be rejected in both markets: a suspended
  // market has no approved SKUs at all, so a stale cart cannot survive a
  // reload into checkout. That is the point of the suspension.
  const packingSku = AUDITED_CA_SKU;
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

  assert.equal(isMarketSuspended('CA'), true);
  assert.equal(isMarketSuspended('US'), true);
  assert.deepEqual(await rejectedCartLineIds(storefront, cart, 'CA'), [
    'gid://shopify/CartLine/line-ca',
  ]);
  assert.deepEqual(await rejectedCartLineIds(storefront, cart, 'US'), [
    'gid://shopify/CartLine/line-ca',
  ]);
  assert.deepEqual(
    APPROVED_VARIANT_SKUS_BY_MARKET.CA,
    [],
    'a suspended market exposes no approved SKUs',
  );
});

test('market-safe cart sync purges invalid lines before checkout is exposed', async () => {
  const packingSku = AUDITED_CA_SKU;
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
