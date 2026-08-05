import test from 'node:test';
import assert from 'node:assert/strict';
import {
  CHECKOUT_URL_REWRITER,
  buildCheckoutRewriteOptions,
} from '../app/lib/checkout.js';

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

test('buildCheckoutRewriteOptions yields the same rewritten URL for the cart page and the drawer', () => {
  // A cart whose buyer identity Shopify accepted as CA, while the page
  // itself was requested in the US market. Checkout must follow the cart.
  const cart = {
    checkoutUrl: `https://puchica.ca/cart/c/${TOKEN}`,
    buyerIdentity: {countryCode: 'CA'},
  };
  const storefront = {i18n: {country: 'US', language: 'EN'}};
  const env = {PUBLIC_CHECKOUT_DOMAIN: 'checkout.puchica.ca'};
  // The drawer receives the same locale/domain via root loader data.
  const rootData = {
    selectedLocale: {country: 'US', language: 'EN'},
    consent: {checkoutDomain: 'checkout.puchica.ca'},
  };

  // Cart page path (cart.jsx): storefront + env straight from context.
  const cartPageUrl = CHECKOUT_URL_REWRITER(
    cart.checkoutUrl,
    buildCheckoutRewriteOptions(cart, storefront, env),
  );
  // Drawer path (CartSummary.jsx): locale/domain reconstructed from rootData.
  const drawerUrl = CHECKOUT_URL_REWRITER(
    cart.checkoutUrl,
    buildCheckoutRewriteOptions(
      cart,
      {i18n: rootData.selectedLocale},
      {PUBLIC_CHECKOUT_DOMAIN: rootData.consent.checkoutDomain},
    ),
  );

  assert.equal(cartPageUrl, drawerUrl);
  // Both follow the cart's CA buyer identity, not the storefront's US market.
  assert.equal(
    cartPageUrl,
    `https://checkout.puchica.ca/checkouts/cn/${TOKEN}/en-ca`,
  );
});

test('buildCheckoutRewriteOptions falls back to the storefront country when the cart has no buyer identity', () => {
  const cart = {checkoutUrl: `https://puchica.ca/cart/c/${TOKEN}`};
  const options = buildCheckoutRewriteOptions(
    cart,
    {i18n: {country: 'CA', language: 'FR'}},
    {PUBLIC_CHECKOUT_DOMAIN: 'checkout.puchica.ca'},
  );
  assert.equal(options.country, 'CA');
  assert.equal(options.language, 'FR');
  assert.equal(options.checkoutDomain, 'checkout.puchica.ca');
});
