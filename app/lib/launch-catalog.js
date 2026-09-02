/**
 * Temporary launch gate for the customer-facing catalog.
 *
 * Shopify's Storefront cache can retain a product after its Admin status is
 * changed. Until the catalog review is complete, an explicit Shopify tag makes
 * the storefront fail closed: an unreviewed product cannot surface in a
 * collection, search result, or merchandising rail just because it remains in
 * a cached collection response.
 */
// Emergency storefront containment. While true, cart and checkout entry routes
// remain closed even if a stale browser cart or shared Shopify cart permalink
// exists. Remove only after the preview and catalog launch gates are approved.
export const STOREFRONT_CONTAINMENT_ACTIVE = false;

/**
 * A versioned, final approval tag prevents the legacy launch tag from
 * accidentally reopening the catalog. The legacy tag is present on the
 * current unverified catalog and therefore is not evidence of readiness.
 */
export const CATALOG_APPROVAL_TAG = 'puchica-catalog-approved-v1';

/**
 * Evidence required before a product can be discovered or purchased.
 *
 * These tags represent completed checks, not marketing claims. Product truth,
 * mapping, cost, margin, copy, and imagery are shared gates. Delivery evidence
 * is market-specific: a Canadian route must not be treated as proof that the
 * same supplier/variant can ship to the United States (or vice versa).
 */
export const REQUIRED_CATALOG_EVIDENCE_TAGS = Object.freeze([
  CATALOG_APPROVAL_TAG,
  'dsers-mapped',
  'cost-verified',
  'margin-verified',
  'copy-verified',
  'imagery-verified',
]);

export const MARKET_ROUTE_EVIDENCE_TAGS = Object.freeze({
  CA: 'ca-route-verified',
  US: 'us-route-verified',
});

/**
 * How an offer physically reaches the customer.
 *
 * This is the axis the 2026 United States duty change actually moved. A parcel
 * posted from China to a US customer now clears customs on every order; a
 * parcel picked from a US warehouse for a US customer is a domestic shipment
 * with no customs event at all, and its duty was paid once, upstream, on the
 * importer's wholesale cost. Those are different economics for the same
 * market, so the constraint belongs on the offer's route, not on the market.
 *
 * The default is deliberately `cn-direct`: an offer that does not say how it
 * ships is treated as the expensive case and fails closed.
 */
export const FULFILMENT_ROUTES = Object.freeze({
  CN_DIRECT: 'cn-direct',
  US_LOCAL: 'us-local',
});

export const DEFAULT_FULFILMENT_ROUTE = FULFILMENT_ROUTES.CN_DIRECT;

export function fulfilmentRouteFor(offer) {
  return offer?.fulfilment || DEFAULT_FULFILMENT_ROUTE;
}

/**
 * The 2026-08 travel cohort: exact supplier offers that passed the route,
 * cost, copy, and imagery review. ARCHIVED, not live.
 *
 * Every handle below was deleted from Shopify on 2026-08-28. Verified against
 * production on 2026-09-01: all seven return 404, the product sitemap carries
 * zero <loc> entries and the Canadian feed zero <item> entries. Nothing here
 * can be served, sold, indexed or advertised.
 *
 * It is kept because the evidence is expensive and still true - the DSers
 * route readings, the exact per-colour SKUs, the bundle's component split, the
 * per-market route findings. Recreating a product in Shopify restores its
 * offer by moving the entry into APPROVED_CATALOG_OFFERS below and deleting
 * the matching SUSPENDED_COMMERCE_MARKETS entry. Nothing needs re-auditing
 * except the supplier route, which goes stale on its own.
 */
export const ARCHIVED_CATALOG_OFFERS = Object.freeze([
  Object.freeze({
    handle: '3-piece-packing-cube-set',
    sku: '14:1052#S3007 Black;5:200004186#3PCS L M S Set',
    markets: Object.freeze(['CA', 'US']),
  }),
  Object.freeze({
    handle: 'white-semi-circular-travel-jewelry-case',
    sku: '14:29',
    markets: Object.freeze(['CA', 'US']),
  }),
  Object.freeze({
    handle: 'black-hanging-travel-toiletry-organizer',
    sku: '14:771#Black',
    markets: Object.freeze(['CA', 'US']),
  }),
  Object.freeze({
    handle: 'travel-cable-organizer-case',
    sku: '14:193#Double Layers',
    markets: Object.freeze(['CA', 'US']),
  }),
  // Canada only. The route evidence read in DSers on 2026-08-22 was ship-to
  // Canada; no United States route has been quoted for this supplier variant,
  // and the US market is commercially suspended regardless. Do not add 'US'
  // here without a fresh US route reading.
  Object.freeze({
    handle: 'black-travel-tech-case',
    sku: '14:29#Black',
    markets: Object.freeze(['CA']),
  }),
  // Multi-item bundle. A bundle can only claim a market where every component
  // has route evidence for it; all three now do, in both markets.
  Object.freeze({
    handle: 'the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case',
    sku: 'PUCHICA-KIT-CARRYON-01',
    markets: Object.freeze(['CA', 'US']),
    bundle: true,
  }),
  // Canada only. Route evidence read in DSers on 2026-08-27: AliExpress
  // Selection Standard from CN, free shipping, 8-16 days, tracking available.
  // No US route has been quoted for this supplier variant.
  //
  // The first product priced above the CA$70 CPA crossover, so it is the first
  // that can carry paid traffic: US$27.94 worst-case landed against CA$139
  // retail is 28%, +CA$74.41 contribution against a CA$42 benchmark CPA. Every
  // pre-existing product sits under the crossover and loses money on ads.
  //
  // Colours are listed separately because the gate is per-SKU and their depth
  // differs sharply: Grey/Pink/Beige hold ~975 units each, Black only 24.
  Object.freeze({
    handle: 'compression-packing-cube-set-5-piece',
    sku: '14:691;200007763:201336100', // Grey
    markets: Object.freeze(['CA']),
  }),
  Object.freeze({
    handle: 'compression-packing-cube-set-5-piece',
    sku: '14:1052;200007763:201336100', // Pink
    markets: Object.freeze(['CA']),
  }),
  Object.freeze({
    handle: 'compression-packing-cube-set-5-piece',
    sku: '14:771;200007763:201336100', // Beige
    markets: Object.freeze(['CA']),
  }),
  Object.freeze({
    handle: 'compression-packing-cube-set-5-piece',
    sku: '14:193;200007763:201336100', // Black - 24 units, watch for oversell
    markets: Object.freeze(['CA']),
  }),
]);

/**
 * Exact supplier offers the storefront may actually serve. Product-level
 * approval is not permission to sell every colour or size in a supplier
 * listing, so the handle and exact SKU stay together here and every storefront
 * gate and production monitor derives its cohort from this one list.
 *
 * Empty since 2026-08-28. The catalogue was deleted from Shopify and no
 * replacement product has been through the route, cost, copy and imagery
 * review. An empty list is the honest state, and it is what makes the gates
 * agree with the storefront: production monitoring asserts the live site
 * serves exactly this set, and the live site serves nothing.
 *
 * Do not add an entry here to make a check pass. An entry means a real
 * Shopify product exists at that handle with that exact SKU, with route and
 * cost evidence recorded. ARCHIVED_CATALOG_OFFERS above holds the previous
 * cohort's evidence for whichever of them come back.
 */
export const APPROVED_CATALOG_OFFERS = Object.freeze([
  // 2026-09-01 watch-roll cohort. United States only, cn-direct fulfilment.
  //
  // CORRECTED the same day. These were first entered as us-local on the
  // strength of the search field `itemCardType: app_us_local_card`. That was a
  // misread: the flag means the item is MERCHANDISED in the US storefront, not
  // that it ships from a US warehouse. The listing's own shipping panel, read
  // with ship-to United States, says "AliExpress Selection Standard", $1.99,
  // Sep 10-14, with a delivery spread of 8-11 days and USPS only as final mile.
  // That is a China-direct consolidated line, so the de minimis duty stack
  // applies in full and every offer here needs its own duty clearance.
  //
  // worstCaseDutyContributionUsd is scripts/us-duty-impact.mjs scenario D -
  // duty assessed on the retail transaction value AND the carrier disbursement
  // billed - at the retail price each SKU actually carries on the US price
  // list. Item cost $26.18 (3 slot) / $30.52 (4 slot) / $43.64 (6 slot),
  // supplier shipping $1.99, duty rate 0.38 for leather cases under 4202.
  //
  // WATCH THIS: $26.18 is a Labor Day sale price ending 2026-09-07 against a
  // $55.70 compare-at. Re-read supplier cost after that date; if it reverts,
  // every figure below has to be recomputed before these keep selling.
  //
  // CA is absent deliberately: the market is suspended and no Canadian route
  // has been quoted for these supplier variants.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:496#3 Slot Black Red',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 4.45,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:865#3 Slot Green Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 4.45,
  }),
  // 7 units. Thinnest variant in the cohort - watch for oversell.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:193#3 Slot Brown',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 4.45,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:173#6 Slot Brown',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 8.40,
  }),
  // 100 units. Deepest stock in the cohort.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:350686#6 Slot Green Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 8.40,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:350850#6 Slot Black Red',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 8.40,
  }),
  // 4 units.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-4-watches',
    sku: '14:173#4 Slot Black Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 5.47,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-4-watches',
    sku: '14:100013777#4 Slot Brown Black',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    worstCaseDutyContributionUsd: 5.47,
  }),
]);

/**
 * A bundle is one Shopify SKU fulfilled as several supplier orders, so it can
 * never carry `dsers-mapped`: DSers maps one storefront variant to one supplier
 * variant. Exempting the tag is only safe because the bundle must instead carry
 * `bundle-fulfilment-verified`, which asserts that every component is itself
 * DSers-mapped and that the manual split is documented in the runbook.
 */
export const BUNDLE_CATALOG_HANDLES = new Set(
  // Derived from the archived cohort as well as the live one: which handles
  // are bundles is an evidence fact about the product, not a function of
  // whether it is currently sellable. Emptying the catalogue must not quietly
  // drop the `dsers-mapped` exemption rule.
  [...ARCHIVED_CATALOG_OFFERS, ...APPROVED_CATALOG_OFFERS]
    .filter((offer) => offer.bundle)
    .map((offer) => offer.handle),
);

export const BUNDLE_EXEMPT_EVIDENCE_TAGS = Object.freeze(['dsers-mapped']);

export const BUNDLE_REQUIRED_EVIDENCE_TAGS = Object.freeze([
  'bundle-fulfilment-verified',
]);

/**
 * Evidence a given handle must carry. Bundles trade `dsers-mapped` for
 * `bundle-fulfilment-verified`; every other handle keeps the shared list.
 */
export function requiredEvidenceTagsForHandle(handle) {
  if (!BUNDLE_CATALOG_HANDLES.has(handle)) {
    return REQUIRED_CATALOG_EVIDENCE_TAGS;
  }
  return Object.freeze([
    ...REQUIRED_CATALOG_EVIDENCE_TAGS.filter(
      (tag) => !BUNDLE_EXEMPT_EVIDENCE_TAGS.includes(tag),
    ),
    ...BUNDLE_REQUIRED_EVIDENCE_TAGS,
  ]);
}

// Products removed from the deliberately small first-sale cohort. Keeping this
// list explicit lets production checks prove that stale Shopify data cannot
// make an old product buyable again.
export const RETIRED_CATALOG_HANDLES = new Set([
  'white-luggage-id-tag',
  'ten-hole-white-cable-organizer-clips',
  'large-blue-handled-clothes-storage-bag',
  'black-knitted-luggage-wheel-covers-set-of-4',
  'soft-luggage-handle-wrap-black-coffee-brown',
]);

/**
 * Commerce closures, at the two levels they actually occur.
 *
 * A market is suspended when there is nothing to sell into it at all. A
 * fulfilment route is suspended when the goods can be sold but not profitably
 * delivered by that particular means - which is what the 2026 duty change did,
 * and it did it to one route rather than to the whole United States market.
 *
 * The US $800 de minimis exemption is gone: suspended for all countries by
 * EO 14324, codified by CBP on 2026-06-24, upheld by the Court of International
 * Trade on 2026-08-13, and repealed by statute on 2027-07-01. The flat
 * per-parcel specific duty that used to cap the damage ceased on 2026-02-28,
 * so every parcel entering the United States is now assessed ad valorem -
 * roughly 38% on cases and cables, roughly 55% on polyester travel goods -
 * plus $2.69 MPF and a carrier disbursement fee billed to the customer when
 * duty was not prepaid.
 *
 * scripts/us-duty-impact.mjs models this against the exact cost baseline. Even
 * in the most favourable case, where the supplier prepays duty and the customer
 * never sees it, mean contribution falls from $17.60 to $8.26 and the Carry-On
 * Kit turns negative. In the case CBP is actually entitled to apply - duty on
 * the retail transaction value, because in a dropship the purchaser is the end
 * customer - every cn-direct offer loses money.
 *
 * All of that is a fact about parcels CROSSING THE BORDER. It says nothing
 * about a US-warehouse offer, whose duty was already paid upstream on the
 * importer's wholesale cost and which never clears customs on the customer's
 * order. The previous blanket `US` market suspension over-reached: it closed
 * the market this store actually sells into on the strength of evidence that
 * only ever applied to cn-direct fulfilment. The evidence is kept and still
 * binding - on the route it was measured against.
 *
 * A us-local offer therefore needs no re-litigation of duty. What it does
 * still need is its own route evidence tag and a real cost reading, exactly
 * like any other offer.
 */
export const SUSPENDED_FULFILMENT_ROUTES = Object.freeze({
  US: Object.freeze({
    [FULFILMENT_ROUTES.CN_DIRECT]:
      'us-de-minimis-repeal-2026: per-parcel landed duty exceeds contribution',
  }),
  CA: Object.freeze({}),
});

export const SUSPENDED_COMMERCE_MARKETS = Object.freeze({
  // Added 2026-09-01. Every offer below names a handle deleted from Shopify on
  // 2026-08-28, so there is nothing to sell into Canada. check-production-health
  // asserts the storefront serves exactly the approved handle set and failed CI
  // run #114 after a successful deploy, because the storefront correctly serves
  // none of them. Suspending empties the gate through offersForMarket(), so the
  // checks compare an empty set against an empty catalog. Remove this entry
  // when real products are approved, and prune APPROVED_CATALOG_OFFERS to
  // whatever actually ships at the same time.
  CA: 'catalog-empty-2026-08-28: no approved offer resolves',
});

export function isFulfilmentRouteSuspended(market, route) {
  const suspended =
    SUSPENDED_FULFILMENT_ROUTES[String(market || '').toUpperCase()] || {};
  return Object.prototype.hasOwnProperty.call(
    suspended,
    route || DEFAULT_FULFILMENT_ROUTE,
  );
}

/**
 * Markets this storefront can display a catalogue for, in preference order.
 */
export const DISCOVERY_MARKETS = Object.freeze(['US', 'CA']);

/**
 * The market whose cohort a discovery surface should DISPLAY.
 *
 * A commercially suspended market must not blank a shared page: Googlebot
 * crawls from US IPs, so an empty cohort on the canonical /collections/all
 * would noindex the catalogue for every market - the exact post-deploy
 * metadata failure of 2026-08-21/22. This previously hard-coded 'CA' as the
 * fallback, which was only correct while CA happened to be the open market.
 * It is now the suspended one, so the fallback resolved a suspended market
 * back to itself and quietly did nothing. Resolve to the first market that is
 * actually open instead, and let the caller keep checkout closed regardless of
 * what is displayed.
 */
export function resolveDiscoveryMarket(requestedMarket) {
  const requested = String(requestedMarket || '').toUpperCase();
  if (requested && !isMarketSuspended(requested)) return requested;
  return (
    DISCOVERY_MARKETS.find((market) => !isMarketSuspended(market)) || requested
  );
}

/**
 * An offer is sellable into a market when the market is open, the offer claims
 * that market, and either its fulfilment route is open there or the offer
 * carries its own duty clearance.
 *
 * The route suspension exists because a percentage duty destroys a thin
 * margin. It is not a fact about the route in isolation - it is a fact about
 * the route AT A PRICE POINT. scripts/us-duty-impact.mjs models the same
 * parcel across four duty bases; the old cohort went negative at $15-52
 * retail, and the same stack leaves a positive contribution at $89-129 - the
 * real USD price list, not the CAD one, which runs to $149. A
 * blanket route ban therefore closes offers that demonstrably work.
 *
 * `worstCaseDutyContributionUsd` is the contribution under the HARSHEST
 * modelled basis - duty assessed on the retail transaction value AND the
 * carrier disbursement billed - which is the case CBP is actually entitled to
 * apply to a dropship. An offer may only override a suspended route with a
 * figure above zero, and that figure must come from the model, not from
 * optimism. Omitting it keeps the offer closed.
 */
export function isOfferSellable(offer, market) {
  if (!offer || isMarketSuspended(market)) return false;
  if (!offer.markets.includes(market)) return false;
  if (!isFulfilmentRouteSuspended(market, fulfilmentRouteFor(offer))) {
    return true;
  }
  return Number(offer.worstCaseDutyContributionUsd) > 0;
}

export function isMarketSuspended(market) {
  return Object.prototype.hasOwnProperty.call(
    SUSPENDED_COMMERCE_MARKETS,
    String(market || '').toUpperCase(),
  );
}

function offersForMarket(market) {
  if (isMarketSuspended(market)) return [];
  return APPROVED_CATALOG_OFFERS.filter((offer) =>
    isOfferSellable(offer, market),
  );
}

export const APPROVED_VARIANT_SKUS_BY_MARKET = Object.freeze({
  CA: Object.freeze(offersForMarket('CA').map((offer) => offer.sku)),
  US: Object.freeze(offersForMarket('US').map((offer) => offer.sku)),
});

export const APPROVED_PRODUCT_HANDLES_BY_MARKET = Object.freeze({
  CA: Object.freeze([
    ...new Set(offersForMarket('CA').map((offer) => offer.handle)),
  ]),
  US: Object.freeze([
    ...new Set(offersForMarket('US').map((offer) => offer.handle)),
  ]),
});

export const DISCOVERABLE_PRODUCT_HANDLES = Object.freeze([
  ...new Set(APPROVED_CATALOG_OFFERS.map((offer) => offer.handle)),
]);

// Retain this export name for callers that construct Storefront API queries.
// It now means final approval, not the unsafe legacy tag.
export const LAUNCH_READY_TAG = CATALOG_APPROVAL_TAG;

// Temporary operational hold: the exact mapped 24-piece variant returned no
// United States shipping route in DSers on 2026-08-01. Keep it out of every
// customer-facing launch surface until a replacement route passes the quote
// and fulfillment gates.
export const OPERATIONAL_HOLD_HANDLES = new Set([
  '24-piece-drawer-organizer-tray-set',
  // Brand/IP authorization has not been established for the supplier-branded
  // Toocki listing. It cannot enter organic or paid discovery while held.
  'toocki-five-clip-cable-organizer',
  // Battery type, transport constraints, accuracy, instructions, and claims
  // remain unverified for this scale.
  'pocket-luggage-scale-50kg',
  // The customer-facing media visibly uses the Naturehike brand, but seller
  // authorization and exact-brand permission are not documented.
  'travel-toiletry-organizer',
]);

export function isLaunchReadyProduct(product, market = 'CA') {
  const tags = new Set(
    Array.isArray(product?.tags)
      ? product.tags.map((tag) => String(tag).trim().toLowerCase())
      : [],
  );

  const routeTag =
    MARKET_ROUTE_EVIDENCE_TAGS[String(market || 'CA').toUpperCase()] ||
    MARKET_ROUTE_EVIDENCE_TAGS.CA;

  return Boolean(
    product?.availableForSale &&
    requiredEvidenceTagsForHandle(product?.handle).every((tag) =>
      tags.has(tag),
    ) &&
    tags.has(routeTag) &&
    !RETIRED_CATALOG_HANDLES.has(product?.handle) &&
    !OPERATIONAL_HOLD_HANDLES.has(product?.handle),
  );
}

export function filterLaunchProducts(products = [], market = 'CA') {
  return products.filter(
    (product) =>
      isLaunchReadyProduct(product, market) &&
      Boolean(findApprovedVariant(product, market)),
  );
}

export function isApprovedVariantSku(sku, market = 'CA') {
  const country = String(market || 'CA').toUpperCase();
  const approved =
    APPROVED_VARIANT_SKUS_BY_MARKET[country] ||
    APPROVED_VARIANT_SKUS_BY_MARKET.CA;
  return typeof sku === 'string' && approved.includes(sku);
}

export function filterDiscoverableProducts(products = []) {
  return products.filter((product) => {
    const resolution = resolveApprovedProductMarket(product?.handle);
    return Boolean(
      resolution?.availableMarkets.some(
        (market) =>
          isLaunchReadyProduct(product, market) &&
          findApprovedVariant(product, market),
      ),
    );
  });
}

export function resolveApprovedProductMarket(handle, requestedMarket = 'CA') {
  const availableMarkets = [
    ...new Set(
      APPROVED_CATALOG_OFFERS.filter((offer) => offer.handle === handle).flatMap(
        (offer) =>
          offer.markets.filter((market) => isOfferSellable(offer, market)),
      ),
    ),
  ];
  if (!availableMarkets.length) return null;

  const requested = String(requestedMarket || 'CA').toUpperCase();
  const marketAvailable = availableMarkets.includes(requested);
  return {
    availableMarkets,
    commerceMarket: marketAvailable ? requested : availableMarkets[0],
    marketUnavailable: !marketAvailable,
  };
}

export function findApprovedVariant(product, market = 'CA') {
  return findApprovedVariants(product, market)[0];
}

export function findApprovedVariants(product, market = 'CA') {
  return (product?.variants?.nodes || []).filter(
    (variant) =>
      variant?.availableForSale && isApprovedVariantSku(variant.sku, market),
  );
}

/**
 * Build the small option matrix used on an approved PDP without re-exposing
 * unreviewed supplier variants. Hydrogen's full product option matrix can
 * contain colours and configurations that never passed the market gate; this
 * mapper derives customer controls exclusively from approved exact SKUs.
 */
export function buildApprovedProductOptions(
  product,
  approvedVariants,
  selectedVariant,
) {
  const variants = Array.isArray(approvedVariants) ? approvedVariants : [];
  if (variants.length <= 1) return [];

  return (product?.options || [])
    .map((option) => {
      const values = new Map();

      for (const variant of variants) {
        const selectedOption = variant?.selectedOptions?.find(
          (entry) => entry?.name === option?.name,
        );
        if (!selectedOption?.value || values.has(selectedOption.value))
          continue;

        const sourceValue = option?.optionValues?.find(
          (entry) => entry?.name === selectedOption.value,
        );
        const query = new URLSearchParams();
        for (const entry of variant.selectedOptions || []) {
          if (entry?.name && entry?.value) query.set(entry.name, entry.value);
        }

        values.set(selectedOption.value, {
          name: selectedOption.value,
          handle: product.handle,
          variantUriQuery: query.toString(),
          selected: variant.id === selectedVariant?.id,
          available: Boolean(variant.availableForSale),
          exists: true,
          isDifferentProduct: false,
          swatch: sourceValue?.swatch || null,
        });
      }

      return {name: option.name, optionValues: [...values.values()]};
    })
    .filter(
      (option) =>
        option.name &&
        !/^(title|default title)$/i.test(option.name) &&
        option.optionValues.length > 1,
    );
}
