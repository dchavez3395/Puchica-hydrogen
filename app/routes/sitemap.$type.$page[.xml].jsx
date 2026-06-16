import {getSitemap} from '@shopify/hydrogen';

/**
 * @param {Route.LoaderArgs}
 *
 * The storefront is hard-coded to EN/CA in app/lib/context.js, so we
 * only advertise EN-CA in the sitemap. The previous `EN-US`/`FR-CA`
 * entries told Google about locale-prefixed URLs that 404'd at runtime
 * — Google Search Console would flag those as soft-404s and erode
 * crawl budget.
 *
 * If the storefront later adds locale subpath routing, extend this
 * array and add hreflang `<link rel="alternate">` tags in root.jsx.
 */
export async function loader({request, params, context: {storefront}}) {
  const response = await getSitemap({
    storefront,
    request,
    params,
    locales: ['EN-CA'],
    getLink: ({type, baseUrl, handle, locale}) => {
      if (!locale) return `${baseUrl}/${type}/${handle}`;
      return `${baseUrl}/${locale}/${type}/${handle}`;
    },
  });

  response.headers.set('Cache-Control', `max-age=${60 * 60 * 24}`);

  return response;
}

/** @typedef {import('./+types/sitemap.$type.$page[.xml]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
