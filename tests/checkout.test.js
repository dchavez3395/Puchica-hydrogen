import test from 'node:test';
import assert from 'node:assert/strict';
import {CHECKOUT_URL_REWRITER} from '../app/lib/checkout.js';

const TOKEN = 'AbCdEf_1234';

test('rewrites approved storefront cart permalinks onto the checkout domain', () => {
  for (const host of ['puchica.ca', 'puchica.shop']) {
    assert.equal(
      CHECKOUT_URL_REWRITER(`https://${host}/cart/c/${TOKEN}`, {
        country: 'US',
        language: 'EN',
        checkoutDomain: 'checkout.puchica.ca',
      }),
      `https://checkout.puchica.ca/checkouts/cn/${TOKEN}/en-us`,
    );
  }
});

test('rewrites trusted Shopify legacy cart hosts without navigating to them', () => {
  for (const host of ['ug91ve-sz.myshopify.com', 'puchica-2.myshopify.com']) {
    const rewritten = CHECKOUT_URL_REWRITER(
      `https://${host}/cart/c/${TOKEN}?discount=SAVE10`,
      {
        country: 'CA',
        language: 'FR',
        checkoutDomain: 'checkout.puchica.ca',
      },
    );

    assert.equal(
      rewritten,
      `https://checkout.puchica.ca/checkouts/cn/${TOKEN}/fr-ca?discount=SAVE10`,
    );
    assert.equal(new URL(rewritten).hostname, 'checkout.puchica.ca');
  }
});

test('fails closed for untrusted hosts, insecure URLs, and malformed paths', () => {
  assert.equal(
    CHECKOUT_URL_REWRITER(`https://evil.example/cart/c/${TOKEN}`),
    null,
  );
  assert.equal(
    CHECKOUT_URL_REWRITER(`http://puchica.ca/cart/c/${TOKEN}`),
    null,
  );
  assert.equal(CHECKOUT_URL_REWRITER('https://puchica.ca/cart'), null);
});
