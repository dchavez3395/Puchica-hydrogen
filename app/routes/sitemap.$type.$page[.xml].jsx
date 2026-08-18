import {
  filterDiscoverableProducts,
  LAUNCH_READY_TAG,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';

/**
 * @param {Route.LoaderArgs}
 *
 * The URL-locale routes (/fr, /es, /pt-br) are live, so the sitemap
 * advertises all four languages plus an `x-default` pointing at the
 * unprefixed English URL.
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

  if (params.type === 'products') {
    if (STOREFRONT_CONTAINMENT_ACTIVE) {
      return xmlResponse(emptyUrlset());
    }
    if (String(params.page || '1') !== '1') {
      return xmlResponse(emptyUrlset());
    }

    const {products} = await storefront.query(LAUNCH_PRODUCTS_QUERY, {
      cache: storefront.CacheShort(),
      variables: {query: `tag:${LAUNCH_READY_TAG}`},
    });
    const launchProducts = filterDiscoverableProducts(products.nodes || []);
    return xmlResponse(
      productUrlset(launchProducts, new URL(request.url).origin, locales),
    );
  }

  if (params.type === 'pages' && String(params.page || '1') === '1') {
    return xmlResponse(
      staticPageUrlset(new URL(request.url).origin, locales),
    );
  }

  return xmlResponse(emptyUrlset());
}

const LAUNCH_PRODUCTS_QUERY = `#graphql
  query LaunchSitemapProducts($query: String!) {
    products(first: 250, sortKey: TITLE, query: $query) {
      nodes {
        handle
        tags
        availableForSale
        updatedAt
        variants(first: 50) {
          nodes {
            sku
            availableForSale
          }
        }
      }
    }
  }
`;

function productUrlset(products, baseUrl, locales) {
  const urls = products
    .map((product) => {
      const canonical = `${baseUrl}/products/${encodeURIComponent(product.handle)}`;
      const alternates = locales
        .map((locale) => {
          const href =
            locale === 'en'
              ? canonical
              : `${baseUrl}/${locale}/products/${encodeURIComponent(product.handle)}`;
          return `  <xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`;
        })
        .join('\n');
      const xDefault = `  <xhtml:link rel="alternate" hreflang="x-default" href="${canonical}" />`;
      return `<url>
  <loc>${canonical}</loc>
  <lastmod>${product.updatedAt}</lastmod>
  <changefreq>weekly</changefreq>
${alternates}
${xDefault}
</url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

const LAUNCH_STATIC_PATHS = [
  '/',
  '/collections/all',
  '/pages/about',
  '/pages/contact',
  '/pages/faq',
  '/pages/shipping',
];

function staticPageUrlset(baseUrl, locales) {
  const urls = LAUNCH_STATIC_PATHS.map((path) => {
    const canonical = `${baseUrl}${path}`;
    const alternates = locales
      .map((locale) => {
        const href = locale === 'en' ? canonical : `${baseUrl}/${locale}${path}`;
        return `  <xhtml:link rel="alternate" hreflang="${locale}" href="${href}" />`;
      })
      .join('\n');
    const xDefault = `  <xhtml:link rel="alternate" hreflang="x-default" href="${canonical}" />`;
    return `<url>
  <loc>${canonical}</loc>
  <changefreq>weekly</changefreq>
${alternates}
${xDefault}
</url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">${urls}</urlset>`;
}

function emptyUrlset() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml"></urlset>`;
}

function xmlResponse(xml, status = 200) {
  return new Response(xml, {
    status,
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${60 * 60 * 24}`,
    },
  });
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
