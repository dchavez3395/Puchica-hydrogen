import dotenv from 'dotenv';
dotenv.config();

const PUBLIC_STORE_DOMAIN = process.env.PUBLIC_STORE_DOMAIN;
const PUBLIC_STOREFRONT_API_TOKEN = process.env.PUBLIC_STOREFRONT_API_TOKEN;

const query = `
query getCollection($handle: String!) {
  collection(handle: $handle) {
    id
    title
    handle
    products(first: 5) {
      nodes {
        title
      }
    }
  }
}
`;

async function main() {
  console.log(`Querying Storefront API for collection "for-you"...`);
  console.log(`Domain: ${PUBLIC_STORE_DOMAIN}`);

  const endpoint = `https://${PUBLIC_STORE_DOMAIN}/api/2024-04/graphql.json`;
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': PUBLIC_STOREFRONT_API_TOKEN
    },
    body: JSON.stringify({
      query,
      variables: { handle: 'for-you' }
    })
  });

  if (!res.ok) {
    console.error(`HTTP Error: ${res.status} ${res.statusText}`);
    process.exit(1);
  }

  const json = await res.json();
  console.log('Storefront Response:', JSON.stringify(json, null, 2));
}

main().catch(console.error);
