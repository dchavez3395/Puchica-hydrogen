/**
 * Shared SEO helpers for the Puchica storefront.
 *
 * Why a custom helper instead of `getSeoMeta` from `@shopify/hydrogen`:
 * - getSeoMeta does not emit `og:url` (Google still recommends it).
 * - getSeoMeta does not accept a `pathname` for canonicals — it has to be
 *   composed separately anyway.
 * - getSeoMeta has no `noindex` shorthand; you have to add a separate
 *   `{name: 'robots', content: 'noindex,follow'}` entry yourself.
 * - The Hydrogen helper does set good Twitter card defaults, but we
 *   have only a handful of OG/Twitter consumers, so the duplication is
 *   small and the explicit form is easier to audit.
 */

import {BRAND_DESCRIPTION, SOCIAL_PROFILES, STORE_LOGO_URL} from '~/lib/brand';
import {parseLocaleFromPath, localizePath} from '~/lib/i18n';

/**
 * The public-facing canonical domain. NOT the Shopify domain
 * (`env.PUBLIC_STORE_DOMAIN`) — that one is the *.myshopify.com URL
 * Shopify uses internally and would point Google at the wrong place.
 *
 * Apex (`puchica.ca`) is the marketing / brand host and currently serves
 * the legacy Express theme. Hydrogen (the styled storefront) is on
 * `www.puchica.ca`. The apex will 301-redirect to `www` once the edge
 * redirect is in place (see memory/puchica-dns-state-2026-06-18.md),
 * so all canonicals / og:url / sitemap URLs already point at the
 * correct destination.
 */
export const SITE_URL = 'https://www.puchica.ca';

/** Default OG image — the brand logo, served from the Shopify CDN. */
export const DEFAULT_OG_IMAGE = STORE_LOGO_URL;

/** Site name for OG/Twitter cards. */
export const SITE_NAME = 'Puchica';

/** Locale — matches the hard-coded i18n in app/lib/context.js (EN/CA). */
export const OG_LOCALE = 'en_CA';

/**
 * Build an absolute canonical URL from a pathname.
 * Always returns a string ending in the given path with no trailing slash
 * unless the path itself ends with one.
 *
 * Pass `langKey` ('fr' | 'es' | 'pt-br') to build the localized canonical for
 * a non-English page, so each language self-canonicalizes. English (default,
 * or an omitted langKey) stays unprefixed — existing callers are unchanged.
 *
 * @param {string} pathname - should start with "/" (e.g. "/products/foo")
 * @param {string} [langKey] - 'en' | 'fr' | 'es' | 'pt-br'; defaults to English
 */
export function canonical(pathname, langKey) {
  if (!pathname) return SITE_URL + (langKey ? localizePath('/', langKey) : '/');
  // Strip any host if the caller passed a full URL by accident.
  let path = pathname;
  try {
    if (path.startsWith('http://') || path.startsWith('https://')) {
      path = new URL(path).pathname;
    }
  } catch {
    /* ignore */
  }
  if (!path.startsWith('/')) path = '/' + path;
  // localizePath is idempotent (strips any existing prefix first), so this is
  // safe whether the caller passes a bare or already-prefixed path.
  if (langKey) path = localizePath(path, langKey);
  return SITE_URL + path;
}

/**
 * Build the reciprocal hreflang alternates for a page, for all four languages
 * plus `x-default` (English). Returns objects ready to spread into React
 * Router `<link rel="alternate" hreflang=...>` meta/link descriptors.
 *
 * Emit these on every indexable page ONCE the URL-locale routing is live —
 * they point at /fr, /es, /pt-br URLs, so wiring them in before those routes
 * resolve would advertise 404s to search engines.
 *
 * @param {string} pathname - the current path (bare or already-prefixed)
 * @returns {Array<{hreflang: string, href: string}>}
 */
export function hreflangAlternates(pathname) {
  const {rest} = parseLocaleFromPath(pathname || '/');
  const langs = ['en', 'fr', 'es', 'pt-br'];
  const alts = langs.map((k) => ({
    hreflang: k,
    href: SITE_URL + localizePath(rest, k),
  }));
  alts.push({hreflang: 'x-default', href: SITE_URL + localizePath(rest, 'en')});
  return alts;
}

/**
 * Build the standard meta array for a Puchica page.
 *
 * Returns an array of meta objects suitable for React Router's `meta`
 * export. Adds title/description, OG (title/description/image/url/type/
 * site_name/locale), Twitter card, and an absolute canonical link.
 *
 * @param {object} opts
 * @param {string} opts.title       - raw page title (no suffix added)
 * @param {string} [opts.description]
 * @param {string} [opts.image]     - absolute URL of OG image
 * @param {string} [opts.type]      - OG type, default "website"
 * @param {boolean} [opts.noindex]  - if true, emits robots noindex,follow
 * @param {string} [opts.pathname]  - used to build canonical + og:url
 * @param {string} [opts.langKey]   - 'fr'|'es'|'pt-br' to localize the
 *   canonical/og:url; omit or 'en' for the unprefixed English URL. Pass
 *   `params.locale` from the route's meta args.
 * @param {string} [opts.twitterCard] - "summary" (default) or "summary_large_image"
 */
export function puchicaMeta({
  title,
  description,
  image = DEFAULT_OG_IMAGE,
  type = 'website',
  noindex = false,
  pathname,
  langKey,
  twitterCard = 'summary',
} = {}) {
  const tags = [];
  if (title) tags.push({title});
  if (description) tags.push({name: 'description', content: description});

  if (noindex) {
    tags.push({name: 'robots', content: 'noindex,follow'});
  }

  // Open Graph
  if (title) {
    tags.push({property: 'og:title', content: title});
    tags.push({property: 'og:site_name', content: SITE_NAME});
  }
  if (description) {
    tags.push({property: 'og:description', content: description});
  }
  tags.push({property: 'og:type', content: type});
  if (image) tags.push({property: 'og:image', content: image});
  if (pathname) {
    // langKey ('fr' | 'es' | 'pt-br') prefixes the canonical so each language
    // self-canonicalizes; undefined/'en' leaves English URLs unprefixed.
    const href = canonical(pathname, langKey);
    tags.push({property: 'og:url', content: href});
    tags.push({tagName: 'link', rel: 'canonical', href});
  }
  if (OG_LOCALE) tags.push({property: 'og:locale', content: OG_LOCALE});

  // Twitter
  tags.push({name: 'twitter:card', content: twitterCard});
  if (title) tags.push({name: 'twitter:title', content: title});
  if (description) tags.push({name: 'twitter:description', content: description});
  if (image) tags.push({name: 'twitter:image', content: image});

  return tags;
}

/**
 * Build a BreadcrumbList JSON-LD object. Pass items in order from root
 * to leaf; each item is `{name, url}` where `url` is a path (e.g. "/products/foo").
 *
 * @param {Array<{name: string, url: string}>} items
 */
export function breadcrumbJsonLd(items) {
  if (!Array.isArray(items) || items.length === 0) return null;
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, idx) => ({
      '@type': 'ListItem',
      position: idx + 1,
      name: item.name,
      item: canonical(item.url),
    })),
  };
}

/**
 * Build an Organization JSON-LD object. Used on the homepage to anchor
 * Google's brand knowledge panel.
 *
 * The defaults pull from `~/lib/brand` so the SEO schema and the
 * Footer's social links stay in lockstep. Pass overrides for tests or
 * for a one-off variant of the schema.
 *
 * @param {object} opts
 * @param {string} [opts.name]        - defaults to SITE_NAME
 * @param {string} [opts.url]         - defaults to SITE_URL
 * @param {string} [opts.logo]        - absolute URL of brand logo
 * @param {string} [opts.description] - one-line "what is Puchica"
 * @param {string[]} [opts.sameAs]    - social profile URLs
 */
export function organizationJsonLd({
  name = SITE_NAME,
  url = SITE_URL,
  logo = DEFAULT_OG_IMAGE,
  description = BRAND_DESCRIPTION,
  sameAs = SOCIAL_PROFILES,
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': canonical('/#organization'),
    name,
    url,
    description,
    logo: {
      '@type': 'ImageObject',
      url: logo,
    },
    sameAs: sameAs.filter(Boolean),
  };
}

/**
 * Build a WebSite JSON-LD with a SearchAction. This is what generates
 * the Google Sitelinks Searchbox. Goes on the homepage.
 *
 * @param {object} opts
 * @param {string} [opts.name]      - defaults to SITE_NAME
 * @param {string} [opts.url]       - defaults to SITE_URL
 * @param {string} [opts.searchPath] - URL pattern with `{search_term_string}`
 *   token. Defaults to "/search?q={search_term_string}".
 */
export function websiteJsonLd({
  name = SITE_NAME,
  url = SITE_URL,
  searchPath = '/search?q={search_term_string}',
} = {}) {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': canonical('/#website'),
    name,
    url,
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: canonical(searchPath),
      },
      // Google's docs say the query input property should be named
      // `query-input` (with a hyphen) and the value should be the
      // required parameter name in the URL template, e.g. "required name=search_term_string".
      'query-input': 'required name=search_term_string',
    },
  };
}

/**
 * The actual `<script>` renderer lives in `app/components/JsonLdScript.jsx`
 * — the `.jsx` extension is what tells the Vite/oxc parser that JSX is
 * allowed in that file. Re-export it here so callers have a single
 * import path (`from '~/lib/seo'`).
 */
export {JsonLdScript} from '~/components/JsonLdScript';
