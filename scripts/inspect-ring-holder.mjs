import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($id: ID!) {
  product(id: $id) {
    title
    productType
    media(first: 10) {
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
  const id = "gid://shopify/Product/9269953626362";
  const res = await adminGraphQL(query, { id });
  console.log(JSON.stringify(res, null, 2));
}

main().catch(console.error);
