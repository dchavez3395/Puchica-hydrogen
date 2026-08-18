import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

test('customer account navigation and redirects preserve the active locale', () => {
  const layout = readFileSync('app/routes/account.jsx', 'utf8');
  const index = readFileSync('app/routes/account._index.jsx', 'utf8');
  const fallback = readFileSync('app/routes/account.$.jsx', 'utf8');
  const logout = readFileSync('app/routes/account_.logout.jsx', 'utf8');
  const orders = readFileSync('app/routes/account.orders._index.jsx', 'utf8');
  const order = readFileSync('app/routes/account.orders.$id.jsx', 'utf8');

  assert.match(layout, /LocalizedNavLink as NavLink/);
  assert.match(layout, /action=\{localize\('\/account\/logout'\)\}/);
  assert.match(orders, /LocalizedLink as Link/);
  for (const source of [index, fallback, logout, order]) {
    assert.match(source, /localizePath\(/);
    assert.doesNotMatch(source, /redirect\(['"]\/(?:account|)['"]/);
  }
});
