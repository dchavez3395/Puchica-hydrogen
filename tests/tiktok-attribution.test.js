import assert from 'node:assert/strict';
import test from 'node:test';

import {loader} from '../app/routes/tiktok.js';
import {
  TIKTOK_ATTRIBUTION,
  TIKTOK_DESTINATION,
  tiktokBioDestinationUrl,
} from '../app/lib/social-bio-links.js';

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

test('TikTok bio lands on the product that actually has TikTok creative', () => {
  // Pinned literals, not the exported constants: the previous target was the
  // jewelry case, which has no TikTok creative, while the live bio and the
  // UGC pack promised the cable case. Deriving expectations from the constant
  // would let that drift back in silently.
  assert.equal(TIKTOK_DESTINATION, '/products/travel-cable-organizer-case');
  assert.equal(TIKTOK_ATTRIBUTION.utm_campaign, 'organic_relaunch_2026_08');
  assert.equal(TIKTOK_ATTRIBUTION.utm_medium, 'organic_social');
});

test('TikTok bio redirect is not cached or indexed', async () => {
  const response = await loader({
    request: new Request('https://puchica.ca/tiktok'),
  });

  assert.match(response.headers.get('cache-control') || '', /no-store/i);
  assert.match(response.headers.get('x-robots-tag') || '', /noindex/i);
});

test('the health check URL is exactly what a bare /tiktok click lands on', async () => {
  // These two had drifted: the route was repointed at the cable case during
  // the organic relaunch and the production health check kept asserting the
  // old jewelry-case URL, so the post-deploy step failed on every run. Deriving
  // both from one module is only half the fix - this pins that the derived
  // string, query order included, is byte-identical to the real redirect.
  const response = await loader({
    request: new Request('https://puchica.ca/tiktok'),
  });
  const landed = new URL(
    response.headers.get('location'),
    'https://puchica.ca',
  ).toString();

  assert.equal(landed, tiktokBioDestinationUrl('https://puchica.ca'));
});

test('the destination URL builder tolerates a trailing slash on the origin', () => {
  assert.equal(
    tiktokBioDestinationUrl('https://puchica.ca/'),
    tiktokBioDestinationUrl('https://puchica.ca'),
  );
});
