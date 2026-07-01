import {Outlet} from 'react-router';
import {PREFIXED_LANGS} from '~/lib/i18n';

/**
 * Optional-locale route boundary.
 *
 * Mounted in `app/routes.js` as the parent of every file route under an
 * optional `:locale?` segment, so the app serves:
 *
 *   /products/x         -> English  (no prefix; params.locale === undefined)
 *   /fr/products/x      -> French   (params.locale === 'fr')
 *   /es/products/x      -> Spanish
 *   /pt-br/products/x   -> Portuguese (BR)
 *
 * The actual language the Storefront API queries with is resolved from the URL
 * in `getLocaleFromRequest` (app/lib/i18n.js) — this boundary's only job is to
 * REJECT a first path segment that looks like a locale slot but isn't one of
 * our shipped languages, so those URLs 404 (and then fall to Shopify redirect
 * handling in server.js) instead of silently rendering English content under a
 * junk prefix.
 *
 * English has no prefix, so `params.locale === undefined` is always valid.
 *
 * ── TEST THIS (needs `npm run dev`) ────────────────────────────────────────
 *  1. `/` and `/products/<h>` render English exactly as before.
 *  2. `/fr`, `/fr/products/<h>`, `/es/...`, `/pt-br/...` render translated.
 *  3. `/xx/products/<h>` (bogus locale) returns 404, not English.
 *  4. Single-segment non-locale paths (`/some-shopify-page`) still resolve the
 *     way they did before (watch the `$.jsx` splat + storefrontRedirect path —
 *     this is the edge case most likely to regress).
 */
export async function loader({params}) {
  const locale = params.locale?.toLowerCase();
  if (locale && !PREFIXED_LANGS.includes(locale)) {
    throw new Response('Not Found', {status: 404});
  }
  return null;
}

export default function LocaleBoundary() {
  return <Outlet />;
}
