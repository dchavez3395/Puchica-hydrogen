import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';
import {
  isAllowedMetaEventSourceUrl,
  isAllowedMetaRequestOrigin,
} from '../app/lib/meta-capi.js';

test('Meta CAPI accepts Puchica storefront event source URLs', () => {
  assert.equal(isAllowedMetaEventSourceUrl('https://puchica.ca/'), true);
  assert.equal(
    isAllowedMetaEventSourceUrl(
      'https://www.puchica.ca/fr/products/white-semi-circular-travel-jewelry-case',
    ),
    true,
  );
  assert.equal(isAllowedMetaEventSourceUrl('http://puchica.ca/cart'), true);
  assert.equal(isAllowedMetaEventSourceUrl('https://puchica.shop/cart'), true);
});

test('Meta CAPI rejects malformed and non-Puchica event source URLs', () => {
  assert.equal(isAllowedMetaEventSourceUrl('not-a-url'), false);
  assert.equal(isAllowedMetaEventSourceUrl('https://puchica.ca.example.com/'), false);
  assert.equal(isAllowedMetaEventSourceUrl('https://evil.example/'), false);
  assert.equal(isAllowedMetaEventSourceUrl('javascript:alert(1)'), false);
});

test('Meta CAPI accepts only a matching storefront request origin', () => {
  const request = (url, origin) =>
    new Request(url, {headers: origin ? {origin} : {}});

  assert.equal(
    isAllowedMetaRequestOrigin(
      request('https://puchica.ca/api/meta-event', 'https://puchica.ca'),
    ),
    true,
  );
  assert.equal(
    isAllowedMetaRequestOrigin(
      request('https://puchica.shop/api/meta-event', 'https://puchica.shop'),
    ),
    true,
  );
  assert.equal(
    isAllowedMetaRequestOrigin(
      request('https://puchica.ca/api/meta-event', 'https://evil.example'),
    ),
    false,
  );
  assert.equal(
    isAllowedMetaRequestOrigin(request('https://puchica.ca/api/meta-event')),
    false,
  );
});

test('Meta relay handles malformed attribution cookies defensively', () => {
  const route = readFileSync('app/routes/api.meta-event.jsx', 'utf8');
  assert.match(route, /isAllowedMetaRequestOrigin\(request\)/);
  assert.match(route, /decodeURIComponent\(v\)/);
  assert.match(route, /catch \{[\s\S]*malformed optional attribution cookie/);
});

