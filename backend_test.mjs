import fs from 'fs';

const STOREFRONT_TOKEN = 'ced30477a7769fdc3d80ebff7f151a4a';
const STORE_DOMAIN = 'ug91ve-sz.myshopify.com';
const API_VERSION = '2025-01';

async function graphql(query, variables = {}) {
  const res = await fetch(`https://${STORE_DOMAIN}/api/${API_VERSION}/graphql.json`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Shopify-Storefront-Access-Token': STOREFRONT_TOKEN,
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors) throw new Error(JSON.stringify(json.errors));
  return json.data;
}

const query = `query($query: String!, $first: Int!, $after: String) {
  products(query: $query, first: $first, after: $after) {
    edges {
      node {
        id
        title
        status
        productType
        tags
        vendor
        descriptionHtml
        seo { title description }
        variants(first: 50) { edges { node { id price title } } }
        images(first: 3) { edges { node { url } } }
      }
    }
    pageInfo { hasNextPage endCursor }
  }
}`;

const data = await graphql(query, { query: "status:ACTIVE", first: 5 });
const products = data.products.edges.map(e => e.node);

console.log('PRODUCTS FOUND: ' + products.length);
products.forEach((p, i) => {
  console.log(`\n[${i}] ${p.title}`);
  console.log(`  ID: ${p.id}`);
  console.log(`  Status: ${p.status} | Type: ${p.productType}`);
  console.log(`  Tags: ${p.tags.join(', ') || '(none)'}`);
  const v = p.variants.edges[0]?.node;
  console.log(`  Variant: ${v?.title} @ $${v?.price}`);
  console.log(`  Img: ${p.images.edges[0]?.node.url || 'none'}`);
});

fs.writeFileSync('D:/puchica-storefront/test_products.json', JSON.stringify(products, null, 2));
console.log('\nSaved to D:/puchica-storefront/test_products.json');
