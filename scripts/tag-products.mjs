import { adminGraphQL } from './shopify-oauth.mjs';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const CONFIRMED = args.has('--confirm-bulk-tag');
if (APPLY && !CONFIRMED) {
  throw new Error('Bulk tagging requires --apply --confirm-bulk-tag.');
}

const productsQuery = `
query($after: String) {
  products(first: 250, after: $after) {
    edges {
      node {
        id
        title
        tags
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

const tagAddMutation = `
mutation($id: ID!, $tags: [String!]!) {
  tagsAdd(id: $id, tags: $tags) {
    node { id }
    userErrors { field message }
  }
}
`;

async function main() {
  let after = null;
  let hasNext = true;
  const productsToTag = [];

  console.log('Scanning all products in catalog for Higgsfield images...');
  while (hasNext) {
    const res = await adminGraphQL(productsQuery, { after });
    const connection = res?.data?.products;
    if (!connection) break;

    const nodes = (connection.edges || []).map(e => e.node);
    for (const node of nodes) {
      const images = node.images?.edges || [];
      const hasHiggsfield = images.some(img => img.node?.url && img.node.url.includes('/hf_'));
      const hasTag = node.tags && node.tags.includes('for-you');

      if (hasHiggsfield && !hasTag) {
        productsToTag.push(node);
      }
    }

    hasNext = connection.pageInfo.hasNextPage;
    after = connection.pageInfo.endCursor;
  }

  console.log(`Found ${productsToTag.length} products with Higgsfield images missing the 'for-you' tag.`);

  if (productsToTag.length === 0) {
    console.log('All products already tagged correctly.');
    return;
  }

  if (!APPLY) {
    console.log('PREVIEW ONLY — no product tags changed.');
    for (const product of productsToTag.slice(0, 20)) {
      console.log(`  WOULD TAG: ${product.title}`);
    }
    return;
  }

  for (let i = 0; i < productsToTag.length; i++) {
    const prod = productsToTag[i];
    console.log(`[${i+1}/${productsToTag.length}] Tagging: ${prod.title}...`);
    const res = await adminGraphQL(tagAddMutation, {
      id: prod.id,
      tags: ['for-you']
    });

    const errs = res?.data?.tagsAdd?.userErrors || [];
    if (errs.length > 0) {
      console.error(`  Error tagging ${prod.id}: ${JSON.stringify(errs)}`);
    } else {
      console.log(`  Successfully tagged.`);
    }
  }

  console.log('Tagging complete!');
}

main().catch(console.error);
