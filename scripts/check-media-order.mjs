import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($id: ID!) {
  product(id: $id) {
    title
    media(first: 10) {
      nodes {
        id
        ... on MediaImage {
          image { url }
        }
      }
    }
  }
}
`;

async function main() {
  const id = "gid://shopify/Product/9270083453178"; // Almond Latte - Cute Magnetic Power Bank
  const res = await adminGraphQL(query, { id });
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
