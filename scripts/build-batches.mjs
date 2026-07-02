import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($after: String) {
  products(first: 250, after: $after) {
    edges {
      node {
        id
        title
        status
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

async function main() {
  let after = null;
  let hasNext = true;
  let allProducts = [];

  console.log('Fetching all active products from Shopify...');
  while (hasNext) {
    const res = await adminGraphQL(query, { after });
    const connection = res?.data?.products;
    if (!connection) break;
    allProducts.push(...(connection.edges || []).map(e => e.node));
    hasNext = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  console.log(`Total active products fetched: ${allProducts.length}`);

  const batchA = [];
  const batchB = [];
  const batchC = [];

  const rxA = /\b(jersey|maillot|soccer)\b/i;
  const rxB = /\b(Canada|Portugal|Argentina|Brasil|Fifa|World Cup)\b/i;

  for (const node of allProducts) {
    if (node.status !== 'ACTIVE') continue;

    // Check if it already has a Higgsfield image
    const images = node.images?.edges || [];
    const hasHiggsfield = images.some(img => img.node?.url && img.node.url.includes('/hf_'));
    if (hasHiggsfield) continue; // Skip already done

    const title = node.title || '';
    if (rxA.test(title)) {
      batchA.push(node);
    } else if (rxB.test(title)) {
      batchB.push(node);
    } else {
      batchC.push(node);
    }
  }

  // Ensure work/ exists
  mkdirSync('work', { recursive: true });

  writeFileSync(join('work', 'batch_a_pending.json'), JSON.stringify(batchA, null, 2));
  writeFileSync(join('work', 'batch_b_pending.json'), JSON.stringify(batchB, null, 2));
  writeFileSync(join('work', 'batch_c_pending.json'), JSON.stringify(batchC, null, 2));

  console.log(`Categorized counts (remaining to generate):`);
  console.log(`- Batch A (Jerseys): ${batchA.length}`);
  console.log(`- Batch B (Rest of World Cup): ${batchB.length}`);
  console.log(`- Batch C (Remaining Active): ${batchC.length}`);
}

main().catch(console.error);
