import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const lineItem = readFileSync('app/components/CartLineItem.jsx', 'utf8');
const fragments = readFileSync('app/lib/fragments.js', 'utf8');

test('a cart line falls back to the product image when the variant has none', () => {
  // 15 of 20 variants had no image on 2026-09-18, so the cart page and the
  // drawer rendered an empty box next to the title.
  assert.match(lineItem, /merchandise\.image \|\| product\.featuredImage/);
});

test('both cart line fragments request the product featured image', () => {
  const matches = fragments.match(/vendor\s+featuredImage \{/g) || [];
  assert.equal(matches.length, 2, 'CartLine and CartLineComponent both need featuredImage');
});
