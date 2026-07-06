// debug_auth.mjs
import fs from 'fs';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load env from project root
const envPath = join(__dirname, 'env');
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const m = line.match(/^([A-Z_]+)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  }
}

console.log('SHOPIFY_CLIENT_ID:', process.env.SHOPIFY_CLIENT_ID ? 'SET' : 'MISSING');
console.log('SHOPIFY_CLIENT_SECRET:', process.env.SHOPIFY_CLIENT_SECRET ? 'SET' : 'MISSING');
console.log('PUBLIC_STORE_DOMAIN:', process.env.PUBLIC_STORE_DOMAIN);

// Try getting token directly
const { getAdminToken } = await import('./scripts/shopify-oauth.mjs');
try {
  const token = await getAdminToken();
  console.log('Token obtained:', token.slice(0, 20) + '...');

  // Try a simple query
  const { adminGraphQL } = await import('./scripts/shopify-oauth.mjs');
  const data = await adminGraphQL('{ shop { name } }');
  console.log('Shop query result:', JSON.stringify(data));
} catch(e) {
  console.error('Error:', e.message);
}
