import {warn} from './logger.js';
import {cartCheckoutCountry} from './cart-market.js';

const CANONICAL_CHECKOUT_DOMAIN = 'checkout.puchica.ca';
const LEGACY_CHECKOUT_DOMAINS = new Set([
  'ug91ve-sz.myshopify.com',
  'puchica-2.myshopify.com',
]);
const STOREFRONT_DOMAINS = new Set([
  'puchica.ca',
  'www.puchica.ca',
  'shop.puchica.ca',
  // Shopify currently shapes Cart.checkoutUrl on this store-owned domain.
  // It is accepted only as a cart-permalink source and is always rewritten
  // onto the dedicated checkout host before it reaches a shopper.
  'puchica.shop',
  'www.puchica.shop',
]);

/**
 * @typedef {{
 *   checkoutDomain?: string,
 *   country?: string,
 *   language?: string,
 * }} CheckoutRewriteOptions
 */

/**
 * Build the {@link CheckoutRewriteOptions} for a cart from the request's
 * storefront + env context. Checkout localization follows the cart's
 * accepted buyer identity (not the market originally requested by the
 * browser before Shopify applied a fallback), so the cart page and the
 * cart drawer produce the same rewritten URL for the same cart.
 *
 * Callers that don't have a Hydrogen `storefront`/`env` in scope (e.g.
 * the {@link CartSummary} drawer component) pass equivalent objects
 * reconstructed from root loader data:
 *   `buildCheckoutRewriteOptions(cart, {i18n: selectedLocale}, {PUBLIC_CHECKOUT_DOMAIN: consent.checkoutDomain})`.
 *
 * @param {any} cart Cart fragment (may be null/undefined for permalink redirects).
 * @param {{ i18n?: { country?: string; language?: string } }} storefront
 * @param {{ PUBLIC_CHECKOUT_DOMAIN?: string }} env
 * @returns {CheckoutRewriteOptions}
 */
export function buildCheckoutRewriteOptions(cart, storefront, env) {
  const i18n = storefront?.i18n || {};
  return {
    language: i18n.language,
    country: cartCheckoutCountry(cart, i18n.country),
    checkoutDomain: env?.PUBLIC_CHECKOUT_DOMAIN,
  };
}

/**
 * Convert Shopify's Hydrogen cart permalink into the dedicated checkout URL.
 * Unknown hosts, malformed paths, and non-HTTPS destinations fail closed.
 * Locale and configuration are supplied per request so Markets context is
 * preserved instead of being frozen at module load.
 *
 * @param {string | null | undefined} url
 * @param {CheckoutRewriteOptions} [options]
 * @returns {string | null | undefined}
 */
export function CHECKOUT_URL_REWRITER(
  url,
  options = /** @type {CheckoutRewriteOptions} */ ({}),
) {
  if (!url) return url;

  const resolvedOptions = {
    checkoutDomain: undefined,
    country: undefined,
    language: undefined,
    ...options,
  };

  let parsed;
  try {
    parsed = new URL(url);
  } catch {
    return null;
  }

  if (parsed.protocol !== 'https:') return null;

  const configuredDomain = String(
    resolvedOptions.checkoutDomain || CANONICAL_CHECKOUT_DOMAIN,
  ).toLowerCase();
  const checkoutDomain = LEGACY_CHECKOUT_DOMAINS.has(configuredDomain)
    ? CANONICAL_CHECKOUT_DOMAIN
    : configuredDomain;

  if (parsed.hostname === checkoutDomain) return parsed.toString();
  // Shopify can return the cart permalink on either the public storefront
  // host or the store's historical `myshopify.com` host. Both are trusted
  // inputs, but neither is sent to the shopper directly: the token is always
  // moved onto the dedicated, approved checkout domain below.
  const isApprovedCartHost =
    STOREFRONT_DOMAINS.has(parsed.hostname) ||
    LEGACY_CHECKOUT_DOMAINS.has(parsed.hostname);
  if (!isApprovedCartHost) {
    warn('checkout rewriter rejected unapproved host', {
      host: parsed.hostname,
    });
    return null;
  }

  const tokenMatch = parsed.pathname.match(
    /^\/cart\/c\/([A-Za-z0-9_-]{4,256})\/?$/,
  );
  if (!tokenMatch) {
    warn('checkout rewriter rejected unexpected path', {
      host: parsed.hostname,
      pathname: parsed.pathname,
    });
    return null;
  }

  const language = String(resolvedOptions.language || 'EN')
    .toLowerCase()
    .replace('_', '-');
  const country = String(resolvedOptions.country || 'US').toLowerCase();
  const locale = `${language}-${country}`;
  const rewritten = new URL(
    `https://${checkoutDomain}/checkouts/cn/${encodeURIComponent(tokenMatch[1])}/${locale}`,
  );
  parsed.searchParams.forEach((value, key) => {
    rewritten.searchParams.append(key, value);
  });
  return rewritten.toString();
}
