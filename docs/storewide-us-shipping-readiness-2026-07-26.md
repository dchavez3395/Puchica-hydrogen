# US shipping readiness - 2026-07-26

## Shopify configuration

- The dedicated `U.S` market (`gid://shopify/Market/40405303546`) was changed from `DRAFT` to `ACTIVE` on 2026-07-26.
- The General delivery profile already contains a `US Cross-border` zone for country `US`.
- Active methods in that zone include `Standard International`, `Express International`, and `Standard Shipping`.
- The original shared `Shopify Catalog` used a CAD price list, which conflicted with the US/USD buyer context.
- A dedicated zero-adjustment USD price list (`gid://shopify/PriceList/22620078330`) and active `Puchica US Catalog` (`gid://shopify/MarketCatalog/103822819578`) were created for the U.S. market.
- The U.S. market was removed from the shared CAD catalog; Canada and the UK remain attached to it.

## Verification result

- Canada Storefront API context: products returned.
- Default Storefront API context: products returned.
- United States Storefront API context immediately after activation: **0 products returned**.

Shopify Admin now resolves the dedicated USD catalog for a US buyer. A follow-up Admin check confirmed that the U.S. market remains `Active`, the `Puchica US Catalog` remains assigned, and Managed Markets remains enabled through Global-e. Shopify's market page states that orders can be fulfilled only with Global-e labels/rates and displays sample rates of **CA$30.82 FedEx** and **CA$46.63 DHL Express** for a 0.5 kg shipment. That fulfillment model conflicts with the catalog's DSers supplier-direct shipping evidence, which is primarily fulfilled from China. The last completed US Storefront API check still returned zero products.

Treat US launch availability as **BLOCKED_BY_MANAGED_MARKETS_FULFILLMENT_MODE**. The next configuration decision is to deactivate Managed Markets for the U.S. market and use Puchica's existing US Cross-border delivery profile, or replace DSers fulfillment with a Managed Markets-compatible fulfillment path. Deactivation changes merchant-of-record, duties/tax handling, carrier rates, and compliance responsibility, so it requires explicit merchant approval.

## US supplier quotes captured

- `Travel Pet Water Bottle`: all three mapped colors returned AliExpress Selection Standard from CN, US$1.99 shipping, 7~12 days, tracking available; supplier cost range US$3.49~3.56 and DSers aggregate stock 23.
- `Everyday Carabiner Clip Set`: both mapped variants returned AliExpress Selection Standard from CN, US$1.99 shipping, 7~12 days, tracking available; supplier cost range US$2.07~2.08 and DSers aggregate stock 47.

The following additional US supplier checks were completed:

- `Compact Bicycle Bell`: all six mapped colors returned US$1.99 shipping, 7~13 days, tracking available.
- `Car Sun Visor Organizer`: all three mapped colors returned US$1.99 shipping, 7~11 days, tracking available.
- `Adjustable Rhinestone Ring`: both mapped styles returned US$1.99 shipping, 7~12 days, tracking available.
- `Precision Nail Clippers`: both `blue` and `Red single` returned **No Shipping** to the United States.
- `Everyday Polarized Sunglasses`: all three mapped variants returned US$1.99 shipping with tracking; black and silver quoted 7~11 days, while gold quoted 9~14 days.
- `Long-Handle Bottle Brush`: both mapped variants returned US$1.99 shipping, 7~11 days, tracking available.
- `Multi-Use Organizer Hooks`: brown, pink, and light blue returned US$1.99 shipping with tracking; black returned **No Shipping** to the United States.
- `Everyday Zip Hoodie`: representative black, grey, and white SKUs returned US$1.99 shipping in 7~12 days with tracking; the exact `XL / Grey` supplier SKU returned **No Shipping** to the United States.
- `Everyday Performance Shorts`: five representative black, white, and grey size samples returned US$1.99 shipping in 7~13 days with tracking.
- `Breezy Everyday Pants`: five representative dark-grey and dark-blue size samples returned US$1.99 shipping in 8~13 days with tracking.
- `Quick-Dry Training Shorts`: four representative black/blue size samples returned US$1.99 shipping in 7~13 days with tracking; the exact `XXXL / 61620lan` supplier SKU returned **No Shipping** to the United States.
- `Everyday Fleece Joggers`: four representative navy/grey size samples returned US$1.99 shipping in 7~12 days with tracking; the sellable `3XL / Navy` supplier SKU returned **No Shipping** to the United States.
- `Long-Sleeve Performance Tee`: four representative grey/black-green size samples returned US$1.99 shipping in 9~14 days with tracking; the no-shipping `XXXL / Light Gray` SKU was already disabled with zero inventory.
- `Men's Cotton-Linen Wide-Leg Pants`: five representative samples across both visible style groups returned US$1.99 shipping in 7~14 days with tracking.
- `Men's High-Neck Knit Sweater`: four representative dark-grey/beige size samples returned US$1.99 shipping in 9~14 days with tracking; the no-shipping `S / Dark Grey` SKU was already disabled with zero inventory.

Ten products have fully passing sampled shipping sets. `Quick-Dry Training Shorts`, `Long-Sleeve Performance Tee`, and `Men's High-Neck Knit Sweater` are also U.S.-eligible because each observed no-shipping SKU is already disabled with zero inventory; all sampled sellable groups passed.

All 13 U.S.-eligible products now also pass the conservative price and contribution gate. Nine already cleared their calculated U.S. price floors. Four received fixed U.S.-catalog-only prices without changing Canadian pricing: `Breezy Everyday Pants` US$21.99, `Everyday Performance Shorts` US$34.99, `Men's High-Neck Knit Sweater` US$30.99, and `Long-Sleeve Performance Tee` US$19.99. Price evidence is recorded in `storewide-us-catalog-price-validation-2026-07-26.csv`.

`Precision Nail Clippers` was removed from the dedicated US publication (`gid://shopify/Publication/215035183354`) on 2026-07-26. `Multi-Use Organizer Hooks` was also excluded from `Puchica US Catalog` because Shopify catalog inclusion is product-level and its black variant cannot ship to the United States. The mixed-shipping `Everyday Zip Hoodie` was subsequently excluded for the same product-level reason. `Quick-Dry Training Shorts` remains included because its failed `XXXL / 61620lan` variant is already unavailable for sale with zero inventory. Everyday Fleece Joggers was also excluded because its failing 3XL / Navy variant remains sellable in Canada. Shopify Admin verification shows the U.S. catalog has 61 included products; Precision Nail Clippers, Multi-Use Organizer Hooks, Everyday Zip Hoodie, and Everyday Fleece Joggers are absent from the Included view. Their viable Canadian listings remain unchanged.

All 17 active launch products now have U.S. quote evidence. The worksheet covers all 358 active launch variant rows: 350 shipping passes (including representative-sample rows) and 8 exact no-shipping failures. Thirteen products have a sellable U.S. variant set; four remain excluded at product level because a no-shipping variant is still sellable in Canada.

## Product approval rule

A mapped product can be marked dual-country approved only when all of the following are true:

1. Exact DSers supplier quote evidence exists for Canada.
2. Exact DSers supplier quote evidence exists for the United States.
3. Landed contribution passes for both destinations after discounts and payment fees.
4. Required variants are in stock and mapped.
5. The product passes content and compliance review.
6. Shopify returns the product in both Canada and US storefront contexts.
7. A US checkout can resolve an applicable delivery method.