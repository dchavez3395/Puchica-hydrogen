# Puchica Pre-Purchase Readiness Report

## Current launch position

- 20 active products are tagged as launch-ready.
- 431 Shopify variants are represented across those products.
- All 20 products were evaluated using current Shopify pricing, DSers quote evidence, destination availability, operational risk, and conservative post-discount margin assumptions.
- 8 products form the focused merchandising set through the `puchica-launch-featured` tag and the Launch Picks collection.
- 19 products have positive minimum quoted margin at the modeled launch discount and payment-fee allowance.
- The Foot Gauge includes one supplier variant with no shipping; that variant is already unavailable and must remain disabled.

## Focused launch set

1. Car Sun Visor Organizer
2. Everyday Carabiner Clip Set
3. Travel Pet Water Bottle
4. Adjustable Rhinestone Ring
5. Compact Bicycle Bell
6. Everyday Polarized Sunglasses
7. Everyday Zip Hoodie
8. Everyday Performance Shorts

These are merchandising approvals based on available evidence. They do not prove that supplier payment, tracking synchronization, physical quality, packaging, or delivery will work. Those require a real test order.

## Pre-purchase work completed

- Recalculated launch economics using current CAD prices, FIRST15 discount exposure, and a payment-fee allowance.
- Created a formula-driven launch scorecard and CSV source.
- Created and published accurate Shopify smart collections:
  - Launch Picks
  - Activewear
  - Everyday Accessories
  - On the Go
  - Practical Tools
- Replaced legacy storefront merchandising links with the focused Launch Picks path.
- Reworked homepage category queries and launch-product selection.
- Added category tags to all 20 launch products.
- Expanded five thin apparel descriptions with sizing and variant-selection guidance.
- Added missing alt text to 123 catalog media images.
- Corrected localized document-language and Open Graph locale output.
- Added customer-support procedures and a complete test-order validation runbook.
- Passed the automated storefront test suite and production build.
- Deployed commit `0a32f0c` to Shopify Oxygen production.

## Production verification

- Launch Picks: 8 products.
- Activewear: 10 products.
- On the Go: 5 products.
- Everyday Accessories: 4 products.
- Practical Tools: 3 products.
- English, French, Spanish, and Brazilian Portuguese routes emit the intended HTML and Open Graph locales.
- The old Best Sellers URL redirects to Launch Picks.
- Search returns Compact Bicycle Bell for `bell` and does not expose No-Drill Shower Shelf for `shower shelf`.
- Compact Bicycle Bell has an enabled add-to-cart control.
- Cart, Shopify customer-account login, and the styled not-found route load successfully.
- All 20 launch-ready products are published to Puchica Storefront, Online Store, Google & YouTube, and Facebook & Instagram.

## What remains unproven until purchase

- Shopify order creation after a real payment.
- DSers order ingestion timing.
- Exact supplier-SKU mapping on the purchased line item.
- Whether supplier payment is manual or can be safely automated.
- Actual Canadian and US destination acceptance at order time.
- Tracking synchronization from supplier to DSers to Shopify.
- Customer transactional email delivery.
- Physical product quality, packaging, labeling, and delivery time.
- Actual landed margin after any supplier-price or shipping change.

## Recommended test sequence

1. Compact Bicycle Bell: low-cost control and first end-to-end validation.
2. Travel Pet Water Bottle: higher-value hero product and second destination check.
3. If practical, send one test to Canada and one to the United States.
4. Do not scale ads until both orders pass mapping, tracking, delivery, and quality checks.

## Launch rule

Keep paid acquisition conservative until at least one Canadian and one US order complete successfully. Product mappings and quoted shipping are strong pre-purchase evidence, but they are not the same as proven hands-off fulfillment.
