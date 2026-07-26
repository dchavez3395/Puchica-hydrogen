# US shipping readiness - 2026-07-26

## Shopify configuration

- The dedicated `U.S` market (`gid://shopify/Market/40405303546`) was changed from `DRAFT` to `ACTIVE` on 2026-07-26.
- The General delivery profile already contains a `US Cross-border` zone for country `US`.
- Active methods in that zone include `Standard International`, `Express International`, and `Standard Shipping`.
- The shared `Shopify Catalog` is Active and associates the U.S. market with the existing product publication.

## Verification result

- Canada Storefront API context: products returned.
- Default Storefront API context: products returned.
- United States Storefront API context immediately after activation: **0 products returned**.

The Admin configuration is therefore necessary but not yet sufficient proof that a US buyer can purchase. Treat US launch availability as **PENDING_STOREFRONT_CATALOG_VERIFICATION** until the US Storefront API context returns the intended launch products and checkout delivery options are verified.

## Product approval rule

A mapped product can be marked dual-country approved only when all of the following are true:

1. Exact DSers supplier quote evidence exists for Canada.
2. Exact DSers supplier quote evidence exists for the United States.
3. Landed contribution passes for both destinations after discounts and payment fees.
4. Required variants are in stock and mapped.
5. The product passes content and compliance review.
6. Shopify returns the product in both Canada and US storefront contexts.
7. A US checkout can resolve an applicable delivery method.