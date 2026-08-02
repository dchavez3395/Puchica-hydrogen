import {resolveStorefrontLocale} from './i18n.js';

const CART_MARKET_RESOLUTION_QUERY = `#graphql
  query CartMarketResolution(
    $country: CountryCode!
    $language: LanguageCode!
  ) @inContext(country: $country, language: $language) {
    localization {
      country {
        isoCode
        currency { isoCode }
      }
      availableCountries {
        isoCode
        currency { isoCode }
      }
    }
  }
`;

/**
 * Shopify can silently fall back when a requested market is not published.
 * Cart mutations must use the market Shopify actually resolved, otherwise a
 * U.S.-priced page can create a Canadian zero-quantity ghost line.
 *
 * @param {any} storefront
 * @returns {Promise<string>}
 */
export async function resolveCartBuyerCountry(storefront) {
  const requestedLocale = storefront.i18n;
  const data = await storefront.query(CART_MARKET_RESOLUTION_QUERY, {
    variables: {
      country: requestedLocale.country,
      language: requestedLocale.language,
    },
    cache: storefront.CacheNone(),
  });

  return resolveStorefrontLocale(
    requestedLocale,
    data?.localization,
  ).country;
}

/**
 * Checkout localization follows the cart Shopify accepted, not the market
 * originally requested by the browser before Shopify applied a fallback.
 *
 * @param {any} cart
 * @param {string} fallbackCountry
 */
export function cartCheckoutCountry(cart, fallbackCountry) {
  return cart?.buyerIdentity?.countryCode || fallbackCountry;
}

/**
 * Existing carts keep their original buyer identity until it is explicitly
 * updated. A page can therefore render in one market while a stale cart still
 * prices and validates lines in another market.
 *
 * @param {any} cart
 * @param {string} country
 */
export function cartBuyerCountryNeedsSync(cart, country) {
  const desiredCountry = String(country || '').toUpperCase();
  if (!desiredCountry) return false;

  const currentCountry = String(
    cart?.buyerIdentity?.countryCode || '',
  ).toUpperCase();

  return currentCountry !== desiredCountry;
}

/**
 * Fail closed when Shopify cannot confirm the requested cart market.
 *
 * @param {any} result
 * @param {string} country
 */
export function cartBuyerCountrySyncFailed(result, country) {
  const desiredCountry = String(country || '').toUpperCase();
  const syncedCountry = String(
    result?.cart?.buyerIdentity?.countryCode || '',
  ).toUpperCase();

  return Boolean(result?.errors?.length) || syncedCountry !== desiredCountry;
}
