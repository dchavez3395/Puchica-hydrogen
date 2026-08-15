import test from 'node:test';
import assert from 'node:assert/strict';
import {isAllowedMetaEventSourceUrl} from '../app/lib/meta-capi.js';

test('Meta CAPI accepts Puchica storefront event source URLs', () => {
  assert.equal(isAllowedMetaEventSourceUrl('https://puchica.ca/'), true);
  assert.equal(
    isAllowedMetaEventSourceUrl(
      'https://www.puchica.ca/fr/products/travel-cable-organizer-case',
    ),
    true,
  );
  assert.equal(isAllowedMetaEventSourceUrl('http://puchica.ca/cart'), true);
});

test('Meta CAPI rejects malformed and non-Puchica event source URLs', () => {
  assert.equal(isAllowedMetaEventSourceUrl('not-a-url'), false);
  assert.equal(isAllowedMetaEventSourceUrl('https://puchica.ca.example.com/'), false);
  assert.equal(isAllowedMetaEventSourceUrl('https://evil.example/'), false);
  assert.equal(isAllowedMetaEventSourceUrl('javascript:alert(1)'), false);
});

