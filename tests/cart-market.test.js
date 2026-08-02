import assert from 'node:assert/strict';
import test from 'node:test';

import {
  cartBuyerCountryNeedsSync,
  cartBuyerCountrySyncFailed,
  cartCheckoutCountry,
  resolveCartBuyerCountry,
} from '../app/lib/cart-market.js';

test('cart creation uses the market Shopify actually resolved', async () => {
  const calls = [];
  const storefront = {
    i18n: {country: 'CA', language: 'EN'},
    CacheNone: () => ({mode: 'no-store'}),
    query: async (_query, options) => {
      calls.push(options);
      return {
        localization: {
          country: {isoCode: 'US', currency: {isoCode: 'USD'}},
          availableCountries: [
            {isoCode: 'US', currency: {isoCode: 'USD'}},
          ],
        },
      };
    },
  };

  assert.equal(await resolveCartBuyerCountry(storefront), 'US');
  assert.deepEqual(calls[0].variables, {country: 'CA', language: 'EN'});
  assert.deepEqual(calls[0].cache, {mode: 'no-store'});
});

test('checkout locale follows the accepted cart market', () => {
  assert.equal(
    cartCheckoutCountry({buyerIdentity: {countryCode: 'US'}}, 'CA'),
    'US',
  );
  assert.equal(cartCheckoutCountry(null, 'CA'), 'CA');
});

test('existing cart market is synchronized before adding a line', () => {
  assert.equal(
    cartBuyerCountryNeedsSync(
      {buyerIdentity: {countryCode: 'CA'}},
      'US',
    ),
    true,
  );
  assert.equal(
    cartBuyerCountryNeedsSync(
      {buyerIdentity: {countryCode: 'US'}},
      'US',
    ),
    false,
  );
  assert.equal(cartBuyerCountryNeedsSync(null, 'US'), true);
});

test('cart market sync fails closed on errors or a mismatched country', () => {
  assert.equal(
    cartBuyerCountrySyncFailed(
      {cart: {buyerIdentity: {countryCode: 'US'}}, errors: []},
      'US',
    ),
    false,
  );
  assert.equal(
    cartBuyerCountrySyncFailed(
      {cart: {buyerIdentity: {countryCode: 'CA'}}, errors: []},
      'US',
    ),
    true,
  );
  assert.equal(
    cartBuyerCountrySyncFailed(
      {
        cart: {buyerIdentity: {countryCode: 'US'}},
        errors: [{message: 'Market update failed'}],
      },
      'US',
    ),
    true,
  );
});
