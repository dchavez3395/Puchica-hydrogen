import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query {
  collectionByHandle(handle: "for-you") {
    id
    title
    productsCount {
      count
    }
    products(first: 5) {
      nodes {
        title
      }
    }
  }
  publications(first: 10) {
    nodes {
      id
      name
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
  console.log('Querying collection and publications...');
  const res = await adminGraphQL(query);
  console.log('Raw response:', JSON.stringify(res, null, 2));
  const collection = res?.data?.collectionByHandle;
  const publications = res?.data?.publications?.nodes || [];
  
  if (!collection) {
    console.error('Error: Collection "for-you" not found.');
    process.exit(1);
  }

  console.log(`Found collection: "${collection.title}" (ID: ${collection.id})`);
  console.log(`Products Count: ${collection.productsCount.count}`);
  console.log(`First few products:`, collection.products?.nodes?.map(n => n.title));
  console.log('Available publications:');
  for (const pub of publications) {
    console.log(`- Name: "${pub.name}" (ID: ${pub.id})`);
  }

  // Find publication named "Hydrogen" or "Headless" or containing "storefront"
  const headlessPub = publications.find(p => /headless|hydrogen/i.test(p.name));
  let publicationId = headlessPub?.id;

  if (!publicationId && publications.length > 0) {
    // Fallback to first publication
    publicationId = publications[0].id;
  }

  if (!publicationId) {
    console.error('Error: No publications found.');
    process.exit(1);
  }

  console.log('Publishing collection to ALL active publication channels...');
  for (const pub of publications) {
    console.log(`- Publishing to: "${pub.name}" (ID: ${pub.id})...`);
    const pubRes = await adminGraphQL(publishMutation, {
      id: collection.id,
      input: [{ publicationId: pub.id }]
    });

    const pubErrors = pubRes?.data?.publishablePublish?.userErrors || [];
    if (pubErrors.length > 0) {
      console.warn(`  [WARN] Failed for "${pub.name}":`, JSON.stringify(pubErrors, null, 2));
    } else {
      console.log(`  [SUCCESS] Published to "${pub.name}"`);
    }
  }

  console.log('SUCCESS: Collection is now successfully published everywhere!');
}

main().catch(console.error);
