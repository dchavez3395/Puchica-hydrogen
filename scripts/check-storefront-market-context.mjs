import dotenv from 'dotenv';

dotenv.config();

const store = process.env.PUBLIC_STORE_DOMAIN;
const token = process.env.PUBLIC_STOREFRONT_API_TOKEN;

if (!store || !token) {
  throw new Error(
    'PUBLIC_STORE_DOMAIN and PUBLIC_STOREFRONT_API_TOKEN are required',
  );
}

const query = `#graphql
  query MarketContextCheck($country: CountryCode!)
  @inContext(country: $country) {
    products(first: 20, query: "tag:puchica-launch-ready") {
      nodes {
        handle
        title
        availableForSale
        priceRange {
          minVariantPrice {
            amount
            currencyCode
          }
        }
      }
    }
  }
`;

async function check(country) {
  const response = await fetch(
    `https://${store}/api/2026-04/graphql.json`,
    {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-Shopify-Storefront-Access-Token': token,
      },
      body: JSON.stringify({query, variables: {country}}),
    },
  );

  const payload = await response.json();
  if (!response.ok || payload.errors) {
    throw new Error(
      `${country} Storefront request failed: ${JSON.stringify(payload)}`,
    );
  }

  return {
    country,
    count: payload.data.products.nodes.length,
    products: payload.data.products.nodes,
  };
}

const results = await Promise.all(['CA', 'US'].map(check));
console.log(JSON.stringify(results, null, 2));
