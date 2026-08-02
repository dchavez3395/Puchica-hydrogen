import test from 'node:test';
import assert from 'node:assert/strict';

import {
  filterLaunchProducts,
  isLaunchReadyProduct,
  LAUNCH_READY_TAG,
  OPERATIONAL_HOLD_HANDLES,
} from '../app/lib/launch-catalog.js';

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
        tags: [LAUNCH_READY_TAG],
        availableForSale: true,
      }),
      false,
      handle,
    );
  }
});

test('filter keeps only available, tagged, non-held products', () => {
  const safe = {
    handle: 'verified-organizer',
    tags: [LAUNCH_READY_TAG],
    availableForSale: true,
  };
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
