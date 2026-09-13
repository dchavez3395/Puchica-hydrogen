import test from 'node:test';
import assert from 'node:assert/strict';
import {readFile} from 'node:fs/promises';
import {formatProductOptionLabel} from '../app/lib/product-options.js';

import {
  APPROVED_CATALOG_OFFERS,
  COST_HOLD_CATALOG_OFFERS,
  VOLTAGE_HOLD_CATALOG_OFFERS,
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
  US_DUTY_INCIDENCE,
  US_DUTY_INCIDENCE_STATES,
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
  // The launch title moved from travel organizers to woven bamboo lighting on
  // 2026-09-09, because that is what the store now lists. The rest of this
  // test still asserts a travel-framed homepage, and that gap is real: the
  // hero copy, the SmallSpaceLanding title ordering below and brand.js all
  // still describe a travel-organizer store while the only live products are
  // two light fixtures. Repositioning the brand is a decision, not a fix, so
  // it is flagged here rather than made here. What must not happen in the
  // meantime is the metadata drifting back to describing goods we do not sell.
  assert.match(launchMeta, /Woven bamboo lighting/);
  assert.doesNotMatch(launchMeta, /Travel organizers for easier packing/);
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
  // POLARITY REVERSED 2026-09-13. Canada is the open market and the United
  // States is the suspended one. Both entries in SUSPENDED_COMMERCE_MARKETS
  // have always recorded a COMMERCIAL state rather than a route fact, and this
  // is the clearest demonstration of it: nothing about either country's
  // logistics changed on 2026-09-13, only which duty stack the store chose to
  // sell through.
  //
  // The old CA entry was never a judgement about Canada either - it recorded an
  // empty catalogue after the 2026-08-28 Shopify deletion and said so.
  assert.equal(isMarketSuspended('CA'), false);
  // US is now suspended as a MARKET, on top of the cn-direct ROUTE suspension
  // that was already there on de minimis evidence. The two are independent and
  // both still hold, which is the distinction the next three lines protect:
  // reversing a market decision must not quietly reopen a route closed on
  // measured evidence, and vice versa.
  assert.equal(isMarketSuspended('US'), true);
  assert.equal(isFulfilmentRouteSuspended('US', 'cn-direct'), true);
  assert.equal(isFulfilmentRouteSuspended('US', 'us-local'), false);
  // Discovery carries the two offers approved on 2026-09-09 and nothing else.
  // Six more bamboo offers cleared every commercial gate and are NOT here:
  // their supplier listing states 220 V and the United States runs at 120 V,
  // so they sit in VOLTAGE_HOLD_CATALOG_OFFERS. It was seven until the dome
  // was released on 2026-09-10 - not by answering its voltage question but by
  // finding the same shade on a 90-260V listing, which is the pattern to reach
  // for on the remaining six. A held offer
  // that leaks into discovery is a product page for a fixture we will not
  // ship, which is worse than one that never appeared.
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, [
    'hand-woven-bamboo-pendant-light',
    'woven-bamboo-dome-pendant',
    'slatted-bamboo-lantern-pendant-20cm',
  ]);
  for (const offer of VOLTAGE_HOLD_CATALOG_OFFERS) {
    assert.ok(
      !DISCOVERABLE_PRODUCT_HANDLES.includes(offer.handle),
      `${offer.handle} is on voltage hold and must not be discoverable`,
    );
    assert.equal(isApprovedVariantSku(offer.sku, 'CA'), false, offer.sku);
  }

  for (const {handle} of ARCHIVED_CATALOG_OFFERS) {
    assert.equal(
      resolveApprovedProductMarket(handle, 'CA'),
      null,
      `${handle} must resolve to no open market`,
    );
    assert.equal(resolveApprovedProductMarket(handle, 'US'), null, handle);
  }
  assert.equal(resolveApprovedProductMarket('retired-product', 'CA'), null);

  // The evidence itself is intact - nine handles across eighteen exact
  // offers - so restoring a product is a move between two lists, not a
  // re-audit.
  assert.equal(
    new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle)).size,
    9,
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

  // CA is open again as of 2026-09-13, so this no longer demonstrates what it
  // used to. It now demonstrates something stricter and more useful: the
  // evidence layer passing is NOT sufficient on its own. `safe` carries every
  // required tag and the CA route tag, and the market is open, and it still
  // does not survive the full filter - because filterLaunchProducts also needs
  // an approved VARIANT, and this fixture's SKU is an archived one.
  assert.equal(isMarketSuspended('CA'), false);
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
  // 5 from the 2026-08 travel cohort plus the 8 watch-roll offers retired on
  // 2026-09-08. Their US route is still verified; the price is what failed.
  assert.equal(usRouted.length, 13);

  for (const offer of usRouted) {
    // Suspended in both markets since 2026-09-01: nothing is sellable, but the
    // offer still records its verified routes.
    assert.equal(isApprovedVariantSku(offer.sku, 'CA'), false, offer.sku);
    assert.equal(isApprovedVariantSku(offer.sku, 'US'), false, offer.sku);
    assert.ok(offer.markets.includes('US'), offer.sku);
  }

  // Both cases, because the lookup upper-cases its argument and a regression
  // there would silently open a suspended market to any caller passing 'us'.
  assert.equal(isMarketSuspended('CA'), false);
  assert.equal(isMarketSuspended('ca'), false);
  assert.equal(isMarketSuspended('US'), true);
  assert.equal(isMarketSuspended('us'), true);
  assert.equal(SUSPENDED_COMMERCE_MARKETS.CA, undefined);
  assert.match(SUSPENDED_COMMERCE_MARKETS.US, /market-switched-to-ca/);

  // The duty evidence is preserved, scoped to the route it was measured
  // against, and it OUTLIVES the market decision layered on top of it. The US
  // market is suspended as of 2026-09-13 for commercial reasons; the cn-direct
  // route into it stays shut for the separate, measured de minimis reason, and
  // us-local stays open. If the store ever returns to the United States, the
  // route facts below are what it returns to - they do not have to be
  // re-established, and reopening the MARKET must not quietly reopen the
  // suspended ROUTE.
  assert.equal(isMarketSuspended('US'), true);
  assert.match(SUSPENDED_FULFILMENT_ROUTES.US['cn-direct'], /de-minimis/);
  assert.equal(SUSPENDED_FULFILMENT_ROUTES.US['us-local'], undefined);
  // An offer that does not declare how it ships must fail closed. The us-local
  // case injects an empty suspension table: it asserts that the ROUTE is open,
  // which stays true while the MARKET is shut for having nothing to sell.
  assert.equal(
    isOfferSellable({handle: 'h', sku: 's', markets: ['US']}, 'US'),
    false,
  );
  // An offer on the default cn-direct route reaches the per-offer duty test
  // rather than being refused by the route, and fails it with no contribution
  // recorded. That is the gate the live cohort has to pass, so it must not be
  // possible to pass it by omission.
  assert.equal(
    isOfferSellable(
      {handle: 'h', sku: 's', markets: ['US'], fulfilment: 'cn-direct'},
      'US',
    ),
    false,
  );
  assert.equal(
    isOfferSellable(
      {handle: 'h', sku: 's', markets: ['US'], fulfilment: 'us-local'},
      'US',
      {suspendedMarkets: {}},
    ),
    true,
  );
  // Same offer, real suspension table, and this is the pair that carries the
  // whole point of the test. The injected-table case immediately above says
  // the us-local ROUTE into the US is open. This one says the offer is still
  // not sellable - because since 2026-09-13 the US MARKET is suspended. Two
  // independent rails, and the only difference between the two assertions is
  // which suspension table was supplied.
  assert.equal(
    isOfferSellable(
      {handle: 'h', sku: 's', markets: ['US'], fulfilment: 'us-local'},
      'US',
    ),
    false,
  );
  // And the same offer in the market that is now OPEN goes through, so the
  // market rail is exercised in both directions rather than only closed.
  assert.equal(
    isOfferSellable(
      {handle: 'h', sku: 's', markets: ['CA'], fulfilment: 'us-local'},
      'CA',
    ),
    true,
  );

  // A cn-direct offer may cross the suspended route only by carrying a
  // positive contribution under whichever duty scenario US_DUTY_INCIDENCE
  // currently makes binding. Zero, negative and absent all keep it closed -
  // the override has to be earned by a modelled figure, not asserted.
  const cnDirect = (extra) => ({
    handle: 'h',
    sku: 's',
    markets: ['US'],
    fulfilment: 'cn-direct',
    ...extra,
  });
  const clearance = (value) =>
    US_DUTY_INCIDENCE === US_DUTY_INCIDENCE_STATES.BILLED
      ? {dutyBilledContributionUsd: value}
      : {dutyPrepaidContributionUsd: value};

  // These assert the ROUTE and DUTY rail. The injected empty suspension table
  // is kept even though the US reopened on 2026-09-09: it pins the rail to the
  // route and the duty figure, so these lines keep meaning the same thing
  // whichever way the market table moves next.
  const open = {suspendedMarkets: {}};
  assert.equal(isOfferSellable(cnDirect({}), 'US', open), false);
  assert.equal(isOfferSellable(cnDirect(clearance(0)), 'US', open), false);
  assert.equal(isOfferSellable(cnDirect(clearance(-4.32)), 'US', open), false);
  assert.equal(isOfferSellable(cnDirect(clearance(8.15)), 'US', open), true);
  // With the REAL table the same cleared offer is refused, because since
  // 2026-09-13 the US market is suspended on top of the route. This is the
  // suspension-wins-over-a-cleared-route assertion: an offer may earn its way
  // across a suspended route with a positive contribution and still be shut
  // out by the market decision above it. The two lines differ only by the
  // suspension table, which is what makes the point.
  assert.equal(isOfferSellable(cnDirect(clearance(8.15)), 'US', open), true);
  assert.equal(isOfferSellable(cnDirect(clearance(8.15)), 'US'), false);
  assert.equal(isOfferSellable(cnDirect({}), 'US'), false);
  // Canada is the OPEN market now, and it has no suspended route, so a
  // cn-direct offer there does not need a duty clearance at all - it is let
  // through by the route rail before the duty rail is ever consulted. That is
  // the whole economic difference between the two countries, expressed as two
  // assertions: the same empty offer that is refused for the US passes for CA.
  assert.equal(
    isOfferSellable({...cnDirect({}), markets: ['CA']}, 'CA'),
    true,
  );
  assert.equal(
    isOfferSellable({...cnDirect(clearance(8.15)), markets: ['CA']}, 'CA'),
    true,
  );

  // The other scenario's figure must not be able to open the route on its own.
  // This is the assertion that stops a healthy prepaid number quietly covering
  // for a loss-making billed one once the incidence is actually known.
  const otherOnly =
    US_DUTY_INCIDENCE === US_DUTY_INCIDENCE_STATES.BILLED
      ? {dutyPrepaidContributionUsd: 48.52}
      : {dutyBilledContributionUsd: 48.52};
  assert.equal(isOfferSellable(cnDirect(otherOnly), 'US', open), false);

  // The incidence is a recorded state, not an assumption. While it is
  // unverified the prepaid figure binds, and the DSers Tax&Fee check before a
  // supplier is paid is what makes that safe - see the constant's comment.
  assert.ok(
    Object.values(US_DUTY_INCIDENCE_STATES).includes(US_DUTY_INCIDENCE),
  );

  // Canada has no suspended route, so the duty clearance is never consulted
  // there and US_DUTY_INCIDENCE cannot change the answer. That is the point of
  // the 2026-09-13 switch stated as a test: the constant above is the largest
  // unknown in the US model and it is simply not on this path.
  assert.equal(
    isOfferSellable({...cnDirect(clearance(8.15)), markets: ['CA']}, 'CA'),
    true,
  );
  assert.equal(
    isOfferSellable({...cnDirect(clearance(-99)), markets: ['CA']}, 'CA'),
    true,
    'a CA offer must not be gated on a US duty figure',
  );

  // The evidence neither the suspension nor the emptying may erase. Eighteen
  // exact offers across nine handles, each keeping its own market list, so
  // restoring one is a move between two constants and a suspension deletion -
  // not a re-audit of routes, costs, copy or imagery.
  assert.equal(ARCHIVED_CATALOG_OFFERS.length, 18);
  assert.equal(
    new Set(ARCHIVED_CATALOG_OFFERS.map((offer) => offer.handle)).size,
    9,
  );
  // Discovery carries only the live cohort. The eighteen archived offers are
  // evidence, not inventory, and the loop below is the assertion that matters:
  // none of them may appear no matter what else discovery is carrying.
  assert.deepEqual(DISCOVERABLE_PRODUCT_HANDLES, [
    'hand-woven-bamboo-pendant-light',
    'woven-bamboo-dome-pendant',
    'slatted-bamboo-lantern-pendant-20cm',
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

  // THE MARKET FLIPPED ON 2026-09-13. Canada now carries the three approved
  // offers and the United States carries nothing. Daniel's words: "Canada. i
  // feel like we just complicated things by doing US."
  //
  // The reason is the duty stack, and it is not a close call. The US route is
  // 41.4% assessed on RETAIL (HTS 9405.11.80: 3.9% + 25% Section 301 + 12.5%
  // forced-labour). Canada is 7% MFN assessed on VALUE FOR DUTY, which is the
  // supplier cost. Per unit that is about CA$2.04 against US$40.57, and it is
  // why the US route left almost nothing worth selling under its cost ceiling.
  // It also retires the US_DUTY_INCIDENCE question rather than answering it:
  // at 7% on cost, the prepaid/billed split stops being worth a test shipment.
  //
  // One SKU each, so SKUs and handles are the same length here and a
  // divergence would mean the derivation drifted. It was five until
  // 2026-09-11, when the petal went to TRANSIT_HOLD and the sconce to
  // COST_HOLD; neither came back with the market change, and the sconce
  // specifically did NOT, because its hold is promo dependence and not duty.
  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.US.length, 0);
  assert.equal(APPROVED_PRODUCT_HANDLES_BY_MARKET.US.length, 0);
  assert.deepEqual(APPROVED_PRODUCT_HANDLES_BY_MARKET.CA, [
    'hand-woven-bamboo-pendant-light',
    'woven-bamboo-dome-pendant',
    'slatted-bamboo-lantern-pendant-20cm',
  ]);
  assert.equal(APPROVED_VARIANT_SKUS_BY_MARKET.CA.length, 3);

  // A US offer crosses the suspended cn-direct route, so it must carry BOTH
  // duty scenarios and both must be positive - the watch-roll cohort died
  // because only the prepaid figure was, and requiring both is the rule that
  // came out of that. A Canadian offer crosses no suspended route and has no
  // second scenario, so it carries one figure. Assert per market rather than
  // per catalogue, or the rule silently stops applying the next time the
  // cohort moves country.
  for (const offer of APPROVED_CATALOG_OFFERS) {
    if (offer.markets.includes('US')) {
      assert.equal(typeof offer.dutyPrepaidContributionUsd, 'number', offer.sku);
      assert.equal(typeof offer.dutyBilledContributionUsd, 'number', offer.sku);
      assert.ok(Number(offer.dutyPrepaidContributionUsd) > 0, offer.sku);
      assert.ok(Number(offer.dutyBilledContributionUsd) > 0, offer.sku);
    } else {
      assert.ok(Number(offer.contributionCad) > 0, offer.sku);
    }
  }

  // The voltage hold is a separate rail and must not feed either list. It
  // holds six offers whose commercial evidence is complete - that is why they
  // are held rather than deleted - so nothing but the hold itself keeps them
  // out of the storefront. Seven until 2026-09-10, when the dome came off the
  // hold via a different listing of the same shade at 90-260V.
  assert.equal(VOLTAGE_HOLD_CATALOG_OFFERS.length, 6);
  for (const held of VOLTAGE_HOLD_CATALOG_OFFERS) {
    assert.ok(
      !APPROVED_VARIANT_SKUS_BY_MARKET.CA.includes(held.sku),
      `${held.handle} is on voltage hold and must not be approved`,
    );
    // Their figures stay as they were recorded when they were held, in the
    // currency of the market they were evidenced in. A held offer's evidence
    // is frozen deliberately - re-deriving it would imply it is a candidate.
    assert.ok(Number(held.dutyPrepaidContributionUsd) > 0, held.sku);
  }
  // The cohort is cn-direct - the AliExpress Selection Standard quote read on
  // 2026-09-01 is a China-direct line, not a US warehouse - so every offer must
  // carry a positive contribution under the binding duty scenario or it cannot
  // cross the suspended route.
  // The duty rail is asserted against the RETIRED cohort, not the live one.
  // An empty APPROVED_CATALOG_OFFERS makes this loop vacuous, which is exactly
  // how a gate stops being tested without anyone noticing. These eight offers
  // are the only ones that have ever had to cross the suspended cn-direct
  // route, so they stay its fixture. Clearing the ROUTE gate is not a claim
  // that they are for sale - archival is a separate rail, asserted above.
  const dutyGated = ARCHIVED_CATALOG_OFFERS.filter(
    (offer) => offer.dutyPrepaidContributionUsd !== undefined,
  );
  assert.equal(dutyGated.length, 8);
  for (const offer of dutyGated) {
    assert.equal(offer.fulfilment, 'cn-direct', offer.sku);
    // Both scenarios must be recorded, so switching US_DUTY_INCIDENCE is a
    // one-line change rather than a re-modelling exercise.
    assert.equal(typeof offer.dutyPrepaidContributionUsd, 'number', offer.sku);
    assert.equal(typeof offer.dutyBilledContributionUsd, 'number', offer.sku);
    assert.ok(Number(offer.dutyPrepaidContributionUsd) > 0, offer.sku);
    // Every offer here is under water if the duty lands on us. That is the
    // finding, not an oversight: it is why the incidence has to be read off a
    // real order before a supplier is ever paid.
    assert.ok(Number(offer.dutyBilledContributionUsd) < 0, offer.sku);
    // Injected empty suspension table: this asserts the offer clears the ROUTE
    // gate on its duty figure. It is not for sale - the US market is suspended
    // and the offer is archived - and both of those are asserted separately.
    assert.equal(
      isOfferSellable(offer, 'US', {suspendedMarkets: {}}),
      true,
      offer.sku,
    );
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

  // CA is the OPEN market as of 2026-09-13, which makes this assertion stronger
  // than it was: the market being open is no longer doing the work. This
  // travel-case SKU simply is not in the approved cohort, so no variant is
  // offerable and the PDP exposes no option selector at all. Fail-closed by
  // membership rather than by suspension.
  assert.equal(isMarketSuspended('CA'), false);
  assert.deepEqual(findApprovedVariants(product, 'CA'), []);
  assert.deepEqual(buildApprovedProductOptions(product, [], undefined), []);

  // The builder's own rule - it renders only the variants handed to it, never
  // the product's full option matrix - is what keeps an unreviewed supplier
  // colour off the page. Assert it against an explicit approved subset so the
  // rule stays covered independently of which market is open.
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

  // The fallback must never be hard-coded to a market name. It was 'CA' once,
  // then the correct answer became 'US', and on 2026-09-13 it became 'CA'
  // again - three reversals in under a month, which is the argument for
  // resolving it rather than writing it down.
  assert.match(route, /resolveDiscoveryMarket\(resolvedCountry\)/);
  // Googlebot crawls from US IPs, and the US market is the suspended one as of
  // 2026-09-13. A request resolving to it must be answered with the open
  // Canadian market, or the suspended market's emptiness-derived noindex lands
  // on the canonical URL and deindexes the catalogue for everybody. That is the
  // 2026-08-21/22 failure exactly, with the two countries swapped.
  assert.equal(resolveDiscoveryMarket('US'), 'CA');
  assert.equal(resolveDiscoveryMarket('CA'), 'CA');
  assert.ok(
    !Object.prototype.hasOwnProperty.call(SUSPENDED_COMMERCE_MARKETS, 'CA'),
    'an open market is the precondition for the resolution above',
  );
  assert.match(route, /filterLaunchProducts\(rawProducts\?\.nodes, country\)/);
  // The emptiness fail-safe itself must stay: a genuinely empty catalogue
  // should still noindex rather than serve Google a blank shop page.
  assert.match(route, /noindex: !data\?\.products\?\.nodes\?\.length/);
});

// ---------------------------------------------------------------------------
// Incidence immunity. Added 2026-09-10 after the route that was supposed to
// settle US_DUTY_INCIDENCE turned out to measure Tmall service fees. An offer
// that clears the undercut floor on BOTH duty bases does not care how the
// constant resolves, and the point of these tests is that the catalogue's
// exposure stays a number somebody looked at rather than a footnote.

test('the incidence-immunity floor still matches the undercut floor', async () => {
  const {MIN_CONTRIBUTION_USD} = await import('../scripts/check-undercut.mjs');
  const {INCIDENCE_IMMUNITY_FLOOR_USD} = await import(
    '../app/lib/launch-catalog.js'
  );
  assert.equal(
    INCIDENCE_IMMUNITY_FLOOR_USD,
    MIN_CONTRIBUTION_USD,
    'launch-catalog mirrors the floor by hand to avoid an import cycle; they drifted',
  );
});

test('isIncidenceImmune needs BOTH bases over the floor', async () => {
  const {isIncidenceImmune} = await import('../app/lib/launch-catalog.js');
  assert.equal(
    isIncidenceImmune({
      dutyPrepaidContributionUsd: 57.51,
      dutyBilledContributionUsd: 13.72,
    }),
    true,
  );
  // The live sconce: comfortable on prepaid, under the floor on billed. This
  // is exactly the offer shape that silently depends on the unknown.
  assert.equal(
    isIncidenceImmune({
      dutyPrepaidContributionUsd: 40.52,
      dutyBilledContributionUsd: 7.96,
    }),
    false,
  );
  // A missing figure is exposure, never immunity.
  assert.equal(
    isIncidenceImmune({dutyPrepaidContributionUsd: 99.0}),
    false,
  );
  assert.equal(isIncidenceImmune(undefined), false);
});

test('every approved offer carries the contribution figure its market needs', () => {
  // Per market, because the shape of the answer differs. A US offer files a
  // PAIR - prepaid and billed - because nobody knows which way the incidence
  // resolves and the weaker figure has to be available to bind. A Canadian
  // offer files ONE, because 7% on value for duty admits no second reading.
  //
  // Asserting the wrong shape is not cosmetic: a CA offer carrying a stale US
  // pair would be scored against a duty stack it never pays.
  for (const offer of APPROVED_CATALOG_OFFERS) {
    if (offer.markets.includes('US')) {
      assert.equal(
        typeof offer.dutyPrepaidContributionUsd,
        'number',
        `${offer.handle} sells into the US and has no prepaid contribution`,
      );
      assert.equal(
        typeof offer.dutyBilledContributionUsd,
        'number',
        `${offer.handle} sells into the US and has no billed contribution`,
      );
    }
    if (offer.markets.includes('CA')) {
      assert.equal(
        typeof offer.contributionCad,
        'number',
        `${offer.handle} sells into Canada and has no contributionCad`,
      );
      assert.ok(offer.contributionCad > 0, offer.handle);
      assert.equal(
        offer.dutyPrepaidContributionUsd,
        undefined,
        `${offer.handle} is Canadian and must not carry a US duty pair - a stale one would be scored against a duty stack it never pays`,
      );
    }
  }
});

test('incidenceExposure partitions exactly the US offers, and nothing else', async () => {
  const {incidenceExposure} = await import('../app/lib/launch-catalog.js');
  const {immune, exposed} = incidenceExposure();
  const usOffers = APPROVED_CATALOG_OFFERS.filter((o) => o.markets.includes('US'));

  assert.equal(immune.length + exposed.length, usOffers.length);
  const seen = new Set([...immune, ...exposed].map((o) => o.handle));
  assert.equal(seen.size, new Set(usOffers.map((o) => o.handle)).size);

  // As of 2026-09-13 that set is EMPTY, and empty is the correct answer rather
  // than a gap in coverage. The store sells to Canada, where the incidence
  // question does not arise, so there is nothing to be exposed to it.
  //
  // The assertion that used to live here - that at least one offer is immune,
  // because a catalogue with zero immune offers bets the whole store on one
  // unknown - still matters and is restored automatically by the branch below
  // the day a US offer comes back. It is deliberately not deleted.
  if (usOffers.length === 0) {
    assert.deepEqual(immune, []);
    assert.deepEqual(exposed, []);
  } else {
    assert.ok(
      immune.length > 0,
      'no approved US offer survives the billed basis: the catalogue is fully exposed to US_DUTY_INCIDENCE',
    );
  }
});

// ---------------------------------------------------------------------------
// The transit hold. Added 2026-09-10 after the petal pendant was found sitting
// on AliExpress Selection Shipping_Oversized at 33-41 days to the United
// States while quoting the same $1.99 freight as every other offer. Freight
// cost and transit time are separate facts; nothing in the screen was reading
// the second one.

test('a transit-held offer is not approved and not discoverable', async () => {
  const {TRANSIT_HOLD_CATALOG_OFFERS} = await import(
    '../app/lib/launch-catalog.js'
  );
  assert.ok(TRANSIT_HOLD_CATALOG_OFFERS.length >= 1);
  for (const held of TRANSIT_HOLD_CATALOG_OFFERS) {
    assert.ok(
      !APPROVED_CATALOG_OFFERS.some((o) => o.handle === held.handle),
      `${held.handle} is transit-held and must not be approved`,
    );
    assert.ok(
      !DISCOVERABLE_PRODUCT_HANDLES.includes(held.handle),
      `${held.handle} is transit-held and must not be discoverable`,
    );
    assert.equal(isApprovedVariantSku(held.sku, 'US'), false, held.sku);
  }
});

test('a transit-held offer keeps its economics so releasing it is not a re-audit', async () => {
  const {TRANSIT_HOLD_CATALOG_OFFERS} = await import(
    '../app/lib/launch-catalog.js'
  );
  for (const held of TRANSIT_HOLD_CATALOG_OFFERS) {
    // The whole point of a hold rather than a deletion: the numbers that were
    // measured stay measured. The petal's cost, voltage, stock, imagery and
    // rule 2 all passed - only the parcel failed.
    assert.equal(typeof held.dutyPrepaidContributionUsd, 'number', held.handle);
    assert.equal(typeof held.dutyBilledContributionUsd, 'number', held.handle);
    assert.match(
      String(held.transitHold || ''),
      /\d/,
      `${held.handle} must record WHY it is held, with the observed figure`,
    );
  }
});

test('the hold lists do not overlap each other', async () => {
  const {TRANSIT_HOLD_CATALOG_OFFERS} = await import(
    '../app/lib/launch-catalog.js'
  );
  const voltage = new Set(VOLTAGE_HOLD_CATALOG_OFFERS.map((o) => o.handle));
  for (const held of TRANSIT_HOLD_CATALOG_OFFERS) {
    assert.ok(
      !voltage.has(held.handle),
      `${held.handle} is on two hold lists; releasing one would look sufficient`,
    );
  }
});

test('every offer records the supplier an order would actually reach', () => {
  /*
   * Added 2026-09-13. Before this, nothing in the repo knew which AliExpress
   * listing DSers would order from, and it turned out to be the wrong one for
   * every live product: the saucer pointed at the wide-brim hat listing it was
   * re-sourced away from, the dome at the 220 V listing it was released from,
   * and the lantern at nothing at all. All 383 tests passed throughout.
   *
   * A test cannot reach DSers, so it cannot prove the mapping is right. What it
   * CAN do is pin the number a human verified, so that a silent edit fails and
   * so the next run has something to compare against. The verification method
   * is in the comment above APPROVED_CATALOG_OFFERS.
   */
  const expected = {
    'hand-woven-bamboo-pendant-light': '1005004093257950',
    'woven-bamboo-dome-pendant': '1005008639319927',
    'slatted-bamboo-lantern-pendant-20cm': '1005004341913414',
  };
  for (const offer of APPROVED_CATALOG_OFFERS) {
    assert.ok(
      Object.prototype.hasOwnProperty.call(offer, 'supplierProductId'),
      `${offer.handle} has no supplierProductId - record which listing an order reaches`,
    );
    assert.equal(offer.supplierProductId, expected[offer.handle], offer.handle);
  }

  // The held sconce is the one mapping that was correct all along; keep it
  // recorded so releasing it does not start from nothing.
  const sconce = COST_HOLD_CATALOG_OFFERS.find((o) => o.handle === 'plug-in-bamboo-sconce-swing-arm');
  assert.equal(sconce.supplierProductId, '1005010458579497');

  // An APPROVED offer can never be unmapped: null is what the lantern carried
  // while DRAFT in Shopify, and it belongs on the fulfilment hold, not here.
  for (const offer of APPROVED_CATALOG_OFFERS) {
    assert.notEqual(offer.supplierProductId, null, `${offer.handle} is approved with no supplier`);
  }

  // A recorded id must be the 1005 form DSers uses, not the 3256 form this
  // file quotes in prose. They differ by 2251799813685248 and mixing them up
  // would make every future comparison fail for the wrong reason.
  for (const offer of [...APPROVED_CATALOG_OFFERS, ...COST_HOLD_CATALOG_OFFERS]) {
    if (offer.supplierProductId === null) continue;
    assert.match(offer.supplierProductId, /^1005\d{12}$/, offer.handle);
  }
});

test('a fulfilment-held offer is not approved, not discoverable, and records why', async () => {
  const {FULFILMENT_HOLD_CATALOG_OFFERS} = await import(
    '../app/lib/launch-catalog.js'
  );
  // Empty since the lantern was mapped in DSers on 2026-09-13, and expected
  // to stay empty - the assertions below are the contract for the next
  // offer that lands here, not a description of the current one.
  assert.equal(FULFILMENT_HOLD_CATALOG_OFFERS.length, 0);
  for (const held of FULFILMENT_HOLD_CATALOG_OFFERS) {
    assert.ok(
      !APPROVED_CATALOG_OFFERS.some((o) => o.handle === held.handle),
      `${held.handle} is fulfilment-held and must not be approved`,
    );
    assert.ok(
      !DISCOVERABLE_PRODUCT_HANDLES.includes(held.handle),
      `${held.handle} is fulfilment-held and must not be discoverable`,
    );
    assert.equal(isApprovedVariantSku(held.sku, 'CA'), false, held.sku);
    assert.equal(isApprovedVariantSku(held.sku, 'US'), false, held.sku);
    // The hold exists precisely because there is no supplier to reach.
    assert.equal(held.supplierProductId, null, held.handle);
    // Economics stay measured so a release is not a re-audit.
    assert.equal(typeof held.contributionCad, 'number', held.handle);
    assert.match(
      String(held.fulfilmentHold || ''),
      /\d/,
      `${held.handle} must record WHY it is held, with the observed date`,
    );
  }
});
