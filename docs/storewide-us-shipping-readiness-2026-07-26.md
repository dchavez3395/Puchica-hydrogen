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

Shopify Admin now resolves the dedicated USD catalog and its completed 17-product publication for a US buyer. However, the U.S. market is also marked `Managed`, and its Managed Markets eligibility panel reports **0 of 17 supported**. Managed Markets requires fulfillment through Global-e labels/rates; the launch catalog is fulfilled by DSers suppliers, primarily from China. The US Storefront API therefore still returns zero products.

Treat US launch availability as **BLOCKED_BY_MANAGED_MARKETS_FULFILLMENT_MODE**. The next configuration decision is to deactivate Managed Markets for the U.S. market and use Puchica's existing US Cross-border delivery profile, or replace DSers fulfillment with a Managed Markets-compatible fulfillment path. Deactivation changes merchant-of-record, duties/tax handling, carrier rates, and compliance responsibility, so it requires explicit merchant approval.

## US supplier quotes captured

- `Travel Pet Water Bottle`: all three mapped colors returned AliExpress Selection Standard from CN, US$1.99 shipping, 7~12 days, tracking available; supplier cost range US$3.49~3.56 and DSers aggregate stock 23.
- `Everyday Carabiner Clip Set`: both mapped variants returned AliExpress Selection Standard from CN, US$1.99 shipping, 7~12 days, tracking available; supplier cost range US$2.07~2.08 and DSers aggregate stock 47.

The following additional US supplier checks were completed:

- `Compact Bicycle Bell`: all six mapped colors returned US$1.99 shipping, 7~13 days, tracking available.
- `Car Sun Visor Organizer`: all three mapped colors returned US$1.99 shipping, 7~11 days, tracking available.
- `Adjustable Rhinestone Ring`: both mapped styles returned US$1.99 shipping, 7~12 days, tracking available.
- `Precision Nail Clippers`: both `blue` and `Red single` returned **No Shipping** to the United States.

The five passing products are marked `PASS_SHIPPING_PENDING_US_STOREFRONT_PRICE`, not fully approved, until US storefront prices and contribution are available after the Managed Markets conflict is resolved.

`Precision Nail Clippers` was removed from the dedicated US publication (`gid://shopify/Publication/215035183354`) on 2026-07-26. Verification shows 16 products remain in that publication, Precision Nail Clippers is absent, and its viable Canadian product remains available in the Canada Storefront context.

## Product approval rule

A mapped product can be marked dual-country approved only when all of the following are true:

1. Exact DSers supplier quote evidence exists for Canada.
2. Exact DSers supplier quote evidence exists for the United States.
3. Landed contribution passes for both destinations after discounts and payment fees.
4. Required variants are in stock and mapped.
5. The product passes content and compliance review.
6. Shopify returns the product in both Canada and US storefront contexts.
7. A US checkout can resolve an applicable delivery method.