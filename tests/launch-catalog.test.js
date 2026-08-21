import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formatProductOptionLabel} from '../app/lib/product-options.js';

import {
  APPROVED_CATALOG_OFFERS,
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  APPROVED_VARIANT_SKUS_BY_MARKET,
  buildApprovedProductOptions,
  DISCOVERABLE_PRODUCT_HANDLES,
  filterDiscoverableProducts,
  filterLaunchProducts,
  findApprovedVariant,
  findApprovedVariants,
  isApprovedVariantSku,
  isLaunchReadyProduct,
  isMarketSuspended,
  resolveApprovedProductMarket,
  SUSPENDED_COMMERCE_MARKETS,
  CATALOG_APPROVAL_TAG,
  LAUNCH_READY_TAG,
  MARKET_ROUTE_EVIDENCE_TAGS,
  OPERATIONAL_HOLD_HANDLES,
  REQUIRED_CATALOG_EVIDENCE_TAGS,
  requiredEvidenceTagsForHandle,
  STOREFRONT_CONTAINMENT_ACTIVE,
} from '../app/lib/launch-catalog.js';

const LEGACY_LAUNCH_READY_TAG = 'puchica-launch-ready';

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
  assert.match(route, /return redirect\(localizePath\('\/'/);
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
  assert.match(sitemap, /hreflang="x-default"/);
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

test('approved product pages remain indexable outside their commerce market', async () => {
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
    5,
  );
  assert.match(productRoute, /marketUnavailable \? \(/);
  assert.match(productRoute, /product_market_unavailable/);
  assert.match(productRoute, /eligibleRegion/);
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
  const launchMeta = await readFile(
    new URL('../app/lib/launch-meta.js', import.meta.url),
    'utf8',
  );

  assert.match(home, /SmallSpaceLanding/);
  assert.match(home, /filterLaunchProducts/);
  assert.match(home, /SMALL_SPACE_QUERY/);
  assert.match(home, /launchMetaCopy/);
  assert.match(launchMeta, /Travel organizers for easier packing/);
  assert.doesNotMatch(home, /pk-hold/);
  assert.match(about, /'pt-br': \{/);
  assert.match(about, /\{copy\.artNote\}/);
  assert.doesNotMatch(brand, /organization and travel|space-saving/i);
  assert.match(landing, /const heroFeature = heroPrimary/);
  assert.match(
    landing,
    /if \(\/travel toiletry organizer\/i\.test\(title\)\) return 0/,
  );
  assert.match(
    landing,
    /if \(\/3-piece packing cube\/i\.test\(title\)\) return 1/,
  );
  assert.match(
    landing,
    /if \(\/travel jewelry case\/i\.test\(title\)\) return 2/,
  );
  assert.doesNotMatch(landing, /Canada &amp; U\.S\. delivery routes/);
});

test('product market resolution preserves indexing without opening checkout', () => {
  // The United States is commercially suspended, so a US visitor still gets an
  // indexable page - which is the whole point of this resolver - but the
  // commerce market falls back to Canada and the page must say so. This is the
  // exact shape the resolver was built for; it is now finally being used.
  assert.deepEqual(resolveApprovedProductMarket('3-piece-packing-cube-set', 'US'), {
    availableMarkets: ['CA'],
    commerceMarket: 'CA',
    marketUnavailable: true,
  });
  assert.deepEqual(
    resolveApprovedProductMarket(
      'black-hanging-travel-toiletry-organizer',
      'CA',
    ),
    {
      availableMarkets: ['CA'],
      commerceMarket: 'CA',
      marketUnavailable: false,
    },
  );
  assert.equal(resolveApprovedProductMarket('retired-product', 'CA'), null);
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, [
    '3-piece-packing-cube-set',
    'white-semi-circular-travel-jewelry-case',
    'black-hanging-travel-toiletry-organizer',
    'travel-cable-organizer-case',
    'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
  ]);
});

test('discovery includes every approved market without exposing retired products', () => {
  const products = APPROVED_CATALOG_OFFERS.map((offer) =>
    approvedProduct({
      handle: offer.handle,
      tags: [
        ...requiredEvidenceTagsForHandle(offer.handle),
        ...offer.markets.map((market) => MARKET_ROUTE_EVIDENCE_TAGS[market]),
      ],
      variants: {
        nodes: [{sku: offer.sku, availableForSale: true}],
      },
    }),
  );
  products.push(approvedProduct({handle: 'retired-product'}));

  assert.deepEqual(
    filterDiscoverableProducts(products).map((product) => product.handle),
    DISCOVERABLE_PRODUCT_HANDLES,
  );
});

test('launch copy does not claim unverified testing, testimonials, or fulfillment terms', async () => {
  const dictionary = await readFile(
    new URL('../app/lib/dictionaries.js', import.meta.url),
    'utf8',
  );
  const campaign = await readFile(
    new URL('../app/routes/campaigns.home-finds.jsx', import.meta.url),
    'utf8',
  );
  const collection = await readFile(
    new URL('../app/routes/collections.all.jsx', import.meta.url),
    'utf8',
  );

  assert.doesNotMatch(
    dictionary,
    /thoroughly tested|soigneusement testé|probado a fondo|testado a fundo/i,
  );
  assert.doesNotMatch(
    dictionary,
    /Expédition sous 24 h|Envío en 24 horas|Envio em 24 horas|no-questions-asked/i,
  );
  assert.doesNotMatch(
    dictionary,
    /Maya R\.|James P\.|Sophie L\.|Mariana L\.|Diego R\.|Sofía M\./,
  );
  assert.doesNotMatch(campaign, /clothing, cables, and toiletries/i);
  assert.doesNotMatch(collection, /clothing, cables, and toiletries/i);
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
  // Each market's list must be derived from that offer's own `markets`, minus
  // any market under commercial suspension, so the next market-limited offer is
  // gated without anyone touching this function.
  for (const market of ['CA', 'US']) {
    assert.deepEqual(
      APPROVED_VARIANT_SKUS_BY_MARKET[market],
      isMarketSuspended(market)
        ? []
        : APPROVED_CATALOG_OFFERS.filter((offer) =>
            offer.markets.includes(market),
          ).map((offer) => offer.sku),
    );
  }

  const sharedSku = APPROVED_VARIANT_SKUS_BY_MARKET.CA[0];
  assert.equal(isApprovedVariantSku(sharedSku, 'CA'), true);
  // Suspended: the route evidence is still true, the economics are not.
  assert.equal(isApprovedVariantSku(sharedSku, 'US'), false);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'CA'), false);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'US'), false);

  // An unrecognised market falls back to the Canadian cohort rather than
  // opening everything, which is what keeps an unlisted country fail-closed.
  assert.equal(isApprovedVariantSku(sharedSku, 'GB'), true);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'GB'), false);

  const product = {
    variants: {
      nodes: [
        {sku: 'unreviewed-supplier-sku', availableForSale: true},
        {sku: sharedSku, availableForSale: true},
      ],
    },
  };
  assert.equal(findApprovedVariant(product, 'CA')?.sku, sharedSku);
  assert.equal(findApprovedVariant(product, 'US'), undefined);
});

test('a suspended market closes commerce without erasing route evidence', () => {
  // Every one of these SKUs has a verified United States route - the supplier
  // ships there and the parcel arrives. The suspension is economic, not
  // logistical, so `markets` still records US and reopening is one deletion in
  // SUSPENDED_COMMERCE_MARKETS rather than a re-verification exercise.
  const usRouted = APPROVED_CATALOG_OFFERS.filter((offer) =>
    offer.markets.includes('US'),
  );
  assert.equal(usRouted.length, 5);

  for (const offer of usRouted) {
    assert.equal(isApprovedVariantSku(offer.sku, 'CA'), true, offer.sku);
    assert.equal(isApprovedVariantSku(offer.sku, 'US'), false, offer.sku);
  }

  assert.equal(isMarketSuspended('US'), true);
  assert.equal(isMarketSuspended('us'), true);
  assert.equal(isMarketSuspended('CA'), false);
  assert.match(SUSPENDED_COMMERCE_MARKETS.US, /de-minimis/);
});

test('approved handles and SKUs derive from one exact-offer cohort', () => {
  for (const market of ['CA', 'US']) {
    const offers = isMarketSuspended(market)
      ? []
      : APPROVED_CATALOG_OFFERS.filter((offer) =>
          offer.markets.includes(market),
        );

    assert.deepEqual(
      APPROVED_VARIANT_SKUS_BY_MARKET[market],
      offers.map((offer) => offer.sku),
    );
    assert.deepEqual(APPROVED_PRODUCT_HANDLES_BY_MARKET[market], [
      ...new Set(offers.map((offer) => offer.handle)),
    ]);
  }

  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.CA.length, 5);
  assert.equal(APPROVED_PRODUCT_HANDLES_BY_MARKET.CA.length, 5);
  // Suspended, so nothing is sellable into the United States at all.
  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.US.length, 0);
  assert.equal(APPROVED_PRODUCT_HANDLES_BY_MARKET.US.length, 0);
});

test('approved PDP option builder exposes only its audited variants', () => {
  const approvedSku = '14:29';
  const variants = [
    {
      id: 'white',
      sku: approvedSku,
      availableForSale: true,
      selectedOptions: [{name: 'Color', value: 'White'}],
    },
    {
      id: 'red-unreviewed',
      sku: 'supplier-red',
      availableForSale: true,
      selectedOptions: [{name: 'Color', value: 'Red'}],
    },
  ];
  const product = {
    handle: 'white-semi-circular-travel-jewelry-case',
    options: [
      {
        name: 'Color',
        optionValues: [
          {name: 'White', swatch: {color: '#ffffff'}},
          {name: 'Red', swatch: {color: '#cc0000'}},
        ],
      },
    ],
    variants: {nodes: variants},
  };

  const approved = findApprovedVariants(product, 'CA');
  assert.deepEqual(
    approved.map((variant) => variant.id),
    ['white'],
  );

  const options = buildApprovedProductOptions(product, approved, approved[0]);
  assert.deepEqual(options, []);
  assert.equal(formatProductOptionLabel('White'), 'White');
});
