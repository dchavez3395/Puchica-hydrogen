import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const productRoute = readFileSync('app/routes/products.$handle.jsx', 'utf8');

test('English PDP titles come from the Shopify SEO field when one is set', () => {
  // The comment claimed this for months while the code ignored seo.title
  // entirely, so anything written in Shopify's SEO title box did nothing.
  assert.match(productRoute, /const storedTitle = typeof seo\.title === 'string'/);
  assert.match(productRoute, /langKey === 'en' && storedTitle/);
});

test('translated PDP titles never fall back to the English SEO field', () => {
  // seo.title holds a single English string. Using it in fr/es/pt-br would
  // replace localized copy with English and undo the i18n work.
  assert.match(
    productRoute,
    /: `\$\{productTitle\}\$\{dict\.pdp_meta_title_suffix\}`/,
  );
  assert.doesNotMatch(productRoute, /const title = seo\.title/);
});
