import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {
  initialSetQuantity,
  setSizesFor,
  setTotal,
} from '../app/lib/set-quantity.js';
import {getRequestDictionary} from '../app/lib/dictionaries.server.js';

test('pendants offer one, a pair and three; sconces one and a pair', () => {
  assert.deepEqual(setSizesFor(true), [1, 2, 3]);
  assert.deepEqual(setSizesFor(false), [1, 2]);
});

test('?qty= only selects an offered set size', () => {
  assert.equal(initialSetQuantity('2', [1, 2, 3]), 2);
  assert.equal(initialSetQuantity('3', [1, 2, 3]), 3);
  assert.equal(initialSetQuantity('3', [1, 2]), 1);
  for (const raw of [null, '', '0', '-2', '2.5', '99', 'abc']) {
    assert.equal(initialSetQuantity(raw, [1, 2, 3]), 1, String(raw));
  }
});

test('set totals are exact in cents', () => {
  assert.deepEqual(setTotal({amount: '74.99', currencyCode: 'CAD'}, 3), {
    amount: '224.97',
    currencyCode: 'CAD',
  });
  assert.equal(setTotal({amount: '89.99', currencyCode: 'CAD'}, 2).amount, '179.98');
  assert.equal(setTotal({amount: '84.99', currencyCode: 'CAD'}, 1).amount, '84.99');
});

test('the set picker is translated in every supported language', () => {
  for (const language of ['EN', 'FR', 'ES', 'PT_BR']) {
    const d = getRequestDictionary(language);
    for (const key of [
      'product_set_legend',
      'product_set_1',
      'product_set_2',
      'product_set_3',
      'product_set_hint_pendant',
      'product_set_hint_sconce',
    ]) {
      assert.ok(d[key], `${language} lacks ${key}`);
    }
  }
});

test('the set copy never claims a discount', () => {
  const src = readFileSync('app/lib/dictionaries.js', 'utf8');
  const lines = src.split('\n').filter((l) => /product_set_/.test(l));
  assert.equal(lines.length, 24);
  for (const line of lines) {
    assert.doesNotMatch(line, /save|off|%|sale|deal|économ|ahorr|economi|rabais|descuento|desconto/i, line);
  }
});
