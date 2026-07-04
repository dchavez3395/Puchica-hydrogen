import dotenv from 'dotenv';
dotenv.config();

import { writeFileSync, mkdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';

const query = `
query($after: String) {
  products(first: 250, sortKey: BEST_SELLING, after: $after) {
    edges {
      node {
        id
        title
        productType
        featuredImage { url }
        images(first: 10) {
          edges {
            node {
              url
            }
          }
        }
      }
    }
    pageInfo {
      hasNextPage
      endCursor
    }
  }
}
`;

async function fetchStorefrontProducts() {
  const store = process.env.PUBLIC_STORE_DOMAIN;
  const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;

  if (!store || !token) {
    throw new Error('Missing PUBLIC_STORE_DOMAIN or PUBLIC_STOREFRONT_API_TOKEN in env.');
  }

  let after = null;
  let hasNext = true;
  let allProducts = [];

  console.log('Fetching products sorted by BEST_SELLING from Storefront API...');
  while (hasNext) {
    const res = await fetch(`https://${store}/api/2026-04/graphql.json`, {
      method: 'POST',
      headers: {
        'X-Shopify-Storefront-Access-Token': token,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        query,
        variables: { after }
      })
    });

    if (!res.ok) {
      const text = await res.text();
      throw new Error(`Storefront API request failed (HTTP ${res.status}): ${text}`);
    }

    const json = await res.json();
    const connection = json?.data?.products;
    if (!connection) {
      console.warn('No connection returned, response:', JSON.stringify(json));
      break;
    }

    const nodes = (connection.edges || []).map(e => e.node);
    allProducts.push(...nodes);
    console.log(`  Fetched ${allProducts.length} products...`);
    
    hasNext = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  return allProducts;
}

async function main() {
  const allProducts = await fetchStorefrontProducts();
  console.log(`Total active products fetched: ${allProducts.length}`);

  const batchA = [];
  const batchB = [];
  const batchC = [];

  const rxA = /\b(jersey|maillot|soccer)\b/i;
  const rxB = /\b(Canada|Portugal|Argentina|Brasil|Fifa|World Cup)\b/i;

  for (const node of allProducts) {
    const images = node.images?.edges || [];
    const hasHiggsfield = images.some(img => img.node?.url && img.node.url.includes('/hf_'));

    const title = node.title || '';
    const isJersey = rxA.test(title);
    const isWorldCupApparel = rxB.test(title);

    if (hasHiggsfield && (isJersey || isWorldCupApparel)) {
      continue;
    }

    if (isJersey) {
      batchA.push(node);
    } else if (isWorldCupApparel) {
      batchB.push(node);
    } else {
      batchC.push(node);
    }
  }

  // Ensure work/ exists
  mkdirSync('work', { recursive: true });

  const writeIfMissing = (fileName, data) => {
    const filePath = join('work', fileName);
    if (existsSync(filePath)) {
      console.log(`- [preserve] Existing file ${fileName} preserved`);
    } else {
      writeFileSync(filePath, JSON.stringify(data, null, 2));
      console.log(`- [created] Created ${fileName} with ${data.length} products`);
    }
  };

  // Limit Batch C to top 100 best-sellers
  const limitedBatchC = batchC.slice(0, 100);
  // Batch D is the next 500 best-sellers
  const batchD = batchC.slice(100, 600);
  // Batch E is the next 500 best-sellers
  const batchE = batchC.slice(600, 1100);
  // Batch F is the next 500 best-sellers
  const batchF = batchC.slice(1100, 1600);

  console.log(`\nWriting/preserving batches:`);
  writeIfMissing('batch_a_pending.json', batchA);
  writeIfMissing('batch_b_pending.json', batchB);
  writeIfMissing('batch_c_pending.json', limitedBatchC);
  writeIfMissing('batch_d_pending.json', batchD);
  writeIfMissing('batch_e_pending.json', batchE);
  writeIfMissing('batch_f_pending.json', batchF);

  // Dynamically slice the rest of batchC into batches of 500 starting from Batch G
  let sliceStart = 1600;
  let batchChar = 'G';
  while (sliceStart < batchC.length) {
    const batchData = batchC.slice(sliceStart, sliceStart + 500);
    const fileName = `batch_${batchChar.toLowerCase()}_pending.json`;
    writeIfMissing(fileName, batchData);
    sliceStart += 500;
    batchChar = String.fromCharCode(batchChar.charCodeAt(0) + 1);
  }
}

main().catch(console.error);
