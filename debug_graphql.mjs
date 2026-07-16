// debug_graphql.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const envPath = join(__dirname, 'env');
if (fs.existsSync(envPath)) {
  for (const line of fs.readFileSync(envPath, 'utf8').split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

const { adminGraphQL } = await import('./scripts/shopify-oauth.mjs');

const FIELDS = `id title status productType tags vendor descriptionHtml
  seo { title description }
  variants(first: 50) { edges { node { id price title } } }
  images(first: 1) { edges { node { url } } }`;

const query = `query($filter: String) { products(first: 3, query: $filter) { edges { node { ${FIELDS} } } pageInfo { hasNextPage endCursor } } }`;

const result = await adminGraphQL(query, { filter: 'status:ACTIVE' });

console.log('Result type:', typeof result);
console.log('Result keys:', result ? Object.keys(result) : 'null/undefined');
console.log('result.data exists:', !!result?.data);
console.log('result.products exists:', !!result?.data?.products);
console.log('result.errors:', result?.errors);
console.log('Edge count:', result?.data?.products?.edges?.length);
console.log('First product title:', result?.data?.products?.edges?.[0]?.node?.title);
console.log('First product price:', result?.data?.products?.edges?.[0]?.node?.variants?.edges?.[0]?.node?.price);
