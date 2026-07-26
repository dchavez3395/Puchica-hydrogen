# DSers mapping repair queue — 2026-07-25

## Why this is the first operational task

The DSers My Products screen shows 57 connected AliExpress records, but direct detail checks on the sweater and cotton-linen pants show **`Variants (0)`**. Their displayed price ranges cannot be used as proof of a working order handoff. No product should be made active until its own mapping is repaired and saved.

## Repair one product at a time

1. In DSers **My Products**, open the product’s detail record.
2. Confirm the supplier link is the intended current listing—never assume an older AliExpress link is still valid.
3. In **Variants**, map every Shopify option to one current supplier option. Remove unavailable colours/sizes from Shopify rather than leaving a customer-selectable unmapped choice.
4. Confirm DSers shows a non-zero mapped-variant count, real supplier SKU/stock, and a source image for each saleable option.
5. Capture a fresh quote for one selected variant to Canada: item cost, shipping cost, delivery window, tracking availability, and the service name.
6. Update the Shopify product only with verified facts: title, options, material/specs, measurements, care, images/alt text, tags, product type, and SEO.
7. Recalculate margin using the recorded quote and the live Shopify price. Keep the product Draft if it misses the margin rule.
8. Test its storefront page and cart without placing a supplier order. Only then add its handle to `LAUNCH_PRODUCT_HANDLES` and change Shopify status to Active.

## Priority order after mappings work

| Priority | Product | Why it is first | Required proof |
| ---: | --- | --- | --- |
| 1 | Men's Cotton-Linen Wide-Leg Pants | Best preliminary shipping headroom among apparel | Saved variants, material/size chart, CA shipping quote, return fit review |
| 2 | No-Drill Shower Shelf (rod variants only) | High stock and workable high-tier margin | Current supplier link, non-zero stock per option, CA delivery quote |
| 3 | Travel Pet Water Bottle | Simple non-medical accessory | Capacity/material proof, leak/usage claims checked, CA shipping quote |
| 4 | Compact Bicycle Bell | Simple low-risk add-on | Mount/diameter compatibility and CA quote; bundle/add-on economics |
| 5 | Solar Fairy String Lights | Candidate only with verified electrical specs | Voltage, plug, safety details, CA quote, high-tier margin |

## Do not repair for launch now

- Heated or electric apparel, unverified electrical products, RC toys/drones, infant safety products, health/medical-claim products, logo/luxury-style goods, and novelty animal products.
- Any record where the supplier listing changed option names/colours, as with the raised pet bowl, until it is rebuilt from the current listing.

## Definition of done for the first product

The first item becomes launch-ready only when all of these are true:

- Shopify status is Active and its exact handle is in the Hydrogen allowlist.
- DSers displays mapped variants (not `Variants (0)`) and a usable supplier link.
- The chosen Canadian variant has a saved price/shipping/delivery/tracking quote.
- Storefront content and checkout rates state only what that quote supports.
- A non-charged cart/checkout test reaches the branded checkout domain without exposing the old theme storefront.
