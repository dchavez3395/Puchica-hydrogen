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

  // ===========================================================================
  // 2026-09 watch-roll cohort. RETIRED 2026-09-08 after the Amazon US undercut
  // test, which had never been run on it. Both Shopify products moved to DRAFT
  // the same day.
  //
  // Amazon US, read in a US-priced view: the 3-slot volume tier is $18.99-34.28
  // (ROSELLE $29.99 / 626 reviews / 200+ bought a month; MR.OKAY $34.28 / 239;
  // AUKURA $18.99 / 300+ a month) against our $49. The 4-slot band is
  // $22.49-49.99 against our $62. The 6-slot band is $12.99-64.99 - ProCase
  // $18.69 with 406 reviews and 600+ bought a month, AUKURA $19.99 with 707 -
  // against our $85, with UPRESYE full-grain GENUINE leather at $99.99 just
  // above us.
  //
  // Repricing does not rescue it. At market-matching 32 / 40 / 50,
  // scripts/us-duty-impact.mjs scenario E - the BEST case, duty already inside
  // the supplier price, zero ad spend - returns $6.13 / $7.56 / -$2.52. Our
  // 3-slot COST of $26.18 sits above the $18.99 at which competitors retail.
  // Price for margin and we are above the market; price at the market and there
  // is no margin.
  //
  // Worth keeping from the loss: this category is NOT brand-locked. The largest
  // review count found anywhere across the three searches was 707, against
  // Victor's 13,800 in pest control. Demand is real and steady. The supply
  // price is the only thing that failed, which points at real wholesale rather
  // than at a different product.
  //
  // Duty figures below are the corrected ones from the 2026-09-08 repricing and
  // are kept for whichever offer comes back. US_DUTY_INCIDENCE was still
  // 'unverified' when this was retired, and it remains so. The reading this
  // note once pointed at - the DSers Tax&Fee line - turns out to measure Tmall
  // tax and service fees, not import duty, so no order would have settled it.
  // See US_DUTY_INCIDENCE below.
  // ===========================================================================

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
  // REPRICED AND RE-SOURCED 2026-09-03, after the single-figure
  // `worstCaseDutyContributionUsd` was replaced by the pair below. One number
  // could not describe this cohort honestly, because the biggest input to it
  // is unknown: see US_DUTY_INCIDENCE.
  //
  //   dutyPrepaidContributionUsd  scenario E - the duty is already inside the
  //                               price we pay AliExpress, so nothing further
  //                               is owed and this is an ordinary margin.
  //   dutyBilledContributionUsd   scenario D- - duty assessed at 55.1% on the
  //                               retail transaction value, no carrier
  //                               billback (the couriers on this line are
  //                               domestic last-mile and cannot bill anyone).
  //
  // REPRICED AGAIN 2026-09-08. Both figures were computed against US retail of
  // $89 / $99 / $129, which is NOT what the store charges. The `Puchica US USD`
  // price list (PriceList/22620078330) holds explicit fixed USD overrides on all
  // eight live variants at $49 / $62 / $85, read from the Admin API on
  // 2026-09-08 and confirmed against contextualPricing(country: US) on the same
  // day. They are deliberate entries rather than currency conversion - every
  // other row in that list is still denominated in CAD.
  //
  // Why the two readings disagree is NOT known. Either the 2026-09-02 reading
  // was wrong, or the prices were changed after it. The Admin API exposes no
  // price-list history, so this is recorded as an open discrepancy rather than
  // explained away. If $89 / $99 / $129 was the intended price list, the fix is
  // to change the prices, not these constants.
  //
  // The repricing matters most in the MIDDLE scenario. At $89 the supplier
  // prepaying duty on wholesale value (B) returned $30.30 / $30.44 / $38.07; at
  // the real prices it returns $2.62 / -$1.57 / $0.01. B is an ordinary thing
  // for AliExpress to do, so the cohort now has no margin at all in a scenario
  // that is neither the best nor the worst case.
  //
  // Both from scripts/us-duty-impact.mjs at $49 / $62 / $85 on the US price
  // list, and they now include the CA$6.99 flat US shipping the delivery
  // profile actually charges - about $4.99 collected on every US order, which
  // the model previously threw away by applying Canada's free-over-$50 rule to
  // the US zone.
  //
  // REPRICED 2026-09-03 from $89 / $99 / $129. Those were roughly double the
  // market - PU three-slot rolls cluster at $30-40, the well-reviewed winners
  // sit at or under $80, and the $89-129 band belongs to established brands.
  // The old prices made the billed case look survivable (-$3.21 on a 3-slot)
  // but only because nothing was selling. Holding a price nobody pays protects
  // no margin; it guarantees no orders. The rest of this note used to say that
  // no orders means the incidence question can never be settled, because the
  // DSers Tax&Fee reading only exists on a real order. Both halves were wrong:
  // Tax&Fee is a Tmall tax-and-service-fee field, so an order settles nothing,
  // and the question is answerable without one. See US_DUTY_INCIDENCE below.
  //
  // Costs are DSers, read 2026-09-03:
  // $26.18 (3 slot) / $31.67 (4 slot, worst of a $31.24-31.67 quote) /
  // $43.48 (6 slot). The earlier $30.52 and $43.64 came from the AliExpress
  // listing rather than from DSers, which is what we are actually charged.
  //
  // The duty rate moved 0.38 -> 0.551: HTS 4202.92.97 at 17.6% MFN, plus 25%
  // Section 301 List 3, plus the 12.5% forced-labour action effective
  // 2026-07-24. The 0.38 was inherited and never sourced.
  //
  // ON THE SALE PRICE: $26.18 shows as a Labor Day price "ending 2026-09-07"
  // against a $55.70 anchor. That end date is not worth planning around - the
  // Korea FTC penalised AliExpress affiliates in 2025 for anchors on 7,400+
  // listings the goods had never sold at, and AliExpress rolls Labor Day
  // straight into Super September. Treat $26.18 as the price and watch tariff
  // pass-through instead. Do re-read cost in DSers monthly.
  //
  // STOCK is thinner than Shopify believes: the listing showed 10 and 9 units
  // on the two 3-slot colours where Shopify holds 11 of each.
  //
  // CA is absent deliberately: the market is suspended and no Canadian route
  // has been quoted for these supplier variants.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:496#3 Slot Black Red',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 18.23,
    dutyBilledContributionUsd: -11.46,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:865#3 Slot Green Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 18.23,
    dutyBilledContributionUsd: -11.46,
  }),
  // 7 units. Thinnest variant in the cohort - watch for oversell.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:193#3 Slot Brown',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 18.23,
    dutyBilledContributionUsd: -11.46,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:173#6 Slot Brown',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 32.07,
    dutyBilledContributionUsd: -17.45,
  }),
  // 100 units. Deepest stock in the cohort.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:350686#6 Slot Green Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 32.07,
    dutyBilledContributionUsd: -17.45,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-3-or-6-watches',
    sku: '14:350850#6 Slot Black Red',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 32.07,
    dutyBilledContributionUsd: -17.45,
  }),
  // 4 units.
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-4-watches',
    sku: '14:173#4 Slot Black Gray',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 23.99,
    dutyBilledContributionUsd: -12.86,
  }),
  Object.freeze({
    handle: 'pu-leather-watch-roll-travel-case-4-watches',
    sku: '14:100013777#4 Slot Brown Black',
    markets: Object.freeze(['US']),
    fulfilment: FULFILMENT_ROUTES.CN_DIRECT,
    dutyPrepaidContributionUsd: 23.99,
    dutyBilledContributionUsd: -12.86,
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
  // ===========================================================================
  // 220 V HOLD, 2026-09-09. Seven offers that passed every commercial gate are
  // NOT approved below, and the reason is electrical rather than commercial.
  //
  // All seven map to one AliExpress listing, 1005009170603754 (US id
  // 3256808984289002, "Newest Bamboo Pendant Lamp ... Hand Knit Braiding",
  // seller Lux Aurumpue Lighting Store, brand ZODOLAMP). Its own specification
  // table, expanded and read on 2026-09-09, states:
  //
  //     Voltage        220 V
  //     Base Type      E27
  //     Power Source   AC
  //     Is Include PCBA  N
  //     Is Bulbs Included  No
  //     Certification  CCC,ce,CQC,EMC,FCC,GS,LVD,pse,ROHS,SAA,UL,VDE,EAC
  //
  // United States mains is 120 V. The supplier does not state 120 V or a range
  // that includes it. Compare the two offers that ARE approved below: listing
  // 1005007626643748 and listing 1005010458579497 both read "Voltage 90-260V"
  // in the same field, from the same kind of table - so on this supplier the
  // field distinguishes wide-range parts from 220 V ones rather than being
  // boilerplate everyone fills in identically.
  //
  // What is NOT established, and must not be assumed either way:
  //   - Whether the fixture is a passive lamp holder and cord, in which case
  //     120 V operation with a 120 V bulb would be unremarkable. "Is Include
  //     PCBA: N" is consistent with that but does not establish it.
  //   - Whether the UL entry in the certification list is a real UL listing for
  //     this fixture. That field is a multi-select naming thirteen schemes at
  //     once, including mutually regional ones, which is what a seller ticking
  //     every box looks like.
  //
  // These are hardwired ceiling fixtures. Shipping one into a 120 V market on
  // the strength of an inference about its internals is a decision with
  // liability attached, and it is not one the code should make quietly. So the
  // cohort is held here, intact, rather than deleted.
  //
  // TO RELEASE: get the supplier to confirm 110-120 V operation in writing, or
  // source the same shapes from a listing that states a range covering 120 V.
  // Then move SIX of these seven entries into APPROVED_CATALOG_OFFERS below and
  // drop the voltage line from each product's copy caveat. Cost, route, duty and
  // undercut evidence for all of them is on disk and current.
  //
  // SIX, NOT SEVEN. woven-bamboo-dome-pendant is blocked a second time, on
  // stock, and answering the voltage question does not unblock it. Every SKU on
  // this listing was clamp-tested on 2026-09-09 - select the variant, type 999
  // into the quantity box, read the ceiling the page settles on - and the
  // A-wood base SKU we mapped caps at ONE UNIT:
  //
  //     A-wood base   (dome)      $32.62      1   <- blocked
  //     C-black base  (lantern)   $36.48    264
  //     D-wood base   (column)    $37.10    256
  //     style G       (mini)      $21.65    273
  //     style K       (wave)      $54.58    270
  //     style H       (drum)      $56.82    273
  //     style E       (brim)      $46.64    263
  //
  // The clamp is the only per-SKU number worth trusting. The "Only N left"
  // banner reports a different variant on some pages, and DSers' My Products
  // Stock figure is the sum across every variant on the listing - it reads in
  // the thousands for listings whose US SKU caps in single digits.
  // ===========================================================================
export const VOLTAGE_HOLD_CATALOG_OFFERS = Object.freeze([
  Object.freeze({
    handle: 'woven-bamboo-lantern-pendant-26cm',
    sku: '200000531:1052#C-black base;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 54.64,
    dutyBilledContributionUsd: 9.31,
  }),
  Object.freeze({
    handle: 'woven-bamboo-column-pendant-37cm',
    sku: '200000531:29#D-wood base;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 54.02,
    dutyBilledContributionUsd: 8.69,
  }),
  Object.freeze({
    handle: 'woven-bamboo-mini-pendant-18cm',
    sku: '200000531:200002984#style G;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 69.47,
    dutyBilledContributionUsd: 24.14,
  }),
  Object.freeze({
    handle: 'woven-bamboo-wave-chandelier-35cm',
    sku: '200000531:200006154#style K;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 75.46,
    dutyBilledContributionUsd: 11.5,
  }),
  Object.freeze({
    handle: 'woven-bamboo-drum-chandelier-30cm',
    sku: '200000531:365016#style H;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 73.22,
    dutyBilledContributionUsd: 9.26,
  }),
  Object.freeze({
    handle: 'woven-bamboo-wide-brim-chandelier-30cm',
    sku: '200000531:366#style E;136:200006153#NO light bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 83.4,
    dutyBilledContributionUsd: 19.44,
  }),
]);

/**
 * TRANSIT HOLD - offers whose economics pass and whose PARCEL does not.
 *
 * Added 2026-09-10 for a failure mode nothing in the screen was looking at.
 * Freight COST and transit TIME are separate facts and they do not move
 * together. Every offer in this catalogue quotes $1.99 to the United States,
 * which read as one uniform cheap line. It is not one line.
 *
 * Read from the DSers Shipping info panel, ship-to United States, per SKU:
 *
 *   Style B-Black Base-No bulb (36cm saucer) AliExpress Selection Standard   8-14 days
 *   Style F-Wood Base-No bulb  (26cm dome)   AliExpress Selection Standard   8-14 days
 *   Style C-No bulb            (same seller) AliExpress Selection Standard   7-12 days
 *   Warm Light-30CM            (petal)       Selection Shipping_OVERSIZED   33-41 days
 *
 * All four cost $1.99. The petal is on a different line and takes roughly
 * four times as long. Corroborated independently by the listing page itself,
 * which quoted "Delivery: Oct 13 - 21" against a read date of 2026-09-10 -
 * 33 to 41 days, the same number from a different surface. The slatted
 * lantern and the sconce were checked on their listing pages and both read
 * "Delivery: Sep 17 - 23 (82.5% <= 12 days)", so they stay approved.
 *
 * WHY THIS IS A HOLD AND NOT A REPRICE. A US customer paying CA$144 for a
 * lamp and waiting five to six weeks is a refund, a dispute and a review, and
 * no margin covers that. The product page does not disclose it either. This is
 * the same class of defect as the wide-brim-hat mis-map: the page describes an
 * experience the supply chain does not deliver.
 *
 * Releasing it needs one of: a different SKU on this listing that sits on the
 * Standard line, a different supplier for the same shape, or a page that
 * states the real window and a price that survives stating it. Cost, voltage,
 * stock, imagery and rule 2 are all closed and recorded, so this is not a
 * re-audit.
 */
export const TRANSIT_HOLD_CATALOG_OFFERS = Object.freeze([
  Object.freeze({
    handle: 'woven-rattan-petal-pendant-30cm',
    sku: '200000531:175#30CM;136:200003939#Warm Light',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 51.41,
    dutyBilledContributionUsd: 6.14,
    transitHold: 'selection-shipping-oversized-33-41-days-observed-2026-09-10',
  }),
]);

export const APPROVED_CATALOG_OFFERS = Object.freeze([
  // Rattan/bamboo lighting cohort, approved 2026-09-09. Replaces the retired
  // watch-roll cohort in ARCHIVED_CATALOG_OFFERS.
  //
  // Every entry below is US-only and cn-direct, so each one falls through
  // isOfferSellable() to the per-offer duty test rather than passing on the
  // route. US_DUTY_INCIDENCE is UNVERIFIED, so the binding figure is
  // dutyPrepaidContributionUsd; all nine are positive. The billed figures are
  // recorded too and all nine are ALSO positive, so the cohort survives either
  // resolution of the incidence question - which is the difference between this
  // cohort and the watch rolls.
  //
  // Evidence per entry: supplier cost and per-SKU stock read from the AliExpress
  // SKU table (not the search card), DSers mapping confirmed against the exact
  // skuAttr below, and the retail priced against the Amazon page-1 median for the
  // category the product actually belongs to - chandeliers benchmarked as
  // chandeliers, not as pendants.
  //
  // Contribution figures are contribution() from scripts/us-duty-impact.mjs at
  // dutyRate 0.414 (HTS 9405.11.80 MFN 3.9% + Section 301 25% + forced-labour
  // 12.5%), supplierShip 1.99, carrier 0.
  // RE-MAPPED 2026-09-10 to fix a defect that was live: the product was mapped to
  // `30cm-M`, which on listing 3256807440328996 is a WIDE-BRIM HAT, 30 cm across
  // and 28 cm TALL on a wood base. Every photograph on the product page, and its
  // dimensions diagram, show the WAVE SAUCER - 36 x 13 cm on a black base. A
  // customer would have seen one lamp and received a different one.
  //
  // The copy gave the error away: it read "13 cm deep", which is the saucer's
  // depth, not the hat's 28 cm. The evidence file called it a "saucer pendant"
  // too. The intent was always the saucer; the SKU picked the wrong variant.
  //
  // The saucer is not sold at 30 cm. On the original listing it exists only as
  // 36cm-M and 36cm-H, at 2 units each. On 3256808453005175 the same 36 x 13 cm
  // black-base saucer is `Style B-Black Base` at $18.12 with 604 units, so the
  // re-map fixes the mis-ship AND halves the cost: $34.14 -> $18.12.
  //
  // Contribution moves 56.85 -> 72.87 prepaid and 11.58 -> 27.60 billed, which
  // takes this offer over the $12.00 floor on the billed basis for the first
  // time. Title and copy corrected to 36 cm in Shopify.
  //
  // NOTE the handle still reads `hand-woven-...`. That is a claim the brand
  // forbids and tests/product-copy.test.js exists to catch, sitting in the URL.
  // Left alone here because changing it needs a redirect and a catalogue edit;
  // flagged rather than fixed.
  Object.freeze({
    handle: 'hand-woven-bamboo-pendant-light',
    // RE-SOURCED 2026-09-11. The previous supplier path
    // `200000531:29#Style B-Black Base;5:361386#No bulb` on 3256808453005175
    // fell to THREE units (skuStock 3, page text "Only 3 left" - two
    // independent readings agreeing, and it read 602 earlier the same day).
    // No re-map existed on that listing: the only other 36cm saucer held 2
    // units and every deep-stock variant there is a SLATTED shape that cannot
    // carry this product's knitted copy or its dimensions.
    //
    // New supplier 3256803906943198. Style F - Wood Base, $23.49, 100 units,
    // 90-260V, E27, Wicker, hand knitted, CCC/ce/CQC/ROHS, 2-year warranty.
    // Freight $1.99, CAINIAO_FULFILLMENT_STD, shipFrom China, max 13 days.
    // NO `originalPrice` on any SKU on that listing - these are standing
    // prices, not a promotion - and NO `Max. N pcs/shopper` cap. Both of those
    // are the free kills that rejected every other candidate screened today.
    //
    // SHAPE CONFIRMED FROM THE SWATCH ARTWORK, NOT THE VARIANT NAME, and that
    // check earned its keep: this listing ALSO has a "Style B", and on the old
    // supplier Style B IS the saucer. Here Style B is a tall tapered vessel and
    // Style F is the saucer. The names are REVERSED between the two listings.
    // Mapping by name would have shipped a different lamp - the same defect as
    // the 2026-09-10 wide-brim-hat mis-ship. Style F's swatch carries its own
    // dimension drawing: 36cm wide x 13cm tall, 120cm adjustable cord, which
    // matches the live product exactly.
    //
    // THE ONE CHANGE A CUSTOMER SEES: the ceiling cap is WOOD, not black. The
    // black-cap version of the identical shape is on the same listing at $16.53
    // with ONE unit, so it is not usable. Daniel approved the switch 2026-09-11.
    // The copy never stated a cap colour, so no copy change was needed for it.
    //
    // Cost rises $18.12 -> $23.49, so contribution falls 76.62/29.63 ->
    // 71.25/24.26 at the live $107.00. Still incidence-immune with room, and
    // $23.49 clears the $29.04 rule-23 buffered pendant ceiling by $5.55.
    sku: '200000531:200004889#Style F - Wood Base;200007763:201336100;5:100014064#Ship with 24h',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 71.25,
    dutyBilledContributionUsd: 24.26,
  }),
  Object.freeze({
    handle: 'plug-in-bamboo-sconce-swing-arm',
    sku: '200000795:175#US PLUG-DIM switch;249:200006305#no light',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 43.15,
    dutyBilledContributionUsd: 9.41,
  }),
  // Released from VOLTAGE_HOLD_CATALOG_OFFERS on 2026-09-10 by RE-SOURCING it,
  // not by answering the voltage question. The hold note above was right on both
  // counts and neither was fixable on the old listing: 3256808984289002 reads
  // 220 V, and the A-wood base SKU we had mapped capped at ONE unit.
  //
  // The same dome is sold on 3256808453005175 (ZODOLAMP, 500+ sold, 4.7), which
  // reads 90-260V and carries 586 units on the SKU below. Shipping $1.99. The
  // DSers stable cost for US equals the listing price at both ends of the range
  // ($14.82 / $37.23), so there is no promo gap on this listing.
  //
  // Confirmed the SAME PHYSICAL SHADE across the two listings from the swatch
  // artwork, not from the value id. Both listings happen to use 365458 for the
  // dome, but that is luck - 366 is a wide-brim hat on one and a flared bell on
  // the other, and 365016 is a drum vs a cone. AliExpress reuses property value
  // ids across listings and they do NOT denote the same object.
  //
  // Retail CA$139 = US$99.29 at the 1.40 planning rate, set against the Amazon
  // `rattan pendant light` page-1 median of $99.99 (max reviews 921).
  //
  // NOTE THE BILLED FIGURE. At $13.72 this is the FIRST offer in the catalogue
  // to clear the $12.00 undercut floor on the billed basis as well as the
  // prepaid one. The two entries above do not ($11.58 and $7.96), so they still
  // depend on US_DUTY_INCIDENCE resolving to prepaid. This one does not.
  //
  // The previous figures on the held entry (58.5 / 13.17) were modelled at the
  // old supplier cost and are superseded.
  Object.freeze({
    handle: 'woven-bamboo-dome-pendant',
    sku: '200000531:365458#Style F-Wood Base;5:361386#No bulb',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 60.88,
    dutyBilledContributionUsd: 15.55,
  }),
  // Added 2026-09-10. Slatted vertical lantern - bamboo strips bound over rings
  // rather than woven - from listing 3256804155598662. 90-260V, E27, $1.99
  // shipping. The 20x23cm variant carries 5,771 units at $13.38.
  //
  // Found by rule 19: at a $34.01 max supplier cost for this category, a $13.38
  // item leaves unusual headroom, and it shows - $62.17 prepaid and $24.29
  // billed at CA$119, the widest margin in the catalogue on both bases.
  //
  // Priced BELOW the other two pendants deliberately. At 20 x 23 cm this is the
  // small one, and the catalogue now reads as a ladder: $100 sconce, $119
  // lantern, $139 dome, $144 saucer.
  //
  // CAUTION, and it is the one weak spot: the listing has **77 sold** against
  // 500-1,000+ behind the other offers. Per-SKU depth is what carried it.
  Object.freeze({
    handle: 'slatted-bamboo-lantern-pendant-20cm',
    sku: '200000531:350852#20x23cm',
    markets: Object.freeze(['US']),
    dutyPrepaidContributionUsd: 64.92,
    dutyBilledContributionUsd: 25.80,
  }),
  // Added 2026-09-10, from listing 3256812550446681 (LINCCW, 1,000+ sold,
  // 90-260V, $1.99 shipping). Woven rattan petal shade, the most sculptural
  // piece in the range, and the ONLY offer that ships with a bulb - light
  // colour is a variant axis and Warm Light is the SKU sold.
  //
  // Rule 18 passes despite 28 SKUs: they are one shape x 4 sizes x 4 light
  // colours, not 28 shapes. The distinction that matters is DISTINCT SHAPES on
  // the variant axis, never SKU count.
  //
  // ADMITTED BY A CORRECTION, and it is worth recording why. This was first
  // rejected on a self-imposed "billed >= $12" filter. That is stricter than
  // this repo actually requires: isOfferSellable() gates on billed > 0, and the
  // $12.00 undercut floor applies to the BINDING basis, which is prepaid while
  // US_DUTY_INCIDENCE is unverified. The live sconce at $7.96 billed is already
  // approved on exactly that reading. Applying the stricter rule silently
  // rejected products the catalogue's own gates would admit.
  //
  // THE EXPOSURE IS REAL THOUGH. At $6.14 billed this is the second-thinnest
  // offer after the sconce. If the incidence resolves to billed, this one and
  // the sconce fall under the floor; the saucer ($27.60), slatted lantern
  // ($24.29) and dome ($13.72) do not.
  //
  // REMOVED 2026-09-10 and moved to TRANSIT_HOLD_CATALOG_OFFERS below. Rule 2
  // closed clean on it - the DSers stable cost for the United States reads
  // $39.59, identical to the listing page, so there was no promo gap. It came
  // off the catalogue for a different reason, found in the same sitting: its
  // carrier line is AliExpress Selection Shipping_Oversized at 33-41 days.
]);
/**
 * True when nothing is approved for sale anywhere.
 *
 * Used to suppress discovery affordances that would otherwise send a shopper
 * to a guaranteed dead end. On 2026-09-08 the search page and the search
 * drawer both rendered "Shop by need" chips reading `watch roll`,
 * `3 slot watch case`, `6 slot watch case` - the retired cohort. Clicking one
 * returned zero products and re-rendered the same three chips, so the only
 * content on the page was a link back to itself.
 *
 * Deliberately derived from the catalogue rather than from
 * STOREFRONT_CONTAINMENT_ACTIVE, which is `false`: containment is not on, the
 * store is simply empty, and those are different states.
 */
export const CATALOG_IS_EMPTY = APPROVED_CATALOG_OFFERS.length === 0;

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

/**
 * WHO ACTUALLY PAYS THE US IMPORT DUTY ON A CN-DIRECT PARCEL.
 *
 * This is the largest single unknown in the whole model - about $52 an order
 * on a 3-slot at $89 - and it is deliberately recorded as a state rather than
 * assumed, because assuming it either way has already gone wrong once.
 *
 *   'prepaid'    The duty is inside the price we pay AliExpress. Nothing
 *                further is owed by us or by the customer, and the margin is
 *                an ordinary dropship margin.
 *   'billed'     The duty lands on top - on us, or on the customer at the
 *                door. Every offer in this cohort is loss-making and the
 *                cohort has to be pulled or re-sourced.
 *   'unverified' We do not know.
 *
 * WHY 'unverified' STILL ALLOWS SELLING. Since 2026-07-24 the postal
 * informal-entry process requires a bonded filer remitting to CBP in arrears
 * through Pay.gov, and that process has no recipient-billing mechanism at all.
 * On a consolidated Selection / Choice line there is literally nobody to hand
 * the customer a bill, so the duty must be funded upstream - which points hard
 * at 'prepaid'. That is an inference from the regulations, not a reading, so
 * it does not get to be recorded as fact.
 *
 * CORRECTION 2026-09-10 - THE PLAN TO SETTLE THIS WAS BUILT ON A FIELD THAT
 * MEASURES SOMETHING ELSE. This block used to say that the first genuine US
 * order settles the question at zero risk, because DSers shows a "Tax&Fee"
 * line before payment is taken: $0.00 meaning 'prepaid', anything else
 * meaning 'billed'. The field's own tooltip says otherwise -
 *
 *     "Tax&Fee is showing estimated tax amount or service fee generated when
 *      getting service from Tmall suppliers."
 *
 * - so it is Tmall tax and service fees. Every supplier here is an AliExpress
 * marketplace seller. The line would have read $0.00 regardless of what the
 * duty did, and the old instruction was to read $0.00 as 'prepaid'. That is a
 * false confirmation of the profitable scenario, arrived at by spending money.
 * The DSers "Tax/Import charges" preview column reads $0.00 for the same
 * reason. Neither field is evidence about duty in either direction.
 *
 * WHAT ALIEXPRESS PUBLISHES, read 2026-09-10 from its Help Center article
 * "Do I need to pay for customs duties and import taxes?" (questionId
 * 1061036456): duties "are typically not included in the price of the item",
 * "Customs duties and taxes are never covered by AliExpress", and they are
 * "normally collected by the shipping company upon delivery" - with the one
 * exception of a seller shipping from a warehouse in the buyer's own country.
 * The US-specific article "Tax Policy on United States" (1061037206) covers
 * state sales tax and the Colorado Retail Delivery Fee only, and is silent on
 * import duty.
 *
 * That is a statement of LIABILITY, not of INCIDENCE, and it does not settle
 * this constant. It rules out "AliExpress absorbs it on our behalf". It does
 * not rule out "it is already inside the quoted price", because the carriers
 * on this line are last-mile only and have no mechanism to present a bill -
 * the regulatory point above still stands. What it does change is the shape of
 * the downside: on AliExpress's own account the collector is the courier at
 * the door, so a wrong guess lands on the CUSTOMER, as a refund and a review,
 * not merely on our margin.
 *
 * HOW IT ACTUALLY GETS SETTLED, without buying anything. The AliExpress
 * order-confirmation page for a US shipping address, signed in, shows the full
 * order summary before payment is authorised. An "Import charges" line there,
 * or its absence, is the reading. This needs Daniel's login and nothing else;
 * Claude does not sign in to accounts.
 *
 * BETTER: MAKE THE ANSWER STOP MATTERING. An offer priced so that BOTH
 * dutyPrepaidContributionUsd AND dutyBilledContributionUsd clear the $12.00
 * undercut floor is approvable under either resolution, and does not care what
 * this constant ever becomes. Measured 2026-09-10 across the five live offers:
 *
 *   woven-bamboo-pendant-light-36cm     prepaid $72.87  billed $27.60   immune
 *   woven-bamboo-dome-pendant-26cm      prepaid $57.51  billed $13.72   immune
 *   slatted-bamboo-lantern-pendant-20cm prepaid $62.17  billed $24.29   immune
 *   plug-in-bamboo-sconce-swing-arm     prepaid $40.52  billed  $7.96   exposed
 *
 * UPDATED later the same day. The petal (prepaid $51.41 / billed $6.14) was
 * the second exposed offer and is no longer approved - it went to
 * TRANSIT_HOLD_CATALOG_OFFERS on a 33-41 day carrier line. So the catalogue's
 * entire exposure to this constant is now ONE product, the sconce.
 *
 * The sconce cannot be repriced into immunity: it would need US$81.09 against
 * a rule-2 ceiling of $72.43, and it already sits at the ceiling. The only
 * route is supplier cost - $4.04 off it, $23.91 -> $19.87. That is the whole
 * remaining dependency on how the duty question resolves.
 */
export const US_DUTY_INCIDENCE_STATES = Object.freeze({
  PREPAID: 'prepaid',
  BILLED: 'billed',
  UNVERIFIED: 'unverified',
});

export const US_DUTY_INCIDENCE = US_DUTY_INCIDENCE_STATES.UNVERIFIED;

/**
 * The $12.00 undercut floor, mirrored from scripts/check-undercut.mjs, which
 * cannot be imported here without a cycle. If that number moves, move this one
 * and the test in tests/launch-catalog.test.js will say so.
 */
export const INCIDENCE_IMMUNITY_FLOOR_USD = 12.0;

/**
 * An offer is INCIDENCE-IMMUNE when it clears the undercut floor on both duty
 * bases at once, so its approval does not depend on how US_DUTY_INCIDENCE ever
 * resolves. This is the cheap way out of the largest unknown in the model: not
 * answering it, but pricing and sourcing so the answer cannot change anything.
 *
 * Use it to read the catalogue's real exposure. Every offer this returns false
 * for is an offer that stops being sellable the day the reading comes back
 * 'billed', and those are the ones to reprice or re-source first.
 */
export function isIncidenceImmune(offer, floor = INCIDENCE_IMMUNITY_FLOOR_USD) {
  const prepaid = Number(offer?.dutyPrepaidContributionUsd);
  const billed = Number(offer?.dutyBilledContributionUsd);
  if (!Number.isFinite(prepaid) || !Number.isFinite(billed)) return false;
  return prepaid >= floor && billed >= floor;
}

/**
 * Approved offers split by whether they care about US_DUTY_INCIDENCE.
 */
export function incidenceExposure(offers = APPROVED_CATALOG_OFFERS) {
  const immune = [];
  const exposed = [];
  for (const offer of offers) {
    (isIncidenceImmune(offer) ? immune : exposed).push(offer);
  }
  return {immune, exposed};
}

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
  // US reopened 2026-09-09. The line that stood here said to delete it "the
  // moment a real offer lands in APPROVED_CATALOG_OFFERS" - nine have. The
  // route facts are unchanged and still live in SUSPENDED_FULFILMENT_ROUTES:
  // cn-direct into the US remains suspended there, so every offer above still
  // has to clear the per-offer duty test on its own contribution.
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
 * the route AT A PRICE POINT, and about who ends up paying the duty.
 *
 * Which of the two per-offer figures binds is decided by US_DUTY_INCIDENCE:
 *
 *   'prepaid'     dutyPrepaidContributionUsd must be above zero.
 *   'billed'      dutyBilledContributionUsd must be above zero. Nothing in
 *                 the current cohort clears this, which is the point - if the
 *                 reading comes back 'billed', the catalogue empties by
 *                 itself and the storefront stops selling a loss.
 *   'unverified'  the prepaid figure binds, and the per-order Tax&Fee check
 *                 in DSers is what stands between that and paying a supplier.
 *
 * Both figures must come from scripts/us-duty-impact.mjs, not from optimism,
 * and an offer that omits the one currently binding stays closed.
 */
export function isOfferSellable(offer, market, {suspendedMarkets} = {}) {
  // `suspendedMarkets` exists for the gate-logic tests and nothing else.
  // Market suspension short-circuits this function, so once every market is
  // suspended - which is the honest state whenever the catalogue is empty -
  // every route and duty assertion underneath collapses to `false` and the
  // rail silently stops being tested. Injecting an empty table lets a test
  // exercise the route and duty arithmetic on its own terms. Production never
  // passes it, so behaviour is unchanged.
  const suspensionTable = suspendedMarkets ?? SUSPENDED_COMMERCE_MARKETS;
  const marketSuspended = Object.prototype.hasOwnProperty.call(
    suspensionTable,
    String(market || '').toUpperCase(),
  );
  if (!offer || marketSuspended) return false;
  if (!offer.markets.includes(market)) return false;
  if (!isFulfilmentRouteSuspended(market, fulfilmentRouteFor(offer))) {
    return true;
  }
  const binding =
    US_DUTY_INCIDENCE === US_DUTY_INCIDENCE_STATES.BILLED
      ? offer.dutyBilledContributionUsd
      : offer.dutyPrepaidContributionUsd;
  return Number(binding) > 0;
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
