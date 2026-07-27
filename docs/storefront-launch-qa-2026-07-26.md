# Storefront launch QA and remediation — 2026-07-26

## Executive status

The storefront is gated to 20 approved, active, launch-tagged products. Those products have mapped DSers variants and verified Canada and United States shipping evidence at the catalog level. This does not mean a physical test order has been placed; it means the product/variant mapping, sellability, pricing, shipping quote evidence, cart, discount, and checkout paths have been checked without submitting payment.

## Completed in this pass

- Audited all 20 launch products through Shopify Admin and the live Hydrogen storefront.
- Confirmed every approved product route returns HTTP 200 and `/collections/all` exposes exactly the 20 approved products.
- Confirmed rejected and risk-held products did not leak into the observed homepage or all-products catalog.
- Added missing product types to 12 products.
- Replaced weak or supplier-derived copy/SEO on Printed Joggers, Men's Cotton-Linen Pants, Adjustable Rhinestone Ring, Everyday Polarized Sunglasses, Everyday Zip Hoodie, and Compact Bicycle Bell.
- Added concise, accurate featured-image alt text to all 20 approved products.
- Removed the unsupported homepage deal rail and false sale merchandising.
- Removed links to empty or unsupported lifestyle, trending, and gifts-under-$25 collections; legacy direct URLs now redirect to the verified all-products catalog.
- Reframed the legacy Best Sellers destination as Launch Picks in all four storefront languages.
- Corrected newsletter FIRST15 copy from 10% to 15% in English, French, Spanish, and Portuguese.
- Verified FIRST15 in checkout: USD $15.00 subtotal, $2.25 discount, $6.00 US standard shipping, USD $18.75 total. No purchase was submitted.
- Rechecked margin evidence after FIRST15; the only negative Canada row was the already unavailable Foot Gauge blue variant with no shipping. Controlled unavailable variants remain unavailable for sale.
- Enabled Shopify's native privacy banner and changed GA4/Meta loaders so the external tracker scripts load only after analytics consent is allowed.
- Restored a runnable test command by adding Vitest; 12/12 analytics tests pass.
- Production Hydrogen build passes. ESLint has zero errors (32 pre-existing console warnings in standalone debug/test scripts).

## Verified commerce behavior

- Canada checkout: standard CA$7.99 and express CA$20.00 were previously verified.
- United States checkout: standard US$6.00 verified.
- FIRST15: 15% discount verified in US checkout.
- Product purchase routes: 20/20 approved product pages return 200.
- Explicitly controlled unavailable variants remain unavailable, including the known no-shipping or failed quote variants.

## Deferred or externally blocked

- Google & YouTube product publication is enabled for all 20 products, but Merchant Center ingestion was still processing and may take up to three days.
- No physical sample or paid test order has been placed. That remains a later quality-control step, not a prerequisite for completing no-cost storefront remediation.
- Meta catalog/pixel publication is active, but an ad account is still required before advertising.
- A DevTools Core Web Vitals trace could not run because the chrome-devtools MCP server is not configured. The production build was inspected instead; the main global CSS is 251.43 kB raw / 42.68 kB gzip and the largest shared client chunks are 213.27 kB raw / 66.37 kB gzip and 137.58 kB raw / 44.93 kB gzip.
- `npm audit --omit=dev` reports upstream React Router advisories. Hydrogen 2026.4.4 still declares React Router `~7.16.0`, so forcing 7.18+ would violate Shopify's peer compatibility. This should be upgraded when Shopify publishes a compatible Hydrogen release.
- Shopify's Hydrogen validator script could not complete against this repository because its validator requires unrelated dev packages (`@shopify/hydrogen-react`, `schema-dts`, and `preact`). The authoritative repository checks—lint, production build, and tests—pass.

## Recommended next operating sequence

1. Monitor Google Merchant ingestion until the 20 published products appear or diagnostics identify a specific rejection.
2. Obtain/connect a Meta ad account only when the store is ready to run paid acquisition.
3. Run one low-cost end-to-end test order when ready to validate supplier acknowledgement, DSers order handoff, tracking sync, and the customer notification chain.
4. Order a small sample set from the highest-priority products for physical quality, packaging, and delivery-time validation.
5. Add collection membership only when each collection has enough approved products; do not reintroduce empty editorial links.
6. Upgrade Hydrogen/React Router when Shopify publishes a peer-compatible patched release.