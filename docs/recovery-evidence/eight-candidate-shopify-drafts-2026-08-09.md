# Eight contained Shopify candidate drafts — 2026-08-09

## Outcome

The eight missing catalog build records were created in the connected Puchica Shopify store using `scripts/create-candidate-product-drafts.mjs --apply`.

All eight records were verified after creation with these safety conditions:

- Shopify status is `DRAFT`;
- publication count is `0`;
- there is one intended variant;
- the storefront approval tag is absent;
- no order, publication, ad, or supplier mapping was created.

| Product | Shopify product ID | Variant ID | Internal SKU | Price (CAD) | Status / publications |
|---|---|---|---|---:|---|
| White Luggage ID Tag | `9367269736698` | `50051764093178` | `PU-TRV-TAG-WHT-1` | 14.99 | Draft / 0 |
| Ten-Hole White Cable Organizer Clips | `9367269769466` | `50051764125946` | `PU-ORG-CLIP-WHT-10` | 14.99 | Draft / 0 |
| Six-Piece Metal Tube Squeezer Set | `9367269802234` | `50051764158714` | `PU-HOME-SQUEEZE-MET-6` | 24.99 | Draft / 0 |
| Semi-Circular Travel Jewelry Case | `9367269867770` | `50051764224250` | `PU-TRV-JEWEL-SEM-1` | 22.99 | Draft / 0; exact colour/media still HOLD |
| Large Blue Handled Clothes Storage Bag | `9367269933306` | `50051764289786` | `PU-HOME-CLOTH-BLU-L` | 29.99 | Draft / 0; Canada only |
| Black Hanging Travel Toiletry Organizer | `9367269966074` | `50051764322554` | `PU-TRV-TOIL-BLK-1` | 39.99 | Draft / 0 |
| Gray Travel Shoe Bag | `9367269998842` | `50051764355322` | `PU-TRV-SHOE-GRY-1` | 24.99 | Draft / 0 |
| White Small Wheeled Under-Sink Organizer Bin | `9367270031610` | `50051764388090` | `PU-HOME-BIN-WHT-S` | 29.99 | Draft / 0; separate small-space section |

## Remaining release gates

1. Link each Shopify draft to its exact private DSers supplier record without creating a duplicate product.
2. Retain only the approved supplier option and exact matching images.
3. Confirm option-level stock and both destination routes immediately before release; products with `No Shipping` remain hidden from that market.
4. Apply fixed U.S. market prices where approved.
5. Add exact dimensions and material only when supported by the exact supplier record.
6. Run CA and U.S. storefront, cart, checkout, currency, tax-presentation, analytics, accessibility, and SEO smoke tests.
7. Add the approval tag and publish only after every gate passes. Ads remain paused.

## DSers synchronization check

DSers My Products remained at 31 immediately after the Shopify draft creation. The `Import Products From Shopify` control did not ingest the drafts during the observed check. This is recorded as an unfinished mapping step rather than being treated as successful automation.
