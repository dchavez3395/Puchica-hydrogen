# DSers mapping verification — 2026-08-08

## Executive finding

The user's recollection is correct: the signed-in DSers **My Products** screen shows **29 products**, all **29 under AliExpress**, and **0 under Unmapped**. The catalog is therefore supplier-mapped at the DSers product level. Earlier language implying that the products were not mapped was incorrect and must not be reused.

This finding does **not** by itself prove that every Shopify variant is mapped correctly or that every selected supplier/SKU has a usable Canadian shipping route. Those are separate checks.

## Evidence and method

- Source: signed-in DSers account, `https://www.dsers.com/application/my_products`
- Store shown by DSers: `ug91ve-sz`
- DSers product tabs: `All (29)`, `AliExpress (29)`, `1688 Dropshipping (0)`, `Alibaba (0)`, `Unmapped (0)`
- Both DSers result pages were inspected read-only.
- DSers displayed a Canadian market cost, Canadian selling price and supplier stock for every product card.
- No supplier mapping, listing, setting, address, order or payment was changed.

## Status definitions

- **Mapped to AliExpress (product-level):** the product appears in DSers' AliExpress tab and not the Unmapped tab.
- **Selected mapped SKU inspected:** the DSers shipping drawer exposed the supplier listing title and selected supplier SKU.
- **Canada route verified:** the DSers shipping drawer was switched to Canada and returned a named method, ship-from country, cost, delivery estimate and tracking status.
- **Not fully inspected:** product-level mapping is proven, but every supplier SKU/Shopify variant pairing was not expanded.
- **Not inspected:** no Canada shipping-method result was captured for that product in this pass. It does not mean unavailable.

## Detailed route evidence captured

### Smart Pet Feeder

- Shopify product: `Smart Pet Feeder — Automatic WiFi Dog & Cat Food Dispenser with App Control & Voice Recording`
- DSers product ID: `2085219068647964672`
- Supplier item: `Smart Pet Feeder Automatic Cat Feeder Dog Slow Food Machine With Timed Quantitative Automatic Cat Food Dispenser Cat Dog Bowl`
- Selected supplier SKU: `Black Button Feeder`
- Ship to: Canada
- Method: AliExpress Selection Standard
- Ship from: China
- Shipping: Free Shipping
- Estimate: 8–15 days
- Tracking: Available

### Fingerprint Smart Padlock

- Shopify product: `Fingerprint Smart Padlock — Keyless USB Rechargeable Biometric Security Lock for Gym, School & Travel`
- DSers product ID: `2085218776103649280`
- Supplier item: `KERUI Fingerprint Padlock for Door Keyless Outdoor Waterproof Padlock USB Rechargeable Security Padlock Easy to Use`
- Selected supplier SKU: `2pcs padlock`
- Ship to: Canada
- Method: AliExpress Selection Standard
- Ship from: China
- Shipping: US $1.99
- Estimate: 8–13 days
- Tracking: Available

## What the product cards prove

The accompanying CSV records all 29 products, DSers IDs, DSers cost ranges, Canadian cost ranges, Canadian selling prices and displayed supplier stock. Every row is product-level mapped. Only the two rows above have selected-SKU and Canadian-route evidence from the shipping drawer; the other 27 are intentionally labeled `Not fully inspected` / `Not inspected`, not `Unmapped` or `Unavailable`.

## Important commercial cautions visible now

- Several mapped products have a highest Canadian cost above or very close to the current Canadian selling price. Examples include the 70mai dash cam, KAWA dash cam, Trustfire flashlight and 4K dash cam. These require variant-specific economics before publication.
- DSers stock is supplier-reported stock, not evidence that Shopify's placeholder inventory values are correct.
- A Canadian price on the DSers card is not the same as a Canadian shipping quote. Route verification must be captured in the shipping drawer for each launch variant.
- The DSers drawer describes shipping information as an estimate. Final checkout behavior and current supplier availability still require a pre-launch check.

## Correct next action

Do not remap or discard the catalog. Rank the existing 29 products first, then expand and verify the exact supplier SKU plus Canadian route for the strongest candidates. Only replace a supplier or product when that evidence fails.

Full row-level evidence: `dsers-mapping-verification-2026-08-08.csv`.
