import { adminGraphQL } from './shopify-oauth.mjs';

const args = new Set(process.argv.slice(2));
const APPLY = args.has('--apply');
const CONFIRMED = args.has('--confirm-create-collection');
if (APPLY && !CONFIRMED) {
  throw new Error(
    'Collection creation requires --apply --confirm-create-collection.',
  );
}

const mutation = `
mutation CreateCollection($input: CollectionInput!) {
  collectionCreate(input: $input) {
    collection {
      id
      title
      handle
    }
    userErrors {
      field
      message
    }
  }
}
`;

const publishMutation = `
mutation PublishCollection($id: ID!, $input: [PublicationInput!]!) {
  publishablePublish(id: $id, input: $input) {
    userErrors {
      field
      message
    }
  }
}
`;

async function main() {
  if (!APPLY) {
    console.log(
      'PREVIEW ONLY — would create and optionally publish the legacy "For You" collection. No changes made.',
    );
    return;
  }
  console.log('Creating "For You" collection...');
  const res = await adminGraphQL(mutation, {
    input: {
      title: "For You",
      handle: "for-you",
      ruleSet: {
        appliedDisjunctively: false,
        rules: [
          {
            column: "TAG",
            relation: "EQUALS",
            condition: "for-you"
          }
        ]
      }
    }
  });

  if (res?.errors) {
    console.error('GraphQL errors:', JSON.stringify(res.errors, null, 2));
    process.exit(1);
  }

  const errors = res?.data?.collectionCreate?.userErrors || [];
  if (errors.length > 0) {
    console.error('User errors:', JSON.stringify(errors, null, 2));
    process.exit(1);
  }

  const collection = res.data.collectionCreate.collection;
  console.log(`Collection created! Title: ${collection.title}, Handle: ${collection.handle}, ID: ${collection.id}`);

  // Now, publish it to our storefront channel!
  const storefrontId = process.env.PUBLIC_STOREFRONT_ID;
  if (storefrontId) {
    console.log(`Publishing collection to publication channel: ${storefrontId}...`);
    // Format publication ID correctly
    const publicationId = storefrontId.startsWith('gid://') ? storefrontId : `gid://shopify/Publication/${storefrontId}`;
    const pubRes = await adminGraphQL(publishMutation, {
      id: collection.id,
      input: [{ publicationId }]
    });
    
    const pubErrors = pubRes?.data?.publishablePublish?.userErrors || [];
    if (pubErrors.length > 0) {
      console.warn('[WARN] Failed to publish collection:', JSON.stringify(pubErrors, null, 2));
    } else {
      console.log('Collection successfully published to Storefront!');
    }
  } else {
    console.log('No PUBLIC_STOREFRONT_ID found. You may need to publish this collection in your Shopify Admin dashboard manually.');
  }
}

main().catch(console.error);
