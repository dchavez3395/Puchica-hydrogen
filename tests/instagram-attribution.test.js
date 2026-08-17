import assert from 'node:assert/strict';
import test from 'node:test';

import {
  INSTAGRAM_ATTRIBUTION,
  INSTAGRAM_DESTINATION,
  loader,
} from '../app/routes/instagram.js';

test('Instagram bio path redirects to the storefront with fixed attribution', async () => {
  const response = await loader({
    request: new Request(
      'https://puchica.ca/instagram?fbclid=example&utm_source=untrusted',
    ),
  });
  const location = new URL(response.headers.get('location'), 'https://puchica.ca');

  assert.equal(response.status, 302);
  assert.equal(location.pathname, INSTAGRAM_DESTINATION);
  assert.equal(location.searchParams.get('fbclid'), 'example');
  for (const [key, value] of Object.entries(INSTAGRAM_ATTRIBUTION)) {
    assert.equal(location.searchParams.get(key), value);
  }
});

test('Instagram bio redirect is not cached or indexed', async () => {
  const response = await loader({
    request: new Request('https://puchica.ca/instagram'),
  });

  assert.match(response.headers.get('cache-control') || '', /no-store/i);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/i);
});
