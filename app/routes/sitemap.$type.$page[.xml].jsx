import {getSitemap} from '@shopify/hydrogen';
import {PREFIXED_LANGS} from '~/lib/i18n';

/**
 * @param {Route.LoaderArgs}
 *
 * The URL-locale routes (/fr, /es, /pt-br) are live, so the sitemap
 * advertises all four languages. Hydrogen's `getSitemap` emits one
 * `<xhtml:link rel="alternate" hreflang=...>` per locale, plus an `x-default`
 * pointing at the unprefixed (English) URL, automatically — we just
 * have to list the locales and the URL shape.
 *
 * Locale codes are the four BCP-47 tags search engines see. They map
 * to URL prefixes: `EN` (unprefixed), `fr` -> `/fr`, `es` -> `/es`,
 * `pt-br` -> `/pt-br`. The `getLink` callback's `locale` argument is
 * the *prefix* (or undefined for the canonical English URL), so we
 * use it directly to build the path.
 */
export async function loader({request, params, context: {storefront}}) {
  // Order matters: EN first so the canonical `<loc>` for every URL is
  // the unprefixed (English) one, matching the x-default that
  // hreflangAlternates() emits in root.jsx. The codes here match
  // hreflangAlternates() in app/lib/seo.js so Google's hreflang
  // signals from the sitemap and from <link rel="alternate"> agree.
  const locales = ['en', 'fr', 'es', 'pt-br'];

  const response = await getSitemap({
    storefront,
    request,
    params,
    locales,
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      // Sanity-check the prefix against the i18n module's allow-list.
      // If a future locale is added to the array but not to
      // PREFIXED_LANGS, we'd accidentally advertise 404 URLs.
      if (!PREFIXED_LANGS.includes(locale)) {
        return `${baseUrl}/${type}/${handle}`;
      }
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
