import { writeFileSync, mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { adminGraphQL } from './shopify-oauth.mjs';

const query = `
query($query: String!, $first: Int!, $after: String) {
  products(query: $query, first: $first, after: $after) {
    edges {
      node {
        id
        title
        status
        featuredImage { url }
        images(first: 5) { edges { node { url } } }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}
`;

async function fetchAll() {
  const queryStr = "status:active AND (title:jersey OR title:maillot OR title:soccer)";
  let after = null;
  let allProducts = [];
  let hasNext = true;

  while (hasNext) {
    const response = await adminGraphQL(query, { query: queryStr, first: 50, after });
    const productsConnection = response?.data?.products;
    if (!productsConnection) {
      break;
    }
    const edges = productsConnection.edges || [];
    for (const edge of edges) {
      const node = edge.node;
      // Heuristic: check if any image URL has /hf_
      const images = node.images?.edges || [];
      const hasHiggsfieldImage = images.some(img => img.node?.url && img.node.url.includes('/hf_'));
      if (!hasHiggsfieldImage) {
        allProducts.push(node);
      }
    }
    hasNext = productsConnection.pageInfo.hasNextPage;
    after = productsConnection.pageInfo.endCursor;
  }

  // Ensure work/ directory exists
  mkdirSync('work', { recursive: true });
  writeFileSync(join('work', 'products.json'), JSON.stringify(allProducts, null, 2));
  console.log(`Fetch complete (${allProducts.length} products)`);
}

fetchAll().catch(err => {
  console.error(err);
  process.exit(1);
});
