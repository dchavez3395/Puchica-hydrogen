import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($id: ID!) {
  product(id: $id) {
    title
    featuredMedia {
      ... on MediaImage {
        id
        image { url }
      }
    }
  }
}
`;

async function main() {
  const checkpoint = JSON.parse(readFileSync(join('work', 'checkpoint.json'), 'utf8'));
  const doneIds = checkpoint.doneIds || [];

  console.log(`Verifying ${doneIds.length} products...`);
  const results = [];
  for (const id of doneIds) {
    const res = await adminGraphQL(query, { id });
    const product = res?.data?.product;
    const featuredUrl = product?.featuredMedia?.image?.url || '';
    const isNew = featuredUrl.includes('/hf_');
    results.push({
      id,
      title: product?.title || 'Unknown',
      featuredUrl,
      isNew
    });
  }

  console.log('\n--- VERIFICATION RESULTS ---');
  for (const r of results) {
    console.log(`- ${r.title} (${r.id}): ${r.isNew ? 'VERIFIED (hf_...)' : 'FAILED (old/no image)'}`);
    if (!r.isNew) {
      console.log(`  Current Featured URL: ${r.featuredUrl}`);
    }
  }
}

main().catch(console.error);
