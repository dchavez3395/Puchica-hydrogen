# Supplier economics decision — 2026-08-08

## Decision

**Zero current products pass the Canada or United States economics gate.**

The only currently Active product carrying explicit DSers mapping evidence is
the Naturehike NH20SN010 toiletry bag. It is quarantined in both markets. Its
Shopify tags are not a supplier quote, all six variants have only 4–12 units of
recorded inventory, Canada has no route tag at all, and no exact item cost,
shipping charge, delivery estimate, tracking proof, duty treatment, or mapped
supplier option was available for this review.

This is an **evidence-record conclusion, not a claim that DSers is unmapped**.
The owner reports manually mapping most products for Canada. That work can be
valid in DSers while remaining invisible to Shopify and this repository. The
catalog therefore records those products as `DSERS_STATE_NOT_INSPECTED`, not
`UNMAPPED`, until the exact My Products mapping rows and Canada quotes are
captured.

The historical red five-piece packing-cube record is not a launch approval. It
is no longer in the current Active catalog, and its August 1 quote was a
country-level supplier-page observation without fresh ZIP-level delivery,
tracking, checkout, or fulfillment proof.

## Evidence accessed

- Current read-only Shopify Admin catalog and variant data captured on
  2026-08-08 in `shopify-admin-catalog-2026-08-08.json`.
- Current Storefront API prices for Canada and the United States for all six
  Naturehike variants.
- Repository DSers and supplier records, including the August 1 packing-cube
  audit and control documents.
- Current manufacturer/reseller web evidence identifying the mapped Naturehike
  model as **NH20SN010**, with matching S/L dimensions and option families.
- Shopify's current Canadian documentation: rates vary by plan; local-currency
  conversion outside the payout currency can add a 2% fee. Because the exact
  account rate was not captured, the current worksheet uses a conservative
  **3.5% + 0.30** payment assumption and a **5% refund/defect reserve**.

The authenticated DSers tab was visible but could not be read reliably during
this pass. Repeated read-only tab claims timed out. Direct AliExpress browser
navigation was blocked by browser safety policy. Neither limitation is filled
with inferred data: every unavailable value is `UNKNOWN` and fails closed.

## Margin threshold used

For each currency-specific row:

```text
revenue = merchandise price after active promotion
payment fee = revenue × 3.5% + 0.30
refund/defect reserve = revenue × 5%
max landed cost at 30% margin
  = revenue - payment fee - reserve - (revenue × 30%)
```

`Landed cost` must include the ordinary, repeatable supplier item price,
tracked supplier shipping, Puchica-paid duties/brokerage, automation/order
charges, handling, and packaging. Welcome prices, coins, coupons, flash sales,
and customer-acquisition offers are not accepted as repeatable supplier cost.
Customer-paid shipping and duties contribute zero to the base model until
checkout and policy evidence proves the retained amount and responsibility.

## Price-position warning

Puchica currently asks **CA$40.23–73.45 / US$30–54** for NH20SN010. Current
matched-model evidence outside Canada/US includes a US$12.92 unit listing, but
no clean ordinary Canadian or U.S. exact-model retail band was found. Naturehike
Canada separately sells comparable toiletry bags around CA$5.99–16.99 and
waterproof bags across a broader CA$14.99–49.99 promotional/reference range.
Those are market context, not supplier cost and not proof of exact equivalence.
They nevertheless make the current Puchica price position a serious risk that
must be resolved before creative or ads.

## Required next evidence — exact order

1. Open NH20SN010 in DSers and capture the exact supplier URL/ID and mapping for
   every Shopify option. Do not rely on the product-level `dsers-mapped` tag.
2. Record ordinary item cost, stock, source warehouse, and exact selected
   option. Exclude every conditional/new-customer price.
3. Quote one Canadian postal code and two representative U.S. ZIP codes with a
   normal tracked method; capture cost, ETA, tracking, and quote timestamp.
4. Confirm checkout currency, active discount, payment rate, shipping charged,
   and customer duty language separately for each market.
5. Recalculate the worksheet. The lowest-margin sellable variant must retain at
   least 30% contribution and inventory of at least 25.
6. If NH20SN010 fails price competitiveness or inventory, stop work on it and
   source a different non-electrical organization/travel product. Do not raise
   price merely to rescue a poor supplier route.

## Sources

- Shopify Canada pricing and payments documentation:
  https://www.shopify.com/ca/pricing
- Shopify local-currency fee documentation:
  https://help.shopify.com/en/manual/markets/customizations/local-currencies
- Matched NH20SN010 model and dimensions:
  https://naturehike.com.vn/san-pham/tui-dung-do-ve-sinh-ca-nhan-naturehike-nh20sn010/
- Matched NH20SN010 global unit-price context:
  https://www.yoycart.com/Product/628637158427/
- Naturehike Canada category price context:
  https://naturehike.ca/en/collections/voyage
