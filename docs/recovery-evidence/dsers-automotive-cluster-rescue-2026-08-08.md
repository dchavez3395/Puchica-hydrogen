# DSers automotive cluster rescue — 2026-08-08

## Hard decision

**Cluster decision: NO-GO for launch/ads.** None of the five current automotive products has a fully reconciled exact variant, candidate stock, and Canada + U.S. route with confirmed tracking. The DSers Supplier Optimizer results below are visual-image matches, not proof that the candidate option is the advertised branded/configured product.

The most important failure is structural: Supplier Optimizer exposes supplier item IDs, visible sales, cost ranges, shipping method/cost, ETA and store ratings, but it does **not** expose the selected option or stock in its comparison rows. The mapped Essager product's `Check Product Detail` dialog reported `Variants(0)` and `Images(0)`, despite the card showing an aggregate cost/stock. Exact mapping therefore cannot be proven from this UI surface.

No remapping, import, catalog change, supplier selection or order was performed.

### Interpretation rules

- Supplier URLs are reconstructed from the exact AliExpress item ID returned in DSers' row key.
- `Sale` is the visible DSers Supplier Optimizer sale count, not independently verified lifetime orders.
- Four numeric ratings are reported in DSers' order: reliability / response / delivery / rating.
- `AliExpress Selection Standard` and `YunExpress Standard Shipping` are route labels. **Tracking is unverified** because the comparison table has no tracking field.
- Candidate stock and exact option are **unverified** because the comparison rows do not expose them.
- Rough Canadian margin uses the recovery program's dated planning FX, `US$1 = CA$1.3943`, the displayed Canadian storefront price, and the candidate's minimum item cost plus displayed Canada shipping. It excludes payment fees, refunds, taxes, duties and ad spend, so it is an optimistic ceiling.

## Current mapped-card state

| Product | Shopify / DSers mapping ID | DSers card cost | CA storefront price | Aggregate stock | Card-cost gross-margin range | Current-map decision |
|---|---|---:|---:|---:|---:|---|
| Tesla Magnetic Phone Holder | `9351428374778` / `2085218901899149312` | US$16.37–34.46; CA$22.84–48.07 | CA$74.85 | 3,993 | 69.5% to 35.8% | **HOLD** — exact option/supplier and routes not exposed; visual alternatives have zero sales |
| Essager Magnetic Wireless Car Charger | `9351434240250` / `2085218824753315840` | US$12.44–15.32; CA$17.35–21.37 | CA$66.69 | 9,999 | 74.0% to 68.0% | **HOLD** — strongest economics, but `Variants(0)` and no exact plug/option/stock reconciliation |
| Generic 4K Dash Cam | `9351433978106` / `2085218876695642112` | US$45.90–78.51; CA$64.03–109.53 | CA$110.32 | 39,344 | 42.0% to 0.7% | **REJECT** — top-end variant is effectively break-even before fees; exact 4K/GPS/bundle unverified |
| 70mai M310 Plus | `9351428276474` / `2085218909516333056` | US$38.99–93.59; CA$54.39–130.56 | CA$76.10 | 4,756 | 28.5% to **−71.6%** | **REJECT** — mapped range includes guaranteed-loss variants |
| KAWA MINI 3 | `9351434371322` / `2085218816331218944` | US$47.63–146.93; CA$66.45–204.97 | CA$110.32 | 185 | 39.8% to **−85.8%** | **REJECT** — low aggregate stock and mapped range includes severe-loss variants |

Card cost may or may not include route cost; DSers does not state that in this surface. The gross-margin range therefore must not be used as approved unit economics.

## Top three visible-sales alternatives

Every candidate below is **HOLD/REJECT**, not approved, because exact option and stock are absent.

### Tesla phone holder

DSers returned only Alibaba image matches. All eight matches showed `Sale 0` and no ratings; the first three rows are shown because there is no meaningful sales ranking.

| Supplier item | CA route | U.S. route | Visible sales / ratings | Optimistic CA margin | Decision |
|---|---|---|---|---:|---|
| Alibaba `1601612080933` | US$1.99 + Premium US$6.83, 8 days | US$1.99 + Standard US$7.00, 8 days | 0 / no ratings | 83.6% | **REJECT** — zero-sales image match; SKU/option, MOQ, stock and tracking unknown |
| Alibaba `1601251704417` | US$2.19–3.09 + Premium US$6.83, 8 days | US$2.19–3.09 + Standard US$7.00, 8 days | 0 / no ratings | 83.2% | **REJECT** — same hard gaps |
| Alibaba `1601399528962` | US$2.20 + Standard US$4.70, 7 days | US$2.20 + Standard US$5.12, 8 days | 0 / no ratings | 87.1% | **REJECT** — same hard gaps |

### Essager magnetic wireless charger

| Supplier item | CA route | U.S. route | Visible sales / ratings | Optimistic CA margin | Decision |
|---|---|---|---|---:|---|
| [AliExpress `1005006973804847`](https://www.aliexpress.com/item/1005006973804847.html) | US$10.18–14.43 + Selection Standard US$0, 8 days | +US$1.99, 6 days | 214 / 4.8, 4.9, 4.9, 4.7 | 78.7% | **HOLD** — best screen, but exact Essager option, mounting kit, cable/plug, stock and tracking unverified |
| [AliExpress `1005006974799298`](https://www.aliexpress.com/item/1005006974799298.html) | US$11.37–17.89 + US$2.16, 8 days | +US$1.99, 6 days | 97 / 4.8, 4.9, 4.9, 4.8 | 71.7% | **HOLD** — same variant/stock/configuration gaps |
| [AliExpress `1005006974076067`](https://www.aliexpress.com/item/1005006974076067.html) | US$14.10–21.35 + US$2.16, 8 days | +US$1.99, 6 days | 18 / 4.8, 4.9, 4.9, 4.9 | 66.0% | **REJECT** — low visible sales plus same hard gaps |

### Generic 4K dashcam

| Supplier item | CA route | U.S. route | Visible sales / ratings | Optimistic CA margin | Decision |
|---|---|---|---|---:|---|
| [AliExpress `1005007462897497`](https://www.aliexpress.com/item/1005007462897497.html) | US$51.39–95.60 + Selection Standard US$0, 8 days | +US$1.99, 6 days | 102 / 4.4, 4.6, 4.7, 4.6 | 35.1% | **REJECT** — weak reliability rating; exact 4K/GPS/parking kit/plug/stock unverified |
| [AliExpress `1005006859918901`](https://www.aliexpress.com/item/1005006859918901.html) | US$42.66–91.80 + Selection Standard US$0, 8 days | YunExpress US$0, 7 days | 94 / 4.6, 4.7, 4.7, 4.7 | 46.1% | **HOLD** — best economics, but exact advertised specification and stock unverified |
| [AliExpress `1005012166515692`](https://www.aliexpress.com/item/1005012166515692.html) | US$51.84–94.44 + Selection Standard US$0, 8 days | +US$1.99, 7 days | 59 / 4.4, 4.5, 4.6, 4.5 | 34.5% | **REJECT** — low sales/ratings and configuration ambiguity |

### 70mai M310 Plus

| Supplier item | CA route | U.S. route | Visible sales / ratings | Optimistic CA margin | Decision |
|---|---|---|---|---:|---|
| [AliExpress `1005007522941114`](https://www.aliexpress.com/item/1005007522941114.html) | US$82.79–386.39 + Selection Standard US$0, 9 days | +US$0, 10 days | 481 / all 4.8 | **−51.7%** | **REJECT** — even the minimum price exceeds the CA sale price after FX |
| [AliExpress `1005002702009187`](https://www.aliexpress.com/item/1005002702009187.html) | US$34.99–119.99 + Selection Standard US$0, 9 days | +US$0, 10 days | 451 / all 4.8 | 35.9% | **HOLD** — exact M310 Plus bundle/option and stock unverified; range can lose money |
| [AliExpress `32896648775`](https://www.aliexpress.com/item/32896648775.html) | US$38.99–99.83 + Selection Standard US$0, 9 days | +US$0, 10 days | 424 / 4.9, 4.8, 4.8, 4.9 | 28.6% | **REJECT** — thin optimistic margin and broad variant range; exact model/option unverified |

### KAWA MINI 3

| Supplier item | CA route | U.S. route | Visible sales / ratings | Optimistic CA margin | Decision |
|---|---|---|---|---:|---|
| [AliExpress `1005012182960276`](https://www.aliexpress.com/item/1005012182960276.html) | US$65.90 + Selection Standard US$0, 8 days | +US$1.99, 6 days | 465 / all 4.8 | 16.7% | **REJECT** — margin too thin before fees/returns/ads; exact KAWA configuration/stock unverified |
| [AliExpress `1005008825660425`](https://www.aliexpress.com/item/1005008825660425.html) | US$53.83–59.28 + Selection Standard US$0, 8 days | +US$1.99, 6 days | 190 / all 4.8 | 32.0% | **HOLD** — exact MINI 3 version, voice-control region/firmware and stock unverified |
| [AliExpress `1005010759753412`](https://www.aliexpress.com/item/1005010759753412.html) | US$16.39–24.71 + Selection Standard US$0, 8 days | +US$1.99, 7 days | 167 / 4.4, 4.5, 4.6, 4.4 | 79.3% | **REJECT** — price/ratings strongly suggest a mismatched visual result, not verified KAWA MINI 3 |

## What would be required to reverse NO-GO

Only the following exact-item checks could promote a product:

1. Open the exact supplier listing and select the precise advertised model/bundle, colour, plug/cable, memory-card configuration and vehicle mounting kit.
2. Record ordinary (not welcome/coupon) price and variant-level stock.
3. Confirm tracked Canada and U.S. shipping for that exact option and identify ship-from country/warehouse.
4. Ensure the maximum sellable variant remains profitable after shipping, payment fees, refund allowance and ad acquisition cost.
5. For branded items (Essager, 70mai, KAWA), retain supplier authorization/authenticity evidence and reconcile all warranty/app/firmware claims.

Until then, these products may remain internal research inventory but should not be featured, advertised, or treated as launch-approved.
