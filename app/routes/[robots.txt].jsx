/**
 * @param {Route.LoaderArgs}
 */
export function loader({request}) {
  const url = new URL(request.url);
  const body = robotsTxtData({url: url.origin});

  return new Response(body, {
    status: 200,
    headers: {
      'Content-Type': 'text/plain',

      'Cache-Control': `max-age=${60 * 60 * 24}`,
    },
  });
}

/**
 * @param {{url?: string}}
 */
function robotsTxtData({url}) {
  const sitemapUrl = url ? `${url}/sitemap.xml` : undefined;

  return `
User-agent: *
${generalDisallowRules({sitemapUrl})}

# Google adsbot ignores robots.txt unless specifically named!
User-agent: adsbot-google
${generalDisallowRules({})}

User-agent: Nutch
Disallow: /

User-agent: AhrefsBot
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: AhrefsSiteAudit
Crawl-delay: 10
${generalDisallowRules({sitemapUrl})}

User-agent: MJ12bot
Crawl-Delay: 10
${generalDisallowRules({})}

User-agent: Pinterest
Crawl-delay: 1
${generalDisallowRules({})}
`.trim();
}

/**
 * This function generates disallow rules that generally follow what Shopify's
 * Online Store has as defaults for their robots.txt
 * @param {{sitemapUrl?: string}}
 */
function generalDisallowRules({sitemapUrl}) {
  return `Disallow: /cart
Disallow: /*/cart
Disallow: /cart-sync
Disallow: /*/cart-sync
Disallow: /account
Disallow: /*/account
Disallow: /newsletter
Disallow: /*/newsletter
Disallow: /notify-back
Disallow: /*/notify-back
Disallow: /api
Disallow: /*/api
Disallow: /explore
Disallow: /*/explore
Disallow: /campaigns
Disallow: /*/campaigns
Disallow: /discount
Disallow: /*/discount
Disallow: /collections/*sort_by*
Disallow: /*/collections/*sort_by*
Disallow: /collections/*+*
Disallow: /collections/*%2B*
Disallow: /collections/*%2b*
Disallow: /*/collections/*+*
Disallow: /*/collections/*%2B*
Disallow: /*/collections/*%2b*
Disallow: /*/collections/*filter*&*filter*
Disallow: /blogs/*+*
Disallow: /blogs/*%2B*
Disallow: /blogs/*%2b*
Disallow: /*/blogs/*+*
Disallow: /*/blogs/*%2B*
Disallow: /*/blogs/*%2b*
Disallow: /policies/
Disallow: /search
Disallow: /*/search
Disallow: /search/?*
${sitemapUrl ? `Sitemap: ${sitemapUrl}` : ''}`;
}

/** @typedef {import('./+types/[robots.txt]').Route} Route */
/** @typedef {ReturnType<typeof useLoaderData<typeof loader>>} LoaderReturnData */
