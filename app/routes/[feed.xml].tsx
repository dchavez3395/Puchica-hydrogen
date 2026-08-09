import {data, type LoaderFunctionArgs} from 'react-router';
import {
  filterLaunchProducts,
  findApprovedVariant,
  LAUNCH_READY_TAG,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '~/lib/launch-catalog';

const SITE_URL = 'https://puchica.ca';

/**
 * Google Merchant Center product feed — `/feed.xml`
 *
 * Generates a Google Shopping-compatible XML product feed from products that
 * passed Puchica's shared launch gate. Shopify publication alone is not enough:
 * the explicit launch tag and operational-hold list both apply here.
 *
 * GMC feed spec: https://support.google.com/merchants/answer/7052112
 *
 * Usage: Submit https://puchica.ca/feed.xml as the feed URL in Google Merchant Center.
 */

export async function loader({context}: LoaderFunctionArgs) {
  if (STOREFRONT_CONTAINMENT_ACTIVE) {
    return productFeedResponse([]);
  }

  const {storefront} = context;

  const {products} = await storefront.query(
    `#graphql
    query ProductFeed($query: String!) {
      products(first: 250, sortKey: TITLE, query: $query) {
        edges {
          node {
            title
            handle
            description
            productType
            tags
            availableForSale
            featuredImage { url }
            onlineStoreUrl
            variants(first: 20) {
              edges {
                node {
                  sku
                  title
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
    {
      cache: storefront.CacheShort(),
      variables: {query: `tag:${LAUNCH_READY_TAG}`},
    },
  );

  const launchProducts = filterLaunchProducts(
    products.edges.map(({node}) => node),
  );

  const items = launchProducts.map((product) => {
    const url = `${SITE_URL}/products/${product.handle}`;
    const image = product.featuredImage?.url || '';
    const title = xmlEscape(product.title);
    const description = xmlEscape(stripHtml(product.description || ''));
    const category = xmlEscape(product.productType || '');
    const id = product.handle;
    // Feed one exact, sellable variant per launch-approved product. Do not let
    // an unavailable first variant make an otherwise valid product look out of
    // stock, and never emit a product with no sellable variant.
    const firstVariant = findApprovedVariant(
      {variants: {nodes: product.variants.edges.map(({node}) => node)}},
      'CA',
    );
    if (!firstVariant) return null;

    const price = firstVariant.price?.amount || '0.00';
    const currency = firstVariant.price?.currencyCode || 'CAD';
    const availability = 'in stock';

    // Check for sale price (compareAtPrice > price)
    const compareAt = firstVariant?.compareAtPrice?.amount;
    const regularPrice =
      compareAt && Number(compareAt) > Number(price)
        ? compareAt
        : price;
    const salePriceEl =
      compareAt && Number(compareAt) > Number(price)
        ? `    <g:sale_price>${price} ${currency}</g:sale_price>\n`
        : '';

    return `  <item>
    <g:id>${id}</g:id>
    <g:title>${title}</g:title>
    <g:description>${description}</g:description>
    <g:link>${url}</g:link>
    <g:image_link>${image}</g:image_link>
    <g:availability>${availability}</g:availability>
    <g:price>${regularPrice} ${currency}</g:price>
${salePriceEl}    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>${category}</g:product_type>
    <g:condition>new</g:condition>
  </item>`;
  }).filter(Boolean);

  return productFeedResponse(items);
}

function productFeedResponse(items: string[]) {
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Puchica Product Feed</title>
    <link>${SITE_URL}</link>
    <description>Launch-approved products from Puchica</description>
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
