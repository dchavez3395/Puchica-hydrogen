// Only advertise deliberately curated launch URLs. Shopify still contains
// legacy collections/blog records that are not part of this storefront.
import {STOREFRONT_CONTAINMENT_ACTIVE} from '~/lib/launch-catalog';

const SITEMAP_TYPES = STOREFRONT_CONTAINMENT_ACTIVE
  ? ['pages']
  : ['products', 'pages'];

/**
 * @param {Route.LoaderArgs}
 */
export async function loader({request}) {
  const baseUrl = new URL(request.url).origin;
  const entries = SITEMAP_TYPES.map(
    (type) =>
      `  <sitemap><loc>${baseUrl}/sitemap/${type}/1.xml</loc></sitemap>`,
  ).join('\n');
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${entries}
</sitemapindex>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': `public, max-age=${60 * 60 * 24}`,
    },
  });
}

/** @typedef {import('./+types/[sitemap.xml]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
