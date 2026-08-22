import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {
  FREE_SHIPPING_THRESHOLDS,
  freeShippingProgress,
} from '../app/lib/free-shipping.js';
import {DICTIONARIES} from '../app/lib/dictionaries.js';

test('the threshold matches the live Canadian delivery profile', () => {
  // Shopify "General profile", Canada zone, read 2026-08-22: Standard Shipping
  // CA$5.00 applies 0.00-49.99 and Free Shipping Over $50 applies at 50.00+.
  assert.equal(FREE_SHIPPING_THRESHOLDS.CA, 50);
});

test('a market without a verified rate is promised nothing', () => {
  // The United States is commercially suspended and has no verified Canadian
  // -style threshold. It must not inherit one.
  assert.equal(FREE_SHIPPING_THRESHOLDS.US, undefined);
  assert.equal(freeShippingProgress(80, 'US'), null);
  assert.equal(freeShippingProgress(80, ''), null);
  assert.equal(freeShippingProgress(80, null), null);
});

test('an unreadable subtotal says nothing rather than guessing', () => {
  for (const bad of [undefined, null, '', 'abc', NaN, Infinity, -1]) {
    assert.equal(freeShippingProgress(bad, 'CA'), null, `subtotal ${bad}`);
  }
});

test('progress reports the exact remainder in cents', () => {
  assert.deepEqual(freeShippingProgress(34.99, 'CA'), {
    threshold: 50,
    remaining: 15.01,
    qualified: false,
    percent: 70,
  });
  // The float subtraction here is 2.0000000000000018 before rounding.
  assert.equal(freeShippingProgress(47.99, 'CA').remaining, 2.01);
});

test('reaching the threshold qualifies, and going past it stays qualified', () => {
  const exact = freeShippingProgress(50, 'CA');
  assert.equal(exact.qualified, true);
  assert.equal(exact.remaining, 0);
  assert.equal(exact.percent, 100);

  const over = freeShippingProgress(54.98, 'CA');
  assert.equal(over.qualified, true);
  assert.equal(over.remaining, 0);
  // The bar cannot overfill.
  assert.equal(over.percent, 100);
});

test('every locale can render the free-shipping copy', () => {
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    const dict = DICTIONARIES[locale];
    for (const key of [
      'cart_freeship_away',
      'cart_freeship_qualified',
      'cart_freeship_aria',
    ]) {
      assert.ok(dict[key], `${locale}/${key} missing`);
    }
    // The amount is interpolated as a <CurrencyMoney> node, so the
    // placeholder has to survive translation.
    assert.match(dict.cart_freeship_away, /\{amount\}/);
  }
});

test('the cart summary renders the progress and never hard-codes a threshold', async () => {
  const summary = await readFile(
    new URL('../app/components/CartSummary.jsx', import.meta.url),
    'utf8',
  );
  const component = await readFile(
    new URL('../app/components/FreeShippingProgress.jsx', import.meta.url),
    'utf8',
  );

  assert.match(summary, /<FreeShippingProgress cart=\{cart\} \/>/);
  // The promise must come from the one constant, not from a literal in the
  // component. Comments may name the threshold; executable code may not.
  const code = component.replace(/\/\*[\s\S]*?\*\//g, '');
  assert.match(code, /freeShippingProgress\(/);
  assert.doesNotMatch(code, /\b50\b/);
  // Silence is the fallback in every unknown case.
  assert.match(code, /if \(!progress\) return null;/);
});
