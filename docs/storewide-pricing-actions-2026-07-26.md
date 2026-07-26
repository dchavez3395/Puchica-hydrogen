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
| CA | 2024 Mens Print Pants Autumn/Winter New In Men's Clothing Trousers Sport Jogging Fitness Running Trousers Harajuku Streetwear | 18 | 14 | 22.78~28.02 | 23.99~28.02 | PRICE_PASSES_CURRENT_GATE; REPRICE_THEN_REVIEW |
| CA | Everyday 100% Cotton T-Shirt | 18 | 18 | 45.99~45.99 | 49.99~64.99 | REPRICE_THEN_REVIEW |
| CA | Everyday Pullover Hoodie | 48 | 22 | 54.99~54.99 | 54.99~61.99 | PRICE_PASSES_CURRENT_GATE; REPRICE_THEN_REVIEW |
| US | 1/2PCS Men Business Watches Fashion Men's Steel Band Quartz Watch with Bracelet?Box not Included? | 1 | 1 |  | 12.99~12.99 | USD_STOREFRONT_PRICE_VALIDATION_REQUIRED |
| US | 3PCS/Set Men Business Watches Casual Leather Band Analog Male's Quartz Watch Necklace Bracelet Set | 1 | 1 |  | 11.99~11.99 | USD_STOREFRONT_PRICE_VALIDATION_REQUIRED |
| US | Adjustable Rhinestone Ring | 1 | 1 |  | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Breezy Everyday Pants | 1 | 1 |  | 21.99~21.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Car Sun Visor Organizer | 1 | 1 |  | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Compact Bicycle Bell | 1 | 1 |  | 9.99~9.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Digital Watch & Jewellery Gift Set | 1 | 1 |  | 26.99~26.99 | USD_STOREFRONT_PRICE_VALIDATION_REQUIRED |
| US | Everyday Carabiner Clip Set | 1 | 1 |  | 8.99~8.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Everyday Performance Shorts | 1 | 1 |  | 34.99~34.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Everyday Polarized Sunglasses | 1 | 1 |  | 20.99~20.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Long-Handle Bottle Brush | 1 | 1 |  | 7.99~7.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Long-Sleeve Performance Tee | 1 | 1 |  | 19.99~19.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Men's Cotton-Linen Wide-Leg Pants | 1 | 1 |  | 25.99~25.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Men's High-Neck Knit Sweater | 1 | 1 |  | 30.99~30.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Quick-Dry Training Shorts | 1 | 1 |  | 17.99~17.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |
| US | Travel Pet Water Bottle | 1 | 1 |  | 11.99~11.99 | ACTIVE_US_PRICE_VALIDATION_REQUIRED |

## Operating rule

A calculated price floor does not activate a product. Mapping, stock, content/compliance, country shipping, checkout, and storefront visibility must still pass.
