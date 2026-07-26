# Storewide mapping resolution ? 2026-07-26

These Shopify-only drafts were checked against the complete 57-product DSers mapped snapshot. They have no supplier SKU evidence and remain excluded.

| product | Shopify state | DSers matches | disposition | evidence | next action |
| --- | --- | ---: | --- | --- | --- |
| 6-Piece Silicone Spatula Set | DRAFT | 1 | MAPPED_SYNC_REQUIRED | Manually mapped to supplier 1005012286537204; Canada and U.S. shipping pass, while Shopify supplier metadata remains incomplete. | Keep Draft until cost, SKU, stock, pricing, and both-country checkout are re-read after synchronization. |
| Custom Neon Sign | DRAFT | 0 | CONFIRMED_UNMAPPED_KEEP_EXCLUDED | No title match in the 57-row DSers mapped-product snapshot; Shopify gate reports zero supplier SKUs. | Keep Draft and excluded. Archive if unwanted, or deliberately import/map a verified supplier before quoting. |
| Jade Roller Face Massager | DRAFT | 1 | MAPPED_RISK_HOLD | Exact mapped supplier set passes Canada and U.S. shipping; Shopify supplier metadata remains incomplete. | Keep Draft for hygiene/beauty review and synchronization. |
| Multi-Compartment Desk Organizer | DRAFT | 1 | MAPPED_SYNC_REQUIRED | Manually mapped in DSers to AliExpress supplier 1005010702804982 and the exact blue SKU passed Canada and U.S. quotes; Shopify still reports a blank SKU, CA$0 unit cost, and placeholder inventory 999. | Keep Draft and excluded until DSers-to-Shopify supplier metadata and inventory synchronize; then re-read cost, stock, storefront visibility, and both-country checkout. |
| Portable Mini Bag Sealer — Handheld Heat Sealer | DRAFT | 1 | MAPPED_REPLACEMENT_REQUIRED | Exact mapped white SKU passes U.S. shipping but has no Canada service; searched replacements fail margin. | Keep Draft; replace supplier or reject. |

## Operating rule

Do not quote or activate these products unless a supplier is deliberately imported/mapped and the resulting SKU, stock, cost, and country-shipping evidence is re-audited.
