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


test('the browser guarantees an _fbp cookie before mirroring an event to CAPI', () => {
  // Test events 2026-09-20: Meta processed a server ViewContent that carried
  // _fbp and silently dropped the identical one without it. Page-load events
  // fire before fbevents.js has set the cookie, so the storefront sets one in
  // Meta's own format first; the pixel reuses an existing cookie.
  const pixel = readFileSync('app/components/MetaPixel.jsx', 'utf8');
  assert.match(pixel, /const ensureFbpCookie = \(\) => \{/);
  assert.match(pixel, /`fb\.1\.\$\{Date\.now\(\)\}\.\$\{Math\.floor\(Math\.random\(\) \* 1e10\)\}`/);
  assert.match(pixel, /_fbp=\$\{value\}; path=\/; max-age=7776000; SameSite=Lax/);
  const forward = pixel.indexOf('const forwardToCapi');
  const call = pixel.indexOf('ensureFbpCookie();', forward);
  const send = pixel.indexOf('sendBeacon', forward);
  assert.ok(call > forward && call < send, 'cookie is ensured before the beacon is sent');
});
