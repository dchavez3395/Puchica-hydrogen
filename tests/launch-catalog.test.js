import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formatProductOptionLabel} from '../app/lib/product-options.js';

import {
  APPROVED_VARIANT_SKUS_BY_MARKET,
  buildApprovedProductOptions,
  filterLaunchProducts,
  findApprovedVariant,
  findApprovedVariants,
  isApprovedVariantSku,
  isLaunchReadyProduct,
  CATALOG_APPROVAL_TAG,
  LAUNCH_READY_TAG,
  LEGACY_LAUNCH_READY_TAG,
  MARKET_ROUTE_EVIDENCE_TAGS,
  OPERATIONAL_HOLD_HANDLES,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '../app/lib/launch-catalog.js';

function approvedProduct(overrides = {}) {
  return {
    handle: 'verified-organizer',
    tags: [...REQUIRED_CATALOG_EVIDENCE_TAGS, MARKET_ROUTE_EVIDENCE_TAGS.CA],
    availableForSale: true,
    variants: {
      nodes: [
        {
          sku: APPROVED_VARIANT_SKUS_BY_MARKET.CA[0],
          availableForSale: true,
        },
      ],
    },
    ...overrides,
  };
}

test('Storefront queries use the versioned final approval tag', () => {
  assert.equal(LAUNCH_READY_TAG, CATALOG_APPROVAL_TAG);
  assert.notEqual(LAUNCH_READY_TAG, LEGACY_LAUNCH_READY_TAG);
});

test('release flag is open only after the contained market-cart repair', () => {
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

test('robots allows approved product and collection pages to be indexed', async () => {
  const robots = await readFile(
    new URL('../app/routes/[robots.txt].jsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(robots, /Disallow: \/products(?:\r?\n|$)/);
  assert.doesNotMatch(robots, /Disallow: \/\*\/products(?:\r?\n|$)/);
  assert.doesNotMatch(robots, /Disallow: \/collections(?:\r?\n|$)/);
  assert.doesNotMatch(robots, /Disallow: \/\*\/collections(?:\r?\n|$)/);
  assert.match(robots, /Disallow: \/collections\/\*sort_by\*/);
});

test('product sitemap has the exact-variant data required by its launch gate', async () => {
  const sitemap = await readFile(
    new URL('../app/routes/sitemap.$type.$page[.xml].jsx', import.meta.url),
    'utf8',
  );

  assert.match(sitemap, /variants\(first: 50\)/);
  assert.match(sitemap, /sku\s+availableForSale/);
  assert.match(sitemap, /'\/collections\/all'/);
});

test('product feed exposes the node shape required by the exact-variant gate', async () => {
  const feed = await readFile(
    new URL('../app/routes/[feed.xml].tsx', import.meta.url),
    'utf8',
  );

  assert.match(feed, /variants\(first: 20\)\s*\{\s*nodes\s*\{/);
  assert.match(feed, /findApprovedVariant\(product, 'CA'\)/);
  assert.doesNotMatch(feed, /product\.variants\.edges/);
});

test('market-unavailable product pages fail closed for crawlers', async () => {
  const productRoute = await readFile(
    new URL('../app/routes/products.$handle.jsx', import.meta.url),
    'utf8',
  );
  const rootRoute = await readFile(
    new URL('../app/root.jsx', import.meta.url),
    'utf8',
  );

  assert.equal(
    productRoute.match(/throw productNotFoundResponse\(\)/g)?.length,
    4,
  );
  assert.match(productRoute, /'Cache-Control': 'no-store, max-age=0'/);
  assert.match(productRoute, /'X-Robots-Tag': 'noindex, nofollow'/);
  assert.match(
    productRoute,
    /export const headers = \(\{loaderHeaders, errorHeaders\}\) =>[\s\S]*errorHeaders \|\| loaderHeaders/,
  );
  assert.match(
    rootRoute,
    /export const headers = \(\{loaderHeaders, errorHeaders\}\) =>[\s\S]*errorHeaders \|\| loaderHeaders/,
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
  const landing = await readFile(
    new URL('../app/components/SmallSpaceLanding.jsx', import.meta.url),
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
  assert.match(landing, /const heroFeature = heroPrimary/);
  assert.doesNotMatch(landing, /Canada &amp; U\.S\. delivery routes/);
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
        tags: [
          ...REQUIRED_CATALOG_EVIDENCE_TAGS,
          MARKET_ROUTE_EVIDENCE_TAGS.CA,
        ].map((tag) => tag.toUpperCase()),
      }),
    ),
    true,
  );

  for (const missingTag of REQUIRED_CATALOG_EVIDENCE_TAGS) {
    assert.equal(
      isLaunchReadyProduct(
        approvedProduct({
          tags: [
            ...REQUIRED_CATALOG_EVIDENCE_TAGS.filter(
              (tag) => tag !== missingTag,
            ),
            MARKET_ROUTE_EVIDENCE_TAGS.CA,
          ],
        }),
      ),
      false,
      `missing ${missingTag}`,
    );
  }

  assert.equal(
    isLaunchReadyProduct(
      approvedProduct({
        tags: [
          ...REQUIRED_CATALOG_EVIDENCE_TAGS,
          MARKET_ROUTE_EVIDENCE_TAGS.US,
        ],
      }),
      'CA',
    ),
    false,
  );
  assert.equal(
    isLaunchReadyProduct(
      approvedProduct({
        tags: [
          ...REQUIRED_CATALOG_EVIDENCE_TAGS,
          MARKET_ROUTE_EVIDENCE_TAGS.US,
        ],
      }),
      'US',
    ),
    true,
  );
});

const heldHandles = [
  '24-piece-drawer-organizer-tray-set',
  'toocki-five-clip-cable-organizer',
  'pocket-luggage-scale-50kg',
  'travel-toiletry-organizer',
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
        tags: [
          ...REQUIRED_CATALOG_EVIDENCE_TAGS,
          MARKET_ROUTE_EVIDENCE_TAGS.CA,
        ],
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

test('exact supplier variants are market-gated independently of products', () => {
  const caPackingSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  const sharedCableSku = APPROVED_VARIANT_SKUS_BY_MARKET.US[0];

  assert.equal(isApprovedVariantSku(caPackingSku, 'CA'), true);
  assert.equal(isApprovedVariantSku(caPackingSku, 'US'), false);
  assert.equal(isApprovedVariantSku(sharedCableSku, 'CA'), true);
  assert.equal(isApprovedVariantSku(sharedCableSku, 'US'), true);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'CA'), false);

  const product = {
    variants: {
      nodes: [
        {sku: 'unreviewed-supplier-sku', availableForSale: true},
        {sku: caPackingSku, availableForSale: true},
      ],
    },
  };
  assert.equal(findApprovedVariant(product, 'CA')?.sku, caPackingSku);
  assert.equal(findApprovedVariant(product, 'US'), undefined);
});

test('approved PDP options expose every audited SKU and no supplier extras', () => {
  const [coffeeSku, blackSku] = APPROVED_VARIANT_SKUS_BY_MARKET.CA.slice(-2);
  const variants = [
    {
      id: 'coffee',
      sku: coffeeSku,
      availableForSale: true,
      selectedOptions: [{name: 'Color', value: 'coffee color'}],
    },
    {
      id: 'black',
      sku: blackSku,
      availableForSale: true,
      selectedOptions: [{name: 'Color', value: 'Black'}],
    },
    {
      id: 'red-unreviewed',
      sku: 'supplier-red',
      availableForSale: true,
      selectedOptions: [{name: 'Color', value: 'Red'}],
    },
  ];
  const product = {
    handle: 'travel-luggage-handle-wrap',
    options: [
      {
        name: 'Color',
        optionValues: [
          {name: 'coffee color', swatch: {color: '#7b5948'}},
          {name: 'Black', swatch: {color: '#111111'}},
          {name: 'Red', swatch: {color: '#cc0000'}},
        ],
      },
    ],
    variants: {nodes: variants},
  };

  const approved = findApprovedVariants(product, 'CA');
  assert.deepEqual(
    approved.map((variant) => variant.id),
    ['coffee', 'black'],
  );

  const options = buildApprovedProductOptions(product, approved, approved[0]);
  assert.equal(options.length, 1);
  assert.equal(options[0].name, 'Color');
  assert.deepEqual(
    options[0].optionValues.map((value) => value.name),
    ['coffee color', 'Black'],
  );
  assert.equal(options[0].optionValues[0].selected, true);
  assert.equal(options[0].optionValues[1].selected, false);
  assert.equal(
    options[0].optionValues.some((value) => value.name === 'Red'),
    false,
  );
  assert.equal(formatProductOptionLabel('coffee color'), 'Coffee Brown');
});
