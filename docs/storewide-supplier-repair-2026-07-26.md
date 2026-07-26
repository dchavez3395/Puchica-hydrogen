# Storewide supplier repair log - 2026-07-26

## Completed live controls

| product | exact issue | live control | U.S. catalog state |
| --- | --- | --- | --- |
| Everyday Fleece Joggers | `3XL / Navy` has no U.S. shipping | Inventory set to 0; overselling denied; state re-read | Included |
| Multi-Use Organizer Hooks | `2PCS Black` has no U.S. shipping | Inventory set to 0; overselling denied; state re-read | Included |
| Everyday Zip Hoodie | `XL / Grey` has no U.S. shipping | Inventory set to 0; overselling denied; state re-read | Included |
| Precision Nail Clippers | Both supplier SKUs have no U.S. shipping; `Red single` remains the only sellable Canadian variant | Keep product U.S.-excluded; source an exact replacement AliExpress product and remap before inclusion | Excluded |
| Portable Mini Bag Sealer — Handheld Heat Sealer | Product was absent from DSers | Imported and manually mapped to exact AliExpress supplier `1005012108377337`, white variant; U.S. quote US$2.87 + US$1.99, 6–11 days, stock 140 | Draft; U.S. passes, exact mapped SKU has no Canada shipping; replace supplier |
| 6-Piece Silicone Spatula Set | Product was absent from DSers | Imported and manually mapped to exact AliExpress supplier `1005012286537204`, black variant matching Shopify image; U.S. quote US$9.58 + US$1.99, 7–13 days, stock 1,000 | Draft; Canada passes at US$2.15 shipping, 7–12 days; pricing review pending |
| Multi-Compartment Desk Organizer | Product was absent from DSers | Manually mapped to supplier `1005010702804982`, blue variant matching Shopify imagery; U.S. service observed at US$1.99, 8–14 days | Draft; exact blue SKU passes Canada at US$1.99 shipping, 8–13 days |
| Jade Roller Face Massager | Product was absent from DSers | Manually mapped to supplier `1005007306650500`, exact green three-piece set shown in Shopify; Canada and U.S. each return tracked service at US$2.15, 7–12 days | Draft; dual-country shipping passes; hygiene/beauty hold |
| Resistance Bands Set - Exercise & Fitness | Product was absent from DSers | Manually mapped to supplier `1005012631059934`, five-piece set; Canada and U.S. each return tracked service starting at US$4.81, 7–13 days | Draft; dual-country shipping exists, but landed cost exceeds storefront price; margin and safety hold |
| Cute Duck Night Light | Product was absent from DSers | Manually mapped to supplier `1005012147341925`, exact one-piece variant; U.S. quote US$7.83 + US$1.99, 7–13 days, stock 7,993 | Draft; Canada passes at US$2.15 shipping, 7–12 days; electrical review pending |
| USB Heated Cushion 43x43cm Electric Blanket | Product was absent from DSers | Manually mapped to supplier `1005006143148909`, exact 5V USB Grey-China Mainland SKU; Canada returns US$1.99, 7–12 days and U.S. returns US$1.99, 8–13 days | Archived; dual-country shipping passes; electrical compliance hold |
| RGB LED Strip Lights 5m-30m with APP Control | Product was absent from DSers | Manually mapped to supplier `1005010128533688`, Bluetooth 44-key app/white/30 m configuration matching the 100 ft Shopify image; U.S. service US$1.99, 6–11 days | Draft; U.S. passes, exact mapped SKU has no Canada shipping; replace supplier and retain electrical hold |

## Newly imported products

All nine Shopify products previously absent from DSers were imported on 2026-07-26. Eight have now been manually mapped to visually and variant-matched AliExpress suppliers. `Custom Neon Sign` remains the sole unmapped product: its Shopify listing has only `Default Title` and no customer-personalization field, so mapping it to a made-to-order supplier would create unfulfillable orders. Keep it Draft and unavailable until the storefront captures customization details and a supplier workflow is tested.

## Mermaid costume supplier mapping

The Draft Mermaid costume has 20 Shopify variants, but the DSers supplier selector exposes only seven exact selectable SKUs. Those seven were checked for Canada and the United States and returned tracked AliExpress Selection Standard service from China. Thirteen Shopify variants have no selectable supplier fulfillment path and are recorded as mapping failures in the variant worksheet.

The product remains Draft and held even for the seven shipping-passing SKUs. Activation requires:

1. Remap or remove every non-selectable Shopify variant.
2. Verify textile composition and accurate size measurements.
3. Obtain labeling and children's apparel flammability evidence.
4. Remove or substantiate ambiguous cosplay and costume claims.

## Store-level fulfillment blocker resolved

Managed Markets was turned off on 2026-07-26 after Shopify confirmed that Managed Markets orders could be fulfilled only with Global-e labels and rates. That path was incompatible with direct DSers supplier fulfillment.

The Canada, U.S., and United Kingdom markets remain active under standard Shopify Markets. The U.S. shipping zone was simplified to:

- Standard Shipping: CA$7.99 for orders below CA$75 (displayed as US$6.00 in the U.S. checkout test).
- Free Shipping Over $75.

The duplicate Standard International rate and the unsupported 1–2 business-day Express International promise were removed. A fresh `Travel Pet Water Bottle` checkout using a non-personal New York address returned one real shipping method, `Standard Shipping` at US$6.00. The prior `Shipping not available` blocker is resolved.