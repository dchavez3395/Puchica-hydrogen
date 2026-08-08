# Thermos, desk lamp and Naturehike margin thresholds

**Evidence date:** 2026-08-08

**Market and currency:** Canada, CAD

**Method:** existing conservative payment-fee, reserve and 30% contribution model

**Action status:** provisional evidence only; no catalog, price, inventory, supplier or publication changes were made.

## Corrected executive decision

The Shopify `unitCost` values for these products appear stale/imported and conflict with current signed-in DSers product-card evidence. They are retained only as **catalog-integrity diagnostics** and are not used as current supplier prices.

Current DSers card evidence changes the route conclusions:

| Product / scope | Current retail | Competitive target band | Stale Shopify `unitCost` | Current DSers card item cost | Max all-in landed at band high, 15% off | Provisional decision |
|---|---:|---:|---:|---:|---:|---|
| 500 mL temperature-display thermos | $127.33 | $25–40 | $80.16 | $37.32 | **$20.61** | **Fails on item cost alone** |
| USB rechargeable three-level desk lamp | $138.22 | $22–40 | $86.99 | $18.32–31.63 | **$20.61** | **Mixed:** low options may fit; high options fail |
| Naturehike NH20SN010, S | $40.23–40.69 | $15–25 | $23.32 | $17.17–23.12 | **$12.77** | **Likely fails:** all card costs exceed ceiling |
| Naturehike NH20SN010, L | $70.23–73.45 | $20–35 | $23.32 | $17.17–23.12 | **$18.00** | **Conditional:** cheapest option leaves $0.83 before shipping |

These remain **product-card observations, not exact route quotes**. The exact selected Shopify variant, mapped supplier option, ordinary repeatable item price, tracked Canadian shipping and route charges are not yet captured together. Therefore no lamp or Naturehike option is approved.

## Evidence-layer distinction

### Shopify `unitCost` — stale diagnostic

The Shopify catalog snapshot records CAD 80.16 for the thermos, CAD 86.99 for the lamp and CAD 23.32 for every Naturehike variant. Current signed-in DSers card evidence conflicts materially with the thermos and lamp values. Shopify `unitCost` can be stale, imported, manually entered or detached from the currently mapped supplier option; it is not proof of today's fulfillment cost.

The discrepancy itself is still important. Before launch, Shopify cost records should eventually be reconciled to the approved route so future margin reporting is not corrupted. That reconciliation is not authorized by this report.

### DSers product-card item costs — current but provisional

The current signed-in DSers evidence shows:

- Thermos: CAD 37.32.
- Desk lamp: CAD 18.32–31.63 across card options.
- Naturehike: CAD 17.17–23.12 across card options.

These values are more current than the Shopify diagnostics, but they do not establish which cost belongs to each exact selected Shopify SKU. They also exclude any tracked shipping, order/automation cost, handling, packaging, or Puchica-paid brokerage/duties unless the card explicitly includes them. The route agent must capture the exact selected option and destination quote before a final pass/fail decision.

## Economics method

This uses the established assumptions in `supplier-economics-2026-08-08.md`:

- Payment fee: **3.5% of collected merchandise revenue + CAD 0.30**.
- Refund/defect reserve: **5% of collected merchandise revenue**.
- Required contribution: **30% of collected merchandise revenue**.
- Customer-paid shipping and duties contribute zero until checkout evidence proves what Puchica retains and who is responsible.
- Landed cost includes ordinary repeatable item cost, tracked shipping, Puchica-paid duties/brokerage where applicable, order/automation charges, handling and packaging.
- Welcome prices, coins, coupons, flash sales and new-buyer pricing are not repeatable supplier cost.

```text
revenue = advertised price × (1 - discount rate)
maximum all-in landed cost = revenue × 61.5% - CAD 0.30
```

All values use decimal half-up rounding to cents after calculation.

## Competitive evidence and corrected route decisions

### 1. 500 mL temperature-display thermos — product 9351895548154

Puchica currently lists this product at **CAD 127.33** with a CAD 191 compare-at price. Shopify records CAD 80.16, but the current DSers card shows **CAD 37.32 item cost**.

Competitive evidence:

- [Walmart Canada lists a comparable 500 mL smart temperature-display thermos at CAD 35.97](https://www.walmart.ca/en/ip/500ML-Smart-Thermos-Water-Bottle-Stainless-Steel-Insulation-Touch-Intelligent-Temperature-Display-Vacuum-Flasks-Cup-Digital-Mug/2ZMDPEDJ0ZGO).
- [Canadian Tire lists a branded Thermos 500 mL vacuum bottle at CAD 17.99](https://www.canadiantire.ca/en/pdp/thermos-500ml-stainless-steel-vacuum-bottle-0423429p.html). It lacks the display/divided feature and anchors the ordinary branded vacuum-bottle floor, not exact equivalence.
- [Mega Mart Center identifies exact source SKU 1005007433246294 at USD 13.99](https://megamartcenter.com/products/500ml-temperature-display-thermos-cup-stainless-steel-divided-thermos-bottle-outdoor-vacuum-insulated-cup-fathers-day-gift), but the offer was sold out and shipping was calculated at checkout. It confirms product identity and market context, not a repeatable supplier route.
- [Walmart US carries the exact product title](https://www.walmart.com/ip/500ML-Temperature-Display-Thermos-Cup-Stainless-Steel-Divided-Thermos-Bottle-Outdoor-Vacuum-Insulated-Cup-Father-s-Day-Gift/17653873125), but the observed selected option was out of stock.

**Conservative Canadian band: CAD 25–40.**

| Target retail | Max landed, no discount | Max landed, 15% discount |
|---:|---:|---:|
| $25 low | $15.08 | $12.77 |
| $40 high | $24.30 | **$20.61** |

**Corrected decision:** still fails. The current CAD 37.32 DSers card item cost is CAD 16.71 above the top-of-band promotional ceiling before shipping. Exact route capture remains necessary for the evidence record, but no plausible shipping quote can cure a negative pre-shipping headroom.

### 2. USB rechargeable three-level touch desk lamp — product 9351895810298

Puchica currently lists the lamp at **CAD 138.22** with a CAD 207.33 compare-at price. Shopify records CAD 86.99, while the current DSers card shows **CAD 18.32–31.63 across options**.

Competitive evidence:

- [Walmart Canada lists an unbranded USB-rechargeable, touch-controlled three-level LED desk lamp at CAD 21.87](https://www.walmart.ca/en/ip/USB-Rechargeable-LED-Desk-Lamp-3-Level-Dimmable-Touch-Table-Light-for-Bedroom-Bedside/6RIA67SQ0RXD).
- [Staples Canada lists a branded rechargeable USB-C touch lamp at CAD 29.99](https://www.staples.ca/products/3166018-en-xtricity-roccabella-portable-led-touch-table-lamp-ivory), with three colour temperatures, dimming and a one-year warranty.
- [Home Depot Canada lists a Bostitch rechargeable touch/dimmable desk lamp at CAD 38.99](https://www.homedepot.ca/product/bostitch-konnect-11-61-inches-black-led-desk-lamp/1001625691), with a three-year warranty.
- [Best Buy Canada's current student-lamp collection](https://www.bestbuy.ca/en-ca/shop/back-to-school/best-student-desk-lamps) showed a cordless rechargeable three-level touch lamp at CAD 34.99 and a foldable travel desk lamp at CAD 39.99.
- [Target US current rechargeable/touch desk-lamp results](https://www.target.com/s/dimmable%2Bled%2Bdesk%2Blamp) cluster ordinary offers around USD 20–40, with higher prices attached to materially better features or support.

**Conservative Canadian band: CAD 22–40.**

| Target retail | Max landed, no discount | Max landed, 15% discount |
|---:|---:|---:|
| $22 low | $13.23 | $11.20 |
| $40 high | $24.30 | **$20.61** |

**Corrected decision:** option-dependent. A CAD 18.32 option leaves only **CAD 2.29** for tracked shipping and every other landed-cost component at a CAD 40 retail with 15% off. A CAD 31.63 option fails by CAD 11.02 before shipping. None of the observed card prices supports the low end of the competitive band under promotion. The exact selected SKU and Canadian route quote decide whether one low-cost option can conditionally pass.

### 3. Naturehike NH20SN010 toiletry bag — product 9341750968570

Puchica has six variants:

- S variants: CAD 40.23–40.69.
- L variants: CAD 70.23–73.45.

Shopify records CAD 23.32 for all variants. Current DSers card evidence shows **CAD 17.17–23.12 across options**, without an exact option-to-SKU reconciliation in this report.

Competitive evidence:

- [Hike n Run identifies NH20SN010 as a compact hanging polycotton toiletry organizer](https://hikenrun.com/products/wash-bag-naturehike-sn03-nh20sn010-travel-toiletry-bag); [E-Catalog identifies the S version at 2 L and 220 × 140 × 80 mm](https://e-catalog.com/NATUREHIKE-TOILETRY-BAG-NH20SN010-S.htm); and [bol identifies the L version at 3.6 L and EUR 29](https://www.bol.com/be/fr/p/naturehike-trousse-de-toilette-taille-l-noir-compartiment-resistant-a-l-eau-legere-organisateur-de-voyage-et-de-sport/9300000186240804/). Overseas prices are product-identity context, not Canadian conversion anchors.
- [Naturehike Canada's comparable Fashion Series toiletry bag](https://naturehike.ca/en/products/toiletry-bag-fashion-series) shows S at CAD 8.99 against CAD 11.99 and available L variants around CAD 9.99–11.99 against CAD 13.99–16.99.
- [Naturehike Canada's hygiene collection](https://naturehike.ca/en/collections/hygienic-accessories-camping-outdoor-gears-naturehike-canada) places comparable toiletry/storage products across roughly CAD 11.99–34.99 regular/reference pricing.

Allowed premium bands:

- **S: CAD 15–25.**
- **L: CAD 20–35.**

| Scope | Target retail | Max landed, no discount | Max landed, 15% discount |
|---|---:|---:|---:|
| S | $15 low | $8.93 | $7.54 |
| S | $25 high | $15.08 | **$12.77** |
| L | $20 low | $12.00 | $10.16 |
| L | $35 high | $21.23 | **$18.00** |

**Corrected S decision:** likely fails. Even the CAD 17.17 card item cost is CAD 4.40 above the S promotional ceiling before shipping.

**Corrected L decision:** conditional, not approved. If CAD 17.17 belongs to an exact mapped L option, it leaves only **CAD 0.83** for tracked shipping and all other landed charges at a CAD 35 retail with 15% off. Options above CAD 18 fail the promotional ceiling before shipping; the CAD 23.12 card maximum fails by CAD 5.12.

## Critical catalog-integrity finding remains unchanged

The Naturehike listing's current description conflicts with matched NH20SN010 evidence. The catalog describes a roll-top, 8 L/15 L, 500D PVC/TPU, IPX6, submersion-oriented bag with shoulder strap and MOLLE attachment. Matched-model sources describe a roughly **2–3.6 L hanging polycotton/polyester toiletry organizer** with internal compartments.

The product must remain quarantined even if a route passes. The exact supplier option, images and model must be reconciled before copy is reused. Unsupported claims including “100% waterproof,” IPX6, accidental-submersion protection, 8 L/15 L capacity, MOLLE, shoulder strap, YKK, “full Canadian warranty support,” and “no questions asked” returns must not be published without evidence.

The thermos and lamp records also contain unsupported commercial claims (“verified supplier,” sales-volume assertions, artificial compare-at savings and route/tracking promises) that require evidence or removal before publication.

## Exact route capture required

For each product/variant, the route agent must record:

1. Shopify SKU and exact DSers mapped supplier option side by side.
2. Ordinary repeatable item cost for that exact option, excluding welcome/coin/coupon pricing.
3. Canadian tracked shipping amount and delivery range for the agreed destination.
4. Stock, source warehouse, carrier/method and quote timestamp.
5. Any DSers/order/handling charges and Puchica-paid brokerage/duties.
6. Exact product evidence needed to support material, electrical, battery, food-contact and performance claims.

Then sum all landed components and compare against the applicable promotional ceiling. Until this is complete:

- Thermos: rejected on card item cost.
- Lamp: only low-cost options remain under conditional review.
- Naturehike S: likely rejected.
- Naturehike L: only a lowest-cost exact option could remain under conditional review.
