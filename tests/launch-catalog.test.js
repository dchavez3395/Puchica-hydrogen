import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';

import {
  filterLaunchProducts,
  isLaunchReadyProduct,
  CATALOG_APPROVAL_TAG,
  LAUNCH_READY_TAG,
  LEGACY_LAUNCH_READY_TAG,
  OPERATIONAL_HOLD_HANDLES,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '../app/lib/launch-catalog.js';

function approvedProduct(overrides = {}) {
  return {
    handle: 'verified-organizer',
    tags: [...REQUIRED_CATALOG_EVIDENCE_TAGS],
    availableForSale: true,
    ...overrides,
  };
}

test('Storefront queries use the versioned final approval tag', () => {
  assert.equal(LAUNCH_READY_TAG, CATALOG_APPROVAL_TAG);
  assert.notEqual(LAUNCH_READY_TAG, LEGACY_LAUNCH_READY_TAG);
});

test('emergency containment keeps cart and checkout entry routes closed', () => {
  assert.equal(STOREFRONT_CONTAINMENT_ACTIVE, true);
});

test('legacy home-finds campaign fails closed during containment', async () => {
  const route = await readFile(
    new URL('../app/routes/campaigns.home-finds.jsx', import.meta.url),
    'utf8',
  );

  assert.match(route, /if \(STOREFRONT_CONTAINMENT_ACTIVE\)/);
  assert.match(route, /return redirect\('\/'/);
});

test('the legacy launch tag cannot approve a product', () => {
  assert.equal(
    isLaunchReadyProduct({
      handle: 'legacy-product',
      tags: [LEGACY_LAUNCH_READY_TAG],
      availableForSale: true,
    }),
    false,
  );
});

test('every evidence gate is required and tag matching is case-insensitive', () => {
  assert.equal(
    isLaunchReadyProduct(
      approvedProduct({
        tags: REQUIRED_CATALOG_EVIDENCE_TAGS.map((tag) => tag.toUpperCase()),
      }),
    ),
    true,
  );

  for (const missingTag of REQUIRED_CATALOG_EVIDENCE_TAGS) {
    assert.equal(
      isLaunchReadyProduct(
        approvedProduct({
          tags: REQUIRED_CATALOG_EVIDENCE_TAGS.filter(
            (tag) => tag !== missingTag,
          ),
        }),
      ),
      false,
      `missing ${missingTag}`,
    );
  }
});

const heldHandles = [
  '24-piece-drawer-organizer-tray-set',
  'toocki-five-clip-cable-organizer',
  'pocket-luggage-scale-50kg',
];

test('current NO_GO products are explicit operational holds', () => {
  for (const handle of heldHandles) {
    assert.equal(OPERATIONAL_HOLD_HANDLES.has(handle), true, handle);
  }
});

test('launch tag cannot override an operational hold', () => {
  for (const handle of heldHandles) {
    assert.equal(
      isLaunchReadyProduct({
        handle,
        tags: [...REQUIRED_CATALOG_EVIDENCE_TAGS],
        availableForSale: true,
      }),
      false,
      handle,
    );
  }
});

test('filter keeps only available, tagged, non-held products', () => {
  const safe = approvedProduct();
  assert.deepEqual(
    filterLaunchProducts([
      safe,
      {...safe, handle: heldHandles[0]},
      {...safe, handle: 'untagged', tags: []},
      {...safe, handle: 'sold-out', availableForSale: false},
    ]),
    [safe],
  );
});
