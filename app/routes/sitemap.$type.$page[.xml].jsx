import {
  filterLaunchProducts,
  LAUNCH_READY_TAG,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';

/** @param {Route.LoaderArgs} */
export async function loader({request, params, context: {storefront}}) {
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
    const launchProducts = filterLaunchProducts(
      products.nodes || [],
    );
    return xmlResponse(
      productUrlset(launchProducts, new URL(request.url).origin),
    );
  }

  if (params.type === 'pages' && String(params.page || '1') === '1') {
    return xmlResponse(
      staticPageUrlset(new URL(request.url).origin),
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

function productUrlset(products, baseUrl) {
  const urls = products
    .map((product) => {
      const canonical = `${baseUrl}/products/${encodeURIComponent(product.handle)}`;
      return `<url>
  <loc>${canonical}</loc>
  <lastmod>${product.updatedAt}</lastmod>
  <changefreq>weekly</changefreq>
</url>`;
    })
    .join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

const LAUNCH_STATIC_PATHS = [
  '/',
  '/collections/all',
  '/pages/about',
  '/pages/contact',
  '/pages/faq',
  '/pages/shipping',
];

function staticPageUrlset(baseUrl) {
  const urls = LAUNCH_STATIC_PATHS.map((path) => {
    const canonical = `${baseUrl}${path}`;
    return `<url>
  <loc>${canonical}</loc>
  <changefreq>weekly</changefreq>
</url>`;
  }).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`;
}

function emptyUrlset() {
  return `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"></urlset>`;
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
