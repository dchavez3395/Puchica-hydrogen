const STATIC_PATHS = [
  '/',
  '/collections/all',
  '/pages/about',
  '/pages/contact',
  '/pages/faq',
  '/pages/shipping',
  '/policies/privacy-policy',
  '/policies/refund-policy',
  '/policies/shipping-policy',
  '/policies/terms-of-service',
];
const LOCALES = ['en', 'fr', 'es', 'pt-br'];
const HREFLANG = {en: 'en-US', fr: 'fr-FR', es: 'es-ES', 'pt-br': 'pt-BR'};

/** @param {Route.LoaderArgs} */
export async function loader({context: {storefront}}) {
  const {products} = await storefront.query(LAUNCH_SITEMAP_QUERY, {
    cache: storefront.CacheShort(),
  });
  const productEntries = products.nodes
    .filter((product) => product.availableForSale)
    .map((product) => ({
      path: `/products/${product.handle}`,
      lastmod: product.updatedAt,
    }));
  const entries = [
    ...STATIC_PATHS.map((path) => ({path})),
    ...productEntries,
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${entries.map(renderUrl).join('\n')}
</urlset>`;
  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function renderUrl({path, lastmod}) {
  const canonical = absolute(path, 'en');
  const alternates = [
    ...LOCALES.map(
      (locale) =>
        `    <xhtml:link rel="alternate" hreflang="${HREFLANG[locale]}" href="${xmlEscape(absolute(path, locale))}" />`,
    ),
    `    <xhtml:link rel="alternate" hreflang="x-default" href="${xmlEscape(canonical)}" />`,
  ].join('\n');
  return `  <url>
    <loc>${xmlEscape(canonical)}</loc>
${lastmod ? `    <lastmod>${xmlEscape(lastmod)}</lastmod>\n` : ''}${alternates}
  </url>`;
}

function absolute(path, locale) {
  const prefix = locale === 'en' ? '' : `/${locale}`;
  return `https://puchica.ca${prefix}${path === '/' ? '/' : path}`;
}

function xmlEscape(value) {
  return String(value)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

const LAUNCH_SITEMAP_QUERY = `#graphql
  query LaunchSitemap @inContext(country: US) {
    products(
      first: 250
      sortKey: UPDATED_AT
      query: "tag:puchica-launch-ready"
    ) {
      nodes {
        handle
        updatedAt
        availableForSale
      }
    }
  }
`;

/** @typedef {import('./+types/[sitemap.xml]').Route} Route */
