# Exact-detail rescue — current milk frother and desk lamp

**Evidence date:** 2026-08-08
**Scope:** current Shopify products; exact supplier candidates only; read-only
**No actions taken:** no import, mapping, remapping, order, or catalog change

## Bottom line

| Current product | Exact supplier candidate | Hard decision |
|---|---|---|
| Milk frother `9351189004538` / DSers `2085218934304604160` | AliExpress `1005009033050005` | **HOLD** — strongest economics, but no exact option/configuration record exists and the exact listing cannot be safely accessed from the available browser surface. |
| USB desk lamp `9351895810298` / DSers `2085218769107484672` | AliExpress `1005011845601959` | **REJECT** — unresolved exact electrical/battery configuration plus weak visible DSers rating `4.3`; do not replace the current lamp mapping with another unproved electrical product. |

Neither candidate is promoted.

## Access and evidence limitation

The signed-in DSers Supplier Optimizer exposes exact item ID, cost, destination method/cost/days, Sale count and supplier-score fields, but it does **not** expose the supplier title, exact selectable options, exact-option stock, battery/connector/mode data, contents or regulatory labels. Its exact-ID Find Products search returned `No Data` for frother `1005009033050005`. Supplier Optimizer also warns that some data may be incorrect.

The available browser surface blocked direct access to the AliExpress item pages under its site-safety policy. That restriction was not bypassed. Therefore unknown fields below remain unknown rather than being inferred from image similarity or from the current mapped product.

An Optimizer image match is not a mapping. Both candidates have **no selected variant** until an explicit future mapping action, which was outside this read-only audit.

## 1. Milk frother candidate `1005009033050005`

### What is proven in signed-in DSers

- Exact Supplier Optimizer item ID: `1005009033050005`.
- Visible Sale count: `410`.
- Visible scores: reliability `4.5`; response `4.6`; delivery `4.7`; rating `4.8`.
- Visible item-cost range: **US$4.01–4.11**.
- Canada: AliExpress Selection Standard; **US$2.16** shipping; **8 days**.
- United States: AliExpress Selection Standard; **US$1.99** shipping; **6 days**.
- At the high visible item cost, item plus shown route is approximately **CA$8.74** to Canada and **CA$8.51** US-route equivalent using the established 1 USD = 1.3943 CAD audit FX.
- Both are below the established **CA$15.38** high-band promotional landed ceiling for a competitive CA$30 frother, before other landed components.

### What is not proven

- Actual supplier title.
- Exact selected option/configuration; **none is selected**.
- Ordinary repeatable price for one chosen option rather than a visual-search range.
- Exact-option stock.
- Whether the product is rechargeable, battery-powered or replaceable-battery.
- Connector type, battery chemistry/capacity, input voltage/current, charger/cable contents or safety label.
- Exact speed/mode count, included whisk heads, stand, lid/cup or other package contents.
- Materials/food-contact surfaces, waterproofing/cleaning limits, dimensions and exact colour.
- Whether the named route provides end-to-end tracking for this exact option; Optimizer shows a named method, not an order-level tracking proof.

### Decision: **HOLD**

This is the only candidate of the two worth preserving as a future exact-detail lead. Economics and visible sales are strong enough to justify one later supplier-detail check, but it cannot replace the current mapping or enter the catalog until a single exact option proves the missing configuration and safety fields. `410` visible sales does not prove product fidelity.

Promote only if a future authorized exact-detail view proves one configuration at an all-in landed cost no higher than CA$15.38, a defensible CA$18–30 retail, adequate exact-option stock, complete charging/battery/content facts and recent product-specific reviews. Until then: **HOLD, not launch-ready**.

## 2. Desk-lamp candidate `1005011845601959`

### What is proven in signed-in DSers

- Exact Supplier Optimizer item ID: `1005011845601959`.
- Visible Sale count: `105`.
- Visible scores: reliability `4.5`; response `4.6`; delivery `4.7`; overall rating **`4.3`**.
- Visible item cost: **US$7.67**.
- Canada: AliExpress Selection Standard; **US$2.16** shipping; **8 days**.
- United States: AliExpress Selection Standard; **US$1.99** shipping; **6 days**.
- Item plus shown route is approximately **CA$13.71** to Canada and **CA$13.47** US-route equivalent using the established audit FX.
- Those preliminary figures are below the established **CA$20.61** high-band promotional landed ceiling for a competitive CA$40 lamp, before other landed components.

### What is not proven

- Actual supplier title.
- Exact selected option/configuration; **none is selected**.
- Exact-option ordinary price and stock.
- Whether it is rechargeable or merely USB-powered.
- Connector, included cable/adapter, battery chemistry/capacity, input label, charge time, runtime and replaceability.
- Exact light modes/colour temperatures, dimming steps, controls, output/power and dimensions.
- Product/model label and applicable electrical/battery safety evidence for Canada and the United States.
- Package contents, exact colour, media rights or exact-option review evidence.
- Exact-option tracking proof.

### Decision: **REJECT**

Do not use this candidate to rescue the desk lamp. Its low visible cost is not enough to justify another electrical mapping with no exact title, option, battery/input label, certification, stock or product-specific evidence. Its visible overall DSers rating of `4.3` is also the weakest of the three lamp alternatives previously screened. The current lamp already has unresolved configuration/certification problems and a severely inflated CA$138.22 price; swapping to another opaque image match repeats the failure rather than repairing it.

## Required action

- Preserve frother ID `1005009033050005` as **HOLD evidence only**.
- Remove lamp ID `1005011845601959` from recovery consideration: **REJECT**.
- Make no current-product mapping or storefront change from this report.

## Evidence inputs

- Signed-in DSers Supplier Optimizer CA and US result tables, 2026-08-08.
- `current-catalog-pet-home-supplier-rescue-2026-08-08.md/.csv`.
- `six-product-decision-2026-08-08.md`.
- `five-product-margin-thresholds-2026-08-08.md/.csv`.
- `three-product-decision-2026-08-08.md`.
