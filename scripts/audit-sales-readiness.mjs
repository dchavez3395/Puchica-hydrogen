import fs from 'node:fs/promises';
import dotenv from 'dotenv';

dotenv.config({path: 'D:/puchica-store/.env'});
const {adminGraphQL} = await import('./shopify-oauth.mjs');

const query = `#graphql
  query SalesReadinessProducts($query: String!, $first: Int!, $after: String) {
    products(query: $query, first: $first, after: $after) {
      nodes {
        id
        title
        handle
        descriptionHtml
        productType
        vendor
        tags
        seo { title description }
        variants(first: 100) {
          nodes {
            id
            title
            sku
            availableForSale
            inventoryQuantity
            selectedOptions { name value }
          }
        }
        media(first: 100) {
          nodes {
            id
            alt
            mediaContentType
            preview { image { url } }
          }
        }
      }
      pageInfo { hasNextPage endCursor }
    }
  }
`;

const products = [];
let after = null;
do {
  const response = await adminGraphQL(query, {
    query: 'status:active',
    first: 50,
    after,
  });
  if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
  const connection = response.data.products;
  products.push(...connection.nodes);
  after = connection.pageInfo.hasNextPage ? connection.pageInfo.endCursor : null;
} while (after);

await fs.mkdir('outputs/sales-readiness', {recursive: true});
await fs.writeFile(
  'outputs/sales-readiness/shopify-products.json',
  JSON.stringify(products, null, 2),
);
console.log(JSON.stringify({count: products.length, products: products.map((product) => ({
  title: product.title,
  handle: product.handle,
  type: product.productType,
  media: product.media.nodes.length,
  missingAlt: product.media.nodes.filter((item) => !item.alt).length,
  variants: product.variants.nodes.map((variant) => ({title: variant.title, sku: variant.sku, stock: variant.inventoryQuantity})),
}))}, null, 2));