# Delivery and market audit — 2026-07-25

## Verified current state

- **Enabled Shopify Markets:** Canada (primary) and United Kingdom.
- **Disabled Markets:** U.S., Australia and New Zealand, and LaTam. The U.S. is therefore not a live customer market, regardless of delivery-rate records.
- **General delivery profile location:** `woodland`.
- **No active launch products:** delivery settings must not be used as evidence that a mapped DSers product can be sold or delivered.
- **Shipping policy corrected on 2026-07-25:** removed the unverified 1–2 business-day processing promise. The policy now states that preparation time varies by item, destination, and supplier availability, with options and estimates confirmed at checkout.

## Active checkout rates found in the General profile

| Destination zone | Active fixed rates observed | Important note |
| --- | --- | --- |
| Canada | Standard Shipping CA$7.99; Express CA$20.00; Free Shipping Over $75 | Confirm the delivery estimates and supplier cost for each approved product before marketing these rates. |
| U.S. cross-border | CA$7.90, CA$19.90, CA$29.90, CA$0.00 Standard International; CA$34.90 Express International; CA$7.99 Standard Shipping; Free Shipping Over $75 | The U.S. Market is disabled. Several overlapping rates need consolidation before enabling it. |
| United Kingdom / International zone | Standard International CA$12.99; Free International Shipping; carrier-labelled DHL/FedEx/Canada Post methods | UK is enabled. Do not imply a carrier service or delivery window until a mapped supplier quote verifies it. |
| All other countries | Standard International CA$14.99; Free International Shipping; carrier-labelled DHL/FedEx methods | This zone is not a reason to open global sales: its available Shopify Market and each SKU's supplier support still need verification. |

## Gate to reopening markets

1. Repair DSers variant mappings for the exact product/variant to be sold.
2. Quote that variant to a Canadian address, then a U.S. and UK address if those markets are in scope; capture cost, delivery window, tracking, and exclusions.
3. Set one clear, non-overlapping rate strategy per market. Do not leave multiple competing U.S. standard rates visible at checkout.
4. Test checkout through the Hydrogen storefront and the branded checkout domain for Canada first, then each additional market.
5. Enable the U.S. Market only after steps 1–4 pass; expand further only per product-specific supplier evidence.

## Recommendation

Keep Canada as the proof market. Prepare the U.S. as the next market—not all western markets at once—because it has the clearest existing zone but is currently disabled and contains overlapping rate definitions. The UK is enabled, but no active catalog or verified DSers mapping currently justifies traffic there.
