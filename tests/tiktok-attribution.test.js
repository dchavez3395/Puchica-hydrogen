import assert from 'node:assert/strict';
import test from 'node:test';

import {
  loader,
  TIKTOK_ATTRIBUTION,
  TIKTOK_DESTINATION,
} from '../app/routes/tiktok.js';

test('TikTok bio path redirects to the hero PDP with fixed organic attribution', async () => {
  const response = await loader({
    request: new Request(
      'https://puchica.ca/tiktok?ttclid=example&utm_source=untrusted',
    ),
  });
  const location = new URL(response.headers.get('location'), 'https://puchica.ca');

  assert.equal(response.status, 302);
  assert.equal(location.pathname, TIKTOK_DESTINATION);
  assert.equal(location.searchParams.get('ttclid'), 'example');
  for (const [key, value] of Object.entries(TIKTOK_ATTRIBUTION)) {
    assert.equal(location.searchParams.get(key), value);
  }
});

test('TikTok bio redirect is not cached or indexed', async () => {
  const response = await loader({
    request: new Request('https://puchica.ca/tiktok'),
  });

  assert.match(response.headers.get('cache-control') || '', /no-store/i);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/i);
});
