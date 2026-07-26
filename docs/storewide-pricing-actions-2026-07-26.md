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
| CA | Children's Foot Measuring Gauge | 5 | 0 | 6.47~13.99 | 6.47~13.99 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| CA | Children's Solid-Color Tights | 39 | 0 | 8.37~13.99 | 8.37~13.99 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| CA | Copper Washer Assortment | 4 | 0 | 18.99~53.97 | 18.99~53.97 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| CA | Everyday Crew-Neck T-Shirt | 18 | 0 | 49.99~64.99 | 49.99~64.99 | PRICE_PASSES_CURRENT_GATE |
| CA | Everyday Printed Joggers | 18 | 0 | 24.99~28.02 | 24.99~28.02 | CANADA_FIXED_PRICE_VALIDATED |
| CA | Everyday Pullover Hoodie | 48 | 0 | 54.99~61.99 | 54.99~61.99 | PRICE_PASSES_CURRENT_GATE |
| CA | Men's Everyday Shorts | 72 | 0 | 15.99~22.99 | 15.99~22.99 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| CA | Men's High-Neck Base-Layer Top | 42 | 0 | 16.91~21.99 | 16.91~21.99 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| CA | Printed Children's Winter Mittens | 4 | 0 | 21.94~23.99 | 21.94~23.99 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE |
| US | Adjustable Rhinestone Ring | 1 | 0 | 10.85~10.85 | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Breezy Everyday Pants | 1 | 0 | 21.99~21.99 | 21.99~21.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Car Sun Visor Organizer | 1 | 0 | 10.85~10.85 | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Compact Bicycle Bell | 1 | 0 | 10.85~10.85 | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Digital Watch & Jewellery Gift Set | 1 | 0 | 26.99~26.99 | 26.99~26.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Carabiner Clip Set | 1 | 0 | 10.85~10.85 | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Everyday Fleece Joggers | 1 | 0 | 26.99~39.98 | 26.99~26.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Performance Shorts | 1 | 0 | 34.99~34.99 | 34.99~34.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Polarized Sunglasses | 1 | 0 | 21.70~21.70 | 20.99~20.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Everyday Printed Joggers | 1 | 0 | 19.99~19.99 | 18.99~18.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Everyday Zip Hoodie | 1 | 0 | 34.99~34.99 | 34.99~34.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Long-Handle Bottle Brush | 1 | 0 | 8.68~8.68 | 7.99~7.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Long-Sleeve Performance Tee | 1 | 0 | 19.99~19.99 | 19.99~19.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Men's Cotton-Linen Wide-Leg Pants | 1 | 0 | 28.51~28.51 | 25.99~25.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Men's High-Neck Knit Sweater | 1 | 0 | 30.99~30.99 | 30.99~30.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Multi-Use Organizer Hooks | 1 | 0 | 14.99~15.49 | 10.99~10.99 | ACTIVE_US_FIXED_OVERRIDE_VALIDATED |
| US | Quartz Watch, Bracelet & Necklace Set | 1 | 0 | 11.99~11.99 | 11.99~11.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Quick-Dry Training Shorts | 1 | 0 | 18.81~18.81 | 17.99~17.99 | ACTIVE_US_PRICE_VALIDATED |
| US | Stainless-Steel Quartz Watch & Bracelet | 1 | 0 | 12.99~12.99 | 12.99~12.99 | DRAFT_US_FIXED_OVERRIDE_VALIDATED |
| US | Travel Pet Water Bottle | 1 | 0 | 14.46~14.46 | 11.99~11.99 | ACTIVE_US_PRICE_VALIDATED |

## Operating rule

A calculated price floor does not activate a product. Mapping, stock, content/compliance, country shipping, checkout, and storefront visibility must still pass.
