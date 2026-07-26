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
| CA | 300/280/200/100Pcs Washer Copper Sealing Solid Gasket Washer Sump Plug Oil For Boat Crush Flat Seal Ring Tool | 4 | 1 | 16.10~53.97 | 18.99~53.97 | DISABLE_CA_VARIANT_NO_SHIPPING; PRICE_PASSES_CURRENT_GATE; REPRICE_THEN_REVIEW |
| CA | Everyday 100% Cotton T-Shirt | 18 | 18 | 45.99~45.99 | 49.99~64.99 | REPRICE_THEN_REVIEW |
| CA | Everyday Printed Joggers | 18 | 0 | 24.99~28.02 | 24.99~28.02 | CANADA_FIXED_PRICE_VALIDATED |
| CA | Everyday Pullover Hoodie | 48 | 22 | 54.99~54.99 | 54.99~61.99 | PRICE_PASSES_CURRENT_GATE; REPRICE_THEN_REVIEW |
| CA | Kids Toddler Foot Measure Gauge Shoes Size Measuring Ruler Tool Baby Boy Girl Children's Foot Length Measuring Ruler Fittings | 5 | 4 | 5.91~9.11 | 6.47~13.99 | DISABLE_CA_VARIANT_NO_SHIPPING; REPRICE_THEN_REVIEW |
| CA | Summer Men's Shorts Cool Sportswear Running Sport Shorts Casual Bottoms Gym Fitness Training Jogging Short Pants Men Black Gray | 72 | 71 | 12.66~20.78 | 15.99~22.99 | DISABLE_CA_VARIANT_NO_SHIPPING; REPRICE_THEN_REVIEW |
| CA | Summer Spring Candy Color Kids Pantyhose Ballet Dance Tights for Girls Stocking Children Velvet Solid White Pantyhose | 39 | 38 | 8.19~8.76 | 8.37~13.99 | DISABLE_CA_VARIANT_NO_SHIPPING; REPRICE_THEN_REVIEW |
| CA | Thermal Underwear Tops Men Winter Clothes Thermal Shirt Autumn Men's Winter Tights High Neck Thin Slim Fit Long Sleeve T-shirt | 42 | 41 | 14.38~19.48 | 16.91~21.99 | DISABLE_CA_VARIANT_NO_SHIPPING; REPRICE_THEN_REVIEW |
| CA | Windproof Infant Stroller Gloves Children's Outdoor Sports Mittens Cartoon Printed Hands Warmer Scooter Accessory for Winter | 4 | 1 | 21.94~23.45 | 21.94~23.99 | DISABLE_CA_VARIANT_NO_SHIPPING; REPRICE_THEN_REVIEW |
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
