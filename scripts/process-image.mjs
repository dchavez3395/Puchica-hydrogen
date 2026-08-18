import { readFileSync, existsSync } from 'node:fs';
import { adminGraphQL } from './shopify-oauth.mjs';

async function uploadToTmpfiles(filePath, fileName) {
  if (!existsSync(filePath)) {
    throw new Error(`File does not exist: ${filePath}`);
  }
  const fileBytes = readFileSync(filePath);
  const fd = new FormData();
  fd.append('file', new Blob([fileBytes], { type: 'image/jpeg' }), fileName);

  const res = await fetch('https://tmpfiles.org/api/v1/upload', {
    method: 'POST',
    body: fd,
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Upload failed (HTTP ${res.status}): ${text}`);
  }

  const json = await res.json();
  if (json.status !== 'success' || !json.data?.url) {
    throw new Error(`Upload response error: ${JSON.stringify(json)}`);
  }

  // Convert viewer URL to direct download URL
  // Example: https://tmpfiles.org/wZwsbyY9S6yX/test.jpg -> https://tmpfiles.org/dl/wZwsbyY9S6yX/test.jpg
  const viewerUrl = json.data.url;
  const directUrl = viewerUrl.replace('https://tmpfiles.org/', 'https://tmpfiles.org/dl/');
  return directUrl;
}

const attachMutation = `
mutation($productId: ID!, $media: [CreateMediaInput!]!) {
  productUpdate(product: {id: $productId}, media: $media) {
    product { id }
    userErrors { field message }
  }
}
`;

const mediaQuery = `
query($id: ID!) {
  product(id: $id) {
    media(first: 100) {
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

const reorderMutation = `
mutation($productId: ID!, $moves: [MoveInput!]!) {
  productReorderMedia(id: $productId, moves: $moves) {
    job { id }
    userErrors { field message }
  }
}
`;

async function main() {
  const rawArgs = process.argv.slice(2);
  const APPLY = rawArgs.includes('--apply');
  const CONFIRMED = rawArgs.includes('--confirm-image-upload');
  if (!APPLY || !CONFIRMED) {
    throw new Error(
      'Image upload requires --apply --confirm-image-upload. No file was uploaded.',
    );
  }
  const args = rawArgs.filter((arg) => !arg.startsWith('--'));
  const productId = args[0];
  const filePath = args[1];
  const altText = args[2] || '';

  if (!productId || !filePath) {
    console.error(
      'Usage: node scripts/process-image.mjs <productId> <filePath> [altText] --apply --confirm-image-upload',
    );
    process.exit(1);
  }

  try {
    const fileName = `hf_${Date.now()}_${productId.split('/').pop()}.jpg`;
    console.log(`Uploading ${filePath} to tmpfiles.org as ${fileName}...`);
    const publicUrl = await uploadToTmpfiles(filePath, fileName);
    console.log(`Public URL: ${publicUrl}`);

    // Step 1: Attach image to product
    console.log('Attaching image to product in Shopify...');
    const attachRes = await adminGraphQL(attachMutation, {
      productId,
      media: [{
        originalSource: publicUrl,
        mediaContentType: 'IMAGE',
        alt: altText,
      }]
    });

    if (attachRes?.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(attachRes.errors)}`);
    }

    const attachErrors = attachRes?.data?.productUpdate?.userErrors || [];
    if (attachErrors.length > 0) {
      throw new Error(`Attach userErrors: ${JSON.stringify(attachErrors)}`);
    }

    // Step 2: Query product media to find the new MediaImage ID
    console.log('Querying product media to find the new MediaImage ID...');
    // Shopify downloads originalSource asynchronously, so we may need to wait or poll
    let mediaId = null;
    const maxRetries = 35;
    for (let attempt = 1; attempt <= maxRetries; attempt++) {
      await new Promise(r => setTimeout(r, 2000));
      const mediaRes = await adminGraphQL(mediaQuery, { id: productId });
      const nodes = mediaRes?.data?.product?.media?.nodes || [];
      const match = nodes.find(n => {
        if (!n?.image?.url) return false;
        // Compare filenames without extension
        const a = new URL(n.image.url).pathname.split('/').pop().split('.')[0];
        const b = new URL(publicUrl).pathname.split('/').pop().split('.')[0];
        return a === b;
      });
      if (match?.id) {
        mediaId = match.id;
        break;
      }
      console.log(`  Attempt ${attempt}/${maxRetries}: New media ID not found yet. Retrying...`);
    }

    if (!mediaId) {
      throw new Error(`Could not find new MediaImage ID matching ${publicUrl}`);
    }
    console.log(`Found MediaImage ID: ${mediaId}`);

    // Step 3: Reorder media so this image becomes featured (position "0")
    console.log('Setting as featured image...');
    const reorderRes = await adminGraphQL(reorderMutation, {
      productId,
      moves: [{ id: mediaId, newPosition: '0' }]
    });

    if (reorderRes?.errors) {
      throw new Error(`GraphQL errors: ${JSON.stringify(reorderRes.errors)}`);
    }

    const reorderErrors = reorderRes?.data?.productReorderMedia?.userErrors || [];
    if (reorderErrors.length > 0) {
      throw new Error(`Reorder userErrors: ${JSON.stringify(reorderErrors)}`);
    }

    console.log('SUCCESS: Image attached and set as featured!');
    console.log(`RESULT_URL:${publicUrl}`);
  } catch (error) {
    console.error('FAILED:', error.message);
    process.exit(1);
  }
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
