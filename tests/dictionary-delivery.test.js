import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

import {getRequestDictionary} from '../app/lib/dictionaries.server.js';

test('server selects one complete request dictionary with English fallback', () => {
  const french = getRequestDictionary('FR');
  assert.equal(french.locale_market_ca, 'Canada');
  assert.ok(french.product_add_to_cart);
  assert.ok(french.pdp_meta_description_fallback);
});

test('client translation helper does not bundle all locale dictionaries', () => {
  const helper = readFileSync('app/lib/t.js', 'utf8');
  const productRoute = readFileSync('app/routes/products.$handle.jsx', 'utf8');
  const rootRoute = readFileSync('app/root.jsx', 'utf8');

  assert.doesNotMatch(helper, /lib\/dictionaries/);
  assert.doesNotMatch(productRoute, /lib\/dictionaries/);
  assert.match(rootRoute, /lib\/dictionaries\.server/);
  assert.match(rootRoute, /dictionary: getRequestDictionary/);
});
