import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {DICTIONARIES} from '../app/lib/dictionaries.js';

test('cart removal refreshes the drawer and route data', async () => {
  const source = await readFile(
    new URL('../app/components/CartLineItem.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /CartLineRemoveSubmitButton/);
  assert.match(source, /puchica:cart-updated/);
  assert.match(source, /revalidator\.revalidate\(\)/);
});

test('closed mega menu is isolated from keyboard focus', async () => {
  const source = await readFile(
    new URL('../app/components/MegaMenu.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /inert=\{open \? undefined : ''\}/);
});

test('direct cart visits publish the native Hydrogen cart-view event', async () => {
  const source = await readFile(
    new URL('../app/routes/cart.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /<Analytics\.CartView\s*\/>/);
});

test('missing checkout URLs remain recoverable in every locale', async () => {
  const source = await readFile(
    new URL('../app/components/CartSummary.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /if \(disabled\) return null/);
  assert.match(source, /window\.location\.reload\(\)/);
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    assert.ok(DICTIONARIES[locale].cart_checkout_retry);
  }
});
