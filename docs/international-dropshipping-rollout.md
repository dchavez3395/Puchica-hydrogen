# Puchica International Dropshipping Rollout

## Decision

Puchica should not be configured as Canada-only. Its launch market set should be an English-language, western-market group, enabled only where the mapped supplier can deliver a quoted, tracked service at a profitable price.

This is not one global shipping rule. Supplier cost, delivery time, duties, tax collection, payment fees, and conversion all vary by market and sometimes by product variant.

## Launch order

| Wave | Markets | Why | Gate before enabling |
| --- | --- | --- | --- |
| 1 | Canada and United States | Core North American launch pair | Every featured or advertised exact SKU must pass both countries |
| 2 | Mexico | First Spanish-language expansion and third North American market | Mexico-specific tracked quotes, checkout, MXN pricing, duties/tax, returns, policies, and support pass |
| 3 | Spain | Spanish-language European expansion | Spain-specific route and margin proof plus the applicable EU tax, privacy, returns, and consumer-policy review |
| 4 | Selected Latin American countries | Expand only where demand and operations justify it | Approve each country independently; never treat Latin America as one shipping zone |
| 5 | United Kingdom, Australia, New Zealand, and other selected EU countries | Later diversification | Country-specific quote confirmation, policy review, and local-currency pricing pass |

Having an `es` storefront does not enable any Spanish-speaking market. Language,
selling market, currency, checkout availability, shipping zone, supplier route,
and policy eligibility are separate controls.

Do not open "Rest of world" just because it is available in Shopify. It hides delivery-cost, customs, and support risk inside a misleading shipping promise.

## Required market matrix

For each mapped *variant*, capture the cheapest normal tracked shipping method and the realistic delivery range for the following benchmark destinations:

| Market | Benchmark destination | Purpose |
| --- | --- | --- |
| Canada | Toronto, ON; Vancouver, BC; Winnipeg, MB; one remote postal region | Core market and domestic geographic spread |
| United States | New York, NY; Los Angeles, CA; Dallas, TX | Coasts plus central delivery coverage |
| Mexico | Mexico City; one northern and one southern benchmark | First Spanish-language market; test regional route and duty variation |
| Spain | Madrid; one non-mainland benchmark before broad coverage | Spanish-language EU market with separate delivery and policy exposure |
| United Kingdom | London | UK pricing and tax/shipping test |
| Australia | Sydney | Long-haul shipping-risk test |
| New Zealand | Auckland | Remote English-language market test |
| EU (later) | Germany and France | Separate VAT/customs and delivery checks |

Record the supplier link, check date, variant, product cost, supplier shipping, total landed supplier cost, shipping method, ETA, tracking availability, stock, and DSers mapping status. A quote is stale after a supplier changes it, so recheck featured products weekly and the full catalog monthly.

## Pricing rule

Calculate independently for each market:

```text
Contribution before advertising =
customer product price
+ customer shipping collected
- supplier item cost
- supplier shipping
- payment processing fee
- discount/refund buffer
- applicable tax or duty cost absorbed by Puchica
```

Use the **highest normal tracked supplier shipping quote** among the benchmark destinations in an enabled market when setting the initial product floor. Do not use an untracked loss-leader method to make a price look viable.

Until Shopify Payments fees are verified in Admin, do not bulk-change prices based on a guessed fee. Treat the existing price audit as preliminary and hold a conservative refund/FX buffer in the model.

If a product cannot meet the price floor while staying competitive in that country, it should be excluded from that market or remapped to a better supplier—not universally marked up.

## Shopify configuration standard

1. Create a Shopify Market for each enabled country group; make Canada and the US distinct markets.
2. Use local currency display where Shopify Markets supports it; set market-specific rounded prices only after landed-cost validation.
3. Create shipping zones only for markets with supplier-backed delivery coverage. Show honest delivery timing at checkout and avoid fixed "free worldwide shipping" promises.
4. Confirm tax collection and duty handling for each market before orders are accepted. EU/UK requirements deserve separate review before Wave 3.
5. Ensure the shipping, returns, privacy, and contact pages describe the actual international process without claiming local warehouses, guaranteed ETAs, or duty treatment that has not been confirmed.
6. Configure customer support and Klaviyo flows to state the customer’s market and delivery expectations correctly.

## DSers / supplier operating rule

Only allow a product into an enabled market when all conditions hold:

- The exact Shopify variant is mapped in DSers to a live supplier SKU.
- The supplier ships to that market using a normal tracked method.
- Landed supplier cost has been captured for the benchmark destination.
- Supplier stock, reviews, and variant details have been checked.
- The Shopify selling price leaves a positive contribution after shipping, fees, and buffer.
- The product does not create a prohibited, safety, electrical, sizing, or return-risk exception for that market.

Products with missing cost, a changed/out-of-stock supplier SKU, or no quote for a market remain unavailable there. This is preferable to accepting an order that cannot be fulfilled profitably.

For the initial launch assortment, a product must pass both Canada and the
United States. Once Wave 1 is stable, expansion products may be enabled only in
the individually approved countries; there is no automatic "all Spanish
markets" or "all Latin America" approval.

## Immediate next step

Remap the packing-cube lead offer to a supplier with tracked, profitable routes
for both Canada and the United States, then rerun the four-destination gate.
Apply the same dual-market test to the remaining active catalog before featuring
or advertising it. After Wave 1 is stable, build the Mexico matrix first, then
Spain, then evaluate Latin American countries individually. No price or market
activation should be made from this document alone.
