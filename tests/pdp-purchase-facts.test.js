import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import test from 'node:test';

import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {presentLaunchProductCopy} from '../app/lib/product-presentation.js';

const FACT_KEYS = [
  'product_purchase_facts_h',
  'product_purchase_toiletry_1',
  'product_purchase_toiletry_2',
  'product_purchase_toiletry_3',
];

test('hero product purchase facts are translated in every storefront locale', () => {
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    for (const key of FACT_KEYS) {
      assert.ok(
        DICTIONARIES[locale]?.[key]?.trim(),
        `${locale} is missing ${key}`,
      );
    }
  }
});

test('purchase facts are limited to the validated toiletry hero', async () => {
  const route = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(route, /handle === 'travel-cable-organizer-case'/);
  assert.match(
    route,
    /handle === 'black-hanging-travel-toiletry-organizer'/,
  );
  assert.match(route, /className="pk-product__purchase-facts"/);
});

test('all three exact offers have complete localized product copy', () => {
  const handles = [
    '3-piece-packing-cube-set',
    'white-semi-circular-travel-jewelry-case',
    'black-hanging-travel-toiletry-organizer',
  ];
  for (const locale of ['en', 'fr', 'es', 'pt-br']) {
    assert.ok(DICTIONARIES[locale].product_department_travel);
    for (const handle of handles) {
      const copy = presentLaunchProductCopy(handle, DICTIONARIES[locale]);
      assert.ok(copy?.title, `${locale}/${handle} title missing`);
      assert.ok(copy?.summary, `${locale}/${handle} summary missing`);
      assert.match(copy?.descriptionHtml || '', /<p>/);
    }
  }

  assert.notEqual(
    presentLaunchProductCopy(handles[1], DICTIONARIES.en).title,
    presentLaunchProductCopy(handles[1], DICTIONARIES.fr).title,
  );
});
