// scripts/revert-catalog.mjs
//
// Automatically deletes all generated images (containing "/hf_") from Shopify,
// reverting all products back to their original clean stock photos.

import dotenv from 'dotenv';
dotenv.config();

import { adminGraphQL } from './shopify-oauth.mjs';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const CONFIRMED = args.has('--confirm-delete-generated-media');
if (APPLY && !CONFIRMED) {
  throw new Error(
    'Media deletion requires --apply --confirm-delete-generated-media.',
  );
}

const getProductsQuery = `
  query($cursor: String) {
    products(first: 50, after: $cursor) {
      pageInfo {
        hasNextPage
        endCursor
      }
      edges {
        node {
          id
          title
          media(first: 10) {
            edges {
              node {
                id
                mediaContentType
                ... on MediaImage {
                  image {
                    url
                  }
                }
              }
            }
          }
        }
      }
    }
  }
`;

const deleteMediaMutation = `
  mutation($productId: ID!, $mediaIds: [ID!]!) {
    productDeleteMedia(productId: $productId, mediaIds: $mediaIds) {
      deletedMediaIds
      userErrors {
        field
        message
      }
    }
  }
`;

async function revertProduct(product) {
  const mediaEdges = product.media?.edges || [];
  const generatedMediaIds = [];

  for (const edge of mediaEdges) {
    const node = edge.node;
    if (node.mediaContentType === 'IMAGE') {
      const url = node.image?.url || '';
      if (url.includes('/hf_')) {
        generatedMediaIds.push(node.id);
      }
    }
  }

  if (generatedMediaIds.length === 0) {
    return false; // No generated images to clean up
  }

  if (!APPLY) {
    console.log(
      `PREVIEW: would delete ${generatedMediaIds.length} generated image(s) from "${product.title}".`,
    );
    return false;
  }

  console.log(`Reverting "${product.title}": Deleting ${generatedMediaIds.length} generated image(s)...`);
  
  try {
    const response = await adminGraphQL(deleteMediaMutation, {
      productId: product.id,
      mediaIds: generatedMediaIds
    });

    const errors = response?.data?.productDeleteMedia?.userErrors || [];
    if (errors.length > 0) {
      console.error(`  [ERROR] Failed to revert: ${JSON.stringify(errors)}`);
      return false;
    }

    console.log(`  SUCCESS: Reverted to original stock photo.`);
    return true;
  } catch (err) {
    console.error(`  [ERROR] Mutation failed: ${err.message}`);
    return false;
  }
}

async function main() {
  let hasNext = true;
  let cursor = null;
  let totalReverted = 0;
  let totalChecked = 0;

  console.log(
    APPLY
      ? 'Starting confirmed catalog media deletion...'
      : 'PREVIEW ONLY — scanning generated media; no images will be deleted.',
  );

  while (hasNext) {
    const res = await adminGraphQL(getProductsQuery, { cursor });
    const productEdges = res?.data?.products?.edges || [];
    
    for (const edge of productEdges) {
      totalChecked++;
      const reverted = await revertProduct(edge.node);
      if (reverted) {
        totalReverted++;
      }
    }

    const pageInfo = res?.data?.products?.pageInfo;
    hasNext = pageInfo?.hasNextPage || false;
    cursor = pageInfo?.endCursor || null;
    
    console.log(`Progress: Checked ${totalChecked} products, reverted ${totalReverted}.`);
  }

  console.log(
    APPLY
      ? `\nReversion complete. Cleaned up generated images on ${totalReverted} products.`
      : '\nPreview complete. No generated images were deleted.',
  );
}

main().catch(err => {
  console.error('Fatal error during reversion:', err);
  process.exit(1);
});
