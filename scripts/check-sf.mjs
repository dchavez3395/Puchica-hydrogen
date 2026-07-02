import dotenv from 'dotenv';
dotenv.config();

const store = process.env.PUBLIC_STORE_DOMAIN;
const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;

const query = `
query($id: ID!) {
  product(id: $id) {
    title
    featuredImage {
      url
    }
    images(first: 5) {
      nodes {
        url
      }
    }
  }
}
`;

async function main() {
  const id = "gid://shopify/Product/9270081650938"; // Almond Latte - Cute iPhone 15 Case
  const res = await fetch(`https://${store}/api/2026-04/graphql.json`, {
    method: 'POST',
    headers: {
      'X-Shopify-Storefront-Access-Token': token,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      query,
      variables: { id }
    })
  });
  const json = await res.json();
  console.log(JSON.stringify(json, null, 2));
}

main().catch(console.error);
