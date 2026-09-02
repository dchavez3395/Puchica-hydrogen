import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formatProductOptionLabel} from '../app/lib/product-options.js';

import {
  APPROVED_CATALOG_OFFERS,
  APPROVED_PRODUCT_HANDLES_BY_MARKET,
  ARCHIVED_CATALOG_OFFERS,
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
  isFulfilmentRouteSuspended,
  isOfferSellable,
  SUSPENDED_FULFILMENT_ROUTES,
  resolveDiscoveryMarket,
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

// A real SKU from the archived 2026-08 cohort. Fixtures need a concrete SKU
// to push through the gate; whether the gate currently approves it is the
// thing under test, so it cannot be read from the live approval lists.
const AUDITED_SKU = ARCHIVED_CATALOG_OFFERS[0].sku;

function approvedProduct(overrides = {}) {
  return {
    handle: 'verified-organizer',
    tags: [...REQUIRED_CATALOG_EVIDENCE_TAGS, MARKET_ROUTE_EVIDENCE_TAGS.CA],
    availableForSale: true,
    variants: {
      nodes: [
        {
          sku: AUDITED_SKU,
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

test('product market resolution fails closed on an empty catalogue', () => {
  // The resolver used to fall back from a suspended US to an open CA, keeping
  // the page indexable while checkout stayed shut. There is now nothing to
  // resolve: the catalogue was deleted from Shopify on 2026-08-28 and both
  // markets are suspended, so every handle resolves to null and no product
  // route is advertised as indexable. Verified against production on
  // 2026-09-01: all seven archived handles return 404.
  assert.equal(isMarketSuspended('CA'), true);
  // US is no longer suspended as a market - the de minimis evidence closes the
  // cn-direct ROUTE into it, which is all that evidence ever measured. Every
  // archived offer ships cn-direct, so none of them is sellable there either
  // way, and the catalogue is empty regardless.
  assert.equal(isMarketSuspended('US'), false);
  assert.equal(isFulfilmentRouteSuspended('US', 'cn-direct'), true);
  assert.equal(isFulfilmentRouteSuspended('US', 'us-local'), false);
  // The 2026-09-01 watch-roll cohort is live and cn-direct, crossing the
  // suspended route on its modelled duty contribution, so discovery is no
  // longer empty. The archived cn-direct handles must still resolve to null.
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, [
    'pu-leather-watch-roll-travel-case-3-or-6-watches',
    'pu-leather-watch-roll-travel-case-4-watches',
  ]);

  for (const {handle} of ARCHIVED_CATALOG_OFFERS) {
    assert.equal(
      resolveApprovedProductMarket(handle, 'CA'),
      null,
      `${handle} must resolve to no open market`,
    );
    assert.equal(resolveApprovedProductMarket(handle, 'US'), null, handle);
  }
  assert.equal(resolveApprovedProductMarket('retired-product', 'CA'), null);

  // The evidence itself is intact - seven handles across ten exact offers -
  // so restoring a product is a move between two lists, not a re-audit.
  assert.equal(
    new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle)).size,
    7,
  );
});

test('discovery includes every approved market without exposing retired products', () => {
  // Group by handle first. Shopify returns one product per handle carrying all
  // of its variants, so building one product per OFFER duplicated any handle
  // that has several approved SKUs - a shape the storefront never receives.
  const byHandle = new Map();
  for (const offer of ARCHIVED_CATALOG_OFFERS) {
    const existing = byHandle.get(offer.handle);
    if (existing) {
      existing.skus.push(offer.sku);
      for (const market of offer.markets) existing.markets.add(market);
      continue;
    }
    byHandle.set(offer.handle, {
      skus: [offer.sku],
      markets: new Set(offer.markets),
    });
  }

  const products = [...byHandle].map(([handle, {skus, markets}]) =>
    approvedProduct({
      handle,
      tags: [
        ...requiredEvidenceTagsForHandle(handle),
        ...[...markets].map((market) => MARKET_ROUTE_EVIDENCE_TAGS[market]),
      ],
      variants: {
        nodes: skus.map((sku) => ({sku, availableForSale: true})),
      },
    }),
  );
  products.push(approvedProduct({handle: 'retired-product'}));

  // With every market suspended nothing is discoverable, and the retired
  // product is excluded twice over. The grouping above is still what the
  // storefront receives, so this asserts the filter closes on a realistic
  // payload rather than on an empty one.
  assert.deepEqual(filterDiscoverableProducts(products), []);
  assert.ok(
    products.length > DISCOVERABLE_PRODUCT_HANDLES.length,
    'the payload carries the full cohort plus a retired handle',
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
  const payload = [
    safe,
    {...safe, handle: heldHandles[0]},
    {...safe, handle: 'untagged', tags: []},
    {...safe, handle: 'sold-out', availableForSale: false},
  ];

  // The evidence layer is unaffected by a market suspension: only the safe
  // product carries every required tag, is available, and is neither retired
  // nor held. Assert that directly, because filterLaunchProducts also requires
  // an approved variant and a suspended market approves none.
  assert.deepEqual(
    payload.filter((product) => isLaunchReadyProduct(product, 'CA')),
    [safe],
  );

  // The commerce layer is shut while CA is suspended, so nothing survives the
  // full filter - not even the otherwise-perfect product.
  assert.equal(isMarketSuspended('CA'), true);
  assert.deepEqual(filterLaunchProducts(payload), []);
});

test('exact supplier variants are market-gated independently of products', () => {
  // Each market's list must be derived from that offer's own `markets`, minus
  // any market under commercial suspension, so the next market-limited offer is
  // gated without anyone touching this function.
  for (const market of ['CA', 'US']) {
    assert.deepEqual(
      APPROVED_VARIANT_SKUS_BY_MARKET[market],
      APPROVED_CATALOG_OFFERS.filter((offer) =>
        isOfferSellable(offer, market),
      ).map((offer) => offer.sku),
    );
  }

  // Read the SKU from the offer cohort, not from the by-market list, which a
  // suspension empties. Both markets are suspended, so an audited SKU is
  // approved nowhere - the fail-closed state.
  const sharedSku = AUDITED_SKU;
  assert.equal(isApprovedVariantSku(sharedSku, 'CA'), false);
  assert.equal(isApprovedVariantSku(sharedSku, 'US'), false);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'CA'), false);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'US'), false);

  // An unrecognised market falls back to the Canadian cohort rather than
  // opening everything, which is what keeps an unlisted country fail-closed -
  // and that cohort is empty, so GB is closed too.
  assert.equal(isApprovedVariantSku(sharedSku, 'GB'), false);
  assert.equal(isApprovedVariantSku('unreviewed-supplier-sku', 'GB'), false);

  const product = {
    variants: {
      nodes: [
        {sku: 'unreviewed-supplier-sku', availableForSale: true},
        {sku: sharedSku, availableForSale: true},
      ],
    },
  };
  assert.equal(findApprovedVariant(product, 'CA'), undefined);
  assert.equal(findApprovedVariant(product, 'US'), undefined);
});

test('a suspended market closes commerce without erasing route evidence', () => {
  // Every one of these SKUs has a verified United States route - the supplier
  // ships there and the parcel arrives. The suspension is economic, not
  // logistical, so `markets` still records US and reopening is one deletion in
  // SUSPENDED_COMMERCE_MARKETS rather than a re-verification exercise.
  const usRouted = ARCHIVED_CATALOG_OFFERS.filter((offer) =>
    offer.markets.includes('US'),
  );
  assert.equal(usRouted.length, 5);

  for (const offer of usRouted) {
    // Suspended in both markets since 2026-09-01: nothing is sellable, but the
    // offer still records its verified routes.
    assert.equal(isApprovedVariantSku(offer.sku, 'CA'), false, offer.sku);
    assert.equal(isApprovedVariantSku(offer.sku, 'US'), false, offer.sku);
    assert.ok(offer.markets.includes('US'), offer.sku);
  }

  assert.equal(isMarketSuspended('CA'), true);
  assert.equal(isMarketSuspended('ca'), true);
  assert.match(SUSPENDED_COMMERCE_MARKETS.CA, /catalog-empty/);

  // The duty evidence is preserved, scoped to the route it was measured
  // against. A blanket US market suspension over-reached: it closed the market
  // this store sells into on evidence that only ever applied to parcels
  // crossing the border. cn-direct into the US stays shut; us-local does not.
  assert.equal(isMarketSuspended('US'), false);
  assert.match(SUSPENDED_FULFILMENT_ROUTES.US['cn-direct'], /de-minimis/);
  assert.equal(SUSPENDED_FULFILMENT_ROUTES.US['us-local'], undefined);
  // An offer that does not declare how it ships must fail closed.
  assert.equal(
    isOfferSellable({handle: 'h', sku: 's', markets: ['US']}, 'US'),
    false,
  );
  assert.equal(
    isOfferSellable(
      {handle: 'h', sku: 's', markets: ['US'], fulfilment: 'us-local'},
      'US',
    ),
    true,
  );

  // A cn-direct offer may cross the suspended route only by carrying a
  // positive worst-case duty contribution from scripts/us-duty-impact.mjs.
  // Zero, negative and absent all keep it closed - the override has to be
  // earned by a modelled figure, not asserted.
  const cnDirect = (extra) => ({
    handle: 'h',
    sku: 's',
    markets: ['US'],
    fulfilment: 'cn-direct',
    ...extra,
  });
  assert.equal(isOfferSellable(cnDirect({}), 'US'), false);
  assert.equal(
    isOfferSellable(cnDirect({worstCaseDutyContributionUsd: 0}), 'US'),
    false,
  );
  assert.equal(
    isOfferSellable(cnDirect({worstCaseDutyContributionUsd: -4.32}), 'US'),
    false,
  );
  assert.equal(
    isOfferSellable(cnDirect({worstCaseDutyContributionUsd: 8.15}), 'US'),
    true,
  );
  // Canada has no suspended route, so the clearance is irrelevant there - but
  // the market itself is shut, which still wins.
  assert.equal(
    isOfferSellable(
      {...cnDirect({worstCaseDutyContributionUsd: 8.15}), markets: ['CA']},
      'CA',
    ),
    false,
  );

  // The evidence neither the suspension nor the emptying may erase. Ten exact
  // offers across seven handles, each keeping its own market list, so
  // restoring one is a move between two constants and a suspension deletion -
  // not a re-audit of routes, costs, copy or imagery.
  assert.equal(ARCHIVED_CATALOG_OFFERS.length, 10);
  assert.equal(
    new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle)).size,
    7,
  );
  // Discovery now carries the live us-local cohort and nothing archived: the
  // ten archived offers stay evidence, not inventory.
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, [
    'pu-leather-watch-roll-travel-case-3-or-6-watches',
    'pu-leather-watch-roll-travel-case-4-watches',
  ]);
  for (const archived of ARCHIVED_CATALOG_OFFERS) {
    assert.ok(
      !DISCOVERABLE_PRODUCT_HANDLES.includes(archived.handle),
      archived.handle,
    );
  }
});

test('approved handles and SKUs derive from one exact-offer cohort', () => {
  for (const market of ['CA', 'US']) {
    const offers = APPROVED_CATALOG_OFFERS.filter((offer) =>
      isOfferSellable(offer, market),
    );

    assert.deepEqual(
      APPROVED_VARIANT_SKUS_BY_MARKET[market],
      offers.map((offer) => offer.sku),
    );
    assert.deepEqual(APPROVED_PRODUCT_HANDLES_BY_MARKET[market], [
      ...new Set(offers.map((offer) => offer.handle)),
    ]);
  }

  // Both markets are suspended, so nothing is sellable anywhere. The cohort
  // the lists derive FROM is untouched - ten SKUs across seven handles, the
  // compression cube set contributing four colour SKUs under one handle - so
  // deleting a suspension entry restores exactly that shape.
  // Canada stays shut - the market is suspended and these offers claim only
  // US. The United States now carries eight exact variant SKUs across two
  // handles: six colour/size SKUs on the 3-or-6 roll, two on the 4.
  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.CA.length, 0);
  assert.equal(APPROVED_PRODUCT_HANDLES_BY_MARKET.CA.length, 0);
  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.US.length, 8);
  assert.equal(APPROVED_PRODUCT_HANDLES_BY_MARKET.US.length, 2);
  // The cohort is cn-direct - the AliExpress Selection Standard quote read on
  // 2026-09-01 is a China-direct line, not a US warehouse - so every offer must
  // carry a positive worst-case duty contribution or it cannot cross the
  // suspended route.
  for (const offer of APPROVED_CATALOG_OFFERS) {
    assert.equal(offer.fulfilment, 'cn-direct', offer.sku);
    assert.ok(Number(offer.worstCaseDutyContributionUsd) > 0, offer.sku);
    assert.equal(isOfferSellable(offer, 'US'), true, offer.sku);
  }

  const caCohort = ARCHIVED_CATALOG_OFFERS.filter((offer) =>
    offer.markets.includes('CA'),
  );
  assert.equal(caCohort.length, 10);
  assert.equal(new Set(caCohort.map((offer) => offer.handle)).size, 7);
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

  // Suspended market: no SKU is approved, so no variant is offerable and the
  // PDP exposes no option selector at all. Fail-closed by construction.
  assert.equal(isMarketSuspended('CA'), true);
  assert.deepEqual(findApprovedVariants(product, 'CA'), []);
  assert.deepEqual(buildApprovedProductOptions(product, [], undefined), []);

  // The builder's own rule - it renders only the variants handed to it, never
  // the product's full option matrix - is what keeps an unreviewed supplier
  // colour off the page. Assert it against an explicit approved subset so the
  // rule stays covered while the market is shut.
  const white = variants[0];
  assert.deepEqual(
    buildApprovedProductOptions(product, [white], white),
    [],
    'one approved colour needs no selector, and Red must not appear',
  );
  assert.equal(formatProductOptionLabel('White'), 'White');
});

test('collection catalogue falls back when the resolved market is suspended', async () => {
  // Googlebot crawls from US IPs. If the suspended US market's empty cohort
  // reached the collections page, its emptiness-derived noindex would apply to
  // the canonical URL and deindex the catalogue for every market - the exact
  // post-deploy metadata failure of 2026-08-21/22. The route must therefore
  // resolve a display market that never lands on a suspended one.
  const route = await readFile(
    new URL('../app/routes/collections.all.jsx', import.meta.url),
    'utf8',
  );

  // The fallback used to hard-code 'CA', which was only correct while CA was
  // the open market. It is now the suspended one, so a hard-coded fallback
  // resolved a suspended market back to itself. The resolver picks whichever
  // market is actually open.
  assert.match(route, /resolveDiscoveryMarket\(resolvedCountry\)/);
  assert.equal(isMarketSuspended(resolveDiscoveryMarket('CA')), false);
  assert.equal(isMarketSuspended(resolveDiscoveryMarket('US')), false);
  assert.match(route, /filterLaunchProducts\(rawProducts\?\.nodes, country\)/);
  // The emptiness fail-safe itself must stay: a genuinely empty catalogue
  // should still noindex rather than serve Google a blank shop page.
  assert.match(route, /noindex: !data\?\.products\?\.nodes\?\.length/);
});
