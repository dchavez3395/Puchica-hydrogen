# Launch measurement and product-readiness audit — 2026-08-01

## Decision

- **Storefront / organic traffic:** ready for continued review and ordinary
  organic visits.
- **Paid advertising:** **HOLD.** No spend is authorized by this audit.
- **First offer to prove:** the exact **Red 5-Piece Compression Packing Cube
  Set / `5PCS Set Red`**.
- **Next product to quote:** the **White Small Wheeled Under-Sink Organizer
  Bin / `white S`**, but its last observed Shopify inventory was only 26.

The packing-cube route is the only product in the seven-product storefront
catalog with recorded item cost, supplier shipping, landed-cost math, and a
provisional margin screen. It is not yet a proven fulfillment or attribution
path. The other six products are merchandising candidates, not paid-traffic
candidates.

## Evidence boundary

This audit uses repository and local-storefront evidence only:

- `app/components/GoogleAnalytics4.jsx`
- `app/components/MetaPixel.jsx`
- `app/lib/analytics-items.js`
- `app/components/CartSummary.jsx`
- `app/root.jsx`
- `app/entry.server.jsx`
- `docs/us-organization-candidate-control-2026-08-01.csv`
- `docs/dsers-two-zip-quote-evidence-2026-08-01.csv`
- `docs/us-packing-cubes-limited-test-evidence-2026-08-01.json`
- `outputs/dsers-evidence-2026-08-01/puchica-packing-cubes-dsers-evidence.xlsx`
- local HTTP reads of `/collections/all` and the exact packing-cube campaign
  route in the U.S. market context.

No ad platform, supplier, Shopify Admin, purchase, order, or external write was
performed for this audit.

## Measurement truth

| Layer | Status | Evidence | Remaining gate |
| --- | --- | --- | --- |
| Local identifiers | Implemented | Both local environment values are present and match the expected GA4 and numeric Meta formats. | Do not print or commit secrets/identifiers from `.env`. |
| Production identifiers | Recorded as present | The no-spend production review records the production Meta Pixel and GA4 IDs. | Reconfirm in the production runtime after the next deployment. |
| Page view | Implemented | Hydrogen `page_viewed` maps to Meta `PageView` and GA4 `page_view`. | Observe once in each production debugger after consent. |
| Product view | Implemented | Hydrogen `product_viewed` maps to Meta `ViewContent` and GA4 `view_item`; both prefer the selected Shopify variant ID. | Verify exact variant ID, value, and USD currency in production. |
| Add to cart | Implemented | Hydrogen `product_added_to_cart` maps to Meta `AddToCart` and GA4 `add_to_cart`; value is unit price × newly added quantity. | Verify one event per successful add and no event for a rejected/ghost add. |
| Checkout start | Implemented | The checkout link publishes `custom_checkout_started`; Meta and GA4 subscribe and include cart value, currency, quantity, and variant-level items. | Verify exactly once when the checkout link is used. |
| Purchase | **Not proven** | The storefront intentionally does not emit Purchase. Shopify-hosted checkout is expected to own it. | Complete one genuine order and verify one Meta Purchase and one GA4 purchase with correct order ID, value, and currency. |
| Consent | Implemented | Both integrations call Hydrogen `canTrack()` before loading/sending. | Verify opt-in/opt-out behavior for every active market. |
| Meta deduplication / CAPI | **Not proven** | The storefront events do not carry an explicit shared `event_id`; no local artifact proves a paired server event. | Document the production CAPI owner and verify browser/server deduplication before scale. |
| Domain and UTM continuity | **Not proven** | CSP permits the required analytics hosts, but no local artifact proves Meta domain verification or UTM persistence through Shopify checkout. | Verify domain status and campaign attribution through checkout. |

Configured code is not event proof. The minimum no-spend production sequence is
`PageView → ViewContent → AddToCart → InitiateCheckout`. Purchase proof requires
a genuine Shopify-hosted order; a manual reporting fallback, if accepted for a
very small learning test, must be explicitly documented and cannot support
scaling.

## Seven-product readiness matrix

Current local U.S. storefront prices are the displayed/default catalog prices.
The exact red packing-cube campaign route and Shopify cart currently show
**US$52.00** for the selected `5PCS Set Red` option. The evidence and unit
economics below use that checkout-verified price.

| Rank | Product / exact option | Current local price | Last recorded Shopify inventory | Supplier and margin evidence | Decision |
| ---: | --- | ---: | ---: | --- | --- |
| 1 | Red 5-Piece Compression Packing Cube Set / `5PCS Set Red` | US$52 exact campaign option | 989 | Exact DSers SKU recorded. Item US$20.39 + shipping US$1.99 = US$22.38 provisional landed supply. Pre-ad contribution US$25.21 / 48.5% using the documented fee and reserve assumptions. Country-level U.S. route only; tracking, fresh address ETA, ZIP quotes, sample and Purchase remain unproven. | **GO_LIMITED_TEST readiness only; paid HOLD until the remaining checklist and explicit budget approval pass.** |
| 2 | Wheeled Under-Sink Organizer Bin / `white S` | US$22 | 26 | DSers owner, mapped SKU and U.S.-route tag recorded. No item cost, supplier shipping, tracked ETA, ZIP quote or contribution calculation. Dimensions and wheel function need physical validation. | **Next quote candidate; no paid traffic.** Stock is one unit above the 25-unit gate and must be refreshed first. |
| 3 | Travel Cable Organizer Pouch / `Gray` | US$30 | 9,916 | Strongest recorded inventory among supporting products; mapped SKU and U.S.-route tag recorded. No landed cost, tracking, ETA or margin evidence. Compartment dimensions and zipper quality are unverified. | **Potential backup/cross-sell after quote and sample; no paid traffic.** |
| 4 | 8-Piece Travel Packing Organizer Set / `8PCS Gray` | US$33 | 95 | Mapped SKU and U.S.-route tag recorded. No landed cost, tracking, ETA or margin evidence. Exact eight-piece contents and dimensions need verification. | **Travel supporting offer only; no paid traffic.** |
| 5 | Stainless Steel Tube Squeezer / `Silver` | US$19 | 404 | Mapped SKU and U.S.-route tag recorded. No landed cost or margin evidence. Edge finish, rust behavior and compatible tube width are unverified. | **Low-AOV add-on; do not use as first acquisition offer.** |
| 6 | Five-Slot Cable Organizer Strip / `5 Holes-White` | US$19 | 489 | Mapped SKU and U.S.-route tag recorded. No landed cost or margin evidence. Adhesive retention, residue, surface compatibility and heat-proximity limits are unverified. | **Add-on only; no performance claims or paid traffic.** |
| 7 | Double-Layer Cable Organizer Case / `Double Layers 1` | US$22 | 65 | Mapped SKU and U.S.-route tag recorded. No landed cost or margin evidence. Source-style option naming and physical layout/zipper quality remain unverified. | **Hold as a paid candidate; cleanup and proof required.** |

`us-route-verified` is not a landed-cost approval. For six products it records
only that a route check existed; the candidate CSV still has supplier, quote,
delivery, tracking, cost and contribution fields blank.

## Candidate recommendation

### 1. Prove the red five-piece packing cubes

It leads because it combines the clearest visual problem/solution, the highest
documented acquisition room, exact variant mapping, a dedicated offer page,
and existing exact-product creative. Its provisional economics pass the 30%
pre-ad contribution gate. Its remaining blockers are operational and
measurement proof, not offer-page design.

Required before any activation review:

1. Refresh the exact supplier option, stock, US$20.39 item cost, US$1.99 route,
   service, ETA, and storefront US$53 price.
2. Verify `PageView`, `ViewContent`, `AddToCart`, and `InitiateCheckout` once in
   production with the exact variant ID, value, and USD currency.
3. Obtain legitimate address-level delivery evidence or explicitly retain the
   narrowly capped first-order-monitoring exception.
4. Approve and inspect one genuine order; confirm DSers processing, tracking,
   delivery, five-piece count, color, dimensions, zippers, seams and condition.
5. Confirm exactly one Meta Purchase and one GA4 purchase with correct value,
   currency and order ID.
6. Recalculate actual contribution. Any margin below 30%, missing/duplicate
   Purchase, fulfillment delay, missing tracking, product mismatch or defect is
   a hard stop.

### 2. Quote the wheeled under-sink bin next

This is the best next evidence target because it has a clear home-reset use
case and stronger before/after creative potential than the small cable add-ons.
It cannot replace the cubes yet: the recorded inventory of 26 is fragile and
there is no cost, tracking, ETA or margin evidence.

### 3. Keep the cable pouch as the first cross-sell candidate

Its recorded inventory is strong and it complements travel organization, but
it needs a complete quote and physical-quality check before it can support a
bundle or cart add-on.

## Prioritized blockers

1. **Purchase attribution is unverified.** This is the largest measurement
   blocker and cannot be closed by code review alone.
2. **The first fulfillment cycle is unproven.** No genuine U.S. Shopify → DSers
   → supplier → tracking → delivery chain has passed for the cube SKU.
3. **Supplier evidence is incomplete.** The cube quote is country-level; both
   representative ZIP rows are blank and tracking is not evidenced.
4. **Six products have no landed-cost economics.** They must not inherit the
   cube product's margin assumptions.
5. **Product quality is unverified.** The exact cube piece count, zippers,
   seams, dimensions and color still require delivered-product evidence.
6. **Meta CAPI/deduplication, domain verification and UTM continuity are not
   proven.** These are scale blockers even if browser events appear.
7. **Under-sink inventory is fragile.** Recheck supplier and Shopify stock
   before spending time on its quote or creative.

## Automated guardrail added in this audit

`scripts/check-launch-readiness.mjs` now fails closed if either analytics
integration loses a required storefront subscription, variant-level product
view ID, variant-level checkout items, root mounting, campaign/PDP ProductView,
or selected variant ID. This protects the pre-checkout event contract from
future refactors. It does not claim that production events fired.
