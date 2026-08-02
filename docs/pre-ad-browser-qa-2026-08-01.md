# Puchica pre-ad browser QA — 2026-08-01

## Scope

Read-only and reversible browser checks across the homepage, New Arrivals,
product detail, About, and packing-cubes campaign pages. The cart was used to
verify the add-to-cart path and then emptied. No checkout submission, order,
subscription, ad publication, or spend occurred.

## Verified

- Canada and United States market choices resolve independently.
- Switching to the United States updates the homepage, product page, and cart
  to USD; the packing-cube campaign resolves to US$52.
- The product add-to-cart path opens a cart containing the correct variant,
  quantity, currency, and checkout locale.
- The QA cart was emptied after verification.
- Homepage, collection, About, PDP, and campaign pages have canonical URLs on
  `https://puchica.ca`.
- Tested mobile pages have named buttons and product images with alt text.
- Homepage, About, New Arrivals, PDP, and campaign layouts do not create
  horizontal overflow after the collection-hero box-sizing correction.
- The shipping and returns control is exposed as a native `details`/`summary`
  disclosure and includes a visible chevron indicator.
- A fresh local server and the production PDP loaded without console errors.
- The earlier development hydration errors were isolated to the old, heavily
  hot-reloaded localhost session and did not reproduce on a clean server.
- Meta Pixel and GA4 script sources are present with the configured IDs.

## Remaining measurement proof

The browser surface used for this QA cannot reliably expose consent-gated
third-party event queues or outgoing analytics requests. The implementation and
unit tests cover `ViewContent`/`view_item`, `AddToCart`/`add_to_cart`, and
`InitiateCheckout`/`begin_checkout`, but the production event stream must still
be confirmed in Meta Events Manager and GA4 DebugView before paid traffic.

`Purchase` is emitted from Shopify-hosted checkout rather than Hydrogen. A
pre-ad test order is not required, but the first genuine conversion must be
checked promptly for attribution before the campaign is allowed to scale.

## Current gate

Storefront browser QA: **PASS**

Paid activation: **HOLD pending production deployment, event-console proof,
creative approval, and explicit owner approval of the spend cap.**
