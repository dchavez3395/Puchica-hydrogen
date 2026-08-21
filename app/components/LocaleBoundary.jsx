import {Outlet, redirect} from 'react-router';
import {PREFIXED_LANGS} from '~/lib/i18n';

/**
 * Optional-locale route boundary.
 *
 * Mounted in `app/routes.js` as the parent of every file route under an
 * optional `:locale?` segment, so the app serves:
 *
 *   /products/x         -> English  (no prefix; params.locale === undefined)
 *   /fr/products/x      -> 308 /products/x
 *   /es/products/x      -> 308 /products/x
 *   /pt-br/products/x   -> 308 /products/x
 *
 * The launch storefront is English-only. This boundary redirects former known
 * locale prefixes and rejects any other value occupying the locale slot.
 *
 * English has no prefix, so `params.locale === undefined` is always valid.
 *
 * ── TEST THIS (needs `npm run dev`) ────────────────────────────────────────
 *  1. `/` and `/products/<h>` render English exactly as before.
 *  2. `/fr`, `/fr/products/<h>`, `/es/...`, `/pt-br/...` redirect to English.
 *  3. `/xx/products/<h>` (bogus locale) returns 404, not English.
 *  4. Single-segment non-locale paths (`/some-shopify-page`) still resolve the
 *     way they did before (watch the `$.jsx` splat + storefrontRedirect path —
 *     this is the edge case most likely to regress).
 */
export async function loader({params, request}) {
  const locale = params.locale?.toLowerCase();
  if (locale && !PREFIXED_LANGS.includes(locale)) {
    throw new Response('Not Found', {status: 404});
  }
  if (locale) {
    const url = new URL(request.url);
    const englishPath = url.pathname.slice(params.locale.length + 1) || '/';
    return redirect(`${englishPath}${url.search}`, {
      status: 308,
      headers: {'Cache-Control': 'public, max-age=3600'},
    });
  }
  return null;
}

export default function LocaleBoundary() {
  return <Outlet />;
}
