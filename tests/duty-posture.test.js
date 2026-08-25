import test from 'node:test';
import assert from 'node:assert/strict';

import {DICTIONARIES} from '../app/lib/dictionaries.js';
import {
  DUTY_POSTURE,
  DUTY_POSTURES,
  dutyCopyKey,
  dutyEtaKey,
  isDutyPrepaid,
} from '../app/lib/duty-posture.js';
import {
  parseShortlist,
  renderCatalogBlock,
  tagChecklist,
  validateShortlist,
} from '../scripts/build-catalog-block.mjs';

test('the configured duty posture is one of the known postures', () => {
  assert.ok(DUTY_POSTURES.includes(DUTY_POSTURE));
});

test('both duty postures have copy in every locale', () => {
  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    for (const posture of DUTY_POSTURES) {
      const body = dictionary[dutyCopyKey(posture)];
      const eta = dictionary[dutyEtaKey(posture)];
      assert.ok(body, `${locale} missing body copy for ${posture}`);
      assert.ok(eta, `${locale} missing eta copy for ${posture}`);
      assert.ok(body.length > 40, `${locale} ${posture} body looks truncated`);
    }
  }
});

test('the two postures say materially different things', () => {
  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    assert.notEqual(
      dictionary[dutyCopyKey('customer-pays')],
      dictionary[dutyCopyKey('prepaid')],
      `${locale} uses identical copy for opposite postures`,
    );
  }
});

test('prepaid copy never tells the customer they owe something', () => {
  // The failure this guards against is shipping prepaid duties while the page
  // still says the customer is responsible - the customer then refuses a parcel
  // they had already paid for.
  const forbidden =
    /customer[’']?s responsibility|responsabilité du client|responsabilidad del cliente|responsabilidade do cliente/i;
  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    assert.doesNotMatch(
      dictionary[dutyCopyKey('prepaid')],
      forbidden,
      `${locale} prepaid copy still assigns the charge to the customer`,
    );
  }
});

test('customer-pays copy does not promise anything is included', () => {
  const forbidden =
    /prepaid by puchica|nothing to pay on delivery|prépayés par puchica|pagados por adelantado|pagos antecipadamente/i;
  for (const [locale, dictionary] of Object.entries(DICTIONARIES)) {
    assert.doesNotMatch(
      dictionary[dutyCopyKey('customer-pays')],
      forbidden,
      `${locale} customer-pays copy promises prepayment`,
    );
  }
});

test('the copy key follows the posture', () => {
  assert.equal(dutyCopyKey('prepaid'), 'ship_check_duties_body_prepaid');
  assert.equal(dutyCopyKey('customer-pays'), 'ship_check_duties_body');
  assert.equal(isDutyPrepaid('prepaid'), true);
  assert.equal(isDutyPrepaid('customer-pays'), false);
});

test('a shortlist parses handle and sku and ignores extra columns', () => {
  const rows = parseShortlist(
    [
      '# comment',
      'name,handle,sku,bundle,irrelevant',
      'Cargo bag,rooftop-cargo-bag,14:771#Black,n,ignored',
      'Kit,travel-kit,PUCHICA-KIT-01,y,ignored',
    ].join('\n'),
  );
  assert.equal(rows.length, 2);
  assert.equal(rows[0].handle, 'rooftop-cargo-bag');
  assert.equal(rows[0].bundle, false);
  assert.equal(rows[1].bundle, true);
});

test('rows without a handle or sku are dropped', () => {
  const rows = parseShortlist(
    ['name,handle,sku', 'No handle,,14:1', 'No sku,some-handle,'].join('\n'),
  );
  assert.equal(rows.length, 0);
});

test('an empty shortlist fails, because the gate fails closed', () => {
  const failures = validateShortlist([]);
  assert.ok(failures.some((f) => /empty/i.test(f)));
});

test('a duplicate SKU across handles is rejected', () => {
  const failures = validateShortlist([
    {handle: 'one', sku: '14:29'},
    {handle: 'two', sku: '14:29'},
  ]);
  assert.ok(
    failures.some((f) => /Duplicate SKU/.test(f)),
    'two products sharing a supplier variant must fail',
  );
});

test('an invalid Shopify handle is rejected', () => {
  const failures = validateShortlist([{handle: 'Not A Handle', sku: '14:1'}]);
  assert.ok(failures.some((f) => /not a valid Shopify handle/.test(f)));
});

test('the rendered block is valid JS and preserves exact SKUs', async () => {
  const tricky = '14:1052#S3007 Black;5:200004186#3PCS L M S Set';
  const block = renderCatalogBlock(
    [{handle: 'packing-cubes', sku: tricky, bundle: false}],
    ['CA'],
  );

  const module = await import(
    `data:text/javascript,${encodeURIComponent(block)}`
  );
  assert.equal(module.APPROVED_CATALOG_OFFERS.length, 1);
  assert.equal(
    module.APPROVED_CATALOG_OFFERS[0].sku,
    tricky,
    'a SKU with spaces, hashes and semicolons must survive rendering',
  );
  assert.deepEqual(module.APPROVED_CATALOG_OFFERS[0].markets, ['CA']);
});

test('a bundle renders its bundle flag and trades dsers-mapped for the bundle tag', async () => {
  const block = renderCatalogBlock(
    [{handle: 'kit', sku: 'PUCHICA-KIT-01', bundle: true}],
    ['CA'],
  );
  const module = await import(
    `data:text/javascript,${encodeURIComponent(block)}`
  );
  assert.equal(module.APPROVED_CATALOG_OFFERS[0].bundle, true);

  const tags = tagChecklist({handle: 'kit', bundle: true}, ['CA']);
  assert.ok(!tags.includes('dsers-mapped'), 'a bundle has no single supplier variant');
  assert.ok(tags.includes('bundle-fulfilment-verified'));
});

test('the tag checklist covers every requested market', () => {
  const tags = tagChecklist({handle: 'thing', bundle: false}, ['CA', 'US']);
  assert.ok(tags.includes('ca-route-verified'));
  assert.ok(tags.includes('us-route-verified'));
  assert.ok(tags.includes('dsers-mapped'));
});
