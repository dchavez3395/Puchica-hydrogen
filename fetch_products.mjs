// fetch_products.mjs — fetch all products for backend update
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

import { adminGraphQL } from './scripts/shopify-oauth.mjs';

const FIELDS = `id title status productType tags vendor descriptionHtml seo { title description }
  variants(first: 50) { edges { node { id price title } } }
  images(first: 1) { edges { node { url } } }`;

async function fetchProducts(query, vars) {
  const result = await adminGraphQL(query, vars);
  if (result.errors) {
    throw new Error('GraphQL errors: ' + JSON.stringify(result.errors));
  }
  return result.data;
}

async function main() {
  // Fetch active products
  let allActive = [];
  let after = null;
  let page = 1;
  console.error('Fetching ACTIVE...');
  do {
    const q = after
      ? 'query($after: String!) { products(first: 50, query: "status:ACTIVE", after: $after) { edges { node { ' + FIELDS + ' } } pageInfo { hasNextPage endCursor } } }'
      : 'query { products(first: 50, query: "status:ACTIVE") { edges { node { ' + FIELDS + ' } } pageInfo { hasNextPage endCursor } } }';
    const vars = after ? { after } : {};
    const data = await fetchProducts(q, vars);
    const edges = data.products.edges;
    allActive.push(...edges.map(e => e.node));
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    console.error(`  Page ${page++}: ${edges.length} products (total: ${allActive.length}), hasMore=${data.products.pageInfo.hasNextPage}`);
  } while (after);

  // Fetch draft products
  let allDraft = [];
  after = null;
  page = 1;
  console.error('Fetching DRAFT...');
  do {
    const q = after
      ? 'query($after: String!) { products(first: 50, query: "status:DRAFT", after: $after) { edges { node { ' + FIELDS + ' } } pageInfo { hasNextPage endCursor } } }'
      : 'query { products(first: 50, query: "status:DRAFT") { edges { node { ' + FIELDS + ' } } pageInfo { hasNextPage endCursor } } }';
    const vars = after ? { after } : {};
    const data = await fetchProducts(q, vars);
    const edges = data.products.edges;
    allDraft.push(...edges.map(e => e.node));
    after = data.products.pageInfo.hasNextPage ? data.products.pageInfo.endCursor : null;
    console.error(`  Page ${page++}: ${edges.length} products (total: ${allDraft.length}), hasMore=${data.products.pageInfo.hasNextPage}`);
  } while (after);

  const all = [...allActive, ...allDraft];
  console.error(`\nTotal: ${all.length} (${allActive.length} active, ${allDraft.length} draft)`);

  // Show first 5
  all.slice(0, 5).forEach((p, i) => {
    console.log(`\n[${i}] ${p.title}`);
    console.log(`  ID: ${p.id} | Status: ${p.status} | Type: ${p.productType}`);
    console.log(`  Tags: ${p.tags.join(', ') || '(none)'}`);
    const v = p.variants.edges[0]?.node;
    console.log(`  Variant: "${v?.title}" @ $${v?.price}`);
    console.log(`  SEO: ${p.seo?.title || '(none)'}`);
  });

  fs.writeFileSync(join(__dirname, 'all_products.json'), JSON.stringify(all, null, 2));
  console.log(`\nSaved ${all.length} products to all_products.json`);
}

main().catch(e => { console.error('FATAL:', e.message); process.exit(1); });
