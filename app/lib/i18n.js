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

// Puchica operates one North American storefront with two independently
// priced buyer markets. The selected country drives Storefront API pricing,
// currency, product availability, and the cart buyer identity.
export const MARKETS = {
  CA: {},
  US: {},
};

export const MARKET_COOKIE = 'pk_market';

/**
 * URL-based locales.
 *
 * English is the DEFAULT and is served WITHOUT a prefix, so every existing
 * URL is unchanged (no SEO migration for current traffic). The other three
 * languages live under a path prefix so search engines get a distinct,
 * crawlable URL per language:
 *
 *   en    -> (no prefix)   /products/foo
 *   fr    -> /fr           /fr/products/foo
 *   es    -> /es           /es/products/foo
 *   pt-br -> /pt-br        /pt-br/products/foo
 */
export const PREFIXED_LANGS = ['fr', 'es', 'pt-br']; // 'en' is unprefixed

/**
 * Split a pathname into its language prefix (if any) and the "bare" path the
 * app's routes actually match.
 *
 *   '/fr/products/x' -> {langKey: 'fr', rest: '/products/x'}
 *   '/products/x'    -> {langKey: 'en', rest: '/products/x'}
 *   '/fr'            -> {langKey: 'fr', rest: '/'}
 *   '/en/products/x' -> {langKey: 'en', rest: '/products/x'}  (explicit en normalizes away)
 *
 * @param {string} pathname
 * @returns {{langKey: string, rest: string}}
 */
export function parseLocaleFromPath(pathname) {
  const path = pathname || '/';
  const seg = (path.split('/')[1] || '').toLowerCase();
  if (PREFIXED_LANGS.includes(seg) || seg === 'en') {
    const rest = path.slice(seg.length + 1) || '/';
    return {langKey: seg, rest: rest.startsWith('/') ? rest : '/' + rest};
  }
  return {langKey: 'en', rest: path};
}

/**
 * Add the language prefix to a bare app path. No-op for English (default),
 * external URLs, and in-page hashes. Idempotent: strips any existing prefix
 * first, so it's safe to call on an already-localized path.
 *
 *   localizePath('/products/x', 'fr') -> '/fr/products/x'
 *   localizePath('/products/x', 'en') -> '/products/x'
 *
 * @param {string} pathname - a bare path beginning with '/'
 * @param {string} langKey  - 'en' | 'fr' | 'es' | 'pt-br'
 */
export function localizePath(pathname, langKey) {
  if (!pathname || !pathname.startsWith('/')) return pathname; // external / hash
  const {rest} = parseLocaleFromPath(pathname);
  if (!langKey || langKey === 'en' || !PREFIXED_LANGS.includes(langKey)) return rest;
  return '/' + langKey + (rest === '/' ? '' : rest);
}

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
 * Supported buyer country from a saved choice or Oxygen geo. Falls back to CA.
 * @param {Request} request
 */
function buyerCountry(request) {
  const chosen = readCookie(request, MARKET_COOKIE)?.toUpperCase();
  if (chosen && MARKETS[chosen]) return chosen;

  const geoCountry =
    request.headers.get('oxygen-buyer-country') ||
    request.headers.get('Oxygen-Buyer-Country') ||
    '';
  const country = geoCountry.toUpperCase();
  return MARKETS[country] ? country : DEFAULT_LOCALE.country;
}

/**
 * Resolve the (country, language) for a request.
 * @param {Request} request
 * @returns {{language: string, country: string}}
 */
export function getLocaleFromRequest(request) {
  const country = buyerCountry(request) || DEFAULT_LOCALE.country;
  const {langKey: urlLang} = parseLocaleFromPath(new URL(request.url).pathname);
  const chosen = readCookie(request, LOCALE_COOKIE); // 'en' | 'fr' | 'es' | 'pt-br'
  const language =
    // 1. an explicit non-default language in the URL path wins — it's the
    //    crawlable, shareable signal (Googlebot has no cookie, so this is
    //    what makes /fr, /es, /pt-br serve the right language).
    (urlLang !== 'en' && LANGUAGES[urlLang]) ||
    // 2. the shopper's saved switcher choice (cookie)
    (chosen && LANGUAGES[chosen]) ||
    // 3. a sensible default for their country
    COUNTRY_DEFAULT_LANG[country] ||
    // 4. English
    DEFAULT_LOCALE.language;
  return {language, country};
}

/**
 * Reconcile the requested country with the market Shopify actually resolved.
 * Storefront API can silently fall back to another market when the requested
 * country is not published to the current storefront. Never infer currency
 * from a country code; only surface the currency returned by Shopify.
 *
 * @param {{language?: string, country?: string}} requestedLocale
 * @param {{
 *   country?: {isoCode?: string, currency?: {isoCode?: string}};
 *   availableCountries?: Array<{isoCode?: string, currency?: {isoCode?: string}}>;
 * } | null | undefined} localization
 */
export function resolveStorefrontLocale(requestedLocale, localization) {
  const requestedCountry = String(
    requestedLocale?.country || DEFAULT_LOCALE.country,
  ).toUpperCase();
  const resolvedCountry = String(
    localization?.country?.isoCode || requestedCountry,
  ).toUpperCase();
  const currency = localization?.country?.currency?.isoCode || null;
  const availableMarkets = (localization?.availableCountries || [])
    .filter((country) => MARKETS[country?.isoCode])
    .map((country) => ({
      country: country.isoCode,
      currency: country.currency?.isoCode || null,
    }));

  return {
    language: requestedLocale?.language || DEFAULT_LOCALE.language,
    country: resolvedCountry,
    currency,
    requestedCountry,
    marketFallback: resolvedCountry !== requestedCountry,
    availableMarkets,
  };
}

/** @param {{country?: string, currency?: string | null, language?: string}} locale */
export function marketDisplayLabel(locale) {
  const country = locale?.country || DEFAULT_LOCALE.country;
  const language = String(locale?.language || DEFAULT_LOCALE.language)
    .replace('_BR', '')
    .toUpperCase();
  return [country, locale?.currency, language].filter(Boolean).join(' · ');
}

/**
 * Compact label for the header trigger. Currency remains visible beside every
 * price, in the expanded selector, and in the trigger's accessible name.
 * @param {{country?: string, language?: string}} locale
 */
export function marketCompactLabel(locale) {
  const country = locale?.country || DEFAULT_LOCALE.country;
  const language = String(locale?.language || DEFAULT_LOCALE.language)
    .replace('_BR', '')
    .toUpperCase();
  return [country, language].filter(Boolean).join(' · ');
}
