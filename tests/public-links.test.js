import test from 'node:test';
import assert from 'node:assert/strict';

import {internalLinks} from '../scripts/check-public-links.mjs';

test('public link crawler keeps unique same-origin customer paths', () => {
  const html = `
    <a href="/collections/all">Shop</a>
    <a href="/collections/all#travel">Duplicate</a>
    <a href="products/case?q=1">Case</a>
    <a href="mailto:hello@puchica.ca">Email</a>
    <a href="https://example.com/elsewhere">External</a>
  `;
  assert.deepEqual(
    internalLinks(html, 'https://puchica.ca/fr/'),
    ['/collections/all', '/fr/products/case?q=1'],
  );
});
