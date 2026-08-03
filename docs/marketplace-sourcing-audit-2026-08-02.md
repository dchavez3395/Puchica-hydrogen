# Marketplace sourcing audit - 2026-08-02

## Decision

The authorized Shopify Collective, DropCommerce, and Syncee browse cycle is
complete. **No exact product passed.** Puchica must not import, publish, order,
or advertise any product found in this cycle.

This is a sourcing-model failure for the current offer criteria, not proof that
the travel-organization customer problem has no demand. The next step is a
controlled product-strategy reset, not another marketplace subscription and not
paid traffic to the existing catalog.

Status: `MARKETPLACE_CYCLE_COMPLETE_NO_APPROVED_SKU_PAID_HOLD`.

## Control used

Each candidate needed an exact, tracked route to both Canada and the United
States, adequate stock, supportable returns, a demonstrable customer benefit,
competitive everyday pricing, and landed contribution that could absorb fees,
refund risk, and customer acquisition. The planning preference was at least 50%
landed gross margin; anything below 40% was rejected before advertising.

No supplier was connected. No product was imported, added to an import list,
published, ordered, or paid for. No trial or paid plan was started.

## Shopify Collective

The Canadian Discovery catalog was filtered to at least 45% retailer margin and
C$75-C$120 retail, then searched for travel pouches, toiletry bags, packing,
luggage, cable organizers, storage, and crossbody products.

The only relevant high-margin lead was Annicklevesque's Small Leather Crossbody
Bag, Marie-Pierre, Black at C$99.99 retail, C$50 reported profit, and 50%
retailer margin. Both variants displayed zero stock. The listing shipped from
Canada and typically shipped in four days, but the inspected evidence did not
prove a U.S. route. It failed inventory and dual-market proof.

Result: `FAIL_NO_IN_STOCK_DUAL_MARKET_HERO`.

## DropCommerce

DropCommerce was installed for its no-cost catalog access. Representative exact
checks were:

| Product | Catalog economics | Shipping evidence | Result |
| --- | --- | --- | --- |
| Canopy Verde Kane Makeup Bag | US$27 supplier, US$45 retail, 40% displayed margin, five units | US$8; Canada US$17; five-day processing; displayed transit 0-0 days | Fail: margin, stock, Canada cost, and unusable transit evidence |
| Room for Two Dopp Kit | US$80 retail, 30% displayed margin, 24 units | US$5 and 4-12 days; no Canada route displayed | Fail: margin and Canada |
| Luxury Cable Organizer, set of four | US$21 supplier, US$30 retail, 30% displayed margin, 47 units | US$5 and 4-12 days; no Canada route displayed | Fail: margin, retail band, and Canada |

Broader searches for packing cubes, travel organizers, cable organizers,
crossbody bags, and weekenders returned irrelevant items or products whose
supplier costs were too high for the intended offer.

Result: `FAIL_NO_DUAL_MARKET_AD_VIABLE_PRODUCT`.

## Syncee

Syncee AI Dropship was installed from its Shopify App Store listing and audited
without accepting the displayed three-day trial or the C$1 promotional plan.
The free catalog remained searchable.

Most exact packing-cube results showed only 11%-25% catalog profit relative to
the supplier price and often failed the current Canadian destination. Examples:

- NNE Living's six-piece compression packing-cube set showed C$71.86 supplier
  cost, C$18 catalog profit, shipped from Australia, and did not serve the
  current default destination.
- Bugatti Collections' Packing Cubes showed C$23.99 supplier cost and C$6
  catalog profit. It shipped from the United States with a displayed 1-3 day
  estimate but cost C$21.02 to ship to Canada.

A 40%-and-up search surfaced TORONATA's Salida leather cable organizer. It
showed C$47.64 supplier cost, C$69 profit, and 144%; that percentage is markup on
cost, not landed gross margin. It shipped from the United States with a 1-3 day
estimate and Canada shipping from C$21.02, with possible incremental fees.

The manufacturer's direct price was US$71.99. At the Bank of Canada's July 27
indicative USD/CAD rate of 1.4114, that is approximately C$101.62. The observed
C$68.66 supplier cost plus Canada shipping leaves only about C$32.96 before
payment fees, returns, apps, duties, support, or advertising. Raising the price
to the Syncee-implied C$116.64 would exceed the manufacturer's direct price
before customer shipping and would still not clear Puchica's preferred landed
margin. Other sellers and a competing dropship listing exposed the same item,
adding commodity and price-comparison risk.

Result: `FAIL_MISLEADING_HEADLINE_MARKUP_AND_WEAK_LANDED_ECONOMICS`.

## What this means

Do not keep paying with time or subscriptions for the same marketplace search.
The next product decision should compare three operating models on equal terms:

1. a Canada-first micro-wholesale or direct brand partnership with explicit
   U.S. fulfillment;
2. a single-country initial offer, only if the owner deliberately relaxes the
   current dual-market rule;
3. an organic-first low-CAC product where lower contribution can be viable
   without paid acquisition.

The default recommendation is **model 1**. Keep the broader Puchica brand and
travel-organization creative direction reversible while sourcing a genuinely
distinct bundle or locally held product. Do not rebuild the site or create ads
until one exact SKU passes the landed-cost worksheet.

## Next controlled sprint

- Define one buyer, one travel moment, and one measurable job-to-be-done.
- Create a 20-supplier Canada/United States direct-outreach list outside the
  three audited marketplaces.
- Ask for wholesale cost, both-country rates, dispatch and transit, carrier,
  stock, minimum order, blind shipping, returns, damage/loss treatment, image
  rights, and price-policy terms using one standard evidence form.
- Benchmark the exact item against the manufacturer and at least three current
  retailers before accepting a margin claim.
- Advance at most three candidates to the full unit-economics sheet.
- Require one approved hero and one support SKU before storefront/creative work.
- Keep paid media at `PAID_HOLD`; organic research and non-claim creative
  exploration may continue.

## Public benchmark source

- TORONATA Salida product page:
  https://www.toronata.com/products/salida-travel-pouch-and-premium-leather-cable-organizer
- Bank of Canada daily digest: https://www.bankofcanada.ca/rates/daily-digest/
- Syncee Shopify App Store listing: https://apps.shopify.com/syncee-1
- DropCommerce Shopify App Store listing: https://apps.shopify.com/dropcommerce
