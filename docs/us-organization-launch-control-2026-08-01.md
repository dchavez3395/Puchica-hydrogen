# U.S. organization launch control — 2026-08-01

> **STATUS UPDATE:** The exact 24-piece drawer-tray route later returned
> `No Shipping` and is now `HOLD_ROUTE / NO_GO_QUOTE`. The red five-piece
> compression cube set is now `GO_LIMITED_TEST_READY` under a separate capped
> control. This file is historical context, not launch authorization. For
> current sequencing, gates, and advertising decisions, use
> `docs/ad-ready-launch-master-plan-2026-08-01.md`.

## Operating decision

Puchica will use the **United States as the current proof market** for the ten
new organization products created July 30–31. All ten are Active and carry
`puchica-launch-ready`, `dsers-mapped`, and `us-route-verified`. None carries
`ca-route-verified` or `canada-route-verified`, so Canada is an expansion market
only after exact Canadian variant quotes exist.

The coherent offer is practical organization for home, cables, and travel:

> Make room for what matters — at home and on the go.

The newest **30% pre-ad contribution gate** is authoritative. Older 20% screens
are historical and must not approve these products. A route tag proves that a
U.S. route check was recorded in Shopify; it does not supply exact current item
cost, shipping cost, delivery, or final contribution. Those landed-cost fields
are currently missing for all ten products in this control and must be filled
before promotion.

## Revenue baseline: no external sale yet

The live Shopify analytics read on 2026-08-01 covered the previous 30 days:

- 4,144 sessions;
- 53 sessions with an add-to-cart (1.28% of sessions);
- 29 sessions reached checkout;
- one completed checkout/order, Shopify #1001 for CA$13.85, placed by Daniel
  Chavez and still unfulfilled; this is an internal test, not an external sale;
- 1,884 sessions from the United States and 2,164 from Canada;
- 3,646 direct, 416 social (383 Facebook, 30 TikTok, 3 Instagram), and 78 search
  sessions; and
- 3,405 mobile sessions (82.2%).

Historical traffic does not validate this new assortment. The U.S. proof test
needs a distinct landing route and daily product-level report so its traffic is
not blended with the old catalog.

## Live launch assortment and commercial priority

The data below is a live Shopify read on 2026-08-01. Prices are Shopify Admin
values; confirm shop currency and the actual U.S. checkout price before using
them in a margin formula. Only the listed variant was sellable at the time of
the read; every other variant on each product reported unavailable.

| Priority | Product / sellable variant | Admin price | Shopify inventory | Role and gate |
| ---: | --- | ---: | ---: | --- |
| 1 | **24-Piece Drawer Organizer Tray Set** / `24PCS(6S14M4L)` | 69.76 | 145 | Primary hero. Strong transformation demo and order value. Quote/sample exact 24-piece variant. |
| 2 | **Red 5-Piece Compression Packing Cube Set** / `5PCS Set Red` | 71.45 | 989 | Travel hero. Validate zipper, compression, seams, color accuracy, packed size/weight. |
| 3 | **Gray 8-Piece Travel Packing Organizer Set** / `8PCS Gray` | 44.96 | 95 | Supporting travel set. Ensure exact eight-piece contents match media and description. |
| 4 | **Gray Travel Cable Organizer Pouch** / `Gray` | 40.73 | 9,916 | Strong cable/travel supporting item. Validate compartment dimensions and zipper quality. |
| 5 | **White Small Wheeled Under-Sink Organizer Bin** / `white S` | 29.00 | 26 | Home-organization alternate hero. Stock is close to minimum; quote immediately and verify dimensions/wheel function. |
| 6 | **Black Double-Layer Cable Organizer Case** / `Double Layers 1` | 29.00 | 65 | Supporting item. Customer option naming needs cleanup before traffic. |
| 7 | **Silver Stainless Steel Tube Squeezer** / `Silver` | 25.00 | 404 | Low-risk add-on. Validate tube-width compatibility and rust/edge quality. |
| 8 | **White Five-Slot Cable Organizer Strip** / `5 Holes-White` | 25.00 | 489 | Add-on. Validate adhesive retention, residue, surface compatibility and heat proximity limits. |
| 9 | **White 5-Clip Toocki Cable Organizer** / `1Pcs 5-Clips White` | 25.00 | 67 | Hold for brand/IP and title review before sourcing or traffic; also validate adhesive performance. |
| 10 | **50 kg Pocket Luggage Scale** / `B` | 22.00 | 161 | Risk review first: battery inclusion/type, accuracy, instructions, transport restrictions, warranty/returns and claims. |

This ranking chooses the drawer trays as the first hero because the set has the
highest combination of visual transformation, order value, niche clarity, and
non-electrical operation. Do not source all ten simultaneously. Products 1–2
enter the first quote sprint; product 5 is the home-organization backup.

## Exact U.S. landed-cost record

Use `us-organization-candidate-control-2026-08-01.csv` as the single commercial
record. Complete one row for every sellable variant. A blank cost or delivery
field is a failed gate, not permission to estimate.

Required evidence fields include:

- Shopify product/variant IDs, customer option, SKU, status, availability and
  inventory;
- automation owner, supplier identity/URL, mapped supplier SKU, ship-from
  country and U.S. route-verification evidence;
- quote destination ZIP, timestamp, quote currency and actual FX rate used;
- item cost, supplier shipping, duty/tariff/brokerage/import tax paid by
  Puchica, automation/order charge, packaging/handling and return reserve;
- shipping service, tracking, dispatch estimate, minimum/maximum delivery and
  supplier stock;
- Shopify Admin price/currency, actual U.S. checkout price/currency, market
  adjustment, promo, payment fees, contribution and maximum landed cost; and
- sample/test order dates, quoted versus actual charge, delivery, quality,
  tracking and final decision.

Quote at minimum one East/Central ZIP and one West ZIP. A route result to one
destination must not be generalized nationwide. Customer-paid Shopify shipping
is separate from supplier shipping and is ignored in the base gate until its
net retained value is measured.

## Go/no-go formulas

Use one currency throughout each calculation. Convert supplier charges using
the recorded quote-time FX rate before applying the formulas.

```text
net merchandise revenue R
  = actual U.S. checkout merchandise price P
    × (1 - promo discount rate D)

payment fee F = (R × payment percentage fee) + fixed payment fee

landed supply cost L
  = supplier item cost
    + supplier shipping
    + duties/tariffs/brokerage/import tax paid by Puchica
    + automation/order-processing charge
    + packaging/handling

pre-ad contribution C = R - F - L - return/refund reserve

pre-ad contribution margin = C / R

maximum landed supply cost
  = R - F - return/refund reserve - (0.30 × R)

break-even CAC = C
post-ad contribution = C - actual CAC
```

Do not reuse the historical Canada payment estimate or Canada market adjustment
for the U.S. Calculate from the current U.S. checkout and actual payment plan.

### Variant decision

`GO_SAMPLE` requires all of the following:

1. Exact Shopify-to-DSers mapping exists and DSers exclusively owns the SKU.
2. The exact variant has tracked U.S. delivery quotes to both test ZIPs.
3. Supplier stock and Shopify inventory are each at least 25 units.
4. The worst quote clears at least 30% pre-ad contribution.
5. Product contents, dimensions, claims, option names and images agree.
6. No unresolved electrical/battery, IP/brand, safety, fragile, or compatibility
   risk exists.

Otherwise use `NO_GO_QUOTE`, `NO_GO_MARGIN`, `NO_GO_MAPPING`, `NO_GO_STOCK`,
`NO_GO_CONTENT`, or `NO_GO_RISK`.

### Sample and controlled-order decision

`GO_TEST_ORDER` requires:

1. Sample matches the exact sellable variant and passes its checklist.
2. Actual delivery is no later than the quoted maximum plus two days.
3. Actual landed charge is no more than 5% above the quote.
4. Tracking works end to end and packaging is customer-acceptable.
5. A fresh worst-ZIP quote still clears the 30% gate.

Any critical defect, unsafe edge/material, broken zipper/adhesive/mechanism,
misleading contents, unannounced substitution, or broken tracking is
`NO_GO_SUPPLIER`.

### Paid-test and scale decision

- No ads until one controlled Shopify → DSers → supplier → tracking → delivery
  order succeeds.
- `GO_PAID_TEST`: all product gates pass, U.S. checkout and purchase events are
  verified, the page has one offer, and mobile checkout passes at 375px and
  390px widths on a real browser/device.
- `PAUSE_CREATIVE`: after 100 qualified hero-page sessions, add-to-cart is below
  4%.
- `PAUSE_FUNNEL`: checkout initiation is below 40% of add-to-carts after at
  least 20 carts.
- `GO_SCALE`: at least five paid orders are delivered/accepted, defect plus
  refund rate is below 10%, and blended CAC is at most 70% of pre-ad
  contribution (`CAC <= 0.70 × C`).
- `NO_GO_ECONOMICS`: blended CAC reaches break-even contribution (`CAC >= C`)
  after the pre-authorized test budget is spent.

These are spend controls, not proof of durable product-market fit.

## DSers and AutoDS ownership rule

Every Shopify variant must have exactly one automation owner:

```text
automation_owner ∈ {DSers, AutoDS, MANUAL_HOLD}
```

- All ten current launch products remain DSers-owned.
- Never connect the same Shopify variant to DSers and AutoDS.
- Price/stock monitoring, order routing, tracking and fulfillment sync must be
  controlled by the same owner.
- A future AutoDS pilot must use an entirely new SKU and win a like-for-like
  U.S. landed-cost, delivery, stock, and sample comparison before subscription.
- Changing ownership requires ads paused, product held, old mapping/evidence
  exported, old owner disconnected, new owner validated, and another controlled
  order completed.

Do not purchase AutoDS for this sprint. Software automation is not the current
bottleneck; exact economics, product proof, and conversion are.

## Hero validation: 24-piece drawer trays

### Before ordering

- Match `24PCS(6S14M4L)` and SKU `14:350853#24PCS(6S14M4L)` exactly.
- Record the count and dimensions of all small/medium/large trays.
- Quote tracked delivery to both U.S. test ZIPs and calculate the 30% gate from
  actual U.S. checkout price.
- Confirm material, packed dimensions/weight, odor/food-contact claims, nesting,
  and whether pieces slide inside a drawer.
- Ensure photos and copy show only the sellable 24-piece configuration.

### Sample test

- Count all 24 pieces and compare every size to the listing.
- Inspect cracks, warping, sharp edges, odor, discoloration and packaging.
- Fit in shallow and standard drawers; measure minimum usable drawer depth.
- Load with utensils/cosmetics/office items, open and close the drawer 50 times,
  and record sliding or tipping.
- Wash/wipe according to supplier instructions and recheck warping/finish after
  24 hours.
- Capture original before/after mobile video and retain invoice, tracking,
  order date, delivery date and actual charge.

## Immediate execution queue

1. Populate exact DSers item/shipping/delivery evidence for drawer trays to one
   East/Central and one West U.S. ZIP.
2. Confirm actual U.S. checkout price/currency, payment fee and promotion; run
   the 30% formula for the worse ZIP.
3. If drawer trays pass, order two samples. If they fail, quote the compression
   packing cubes, then the wheeled under-sink bin.
4. Review/remove `Toocki` branding unless rights and supplier authorization are
   documented; hold the SKU meanwhile.
5. Complete battery/accuracy/transport review before considering the luggage
   scale.
6. Create a hero-only analytics report for mobile sessions, add-to-carts,
   checkouts, purchases, revenue, refunds, and ad spend by day.
7. Keep paid ads and AutoDS spend at zero until sample and controlled U.S.
   fulfillment pass.
8. Expand to Canada only after the winning SKU has exact Manitoba and Ontario
   quotes, Canada checkout verification, and a separate 30% calculation.
