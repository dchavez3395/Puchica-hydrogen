# DSers shortlist route verification — 2026-08-08

## Scope

Read-only deep check of six existing products already proven mapped to AliExpress in DSers. The audit captures DSers product cost and stock for all six. Supplier-SKU and Canadian route detail was completed for the brushless drill before the DSers session redirected to sign-in. The other five remain mapped, but their supplier SKU and route are intentionally labeled `Inspection interrupted — sign-in required`.

No mapping, supplier, setting, address, order or payment was changed.

## Critical finding: brushless drill

- Shopify product: `Brushless Electric Drill Kit — 21V Cordless Impact Driver with 2 Batteries & 30+ Accessories`
- DSers product ID: `2085219052449824768`
- Supplier item: `Brushless Electric Drill Tapping Cordless Impact Drill Metal Ratchet Chuck Electric Hand Drill Household Electric Screwdriver`
- Selected supplier SKU: `80N.m Two-speed-EU`
- DSers cost: `$46.31–48.32` / `CA$64.60–67.41`
- DSers stock: `319`
- Canada method: AliExpress Selection Standard
- Ship from: China
- Canada shipping cost: Free Shipping
- Canada estimate: 9–15 days
- Tracking: Available

### Approval consequence

The selected supplier SKU is explicitly an **EU-plug option**. Even though DSers returns a Canadian route, this variant should **not** be approved for Canada unless the Shopify offer clearly and intentionally sells that EU-plug configuration, or the supplier mapping is changed to a Canadian-compatible option and then reverified. Shipping availability does not solve electrical compatibility.

## Remaining five

All five continue to show as product-level AliExpress mappings in DSers, with Canadian cost/price and supplier stock on their product cards. Deep supplier-SKU and route inspection was interrupted when DSers redirected the audit tab to its account login page. This is an authentication interruption, not evidence of an unavailable route or broken mapping.

| Product | DSers cost | CA cost | CA price | DSers stock | Deep status |
|---|---:|---:|---:|---:|---|
| Boykeep 2K pet camera | $22.85–26.05 | CA$31.88–36.34 | CA$98.79 | 4,655 | Sign-in required to inspect SKU/route |
| Essager magnetic wireless car charger | $12.44–15.32 | CA$17.35–21.37 | CA$66.69 | 9,999 | Sign-in required to inspect SKU/route |
| Mini 2-in-1 hair straightener/curling iron | $5.61–6.31 | CA$7.83–8.80 | CA$55.35 | 75,660 | Sign-in required to inspect SKU/route |
| Cordless hair straightener brush | $15.98 | CA$22.29 | CA$63.00 | 49,988 | Sign-in required to inspect SKU/route |
| Wireless milk frother | $7.85–8.81 | CA$10.95–12.29 | CA$68.97 | 19,978 | Sign-in required to inspect SKU/route |

## Resume point

After DSers is signed in again in Chrome, reopen `My Products` and inspect the shipping drawer for the five remaining product IDs listed in the CSV. Record the exact selected supplier SKU, then select Canada and capture the named method, cost, ETA, ship-from country and tracking. Do not infer route support from the Canadian price card alone.
