import assert from 'node:assert/strict';
import test from 'node:test';

import {
  checkStorefrontPixel,
  readAnalyticsWiring,
} from '../scripts/check-storefront-pixel.mjs';

/**
 * The shape the storefront actually serves: loader values are embedded in the
 * streamed payload with escaped quotes, and `fbq` is nowhere in server HTML
 * because MetaPixel installs it from a client effect. A checker that looked for
 * `fbq` would fail even on a correctly configured store.
 */
const CONFIGURED = String.raw`<!DOCTYPE html><html><body><script>window.__reactRouterContext.streamController.enqueue("[\"metaPixelId\",\"1234567890\",\"ga4MeasurementId\",\"G-KTMM6KWWT6\"]");</script></body></html>`;

const DARK = String.raw`<!DOCTYPE html><html><body><script>window.__reactRouterContext.streamController.enqueue("[\"metaPixelId\",null,\"ga4MeasurementId\",\"G-KTMM6KWWT6\"]");</script></body></html>`;

function stubFetch(body, {ok = true, status = 200} = {}) {
  return async () => ({ok, status, text: async () => body});
}

test('reads the pixel id out of an escaped loader payload', () => {
  const wiring = readAnalyticsWiring(CONFIGURED);
  assert.equal(wiring.metaPixelId, '1234567890');
  assert.equal(wiring.ga4MeasurementId, 'G-KTMM6KWWT6');
});

test('a null pixel id reads as absent, not as a parse failure', () => {
  assert.equal(readAnalyticsWiring(DARK).metaPixelId, null);
});

test('handles unescaped payloads too', () => {
  const wiring = readAnalyticsWiring('{"metaPixelId":"999","ga4MeasurementId":null}');
  assert.equal(wiring.metaPixelId, '999');
  assert.equal(wiring.ga4MeasurementId, null);
});

test('matches the real deployed payload shape, which is comma-separated', () => {
  // Captured from puchica.ca on 2026-08-25. A colon-based JSON matcher returns
  // null against this and would report a configured pixel as missing.
  const real = String.raw`...\"metaPixelId\",\"1616698610095354\",\"ga4MeasurementId\",\"G-KTMM6KWWT6\",\"selectedLocale\"...`;
  assert.equal(readAnalyticsWiring(real).metaPixelId, '1616698610095354');
  assert.equal(readAnalyticsWiring(real).ga4MeasurementId, 'G-KTMM6KWWT6');
});

test('does not depend on fbq, which never appears in server HTML', () => {
  assert.ok(!CONFIGURED.includes('fbq'));
  assert.equal(readAnalyticsWiring(CONFIGURED).metaPixelId, '1234567890');
});

test('a storefront with no pixel id fails the check', async () => {
  const result = await checkStorefrontPixel({fetchImpl: stubFetch(DARK)});
  assert.equal(result.ok, false);
  assert.equal(result.failures.length, 1);
  assert.match(result.failures[0], /PUBLIC_CUSTOM_META_ENABLED/);
});

test('a configured storefront passes but is warned about, not declared healthy', async () => {
  const result = await checkStorefrontPixel({fetchImpl: stubFetch(CONFIGURED)});
  assert.equal(result.ok, true);
  assert.deepEqual(result.failures, []);
  // Configuration is necessary and not sufficient - fbq installs lazily and is
  // suppressed when consent reports false. A silent pass here is the exact
  // false green that let a dark pixel run for months.
  assert.equal(result.warnings.length, 1);
  assert.match(result.warnings[0], /not sufficient/);
});

test('a missing GA4 id warns but does not fail', async () => {
  const body = String.raw`[\"metaPixelId\",\"1\",\"ga4MeasurementId\",null]`;
  const result = await checkStorefrontPixel({fetchImpl: stubFetch(body)});
  assert.equal(result.ok, true);
  assert.equal(result.warnings.length, 2);
});

test('an unreachable storefront fails rather than reporting a false pass', async () => {
  const result = await checkStorefrontPixel({
    fetchImpl: stubFetch('', {ok: false, status: 503}),
  });
  assert.equal(result.ok, false);
  assert.match(result.failures[0], /503/);
});
