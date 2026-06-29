import {redirect} from 'react-router';
import {CHECKOUT_URL_REWRITER} from '~/lib/checkout';
import {warn} from '~/lib/logger';

/**
 * Catchall for Shopify cart permalinks like `/cart/c/{token}`.
 *
 * ## Why this exists
 *
 * With `@inContext(country: CA, language: EN)` (Puchica's locale), the
 * Storefront API returns `Cart.checkoutUrl` shaped for the storefront's
 * custom domain (`{puchica.ca, www.puchica.ca}/cart/c/{token}`). That URL
 * hits the Hydrogen worker, which has **no `/cart/c/{token}` route**, so
 * it 404s. Previous-Connor shipped `CHECKOUT_URL_REWRITER` in
 * `app/lib/checkout.js` and the cart action / drawer / page all run it
 * before exposing the URL to the browser — so the legitimate
 * "add-to-cart → checkout" flow works.
 *
 * But the bad URL can still leak:
 *
 *   1. **Shared-cart links.** Shoppers paste the cart permalink into
 *      chat/email; recipients clicking the link bypass the action.
 *   2. **Stale HTML.** Cached pages from before the rewriter shipped
 *      still hold the bad URL.
 *   3. **Marketing automations.** Email/SMS tools that hardcode the
 *      storefront permalink shape.
 *
 * This catchall rewrites those URLs at the worker, so the bad URL is no
 * longer a dead end regardless of how the shopper got there. Once the
 * Markets/Domains config in Shopify admin is corrected so the Storefront
 * API returns the working URL directly, this route can be removed and
 * the rewriter set to the identity function (per the `lib/checkout.js`
 * docstring).
 *
 * ## Specificity / collision
 *
 * `cart.$lines.jsx` is a more specific dynamic segment and continues to
 * win for `/cart/lines` (splat is the loser when a static or dynamic
 * single-segment match exists). `/cart/c/{token}` — three segments under
 * `/cart/` — falls into this splat. If the splat doesn't match the
 * canonical `/c/{token}` shape, we throw a 404 so the request bubbles
 * to the root catchall (`app/routes/$.jsx`) for the friendly 404 page.
 *
 * ## Status / cache
 *
 * `301` is correct: the bad path is a stable, unfixable shape from
 * Hydrogen's side; permanent caching helps repeat traffic. But
 * `Cache-Control: no-store` so a future fix to Shopify's primary
 * domain mapping propagates fast and we don't have to wait for
 * intermediaries to expire. `noindex,nofollow` per the root catchall
 * convention; these URLs are never canonical and shouldn't accumulate
 * search equity.
 *
 * ## Safety
 *
 * Token regex is strict (`[A-Za-z0-9_-]{4,256}`) so a hostile URL can't
 * inject arbitrary characters into the destination. We also feed the
 * rewriter a reconstructed URL on the storefront's primary host
 * (`https://puchica.ca/...`) regardless of which host Hydrogen was
 * reached on (production, preview, *.myshopify.dev). That way the
 * rewriter's `BAD_STOREFRONT_HOSTS` check fires correctly, env-driven
 * `PUBLIC_CHECKOUT_DOMAIN` is honored, and we don't accidentally trust
 * the inbound Host header.
 */

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request, params}) {
  const splat = params['*'] ?? '';
  const permalinkMatch = splat.match(/^c\/([A-Za-z0-9_-]{4,256})\/?$/);
  if (!permalinkMatch) {
    // Not a /cart/c/{token} shape — unknown cart subpath. Bubble.
    throw new Response('Not found', {
      status: 404,
      headers: {'X-Robots-Tag': 'noindex, nofollow'},
    });
  }

  // Reconstruct the permalink URL on the storefront's primary host so the
  // rewriter's BAD_STOREFRONT_HOSTS check fires regardless of which host
  // Hydrogen was reached on (production, preview, *.myshopify.dev).
  const incoming = new URL(request.url);
  const permalinkUrl = new URL(`/cart/c/${permalinkMatch[1]}`, 'https://puchica.ca');
  // Mirror the source query string (key, _s, _y, discount, etc.).
  permalinkUrl.search = incoming.search;

  const rewritten = CHECKOUT_URL_REWRITER(permalinkUrl.toString());

  if (!rewritten || rewritten === permalinkUrl.toString()) {
    // Rewriter bailed — drift, unknown shape, or missing env. Don't
    // redirect to a half-baked URL; surface a 503 so the issue is
    // visible (the warn() fires to dev console / Oxygen logs).
    warn('cart permalink rewriter returned unchanged/bad', {
      original: permalinkUrl.toString(),
      rewritten,
    });
    throw new Response('Checkout temporarily unavailable', {
      status: 503,
      headers: {
        'Retry-After': '300',
        'X-Robots-Tag': 'noindex, nofollow',
      },
    });
  }

  return redirect(rewritten, {
    status: 301,
    headers: {
      'X-Robots-Tag': 'noindex, nofollow',
      'Cache-Control': 'no-store, max-age=0',
    },
  });
}

/**
 * Default export is required by the route module API but should never
 * render — the loader always redirects. Returning `null` makes accidental
 * renders obvious in the React tree without showing anything.
 */
export default function CartPermalink() {
  return null;
}

/** @typedef {import('./+types/cart.$').Route} Route */
