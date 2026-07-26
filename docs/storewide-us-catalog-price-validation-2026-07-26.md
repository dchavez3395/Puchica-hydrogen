# Storewide U.S. catalog price validation ? 2026-07-26

Observed directly in Shopify Admin catalog `Puchica US Catalog` (`103822819578`), assigned to the U.S. market with no overall adjustment. Four conservative price exceptions were resolved with fixed U.S.-catalog prices.

| product | observed/fixed USD price | conservative floor | override | verdict |
| --- | ---: | ---: | --- | --- |
| Adjustable Rhinestone Ring | 10.85 | 9.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Breezy Everyday Pants | 21.99 | 21.99 | yes | PASS_FIXED_US_PRICE_OVERRIDE |
| Car Sun Visor Organizer | 10.85 | 8.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Compact Bicycle Bell | 10.85 | 9.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Everyday Carabiner Clip Set | 10.85 | 8.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Everyday Performance Shorts | 34.99 | 34.99 | yes | PASS_FIXED_US_PRICE_OVERRIDE |
| Everyday Polarized Sunglasses | 21.70 | 20.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Long-Handle Bottle Brush | 8.68 | 7.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Long-Sleeve Performance Tee | 19.99 | 19.99 | yes | PASS_FIXED_US_PRICE_OVERRIDE |
| Men's Cotton-Linen Wide-Leg Pants | 28.51 | 25.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Men's High-Neck Knit Sweater | 30.99 | 30.99 | yes | PASS_FIXED_US_PRICE_OVERRIDE |
| Quick-Dry Training Shorts | 18.81 | 17.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |
| Travel Pet Water Bottle | 14.46 | 11.99 | no | PASS_CONSERVATIVE_US_MARGIN_FLOOR |

## Interpretation

- `PASS_CONSERVATIVE_US_MARGIN_FLOOR`: the lowest displayed U.S. catalog price is at or above the maximum-cost conservative floor.
- `PASS_FIXED_US_PRICE_OVERRIDE`: a fixed U.S.-catalog price was saved at the conservative floor and re-read successfully.
- Price validation does not override the existing Managed Markets/storefront availability blocker.
