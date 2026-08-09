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

test('reviewed catalog release opens commerce behind the evidence gate', () => {
  assert.equal(STOREFRONT_CONTAINMENT_ACTIVE, false);
});

test('legacy home-finds campaign fails closed during containment', async () => {
  const route = await readFile(
    new URL('../app/routes/campaigns.home-finds.jsx', import.meta.url),
    'utf8',
  );

  assert.match(route, /if \(STOREFRONT_CONTAINMENT_ACTIVE\)/);
  assert.match(route, /return redirect\('\/'/);
});

test('containment closes every remaining commerce and legacy-content route', async () => {
  const guardedRoutes = [
    'products.$handle.jsx',
    'collections.all.jsx',
    'collections.$handle.jsx',
    'collections._index.jsx',
    'explore.jsx',
    'search.jsx',
    'discount.$code.jsx',
    'cart-sync.jsx',
    'newsletter.jsx',
    'blogs._index.jsx',
    'blogs.$blogHandle._index.jsx',
    'blogs.$blogHandle.$articleHandle.jsx',
    'pages.$handle.jsx',
  ];

  for (const filename of guardedRoutes) {
    const source = await readFile(
      new URL(`../app/routes/${filename}`, import.meta.url),
      'utf8',
    );
    assert.match(
      source,
      /STOREFRONT_CONTAINMENT_ACTIVE/,
      `${filename} must fail closed during containment`,
    );
  }
});

test('containment removes products from feeds and sitemap discovery', async () => {
  const feed = await readFile(
    new URL('../app/routes/[feed.xml].tsx', import.meta.url),
    'utf8',
  );
  const sitemapIndex = await readFile(
    new URL('../app/routes/[sitemap.xml].jsx', import.meta.url),
    'utf8',
  );
  const productSitemap = await readFile(
    new URL('../app/routes/sitemap.$type.$page[.xml].jsx', import.meta.url),
    'utf8',
  );

  assert.match(feed, /productFeedResponse\(\[\]\)/);
  assert.match(sitemapIndex, /STOREFRONT_CONTAINMENT_ACTIVE[\s\S]*\['pages'\]/);
  assert.match(
    productSitemap,
    /params\.type === 'products'[\s\S]*STOREFRONT_CONTAINMENT_ACTIVE/,
  );
});

test('released homepage is travel-focused and uses the catalog gate', async () => {
  const home = await readFile(
    new URL('../app/routes/_index.jsx', import.meta.url),
    'utf8',
  );
  const about = await readFile(
    new URL('../app/routes/pages.about.jsx', import.meta.url),
    'utf8',
  );
  const brand = await readFile(
    new URL('../app/lib/brand.js', import.meta.url),
    'utf8',
  );

  assert.match(home, /SmallSpaceLanding/);
  assert.match(home, /filterLaunchProducts/);
  assert.match(home, /SMALL_SPACE_QUERY/);
  assert.match(home, /Travel organizers for easier packing/);
  assert.doesNotMatch(home, /pk-hold/);
  assert.match(about, /'pt-br': \{/);
  assert.match(about, /\{copy\.artNote\}/);
  assert.doesNotMatch(brand, /organization and travel|space-saving/i);
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
