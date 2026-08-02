import {type LoaderFunctionArgs} from 'react-router';
import {filterLaunchProducts, LAUNCH_READY_TAG} from '~/lib/launch-catalog';
import {presentProductTitle} from '~/lib/product-presentation';

/**
 * Google Merchant Center product feed — `/feed.xml?country=CA|US`
 *
 * Each sellable variant is a separate item with contextual market pricing and
 * an exact selected-option landing URL. Separate CA and US Merchant data
 * sources should use the same endpoint with their respective country value.
 */
export async function loader({context, request}: LoaderFunctionArgs) {
  const {storefront} = context;
  const requestUrl = new URL(request.url);
  const country = normalizeCountry(requestUrl.searchParams.get('country'));

  const {products} = await storefront.query(PRODUCT_FEED_QUERY, {
    cache: storefront.CacheShort(),
    variables: {
      country,
      language: 'EN',
      query: `tag:${LAUNCH_READY_TAG}`,
    },
  });

  const siteUrl = 'https://puchica.ca';
  const launchProducts = filterLaunchProducts(
    products.edges.map(({node}) => node),
  );
  const items = launchProducts.flatMap((product) =>
    product.variants.edges
      .map(({node: variant}) => buildItem({country, product, siteUrl, variant}))
      .filter(Boolean),
  );

  const marketName = country === 'US' ? 'United States' : 'Canada';
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:g="http://base.google.com/ns/1.0">
  <channel>
    <title>Puchica Organizers — ${marketName}</title>
    <link>${siteUrl}</link>
    <description>Practical organizers for small spaces, cables, and travel.</description>
${items.join('\n')}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      'Content-Type': 'application/xml; charset=utf-8',
      'Cache-Control': 'public, max-age=3600',
      'X-Robots-Tag': 'noindex',
    },
  });
}

function buildItem({country, product, siteUrl, variant}) {
  if (!variant.availableForSale || !variant.price?.amount) return null;

  const variantId = resourceId(variant.id);
  const productId = resourceId(product.id);
  const id = `shopify_${country.toLowerCase()}_${productId}_${variantId}`;
  const link = variantUrl(siteUrl, product.handle, variant.selectedOptions);
  const image = variant.image?.url || product.featuredImage?.url;
  if (!image) return null;

  const baseTitle = presentProductTitle(product.title, variant);
  const variantTitle =
    variant.title && variant.title !== 'Default Title'
      ? ` — ${variant.title}`
      : '';
  const price = variant.price.amount;
  const currency = variant.price.currencyCode;
  const compareAt = variant.compareAtPrice?.amount;
  const onSale = compareAt && Number(compareAt) > Number(price);
  // Only publish a brand when the variant also has a real GTIN. A retailer
  // name or Shopify SKU is not a manufacturer identifier.
  const brand = variant.barcode ? explicitBrand(product.tags) : null;
  const identifierMarkup = variant.barcode
    ? `    <g:gtin>${xmlEscape(variant.barcode)}</g:gtin>`
    : `    <g:identifier_exists>no</g:identifier_exists>`;
  const brandMarkup = brand
    ? `\n    <g:brand>${xmlEscape(brand)}</g:brand>`
    : '';
  const labels = (product.tags || [])
    .filter((tag) => !/^brand:/i.test(tag))
    .slice(0, 5)
    .map(
      (tag, index) =>
        `    <g:custom_label_${index}>${xmlEscape(tag)}</g:custom_label_${index}>`,
    )
    .join('\n');

  return `  <item>
    <g:id>${xmlEscape(id)}</g:id>
    <g:item_group_id>${xmlEscape(`shopify_${country.toLowerCase()}_${productId}`)}</g:item_group_id>
    <g:title>${xmlEscape(`${baseTitle}${variantTitle}`)}</g:title>
    <g:description>${xmlEscape(cleanDescription(product.description))}</g:description>
    <g:link>${xmlEscape(link)}</g:link>
    <g:image_link>${xmlEscape(image)}</g:image_link>
    <g:availability>in stock</g:availability>
    <g:price>${onSale ? compareAt : price} ${currency}</g:price>
${onSale ? `    <g:sale_price>${price} ${currency}</g:sale_price>\n` : ''}    <g:condition>new</g:condition>
${identifierMarkup}${brandMarkup}
    <g:product_type>${xmlEscape(product.productType || 'Organizers')}</g:product_type>
${labels}
  </item>`;
}

function normalizeCountry(value: string | null): 'CA' | 'US' {
  return String(value || '').toUpperCase() === 'US' ? 'US' : 'CA';
}

function variantUrl(
  siteUrl: string,
  handle: string,
  selectedOptions: Array<{name: string; value: string}>,
): string {
  const url = new URL(`/products/${handle}`, siteUrl);
  for (const option of selectedOptions || []) {
    url.searchParams.set(option.name, option.value);
  }
  return url.toString();
}

function explicitBrand(tags: string[] | null | undefined): string | null {
  const tag = (tags || []).find((value) => /^brand:\s*\S/i.test(value));
  return tag ? tag.replace(/^brand:\s*/i, '').trim() : null;
}

function resourceId(gid: string): string {
  return gid.split('/').pop() || gid;
}

function xmlEscape(value: unknown): string {
  return String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&apos;');
}

function cleanDescription(value: string | null | undefined): string {
  return String(value || '')
    .replace(/<[^>]*>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
    .slice(0, 5000);
}

const PRODUCT_FEED_QUERY = `#graphql
  query ProductFeed(
    $country: CountryCode!
    $language: LanguageCode!
    $query: String!
  ) @inContext(country: $country, language: $language) {
    products(first: 250, sortKey: TITLE, query: $query) {
      edges {
        node {
          id
          title
          handle
          description
          productType
          tags
          availableForSale
          featuredImage { url }
          variants(first: 100) {
            edges {
              node {
                id
                title
                barcode
                price { amount currencyCode }
                compareAtPrice { amount currencyCode }
                availableForSale
                image { url }
                selectedOptions { name value }
              }
            }
          }
        }
      }
    }
  }
`;
