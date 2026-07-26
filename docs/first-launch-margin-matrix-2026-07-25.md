# First-launch margin matrix - 2026-07-25

## Purpose

This is the commercial gate for the initial DSers validation cohort and every later catalog batch. A product is **not approved to publish** until its exact chosen variant has a Canadian supplier shipping quote, delivery estimate, and a result at or below the shipping budget in this table.

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
| No-Drill Shower Shelf | CA$44.48-83.05 | CA$33.25 | -CA$6.07 at low tier; CA$17.77 at high tier | Do not use the low-priced variants. Review stocked rod variants separately. |
| Solar Fairy String Lights | CA$13.24-25.66 | CA$10.27 | -CA$2.39 to CA$5.29 | Only possible at higher-priced variants or as a paid-shipping/add-on item. |
| Compact Manicure Set | CA$9.46-18.81 | CA$7.54 | -CA$2.00 to CA$3.78 | Do not lead with it; only retain a variant that clears the quote gate. |
| Travel Pet Water Bottle | CA$12.55-12.80 | CA$5.13 | CA$2.32-2.48 | Viable only if the supplier's Canadian delivery is unusually economical. |
| Compact Bicycle Bell | CA$6.50-9.49 | CA$3.79 | -CA$0.07 to CA$1.77 | Add-on only; not viable as a standalone hero product at these prices. |
| Long-Handle Silicone Bottle Brush | CA$3.66-6.72 | CA$2.71 | -CA$0.75 to CA$1.14 | Add-on only. It should not be independently launched without repricing or a bundle. |
| Men's High-Neck Knit Sweater | CA$39.99 | CA$19.88 | CA$4.52 | Restored as the existing live product while mapping review continues. Do not use the `Variants (0)` detail view alone as conclusive proof of a broken link. |
| Men's Cotton-Linen Wide-Leg Pants | CA$39.40 | CA$16.29 | CA$7.75 | Draft. Strong preliminary economics, but DSers currently reports `Variants (0)`; repair mapping before any quote or content decision. |
| Men's Casual Sports Hoodie | CA$54.99 | CA$29.11 | CA$4.56 | Quote must be low; retain only if sizing/quality presentation is credible. |
| Adjustable Raised Pet Bowl Set | CA$34.99 | CA$17.54 | CA$3.78 | Existing active product; low-stock and Canadian shipping validation are mandatory. |

Negative numbers mean the product cannot reach the 20% merchandise-margin target even with free supplier shipping at that displayed price/cost combination.

## Variant check completed: No-Drill Shower Shelf

DSers shows twelve variants, all shipping from China Mainland. The first review produced this safe merchandising rule:

- **Exclude Black**: current Shopify price CA$44.48, source cost CA$17.81, and supplier stock **0**.
- **Potential single-shelf variants**: White with Rod at CA$47.96 / CA$19.21 source cost, Black with Rod at CA$47.96 / CA$19.21, and Silver with Rod at CA$48.21 / CA$19.31. Each has supplier stock above 980 and a preliminary supplier-shipping budget of about **CA$10**.
- **Potential two-piece variants**: White, Silver, and Black two-piece sets with rod at CA$82.56 / CA$33.07-33.25 source cost. These have supplier stock above 99 and a preliminary supplier-shipping budget of about **CA$17.6**.
- **Do not select a variant until its exact Canada quote and delivery window are captured.** Stock and mapping are positive signals, not fulfillment approval.

## Variant check completed: Men's High-Neck Knit Sweater

An earlier DSers review displayed **54** size/colour rows and **16** images, but the current product-detail record reports **`Variants (0)`**. Treat the existing mapping as broken until DSers shows a saved, selectable variant map again.

- Reviewed source costs range from **CA$15.98 to CA$18.28** at the current CA$39.99 storefront price, leaving about **CA$6.12 to CA$8.42** of preliminary Canadian supplier-shipping headroom for those variants.
- Available variants include S, M, L, and XL in Dark Grey, Beige, and black. The product must not be merchandised until the storefront's option names, size chart, material composition, garment measurements, and care instructions have been checked against the supplier listing.
- The product is restored to Shopify Active and the Hydrogen launch allowlist. Keep traffic controlled while the exact selected-variant Canada quote and DSers mapping detail are independently verified.

## Supplier check completed: Adjustable Raised Pet Bowl Set

The currently linked supplier page shows **free shipping to Canada** and an estimated delivery of **Aug 2-8** for its selected variant. That would meet the product's preliminary shipping budget, but the product is **not approved**:

- The supplier page now presents Green, Blue, Yellow, Pink, and Purple.
- The Shopify/DSers mapping presents Black, Red blue, Pink, and Purple.
- Black and Red blue therefore cannot be treated as live supplier-valid options. The product was moved to Shopify Draft and removed from Hydrogen's launch allowlist until the mapping is rebuilt against the current supplier variants.
- The supplier page also displayed an introductory/welcome price. That promotional price must not be used for margin calculations; use the DSers mapped source cost and a fresh selected-variant quote instead.

## Pricing rules before publishing

1. Quote the exact SKU/variant for a Canadian address and record supplier shipping, delivery window, tracking availability, and stock.
2. If Canadian supplier shipping exceeds the row's budget, either select a different variant/supplier, set a new price that preserves the target margin, make it an explicit add-on/bundle, or reject it. Do not silently accept the loss.
3. Keep the existing CA$7.99 under-CA$75 checkout rate as a customer-facing shipping choice; do not treat it as a reason to overstate delivery speed or hide supplier costs.
4. Do not activate a draft merely because it maps in DSers. Mapping protects fulfillment linkage; it does not validate margin, delivery reliability, claims, safety, or content.
5. After the first paid fulfillment, replace the preliminary cost with the real supplier charge and recheck the margin before scaling traffic.

## Immediate queue after quotes

1. Repair the sweater and raised-pet-bowl mappings before requesting any more supplier quotes.
2. Once mapping is repaired, prioritize cotton-linen pants and the high-tier shower-shelf variants because they have the most workable preliminary shipping headroom.
3. Treat lights, manicure, pet bottle, bell, and bottle brush as optional add-ons until their landed economics are verified.
4. Build a 30+ product lifestyle assortment in verified batches. Do not bulk-publish untouched imports, but do not treat the initial cohort as the catalog ceiling.
