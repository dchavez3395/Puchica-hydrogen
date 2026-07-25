# Puchica Pricing Audit - July 2026

This is a first-pass pricing and supplier-risk audit using:

- Shopify Admin product pricing sampled on July 21, 2026.
- DSers `My Products` screenshots showing `Price for CA`, product cost, Shopify price, and supplier warnings.

No storefront UI changes were made for this audit.

## Immediate Findings

1. Shopify product cost is not populated.
   The sampled active products all returned `inventoryItem.unitCost: null`, so Shopify cannot calculate margin by itself. DSers is currently the source of truth for supplier cost and Canada landed estimate.

2. DSers has supplier-risk warnings on multiple products.
   Products marked `supplier product out of stock`, `supplier SKU has changed`, `supplier SKU out of stock`, or `supplier product not found` should be treated as `Remove/Fix` before any ads.

3. Some compare-at prices are invalid.
   Several Shopify variants have compare-at prices below the live price. That damages sale credibility and can break sale collection logic.

4. A volume dropshipping model still needs contribution margin.
   We do not need luxury margins, but ad-test products should generally sell for at least 2.5x Canada landed cost. Organic-only products can be thinner.

## Pricing Buckets

## DSers Screenshot Pass - July 21, 2026

Screenshots reviewed: DSers `My Products > AliExpress`, 176 products, 100 per page. This pass is based on visible DSers Canada landed cost, Shopify price, stock, and obvious product/ad risk. Because screenshots are not a true export, use this as a triage list, not a final bulk-edit source.

### Stronger Ad-Test Candidates

These have clearer utility, simple creative angles, and visible pricing that can plausibly support paid tests:

- Under-Cabinet Jar Opener: cost about CA$3.40, price about CA$23.64.
- Glass & Windshield Repair Kit: cost about CA$5.20, price about CA$23.00.
- Ginger Shampoo Bar: cost about CA$6.05, price about CA$28.58.
- Garden Hose Splitter 4 Way: cost about CA$6.99, price about CA$22.27.
- Full Spectrum Gooseneck LED Grow Light: cost about CA$10.87-11.01, price about CA$41.83.
- 1080 Degrees Rotating Faucet Extender: cost about CA$7.61, price about CA$31.99.
- Rope Knot Dog Chew Toy: cost about CA$7.24-7.28, price about CA$25.71.
- High-Pressure Air Swirl Cleaning Tool: cost about CA$5.09, price about CA$52.99. Verify product quality before ads, but the margin is interesting.
- Face Down Pillow: cost about CA$3.97, price about CA$28.99. Good problem/comfort angle if product page is clean.
- Fuzzy Thigh High Warm Socks: cost about CA$2.72-3.45, price about CA$27.85. Seasonal/lifestyle product, low cost.
- Fruit & Vegetable Fresh-Keep Storage Box: cost about CA$4.78-5.39, price about CA$15.34. Better as add-on or bundle than standalone ad.
- Golf Ball Finding Glasses: cost about CA$7.15, price about CA$14.63. Price is too low for ads unless repriced.

### Organic-Only / Browse Catalog

These can remain in the store if suppliers are healthy, but they are generic, bulky, seasonal, hard to prove, thin-margin, or higher return risk:

- High Lumen Rechargeable Flashlight.
- High-Pressure Shower Head variants.
- High-Pressure Water Gun.
- Solar Power Bank.
- High-Quality HD Mini Home Cinema Projector.
- High-Quality Training Collar.
- Gaming Laptop Cooling Pad.
- USB Condenser Gaming Microphone.
- Full Face Anti Fog Underwater Scuba Diving Mask.
- Full Coverage Heated Seat Cushion.
- Fun & Strategic Magnetic Chess Game.
- Folding Step Stool.
- Foldover Collar Aviator Jacket.
- Men's coats, trousers, shirts, pajamas, blouses, and seasonal apparel.
- Halloween and Christmas decor.
- Giant inflatables, giant plush items, and bulky seasonal toys.

### Verify or Fix Before Selling

These need DSers detail-page verification before ads or featured placement:

- Gentle Electric Hair Trimmer: visible cost appears missing/zero with stock at 0.
- Any product showing `Cost --`, stock 0, or a non-Canada price row.
- Formula Feeding Milk item, Foot Smoothie item, and other items with struck-through cost values: verify supplier and mapped variant health.
- Solar Firefly LED String Lights: previously showed supplier SKU warning; do not advertise until remapped/confirmed.
- Hernia Belt: previously showed supplier SKU changed; remap before selling.
- High-Impact RC Stunt product: previously showed SKU out of stock; remap before ads.
- High-Pressure Steam product: previously showed SKU changed; remap before ads.
- Any product with very wide landed-cost ranges, especially when the default Shopify variant may not be the low-cost variant.

### Pricing Rule Updates From DSers Pass

- Low-cost utility products under CA$8 landed should generally sell at CA$19.99-29.99 unless perceived value is weak.
- Products over CA$20 landed should not be ad-tested unless the product page has trust proof, clear specs, and a strong margin.
- Apparel should mostly stay organic. It has sizing/return risk and is harder to differentiate.
- Bulky seasonal products should be hidden from homepage/ads unless seasonally relevant and supplier stock is confirmed.
- Do not advertise any product with supplier warnings, missing cost, stock 0, or a non-Canada shipping/cost row.

### Ad Test

Use for products with:

- No DSers warning.
- Clear use case from image/title.
- Canada landed cost below about CA$15.
- Shopify price around CA$24.99 to CA$49.99.
- At least 2.5x landed cost, ideally 3x+.

First-pass candidates from screenshots:

- Rope Knot Dog Chew Toy: DSers cost about CA$5.15-6.58, Shopify price about CA$25.71.
- Under-Cabinet Jar Opener: DSers cost about CA$3.40, Shopify price about CA$23.64.
- Ginger Shampoo Bar: DSers cost about CA$6.05, Shopify price about CA$28.58.
- Glass & Windshield Repair Kit: DSers cost about CA$5.20, Shopify price about CA$23.00.
- Fruit Fly Trap with Hanging Cover: DSers cost about CA$3.09-12.45, Shopify price about CA$18.99.
- Fun Interactive Cat Toys: DSers cost about CA$13.90-14.42, Shopify price about CA$30.64.
- Garlic Press Rocker Set: DSers cost about CA$10.29, Shopify price about CA$23.71.
- Garden Hose Splitter 4 Way: DSers cost about CA$6.99, Shopify price about CA$22.27.
- Full Spectrum Gooseneck LED Grow Light: DSers cost about CA$10.87-11.01, Shopify price about CA$41.83.
- 1080 Rotating Faucet Extender: DSers cost about CA$7.61, Shopify price about CA$31.99.

### Organic Only

Use for products that can live in the catalog but likely cannot support paid ads at current pricing.

- High Lumen Rechargeable Flashlight: DSers cost about CA$15.04-23.26, Shopify price about CA$35.99.
- High Pressure Shower Head: DSers cost about CA$10.06, Shopify price about CA$34.83.
- Dual-Blade Peeler: DSers cost about CA$8.40-8.43, Shopify price about CA$18.99.
- Garden Lawn Water Sprinkler: DSers cost about CA$12.41, Shopify price about CA$27.85.
- Folding Step Stool: DSers cost about CA$12.39-13.01, Shopify price about CA$23.99.
- Night Driving Glasses: DSers cost about CA$7.15-7.43, Shopify price about CA$11.99.

### Reprice

Products where the current price may be too close to cost, too inconsistent across variants, or too low for ads.

- Fruit & Vegetable Fresh-Keep Storage Box: DSers cost about CA$4.78-5.39, Shopify price about CA$15.34. Consider CA$19.99 if quality/perceived value supports it.
- Fruit Fly Trap with Hanging Cover: cost range is wide. Keep only if default sellable variant lands near the low end; otherwise reprice.
- Solar Firefly LED String Lights: DSers warning appears on screenshot and cost range about CA$8.77-14.94 vs Shopify price about CA$38.65. Fix supplier status before testing.
- High Pressure Water Gun: DSers cost about CA$55.74-62.44, Shopify price about CA$84.80. Too thin/risky for ads unless bundled or repriced.
- High-Quality 1000m Training Collar: DSers cost about CA$41.42-41.53, Shopify price about CA$153.41. Margin may be okay, but it is a higher-ticket trust/risk product; needs stronger product-page proof before ads.
- High-Quality Mini Home Cinema Projector: DSers cost about CA$19.27, Shopify price about CA$125.51. Potential margin is strong, but product quality/returns risk should be verified before ads.

### Remove/Fix Before Ads

Any product with DSers warning:

- Supplier product out of stock.
- Supplier SKU has changed.
- Supplier SKU out of stock.
- Supplier product not found.
- Cost missing or `Cost --`.

Visible examples from screenshots:

- Glossy Opaque Shiny H...: supplier product out of stock, cost missing.
- Fridge Lock 2-Pack: supplier product out of stock, cost missing.
- Fuzzy Pillow Phone Holder: supplier product out of stock, cost missing.
- 8FT LED Climbing Santa...: supplier product out of stock.
- Solar Firefly LED String Lights: supplier SKU out of stock.
- Hernia Belt: supplier SKU has changed.
- High-Impact RC Stunt...: supplier SKU out of stock.
- High-Pressure Steam...: supplier SKU has changed.
- High-quality Integrated...: supplier product out of stock.
- Ergonomic Fashion...: supplier product not found.
- Farmhouse Christmas...: supplier product out of stock.
- Glossy Opaque Shiny H... on page 1: supplier product out of stock.

## Compare-At Price Fixes

Shopify sample showed these compare-at prices lower than sale price:

- High Lumen Rechargeable Flashlight: price CA$35.99, compare-at CA$34.83.
- Gas Leak Detector: price CA$23.99, compare-at CA$22.27.
- Fruit Fly Trap with Hanging Cover: price CA$18.99, compare-at CA$18.09.
- Fun & Strategic Magnetic Chess Game: price CA$33.99, compare-at CA$20.91.
- Full Face Anti Fog Underwater Scuba Diving Mask: price CA$46.99, compare-at CA$39.99.
- Free Hanging Waterproof Car Trashcan Bin: price CA$29.99, compare-at CA$20.91.
- Folding Step Stool: price CA$23.99, compare-at CA$18.12.
- Eyewear Storage Box: price CA$16.99, compare-at CA$14.63.

Completed July 21, 2026: cleared the invalid compare-at prices for the 19 sampled variants above. Shopify verification showed all targeted variants now have `compareAtPrice: null`.

## Volume Pricing Rules

Use landed Canada cost from DSers, not Shopify cost.

| Landed CA Cost | Suggested Pricing Rule | Notes |
| --- | --- | --- |
| CA$0-5 | CA$14.99-19.99 | Good add-ons, but watch perceived value. |
| CA$5-8 | CA$19.99-29.99 | Strong impulse range. |
| CA$8-15 | CA$29.99-44.99 | Best zone for ad tests if product image/use case is clear. |
| CA$15-30 | 2.2x-2.8x landed cost | Organic first unless creative is strong. |
| CA$30+ | Case-by-case | Needs trust, proof, low return risk, and clear value. |

## Decision Rule

For each product:

```text
Net before ads =
Shopify price
- DSers CA landed cost
- estimated payment fee
- discount buffer
```

For quick screening:

- `Ad Test`: price >= 2.5x landed cost and no DSers warning.
- `Strong Ad Test`: price >= 3x landed cost, no warning, simple product use case.
- `Organic Only`: price is 1.8x-2.5x landed cost.
- `Reprice`: price is below 1.8x landed cost or compare-at pricing is misleading.
- `Remove/Fix`: supplier warning, no cost, no stock, SKU changed, or product not found.

## Next Actions

1. Export DSers My Products if possible.
2. Fix or unpublish products with supplier warnings.
3. Clear invalid compare-at prices in Shopify.
4. Build a 20-40 product `Ad Test` collection from no-warning, low-cost, clear-use-case products.
5. Keep the broad catalog for organic browsing, but only advertise the clean shortlist.

## Current launch validation sheet

The customer-facing catalog is intentionally smaller than the historical import.
Use [`supplier-price-validation-template.csv`](./supplier-price-validation-template.csv)
for every live SKU and destination before changing a price, turning on paid
traffic, or opening another market. Record the supplier item price, shipping,
payment fee, discounted sale price, delivery window, tracking availability, and
the actual DSers mapping result. A blank row is a hold, not an assumption.
