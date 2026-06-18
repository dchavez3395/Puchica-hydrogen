/**
 * Rewrites a Cart.checkoutUrl so it actually serves checkout.
 *
 * ## Why this exists
 *
 * `Cart.checkoutUrl` from the Storefront API is meant to be a URL the user
 * follows straight into Shopify's hosted checkout. The path is conventionally
 * `/cart/c/{token}?key=…` and the host is whatever the store has configured
 * as the "primary storefront domain" for the cart's `@inContext` (country,
 * language) combination.
 *
 * For Puchica, the Storefront API returns checkoutUrl with host `puchica.ca`
 * (the storefront's custom domain, served by Hydrogen on Oxygen) and the
 * `/cart/c/{token}?…` path. Two problems:
 *
 *   1. `puchica.ca/cart/c/{token}` hits the Hydrogen app, which has no
 *      `/cart/c/{token}` route, so it 404s.
 *   2. `puchica-2.myshopify.com/cart/c/{token}` (the actual primary domain)
 *      302-redirects to `puchica.ca/cart/c/{token}` for the same reason.
 *
 * The store's working checkout URL is on a different host AND a different
 * path: `https://{PUBLIC_CHECKOUT_DOMAIN}/checkouts/cn/{token}/{locale}?…`.
 * That URL returns 200 and serves the real Express checkout (Shop Pay /
 * PayPal / G Pay / shipping / payment).
 *
 * ## Control surface (env vars, set in `.env`)
 *
 *   - `PUBLIC_CHECKOUT_DOMAIN` (default: `puchica-2.myshopify.com`)
 *       The myshopify.com host that actually serves checkout. We
 *       historically hardcoded this; making it env-driven means a
 *       store-rename or duplicate-store migration can't silently
 *       break checkout.
 *   - `PUBLIC_CHECKOUT_LOCALE` (default: `en-ca`)
 *       The locale segment in the working checkout path. Should match
 *       the cart's `@inContext` (country, language). When multi-locale
 *       ships, this should be derived per-request, not env.
 *
 * ## Self-observability
 *
 * In development only, the rewriter logs a warning when the input URL
 * looks like the known-bad storefront host but doesn't match the
 * `/cart/c/{token}` shape. This catches drift early (someone changed
 * the Storefront API path convention, or Markets flipped a domain)
 * without spamming the shopper's DevTools in production.
 *
 * ## Resolution
 *
 * On `www.puchica.ca` Hydrogen is live and the Storefront API still returns
 * the same `/cart/c/{token}` checkoutUrl shape. The Hydrogen worker has no
 * `/cart/c/{token}` route, so the rewriter below is still required even
 * with the apex→www redirect in place. Once the Markets/Domains config in
 * Shopify admin is corrected so the Storefront API returns the working
 * URL directly (or the Hydrogen worker is updated to handle `/cart/c/{token}`
 * and proxy to the checkout host), set `CHECKOUT_URL_REWRITER` to the
 * identity function `url => url` and this becomes a no-op. The two callers
 * (`CartSummary`, `cart.jsx` action) won't need changes.
 *
 * @param {string | null | undefined} url  The Cart.checkoutUrl value.
 * @returns {string | null | undefined}    A URL that actually serves checkout,
 *   or the input if it was null/undefined/empty or already correct.
 */

import {warn} from '~/lib/logger';

// Read once at module load. Hydrogen surfaces these from `.env` into
// `process.env` (Oxygen) and `import.meta.env` (Vite dev). We try
// `import.meta.env` first because Vite tree-shakes it correctly in
// dev/test, and fall back to `process.env` for the Oxygen runtime
// where `import.meta.env` may not be hydrated for non-VITE_ vars.
function readEnv(key, fallback) {
  try {
    const v = import.meta.env?.[key];
    if (v) return v;
  } catch {
    /* import.meta.env unavailable */
  }
  if (typeof process !== 'undefined' && process.env && process.env[key]) {
    return process.env[key];
  }
  return fallback;
}

const CHECKOUT_DOMAIN = readEnv('PUBLIC_CHECKOUT_DOMAIN', 'puchica-2.myshopify.com');
const CHECKOUT_LOCALE = readEnv('PUBLIC_CHECKOUT_LOCALE', 'en-ca');

// The known-bad storefront host that Hydrogen's @inContext(CA, EN) returns.
const BAD_STOREFRONT_HOSTS = new Set(['puchica.ca', 'www.puchica.ca']);

export const CHECKOUT_URL_REWRITER = (url) => {
  if (!url) return url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    // Not a parseable URL — return as-is and let the browser handle it.
    return url;
  }

  if (!BAD_STOREFRONT_HOSTS.has(parsed.host)) {
    // Not the storefront host — leave it alone (e.g. already on a checkout host).
    return url;
  }

  // Extract the cart token from /cart/c/{token}.
  const cartTokenMatch = parsed.pathname.match(/^\/cart\/c\/([^/]+)\/?$/);
  if (!cartTokenMatch) {
    // Same host as the storefront but a path we don't recognize. This
    // is the drift case: the Storefront API changed shape, or someone
    // wired a different route. Log once so it's visible in dev.
    warn(
      'checkout rewriter bypass: host matches storefront but path shape unexpected',
      {host: parsed.host, pathname: parsed.pathname},
    );
    return url;
  }
  const cartToken = cartTokenMatch[1];

  // Build the working checkout URL. `en-ca` matches the @inContext the
  // Hydrogen storefront uses (see app/lib/context.js: i18n: EN, country: CA).
  // If/when we add more locales, this should consult the cart's @inContext.
  const rewritten = new URL(
    `https://${CHECKOUT_DOMAIN}/checkouts/cn/${encodeURIComponent(cartToken)}/${CHECKOUT_LOCALE}`,
  );

  // Preserve the query string (key, _s, _y, discount, etc.).
  parsed.searchParams.forEach((value, key) => {
    rewritten.searchParams.append(key, value);
  });

  return rewritten.toString();
};
