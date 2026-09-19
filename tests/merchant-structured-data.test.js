import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('organization schema publishes the actual shared return policy', async () => {
  const source = await readFile(
    new URL('../app/lib/seo.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /hasMerchantReturnPolicy/);
  assert.match(source, /applicableCountry:\s*\['CA'\]/);
  assert.match(source, /merchantReturnDays:\s*30/);
  assert.match(source, /https:\/\/schema\.org\/ReturnByMail/);
  assert.match(source, /ReturnFeesCustomerResponsibility/);
  assert.match(source, /itemDefectReturnFees:\s*'https:\/\/schema\.org\/FreeReturn'/);
  assert.match(source, /refund-policy#merchant-return-policy/);
  assert.match(source, /hasMerchantReturnPolicy: merchantReturnPolicyJsonLd\(\)/);
});

test('the return policy and shipping details are full nodes, Canada only', async () => {
  // 2026-09-19 schema audit: every PDP offer carried only an @id pointer to a
  // return policy that lived on the homepage, and no shippingDetails at all.
  // seo.js imports through the ~ alias, so assert on source like its siblings.
  const source = await readFile(
    new URL('../app/lib/seo.js', import.meta.url),
    'utf8',
  );
  assert.match(source, /export function merchantReturnPolicyJsonLd\(\)/);
  assert.match(source, /export function shippingDetailsJsonLd\(\)/);
  assert.match(source, /'@type': 'OfferShippingDetails'/);
  assert.match(source, /shippingRate: \{'@type': 'MonetaryAmount', value: '0\.00', currency: 'CAD'\}/);
  assert.match(source, /shippingDestination: \{'@type': 'DefinedRegion', addressCountry: 'CA'\}/);
  assert.match(source, /transitTime:[\s\S]*?maxValue: 21/);
});

test('product offers inline the return policy and shipping details, and the PDP carries the Organization', async () => {
  const source = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /hasMerchantReturnPolicy: merchantReturnPolicyJsonLd\(\)/);
  assert.match(source, /shippingDetails: shippingDetailsJsonLd\(\)/);
  assert.match(source, /<JsonLdScript data=\{organizationJsonLd\(\{\}\)\} \/>/);
  assert.doesNotMatch(source, /hasMerchantReturnPolicy:\s*\{\s*'@id'/);
  assert.doesNotMatch(source, /aggregateRating:\s*\{/);
});
