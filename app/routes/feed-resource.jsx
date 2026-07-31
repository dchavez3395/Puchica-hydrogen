export const handle = {resource: true};

/**
 * Google Merchant Center product feed — `/feed.xml`.
 *
 * The feed intentionally fails closed: it only includes launch-ready products
 * that have an available variant in the US market context.
 */
export async function loader({context}) {
  const {storefront} = context;

  const {products} = await storefront.query(
    `#graphql
    query ProductFeed @inContext(country: US) {
      products(
        first: 250
        sortKey: TITLE
        query: "tag:puchica-launch-ready"
      ) {
        edges {
          node {
            id
            title
            handle
            description
            productType
            tags
            featuredImage { url }
            variants(first: 20) {
              edges {
                node {
                  id
                  price { amount currencyCode }
                  compareAtPrice { amount currencyCode }
                  availableForSale
                }
              }
            }
          }
        }
      }
    }`,
    {cache: storefront.CacheShort()},
  );

  const siteUrl = 'https://puchica.ca';
  const items = products.edges.flatMap(({node: product}) => {
    const variant = product.variants.edges
      .map(({node}) => node)
      .find((node) => node.availableForSale);

    // Do not advertise a product that cannot be purchased in the US context.
    if (!variant) return [];

    const variantId = variant.id.split('/').pop();
    const url = `${siteUrl}/products/${product.handle}?variant=${variantId}`;
    const image = product.featuredImage?.url || '';
    const price = variant.price.amount;
    const currency = variant.price.currencyCode;
    const compareAt = variant.compareAtPrice?.amount;
    const onSale = Boolean(compareAt && Number(compareAt) > Number(price));
    const regularPrice = onSale ? compareAt : price;
    const salePriceEl = onSale
      ? `    <g:sale_price>${price} ${currency}</g:sale_price>\n`
      : '';
    const customLabels = (product.tags || [])
      .slice(0, 5)
      .map(
        (tag, index) =>
          `    <g:custom_label_${index}>${xmlEscape(tag)}</g:custom_label_${index}>`,
      )
      .join('\n');

    return [`  <item>
    <g:id>${xmlEscape(product.id)}</g:id>
    <g:title>${xmlEscape(product.title)}</g:title>
    <g:description>${xmlEscape(stripHtml(product.description || ''))}</g:description>
    <g:link>${xmlEscape(url)}</g:link>
    <g:image_link>${xmlEscape(image)}</g:image_link>
    <g:availability>in stock</g:availability>
    <g:price>${regularPrice} ${currency}</g:price>
${salePriceEl}    <g:identifier_exists>no</g:identifier_exists>
    <g:product_type>${xmlEscape(product.productType || '')}</g:product_type>
    <g:condition>new</g:condition>
${customLabels}
  </item>`];
  });

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Puchica Product Feed</title>
    <link>${siteUrl}</link>
    <description>Curated travel, organization, and home goods from Puchica</description>
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

function xmlEscape(value) {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function stripHtml(value) {
  return value.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim();
}
