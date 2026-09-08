import test from 'node:test';
import assert from 'node:assert/strict';

import {
  auditAltText,
  FOREIGN_BRANDS,
  IMAGE_CLAIM_BANS,
  IMAGERY_REVIEW_REQUIRED,
  MIN_ALT_LENGTH,
} from '../scripts/check-product-imagery.mjs';

const withImages = (handle, images) => ({
  handle,
  images: {nodes: images.map((altText) => ({url: 'https://x/y.jpg', altText}))},
});

test('an image with no alt text fails', () => {
  const failures = auditAltText([withImages('a-product', ['', null])]);
  assert.equal(failures.length, 2);
  for (const failure of failures) assert.match(failure, /no alt text/);
});

test('a label is not a description', () => {
  const [failure] = auditAltText([withImages('a-product', ['watch case'])]);
  assert.match(failure, new RegExp(`${MIN_ALT_LENGTH}-character minimum`));
});

test('the claims banned in copy are banned in imagery too', () => {
  // These are the exact strings that were live on 2026-09-03, taken off the
  // supplier composites. Each one has to be caught by description.
  const live = [
    'Handcrafted smooth premium materials shown across the whole case front',
    'Full-grain cow leather exterior photographed against a dark background',
    'Graphic claiming 100% damage protection for the watches inside the case',
    'A patent pending badge printed over the top of the product photograph',
    'A what makes us better comparison chart scored against other A and other B',
  ];
  for (const alt of live) {
    const failures = auditAltText([withImages('a-product', [alt])]);
    assert.ok(
      failures.length > 0,
      `this was live on the storefront and must fail: "${alt}"`,
    );
  }
});

test('third-party brands are named and refused', () => {
  const failures = auditAltText([
    withImages('a-product', [
      'The Mirage Sable Black case from the Quattro Collection, open on a desk',
      'A Rolex diver with a green bezel resting in the centre compartment here',
    ]),
  ]);
  assert.equal(failures.length, 3); // mirage, quattro collection, rolex
  for (const failure of failures) assert.match(failure, /third-party brand/);
});

test('an honest description of a real image passes', () => {
  // The alt text actually written for the surviving supplier composites.
  const failures = auditAltText([
    withImages('pu-leather-watch-roll-travel-case-3-or-6-watches', [
      'Black watch roll case with burgundy suede lining, shown closed, open with one watch in the centre slot, and rolled shut with its button strap. Three compartments.',
      'Dark green watch roll case with grey suede lining, three views: lid open and empty, compartments from the front, and closed on its flat base.',
    ]),
  ]);
  assert.deepEqual(failures, []);
});

test('a product with no images at all fails rather than passing vacuously', () => {
  const [failure] = auditAltText([{handle: 'a-product', images: {nodes: []}}]);
  assert.match(failure, /no images at all/);
});

test('the gate admits what it cannot do', () => {
  // A green run must never be read as "the imagery is clean". This script
  // checks descriptions; only a person can read text drawn into a photograph.
  assert.match(IMAGERY_REVIEW_REQUIRED.note, /not pixels/);
  assert.match(IMAGERY_REVIEW_REQUIRED.lastFullReview, /^\d{4}-\d{2}-\d{2}$/);
  assert.ok(IMAGERY_REVIEW_REQUIRED.removed > 0);
  assert.ok(IMAGE_CLAIM_BANS.length >= 5);
  assert.ok(FOREIGN_BRANDS.includes('mirage'));
});
