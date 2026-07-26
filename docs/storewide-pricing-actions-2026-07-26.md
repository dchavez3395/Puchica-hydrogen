# Storewide pricing actions ? 2026-07-26

This ledger converts verified cost and shipping evidence into minimum prices under the existing gate assumptions.

## Assumptions

- First-order collected price: 85% of storefront price.
- Variable payment fee: 2.9%; fixed payment fee: CA/US$0.30.
- Target contribution after supplier cost and shipping: 30% of storefront price.
- Net price factor available for supplier cost, shipping, and fixed fee: 0.52535.
- Minimum price formula: `(supplier cost + shipping + 0.30) / 0.52535`.
- Recommended action price rounds upward to a `.99` ending.

## Product actions

| country | product | rows | failing rows | current price range | minimum / action price | disposition |
| --- | --- | ---: | ---: | --- | --- | --- |
| CA | Everyday 100% Cotton T-Shirt | 18 | 18 | 45.99~45.99 | 49.99~64.99 | REPRICE_THEN_REVIEW |
| CA | Everyday Printed Joggers | 18 | 0 | 24.99~28.02 | 24.99~28.02 | CANADA_FIXED_PRICE_VALIDATED |
| CA | Everyday Pullover Hoodie | 48 | 22 | 54.99~54.99 | 54.99~61.99 | PRICE_PASSES_CURRENT_GATE; REPRICE_THEN_REVIEW |
| US | Adjustable Rhinestone Ring | 1 | 0 | 10.85~10.85 | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Breezy Everyday Pants | 1 | 0 | 21.99~21.99 | 21.99~21.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Car Sun Visor Organizer | 1 | 0 | 10.85~10.85 | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Compact Bicycle Bell | 1 | 0 | 10.85~10.85 | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Digital Watch & Jewellery Gift Set | 1 | 0 | 26.99~26.99 | 26.99~26.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Carabiner Clip Set | 1 | 0 | 10.85~10.85 | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Everyday Performance Shorts | 1 | 0 | 34.99~34.99 | 34.99~34.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Polarized Sunglasses | 1 | 0 | 21.70~21.70 | 20.99~20.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Everyday Printed Joggers | 1 | 0 | 19.99~19.99 | 18.99~18.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Long-Handle Bottle Brush | 1 | 0 | 8.68~8.68 | 7.99~7.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Long-Sleeve Performance Tee | 1 | 0 | 19.99~19.99 | 19.99~19.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Men's Cotton-Linen Wide-Leg Pants | 1 | 0 | 28.51~28.51 | 25.99~25.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Men's High-Neck Knit Sweater | 1 | 0 | 30.99~30.99 | 30.99~30.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Quartz Watch, Bracelet & Necklace Set | 1 | 0 | 11.99~11.99 | 11.99~11.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Quick-Dry Training Shorts | 1 | 0 | 18.81~18.81 | 17.99~17.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Stainless-Steel Quartz Watch & Bracelet | 1 | 0 | 12.99~12.99 | 12.99~12.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Travel Pet Water Bottle | 1 | 0 | 14.46~14.46 | 11.99~11.99 | ACTIVE_US_PRICE_VALIDATED |

## Operating rule

A calculated price floor does not activate a product. Mapping, stock, content/compliance, country shipping, checkout, and storefront visibility must still pass.
