import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

/**
 * Why this file exists.
 *
 * On 2026-08-25 puchica.ca was serving a valid Meta pixel ID, reporting consent
 * granted, matching none of the bot patterns, and logging no errors — and `fbq`
 * was still undefined twenty seconds after load, with zero Facebook scripts on
 * the page. The storefront had been invisible to Meta for the entire paid
 * period.
 *
 * The cause is a stale closure. MetaPixel's effect lists `canTrack` as a
 * dependency, so React re-runs it when Hydrogen swaps in the real consent
 * function. But the effect's first line is an `installed` guard, which makes
 * every re-run a no-op. The subscriptions registered on the first run keep
 * calling the mount-time `canTrack` forever, and Hydrogen's mount-time
 * `canTrack` returns false because the Customer Privacy API has not answered
 * yet. `track()` returns early, and since `fbq` is loaded lazily *inside*
 * `track()`, the pixel is never installed at all.
 *
 * These are source assertions rather than render tests because the failure is
 * structural: any future edit that reintroduces a direct `canTrack()` call
 * inside the guarded effect reintroduces a silent, invisible outage that costs
 * real ad money and looks healthy from the admin, the repo and the network tab.
 */

const source = await readFile(
  new URL('../app/components/MetaPixel.jsx', import.meta.url),
  'utf8',
);

test('consent is read through a ref, not captured at mount', () => {
  assert.match(
    source,
    /const canTrackRef = useRef\(canTrack\);\s*\n\s*canTrackRef\.current = canTrack;/,
    'canTrack must be mirrored into a ref on every render',
  );
});

test('allowed() consults the ref rather than the captured binding', () => {
  const allowedBody = source.slice(
    source.indexOf('const allowed = ()'),
    source.indexOf('const forwardToCapi'),
  );

  assert.ok(allowedBody.length > 0, 'allowed() not found');
  assert.match(allowedBody, /canTrackRef\.current/);
  assert.doesNotMatch(
    allowedBody,
    /typeof canTrack === 'function' \? canTrack\(\)/,
    'reading canTrack directly re-creates the stale-closure outage',
  );
});

test('the install guard is still present, so subscriptions are not duplicated', () => {
  // The guard is not the bug — dropping it would re-subscribe on every consent
  // change and double-count events. The fix keeps the guard and moves the
  // moving part behind a ref.
  assert.match(source, /if \(installed\.current\) return;/);
});

test('fbq is loaded lazily inside track, which is why a consent stall hides the pixel entirely', () => {
  const trackBody = source.slice(
    source.indexOf('const track = (event'),
    source.indexOf("subscribe('page_viewed'"),
  );

  assert.match(trackBody, /if \(!allowed\(\)\) return;/);
  assert.match(trackBody, /loadFbq\(pixelId\)/);
});

test('MetaPixel does not fire Purchase, so enabling it cannot double-count', () => {
  // The measurement gate in PR #15 fails hard on PUBLIC_CUSTOM_META_ENABLED
  // because browser and server Purchase events would collide. That hazard is
  // real in general and absent here: Purchase is left to Shopify's checkout
  // integration. This test pins that, so the gate's premise stays checkable.
  assert.doesNotMatch(source, /track\('Purchase'/);
  assert.match(source, /track\('PageView'\)/);
  assert.match(source, /track\('ViewContent'/);
  assert.match(source, /track\('AddToCart'/);
});

test('InitiateCheckout is left to the Shopify checkout, not double-sent', () => {
  // Both halves of the funnel now report into one dataset. Shopify's checkout
  // already emits InitiateCheckout there with its own event_id, so a storefront
  // copy could never dedupe against it and would roughly double the count -
  // the signal campaigns must optimize on while purchase volume is too low.
  assert.doesNotMatch(source, /track\('InitiateCheckout'/);
  assert.doesNotMatch(source, /subscribe\('custom_checkout_started'/);
});

test('every browser event carries an event ID and is mirrored to CAPI', () => {
  assert.match(source, /fbq\('track', event, payload, \{eventID: eventId\}\)/);
  assert.match(source, /forwardToCapi\(event, payload, eventId\)/);
});
