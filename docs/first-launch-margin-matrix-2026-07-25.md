# First-launch margin matrix - 2026-07-25

## Purpose

This is the commercial gate for the ten-product DSers launch queue. A product is **not approved to publish** until its exact chosen variant has a Canadian supplier shipping quote, delivery estimate, and a result at or below the shipping budget in this table.

## Assumptions used for the preliminary screen

- Canada market adjustment: **-5%**.
- FIRST15: **15% off** the product price.
- Payment processing reserve: **3.5% + CA$0.30** of discounted merchandise revenue.
- Target contribution margin: **20%** of discounted merchandise revenue.
- The shipping budget below deliberately **does not count the customer's checkout shipping payment**. It is therefore a conservative product-level screen and remains safe when shipping becomes free at the cart threshold.
- Costs and price ranges are the current values displayed by DSers. They are not supplier shipping quotes, landed cost, or approval to publish.

Formula: `shipping budget = (listed price x 0.95 x 0.85 x 0.765) - CA$0.30 - highest displayed source cost`.

## Supplier-quote gate

| Candidate | Current DSers listed price | Highest displayed source cost | Maximum Canadian supplier shipping | Decision before an exact quote |
| --- | ---: | ---: | ---: | --- |
| No-Drill Shower Shelf | CA$44.48-83.05 | CA$33.25 | -CA$6.07 at low tier; CA$17.77 at high tier | Do not use the low-priced variants. Review each high-tier variant separately. |
| Solar Fairy String Lights | CA$13.24-25.66 | CA$10.27 | -CA$2.39 to CA$5.29 | Only possible at higher-priced variants or as a paid-shipping/add-on item. |
| Compact Manicure Set | CA$9.46-18.81 | CA$7.54 | -CA$2.00 to CA$3.78 | Do not lead with it; only retain a variant that clears the quote gate. |
| Travel Pet Water Bottle | CA$12.55-12.80 | CA$5.13 | CA$2.32-2.48 | Viable only if the supplier's Canadian delivery is unusually economical. |
| Compact Bicycle Bell | CA$6.50-9.49 | CA$3.79 | -CA$0.07 to CA$1.77 | Add-on only; not viable as a standalone hero product at these prices. |
| Long-Handle Silicone Bottle Brush | CA$3.66-6.72 | CA$2.71 | -CA$0.75 to CA$1.14 | Add-on only. It should not be independently launched without repricing or a bundle. |
| Men's High-Neck Knit Sweater | CA$39.99 | CA$19.88 | CA$4.52 | Existing active product; validate exact Canadian shipping and size/return risk. |
| Men's Cotton-Linen Wide-Leg Pants | CA$39.40 | CA$16.29 | CA$7.75 | Strongest apparel candidate on preliminary economics; still requires material, sizing, and Canadian delivery proof. |
| Men's Casual Sports Hoodie | CA$54.99 | CA$29.11 | CA$4.56 | Quote must be low; retain only if sizing/quality presentation is credible. |
| Adjustable Raised Pet Bowl Set | CA$34.99 | CA$17.54 | CA$3.78 | Existing active product; low-stock and Canadian shipping validation are mandatory. |

Negative numbers mean the product cannot reach the 20% merchandise-margin target even with free supplier shipping at that displayed price/cost combination.

## Pricing rules before publishing

1. Quote the exact SKU/variant for a Canadian address and record supplier shipping, delivery window, tracking availability, and stock.
2. If Canadian supplier shipping exceeds the row's budget, either select a different variant/supplier, set a new price that preserves the target margin, make it an explicit add-on/bundle, or reject it. Do not silently accept the loss.
3. Keep the existing CA$7.99 under-CA$75 checkout rate as a customer-facing shipping choice; do not treat it as a reason to overstate delivery speed or hide supplier costs.
4. Do not activate a draft merely because it maps in DSers. Mapping protects fulfillment linkage; it does not validate margin, delivery reliability, claims, safety, or content.
5. After the first paid fulfillment, replace the preliminary cost with the real supplier charge and recheck the margin before scaling traffic.

## Immediate queue after quotes

1. Approve the two existing active products only if their exact Canadian quote passes: sweater and raised pet bowl.
2. Prioritize cotton-linen pants and the high-tier shower-shelf variants because they have the most workable preliminary shipping headroom.
3. Treat lights, manicure, pet bottle, bell, and bottle brush as optional add-ons until their landed economics are verified.
4. Keep the launch assortment at six to ten coherent products; do not mirror all 57 DSers mappings into Shopify.
