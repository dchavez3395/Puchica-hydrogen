/**
 * Locale derivation for the headless storefront.
 *
 * `language` and `country` are Shopify Storefront API enum values consumed by
 * the `@inContext(country, language)` directive that every loader's query
 * already uses:
 *   - `country`  drives currency + market pricing (US → USD, GB → GBP, …)
 *   - `language` drives translated product / collection / blog content
 *     (Spanish, French, Portuguese) that Translate & Adapt produced in admin.
 *
 * Selection order:
 *   1. The shopper's explicit choice from the language switcher (a cookie).
 *   2. A sensible default language for the buyer's country (LatAm → ES, etc.).
 *   3. Fallback to English / Canada.
 *
 * NOTE: country comes from Oxygen's per-request geo header. Currency always
 * follows country; language only auto-switches where it's unambiguous
 * (Canada stays EN by default since a Canadian may want EN or FR — they pick
 * FR via the switcher).
 */

// Cookie value -> Shopify LanguageCode. These are the languages we ship.
export const LANGUAGES = {
  en: 'EN',
  fr: 'FR',
  es: 'ES',
  'pt-br': 'PT_BR',
};

// Reverse: Shopify LanguageCode -> cookie/UI key. Used by the switcher.
export const LANGUAGE_KEYS = {
  EN: 'en',
  FR: 'fr',
  ES: 'es',
  PT_BR: 'pt-br',
};

// Default language for a buyer's country when they haven't chosen one.
const COUNTRY_DEFAULT_LANG = {
  CA: 'EN', // Canada defaults to English; French is available via the switcher
  US: 'EN',
  GB: 'EN',
  ES: 'ES',
  BR: 'PT_BR',
  MX: 'ES',
  AR: 'ES',
  CL: 'ES',
  CO: 'ES',
  PE: 'ES',
  VE: 'ES',
  EC: 'ES',
  GT: 'ES',
  BO: 'ES',
  DO: 'ES',
  HN: 'ES',
  PY: 'ES',
  SV: 'ES',
  NI: 'ES',
  CR: 'ES',
  PA: 'ES',
  UY: 'ES',
  BZ: 'EN',
};

export const LOCALE_COOKIE = 'pk_locale';

const DEFAULT_LOCALE = {language: 'EN', country: 'CA'};

function readCookie(request, name) {
  const header = request.headers.get('Cookie') || '';
  const match = header.match(new RegExp('(?:^|;\\s*)' + name + '=([^;]+)'));
  return match ? decodeURIComponent(match[1]) : null;
}

/**
 * Buyer country from Oxygen's geo header (ISO 3166-1 alpha-2). Falls back to CA.
 * @param {Request} request
 */
function buyerCountry(request) {
  const c =
    request.headers.get('oxygen-buyer-country') ||
    request.headers.get('Oxygen-Buyer-Country') ||
    '';
  return c ? c.toUpperCase() : DEFAULT_LOCALE.country;
}

/**
 * Resolve the (country, language) for a request.
 * @param {Request} request
 * @returns {{language: string, country: string}}
 */
export function getLocaleFromRequest(request) {
  const country = buyerCountry(request) || DEFAULT_LOCALE.country;
  const chosen = readCookie(request, LOCALE_COOKIE); // 'en' | 'fr' | 'es' | 'pt-br'
  const language =
    (chosen && LANGUAGES[chosen]) ||
    COUNTRY_DEFAULT_LANG[country] ||
    DEFAULT_LOCALE.language;
  return {language, country};
}
