import {data, type LoaderFunctionArgs} from 'react-router';

/**
 * Google Merchant Center product feed — `/feed.xml`
 *
 * Generates a Google Shopping-compatible XML product feed from all
 * products published to the Storefront API.
 *
 * GMC feed spec: https://support.google.com/merchants/answer/7052112
 *
 * Usage: Submit https://puchica.ca/feed.xml as the feed URL in Google Merchant Center.
 */

export async function loader({context}: LoaderFunctionArgs) {
  const {storefront} = context;

  const {products} = await storefront.query(
    `#graphql
    query ProductFeed {
      products(first: 250, sortKey: TITLE) {
        edges {
          node {
            title
            handle
            description
            productType
            tags
            featuredImage { url }
            onlineStoreUrl
            variants(first: 20) {
              edges {
                node {
                  title
                  sku
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                }
              }
            }
            priceRange {
              minVariantPrice { amount currencyCode }
            }
          }
        }
      }
    }`,
    {cache: storefront.CacheShort()},
  );

  const SITE_URL = 'https://puchica.ca';
  const currency = 'CAD';

  const items = products.edges.map(({node: product}) => {
    const url = `${SITE_URL}/products/${product.handle}`;
    const image = product.featuredImage?.url || '';
    const title = xmlEscape(product.title);
    const description = xmlEscape(stripHtml(product.description || ''));
    const category = xmlEscape(product.productType || '');
    const id = product.handle;
    const price = product.priceRange?.minVariantPrice?.amount || '0.00';

    // Use first variant as the main item (Google Shopping can handle item groups later)
    const firstVariant = product.variants.edges[0]?.node;
    const sku = xmlEscape(firstVariant?.sku || product.handle);
    const availability = firstVariant?.availableForSale
      ? 'in stock'
      : 'out of stock';

    // Check for sale price (compareAtPrice > price)
    const compareAt = firstVariant?.compareAtPrice?.amount;
    const salePriceEl =
      compareAt && Number(compareAt) > Number(price)
        ? `    <g:sale_price>${compareAt}</g:sale_price>\n`
        : '';

    // Tags → custom labels (up to 5)
    const tags = product.tags || [];
    const customLabels = tags
      .slice(0, 5)
      .map((tag, i) => `    <g:custom_label_${i}>${xmlEscape(tag)}</g:custom_label_${i}>`)
      .join('\n');

    return `  <item>
    <g:id>${id}</g:id>
    <g:title>${title}</g:title>
    <g:description>${description}</g:description>
    <g:link>${url}</g:link>
    <g:image_link>${image}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${price} ${currency}</g:price>
${salePriceEl}    <g:brand>Puchica</g:brand>
    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>${category}</g:product_type>
    <g:condition>new</g:condition>
    <g:mpn>${sku}</g:mpn>
${customLabels}
  </item>`;
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Puchica Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Curated gadgets and home goods from Puchica</description>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
    },
  });
}

function xmlEscape(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(str: string): string {
  return str.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}