import test from 'node:test';
import assert from 'node:assert/strict';
import {readFileSync} from 'node:fs';

const feed = readFileSync('app/routes/[feed.xml].tsx', 'utf8');
const productRoute = readFileSync('app/routes/products.$handle.jsx', 'utf8');

test('merchant feed asks Shopify for the Canadian catalog explicitly', () => {
  // Without @inContext the query resolves against whatever the shop's default
  // market happens to be, which is how the feed once advertised USD prices on
  // CAD product pages.
  assert.match(feed, /@inContext\(country: \$country\)/);
  assert.match(feed, /country: FEED_MARKET/);
  assert.match(feed, /const FEED_MARKET = 'CA'/);
});

test('merchant feed writes prices with real currency precision', () => {
  assert.match(feed, /function formatFeedPrice/);
  assert.match(feed, /toFixed\(2\)/);
  // Every price that reaches the XML must go through the formatter.
  assert.doesNotMatch(feed, /const price = firstVariant\.price\?\.amount/);
  assert.match(feed, /const price = formatFeedPrice\(/);
  assert.match(feed, /const regularPrice = onSale \? formatFeedPrice\(compareAt\) : price/);
});

test('merchant feed carries the fields Merchant Center rejects listings without', () => {
  for (const field of [
    'g:brand',
    'g:identifier_exists',
    'g:google_product_category',
    'g:availability',
    'g:condition',
  ]) {
    assert.ok(feed.includes(`<${field}>`), `feed is missing ${field}`);
  }
});

test('merchant feed reports availability instead of asserting it', () => {
  assert.doesNotMatch(feed, /const availability = 'in stock'/);
  assert.match(feed, /firstVariant\.availableForSale\s*\n?\s*\?\s*'in stock'/);
  assert.match(feed, /'out of stock'/);
});

test('product structured data names a brand and matches the displayed price', () => {
  assert.match(productRoute, /brand: \{'@type': 'Brand', name: 'Puchica'\}/);
  assert.match(productRoute, /const formatSchemaPrice =/);
  assert.match(productRoute, /price: formatSchemaPrice\(price\.amount\)/);
  assert.doesNotMatch(productRoute, /\n\s+price: price\.amount,/);
});
