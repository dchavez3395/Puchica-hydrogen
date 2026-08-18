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

test('account mutations keep provider errors out of customer-facing UI', () => {
  const profile = readFileSync('app/routes/account.profile.jsx', 'utf8');
  const addresses = readFileSync('app/routes/account.addresses.jsx', 'utf8');

  assert.match(profile, /logError\('customer profile update failed'/);
  assert.match(profile, /error: 'account_profile_update_error'/);
  assert.match(profile, /t\(action\.error\)/);
  assert.doesNotMatch(profile, /\{error: error\.message, customer: null\}/);

  for (const key of [
    'account_address_create_error',
    'account_address_update_error',
    'account_address_delete_error',
  ]) {
    assert.match(addresses, new RegExp(key));
  }
  assert.match(addresses, /<small>\{t\(error\)\}<\/small>/);
  assert.doesNotMatch(addresses, /\{error: \{\[addressId\]: error\.message\}\}/);
});
