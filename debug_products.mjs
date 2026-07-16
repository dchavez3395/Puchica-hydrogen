// debug_products.mjs
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

// Simple test query first
console.log('Testing simple query...');
const simple = await adminGraphQL('{ products(first: 3) { edges { node { id title } } pageInfo { hasNextPage endCursor } } }');
console.log('Simple result:', JSON.stringify(simple, null, 2).slice(0, 500));

// Now test with filter
console.log('\nTesting with status filter...');
const filtered = await adminGraphQL('{ products(first: 3, query: "status:ACTIVE") { edges { node { id title status } } pageInfo { hasNextPage endCursor } } }');
console.log('Filtered result:', JSON.stringify(filtered, null, 2).slice(0, 500));
