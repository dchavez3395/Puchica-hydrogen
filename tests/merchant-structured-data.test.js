import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

test('organization schema publishes the actual shared return policy', async () => {
  const source = await readFile(
    new URL('../app/lib/seo.js', import.meta.url),
    'utf8',
  );

  assert.match(source, /hasMerchantReturnPolicy/);
  assert.match(source, /applicableCountry:\s*\['CA', 'US'\]/);
  assert.match(source, /merchantReturnDays:\s*30/);
  assert.match(source, /https:\/\/schema\.org\/ReturnByMail/);
  assert.match(source, /ReturnFeesCustomerResponsibility/);
  assert.match(source, /itemDefectReturnFees:\s*'https:\/\/schema\.org\/FreeReturn'/);
  assert.match(source, /refund-policy#merchant-return-policy/);
});

test('product offers reference the shared merchant return policy', async () => {
  const source = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.match(source, /hasMerchantReturnPolicy/);
  assert.match(source, /refund-policy#merchant-return-policy/);
  assert.doesNotMatch(source, /aggregateRating:\s*\{/);
});
