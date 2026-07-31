import fs from 'node:fs/promises';
import dotenv from 'dotenv';
import {adminGraphQL} from './shopify-oauth.mjs';

dotenv.config({path: 'D:/puchica-store/.env'});

const apply = process.argv.includes('--apply');
const products = JSON.parse(
  await fs.readFile('outputs/sales-readiness/shopify-products.json', 'utf8'),
);

const mutation = `#graphql
  mutation RepairProductEncoding($product: ProductUpdateInput!) {
    productUpdate(product: $product) {
      product { id handle }
      userErrors { field message }
    }
  }
`;

function repair(value) {
  if (typeof value !== 'string') return value;
  return value
    .replace(/ \uFFFD /g, ' \u00d7 ')
    .replace(/airline\uFFFDs/g, 'airline\u2019s');
}

const changes = products.flatMap((product) => {
  const descriptionHtml = repair(product.descriptionHtml);
  const seoDescription = repair(product.seo?.description);
  if (
    descriptionHtml === product.descriptionHtml &&
    seoDescription === product.seo?.description
  ) {
    return [];
  }
  return [{
    id: product.id,
    handle: product.handle,
    product: {
      id: product.id,
      descriptionHtml,
      ...(product.seo
        ? {seo: {title: product.seo.title || '', description: seoDescription || ''}}
        : {}),
    },
  }];
});

if (apply) {
  for (const change of changes) {
    const response = await adminGraphQL(mutation, {product: change.product});
    if (response.errors?.length) throw new Error(JSON.stringify(response.errors));
    const errors = response.data.productUpdate.userErrors;
    if (errors.length) throw new Error(JSON.stringify(errors));
  }
}

console.log(JSON.stringify({apply, changed: changes.length, handles: changes.map(({handle}) => handle)}, null, 2));
