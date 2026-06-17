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
 * path: `https://puchica-2.myshopify.com/checkouts/cn/{token}/{locale}?…`.
 * Verified live — that URL returns 200 and serves the real Express checkout
 * (Shop Pay / PayPal / G Pay / shipping / payment).
 *
 * ## How to remove
 *
 * Once the Markets / Domains config in Shopify admin is corrected so the
 * Storefront API returns the working URL directly, set
 * `CHECKOUT_URL_REWRITER` to the identity function `url => url` and this
 * becomes a no-op. The two callers (`CartSummary`, `cart.$lines`) won't
 * need changes.
 *
 * @param {string | null | undefined} url  The Cart.checkoutUrl value.
 * @returns {string | null | undefined}    A URL that actually serves checkout,
 *   or the input if it was null/undefined/empty or already correct.
 */
export const CHECKOUT_URL_REWRITER = (url) => {
  if (!url) return url;

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    // Not a parseable URL — return as-is and let the browser handle it.
    return url;
  }

  // The known-bad storefront host that Hydrogen's @inContext(CA, EN) returns.
  const BAD_STOREFRONT_HOSTS = new Set(['puchica.ca', 'www.puchica.ca']);

  if (!BAD_STOREFRONT_HOSTS.has(parsed.host)) {
    // Not the storefront host — leave it alone (e.g. already on a checkout host).
    return url;
  }

  // Extract the cart token from /cart/c/{token}.
  const cartTokenMatch = parsed.pathname.match(/^\/cart\/c\/([^/]+)\/?$/);
  if (!cartTokenMatch) {
    // Different path shape we don't recognize — don't break it.
    return url;
  }
  const cartToken = cartTokenMatch[1];

  // Build the working checkout URL. `en-ca` matches the @inContext the
  // Hydrogen storefront uses (see app/lib/context.js: i18n: EN, country: CA).
  // If/when we add more locales, this should consult the cart's @inContext.
  const rewritten = new URL(
    `https://puchica-2.myshopify.com/checkouts/cn/${encodeURIComponent(cartToken)}/en-ca`,
  );

  // Preserve the query string (key, _s, _y, discount, etc.).
  parsed.searchParams.forEach((value, key) => {
    rewritten.searchParams.append(key, value);
  });

  return rewritten.toString();
};
