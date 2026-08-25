#!/usr/bin/env node
/**
 * Is the live storefront actually visible to Meta?
 *
 * This exists because the answer was "no" for months without anyone noticing,
 * and because the usual ways of checking all give a false pass:
 *
 *   - Shopify admin shows the Facebook & Instagram channel installed. It is.
 *     That channel injects its pixel through Shopify's web-pixels-manager,
 *     which loads on the Online Store publication. puchica.ca is a separate
 *     Hydrogen publication on Oxygen and never loads it.
 *   - The repo contains a working MetaPixel component. It renders null unless
 *     PUBLIC_CUSTOM_META_ENABLED is "true" AND PUBLIC_FACEBOOK_PIXEL_ID is set.
 *   - Local .env is not Oxygen's environment, so a green local run proves
 *     nothing about production.
 *
 * The only honest check is against the deployed page. `fbq` is installed by a
 * client effect and never appears in server HTML, so this does not look for it.
 * It looks for the pixel ID in the serialized root loader payload, which is
 * what MetaPixel receives — present means the env is configured, absent means
 * the storefront is dark to Meta no matter what the admin says.
 *
 * Usage:
 *   node scripts/check-storefront-pixel.mjs
 *   node scripts/check-storefront-pixel.mjs --url https://puchica.ca/products/black-travel-tech-case
 */

import process from 'node:process';

export const DEFAULT_URL =
  'https://puchica.ca/products/black-travel-tech-case';

/**
 * Read analytics wiring out of a deployed page's HTML.
 *
 * Kept as a pure function over the response body so the parsing is testable
 * without a network round trip, and so a future markup change fails a unit
 * test rather than silently reporting a false pass in CI.
 *
 * @param {string} html
 * @returns {{metaPixelId: string|null, ga4MeasurementId: string|null,
 *            hasMetaScript: boolean, hasWebPixelsManager: boolean}}
 */
export function readAnalyticsWiring(html) {
  return {
    metaPixelId: extractLoaderValue(html, 'metaPixelId'),
    ga4MeasurementId: extractLoaderValue(html, 'ga4MeasurementId'),
    hasMetaScript: /connect\.facebook\.net/.test(html),
    hasWebPixelsManager: /web-pixels-manager/.test(html),
  };
}

/**
 * Pull one key out of the serialized loader payload.
 *
 * The payload is escaped differently depending on how it was embedded, so this
 * tolerates both raw and backslash-escaped quotes. A key present with a null
 * value is a real answer - the flag is off - and is reported as null, the same
 * as a key that is absent entirely.
 *
 * @param {string} html
 * @param {string} key
 * @returns {string|null}
 */
function extractLoaderValue(html, key) {
  // React Router streams the payload as a flat key/value sequence, so the real
  // separator is a comma, not a colon: metaPixelId\",\"1616698610095354\".
  // A colon-based JSON matcher looks correct and silently returns null against
  // the actual deployed markup, so both shapes are accepted.
  const patterns = [
    new RegExp(
      `\\\\?["']${key}\\\\?["']\\s*,\\s*\\\\?["']([^"'\\\\,]+)\\\\?["']`,
    ),
    new RegExp(
      `\\\\?["']${key}\\\\?["']\\s*:\\s*\\\\?["']([^"'\\\\,]+)\\\\?["']`,
    ),
  ];

  for (const pattern of patterns) {
    const match = html.match(pattern);
    if (match?.[1] && match[1] !== 'null') return match[1];
  }
  return null;
}

/**
 * @param {{url?: string, fetchImpl?: typeof fetch}} [options]
 */
export async function checkStorefrontPixel({
  url = DEFAULT_URL,
  fetchImpl = fetch,
} = {}) {
  const response = await fetchImpl(url, {
    headers: {'user-agent': 'puchica-pixel-check'},
  });

  if (!response.ok) {
    return {
      url,
      ok: false,
      failures: [`Storefront returned HTTP ${response.status} for ${url}.`],
      warnings: [],
      wiring: null,
    };
  }

  const wiring = readAnalyticsWiring(await response.text());
  const failures = [];
  const warnings = [];

  if (!wiring.metaPixelId) {
    failures.push(
      'No Meta Pixel ID in the storefront payload. Meta receives no browser ' +
        'events from this site - no PageView, no ViewContent, no AddToCart. ' +
        'A Sales campaign has nothing to optimise against and will deliver to ' +
        'whoever is cheapest to reach. Set PUBLIC_CUSTOM_META_ENABLED="true" ' +
        'and PUBLIC_FACEBOOK_PIXEL_ID in the Oxygen environment, redeploy, ' +
        'then confirm in Meta Events Manager -> Test Events.',
    );
  } else {
    // A configured ID is necessary and NOT sufficient, and saying otherwise is
    // how this went unnoticed. MetaPixel loads fbq lazily inside track(), and
    // track() returns early when canTrack() is false - so a fully configured
    // storefront can still install no pixel and emit nothing. Verified live on
    // 2026-08-25: pixel ID present in the payload, `fbq` undefined on the page,
    // zero Facebook scripts, no console errors.
    warnings.push(
      `Pixel ID ${wiring.metaPixelId} is configured, which is necessary but ` +
        'not sufficient. fbq is installed lazily on the first tracked event ' +
        'and suppressed when consent reports false, so configuration alone ' +
        'does not prove events reach Meta. Confirm in Events Manager -> Test ' +
        'Events, or open the storefront and check that `fbq` is a function ' +
        'after adding to cart. This script cannot see either.',
    );
  }

  if (!wiring.ga4MeasurementId) {
    warnings.push(
      'No GA4 measurement ID in the storefront payload. Not required for a ' +
        'Meta test, but it is the only independent read on traffic quality.',
    );
  }

  return {url, ok: failures.length === 0, failures, warnings, wiring};
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const index = process.argv.indexOf('--url');
  const url = index >= 0 ? process.argv[index + 1] : DEFAULT_URL;
  const result = await checkStorefrontPixel({url});

  console.log('Storefront analytics wiring');
  console.log('='.repeat(70));
  console.log(`URL           : ${result.url}`);
  if (result.wiring) {
    console.log(`Meta Pixel ID : ${result.wiring.metaPixelId ?? 'ABSENT'}`);
    console.log(`GA4 ID        : ${result.wiring.ga4MeasurementId ?? 'absent'}`);
  }

  for (const failure of result.failures) console.log(`\nFAIL  ${failure}`);
  for (const warning of result.warnings) console.log(`\nWARN  ${warning}`);
  if (result.ok && !result.warnings.length) console.log('\nOK    Meta is receiving browser events.');

  process.exitCode = result.ok ? 0 : 1;
}
