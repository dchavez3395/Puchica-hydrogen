# Storewide U.S. catalog price validation ? 2026-07-26

Observed directly in Shopify Admin catalog `Puchica US Catalog` (`103822819578`), assigned to the U.S. market with no overall adjustment and no fixed-price overrides on the reviewed product rows.

| product | observed USD price | conservative floor | verdict |
| --- | ---: | ---: | --- |
| Adjustable Rhinestone Ring | 10.85 | 9.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Breezy Everyday Pants | 17.72 ? 24.17 | 21.99 | REVIEW_VARIANT_PRICE_COST_MAPPING |
| Car Sun Visor Organizer | 10.85 | 8.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Compact Bicycle Bell | 10.85 | 9.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Everyday Carabiner Clip Set | 10.85 | 8.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Everyday Performance Shorts | 24.83 ? 39.79 | 34.99 | REVIEW_VARIANT_PRICE_COST_MAPPING |
| Everyday Polarized Sunglasses | 21.70 | 20.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Long-Handle Bottle Brush | 8.68 | 7.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Long-Sleeve Performance Tee | 16.63 ? 21.01 | 19.99 | REVIEW_VARIANT_PRICE_COST_MAPPING |
| Men's Cotton-Linen Wide-Leg Pants | 28.51 | 25.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Men's High-Neck Knit Sweater | 28.94 ? 32.19 | 30.99 | REVIEW_VARIANT_PRICE_COST_MAPPING |
| Quick-Dry Training Shorts | 18.81 | 17.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Travel Pet Water Bottle | 14.46 | 11.99 | PASS_CONSERVATIVE_US_MARGIN_FLOOR |

## Interpretation

- `PASS_CONSERVATIVE_US_MARGIN_FLOOR`: the lowest displayed U.S. catalog price is at or above the product?s maximum-cost conservative floor.
- `REVIEW_VARIANT_PRICE_COST_MAPPING`: the displayed range minimum is below the maximum-cost floor. Match variant prices to variant supplier costs or add an adequate fixed-price override before approval.
- Price validation does not override the existing Managed Markets/storefront availability blocker.
