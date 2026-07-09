import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($id: ID!) {
  product(id: $id) {
    id
    title
    productType
    media(first: 20) {
      nodes {
        ... on MediaImage {
          id
          image { url }
        }
      }
    }
  }
}
`;

async function main() {
  let doneIds = [];
  try {
    const checkpoint = JSON.parse(readFileSync(join('work', 'checkpoint.json'), 'utf8'));
    doneIds = checkpoint.doneIds || [];
  } catch (e) {
    console.error('Failed to read checkpoint:', e.message);
    process.exit(1);
  }

  console.log(`Loaded checkpoint. Total done products: ${doneIds.length}`);
  
  // Pick a representative sample of 15 products across the list
  const sampleSize = 15;
  const sampledIds = [];
  if (doneIds.length <= sampleSize) {
    sampledIds.push(...doneIds);
  } else {
    for (let i = 0; i < sampleSize; i++) {
      const idx = Math.floor((i * doneIds.length) / sampleSize);
      sampledIds.push(doneIds[idx]);
    }
  }

  console.log(`Querying Shopify for ${sampledIds.length} sampled products...`);
  const productsData = [];

  for (const id of sampledIds) {
    try {
      const res = await adminGraphQL(query, { id });
      const product = res?.data?.product;
      if (!product) {
        console.warn(`Product ${id} not found.`);
        continue;
      }

      const mediaNodes = product.media?.nodes || [];
      const generated = mediaNodes.find(n => n.image?.url && n.image.url.includes('/hf_'));
      const originals = mediaNodes.filter(n => n.image?.url && !n.image.url.includes('/hf_'));

      productsData.push({
        id: product.id,
        title: product.title,
        productType: product.productType,
        generatedUrl: generated ? generated.image.url : null,
        originalUrls: originals.map(o => o.image.url)
      });
      console.log(`Fetched: ${product.title}`);
    } catch (err) {
      console.error(`Error fetching ${id}:`, err.message);
    }
  }

  const outputPath = join('work', 'sampled_image_comparison.json');
  writeFileSync(outputPath, JSON.stringify(productsData, null, 2));
  console.log(`Saved comparison data to ${outputPath}`);
}

main().catch(console.error);
