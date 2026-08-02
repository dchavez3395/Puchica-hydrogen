# Puchica unit economics and price control — 2026-08-02

## Decision

**Paid traffic remains `HOLD`.** The lead packing-cube offer is economically
promising at full price, but it is not yet proven profitable because the DSers
figures are country-level estimates rather than exact, destination-level landed
quotes. No supplier, order, payment, ad, or live price change was made during
this review.

The immediate commercial position is:

- keep the packing-cube lead offer near **US$47–49 / CA$66–69** only if the
  final landed-cost gate passes;
- do not advertise or expose a 15% discount on the lead offer until the exact
  economics show at least 30% contribution after every variable cost;
- keep the under-sink bin and double-layer cable case near current pricing;
- reduce, bundle, or withhold the cable pouch, tube squeezer, five-slot cable
  strip, and eight-piece organizer set from paid traffic;
- do not treat customer shipping collected at checkout as profit until its fee,
  refund, and fulfillment treatment is reconciled.

## Authenticated DSers evidence

Read-only Supplier Optimizer evidence was captured for the Shopify image hash
`S429d800afd8741a78092f1cff17ae074r`, associated with the red five-piece
packing-cube workflow. The matching result showed 359 sales and 4.8 displayed
rating. Nothing was imported, mapped, ordered, or paid for.

| Market | Displayed item range | Shipping | Service | Days | Status |
| --- | ---: | ---: | --- | ---: | --- |
| United States | US$4.38–20.39 | US$1.99 | AliExpress Selection Standard | 6 | COUNTRY-LEVEL ONLY |
| Canada | US$4.38–20.39 | US$1.99 | AliExpress Selection Standard | 7 | COUNTRY-LEVEL ONLY |

The exact `5PCS Set Red` option price is not exposed by this optimizer range.
The conservative provisional model therefore uses the top of the displayed
range: **US$20.39 + US$1.99 = US$22.38**. For Canada, the existing contextual
conversion record uses approximately **CA$31.72**. Neither amount proves duty,
tax, brokerage, entry fees, remote-area fees, tracking, importer of record, or
the actual checkout charge for a destination.

## Lead-offer provisional economics

Unknown costs are deliberately shown as missing, not zero. The calculations
below exclude customer shipping revenue and use a 15% refund/problem reserve.

| Scenario | Net merchandise | Assumed payment fee | Provisional supply | 15% reserve | Contribution before unknowns | Margin | Gate |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| US current full price | US$52.00 | 2.9% + $0.30 = $1.81 | $22.38 | $7.80 | $20.01 | 38.5% | HOLD |
| US recommended $49 | US$49.00 | 2.9% + $0.30 = $1.72 | $22.38 | $7.35 | $17.55 | 35.8% | HOLD |
| US recommended $47 | US$47.00 | 2.9% + $0.30 = $1.66 | $22.38 | $7.05 | $15.91 | 33.8% | HOLD |
| US $49 with 15% off | US$41.65 | 2.9% + $0.30 = $1.51 | $22.38 | $6.25 | $11.51 | 27.6% | FAIL |
| CA current full price | CA$71.45 | conservative 3.5% + $0.30 = $2.80 | $31.72 | $10.72 | $26.21 | 36.7% | HOLD |
| CA recommended $69 | CA$69.00 | conservative 3.5% + $0.30 = $2.72 | $31.72 | $10.35 | $24.22 | 35.1% | HOLD |
| CA recommended $66 | CA$66.00 | conservative 3.5% + $0.30 = $2.61 | $31.72 | $9.90 | $21.77 | 33.0% | HOLD |
| CA current with 15% off | CA$60.73 | conservative 3.5% + $0.30 = $2.43 | $31.72 | $9.11 | $17.48 | 28.8% | FAIL |

The current full-price cube offer has a plausible cushion. The low end of the
recommended retail band does not leave much room for duty, brokerage, FX,
automation, or support. A sitewide 15% discount fails the 30% gate in the
illustrated US$49 and current-price Canadian cases. Repository history says
`FIRST15` was active, while the current control says promotions are not
approved; the Shopify Admin state must be verified and the discount disabled or
restricted before launch.

## Retail price benchmark

Observed prices were captured on August 2, 2026. Marketplace listings can be
third-party, clearance, location-dependent, or subject to separate delivery
fees, so checkout totals are the real comparison. The currency reference was
the [Bank of Canada daily digest](https://www.bankofcanada.ca/rates/daily-digest/).

| Product | Current price | Credible launch band | Action |
| --- | ---: | ---: | --- |
| 5-piece compression cubes | US$52 / CA$71.45 | US$47–49 / CA$66–69 | Slight reduction only after landed-cost proof |
| 8-piece organizer set | US$33 / CA$44.96 | US$22–29 / CA$31–41 | Reduce or withhold from paid traffic |
| Wheeled under-sink bin | US$22 / CA$29 | US$18–24 / CA$25–34 | Current price credible |
| Travel cable pouch | US$30 / CA$40.73 | US$18–24 / CA$25–34 | Reduce, improve proof, or bundle |
| Double-layer cable case | US$22 / CA$29 | US$18–24 / CA$25–34 | Current price credible |
| Stainless tube squeezer | US$19 / CA$25 | US$8–12 / CA$11–17 | Add-on/bundle only at current economics |
| Five-slot cable strip | US$19 / CA$25 | US$7–10 / CA$10–14 | Add-on/bundle only at current economics |

Lead-offer anchors: [BAGSMART compression cubes](https://www.bagsmart.com/products/compression-packing-cubes),
[Walmart US comparison](https://www.walmart.com/ip/18926710081), and
[CALPAK premium substitute](https://www.calpaktravel.com/products/packing-cubes-5-piece-set/tomato).

## Maximum all-in variable-cost ceilings

These ceilings are the maximum total of supplier item, supplier shipping,
duty, import tax treated as cost, brokerage, FX, automation, packaging,
handling, and other per-order variable costs that can be tolerated while still
leaving a 30% pre-ad contribution margin. They use current prices, no promotion,
a 15% problem reserve, and provisional payment-fee assumptions.

| Product | US ceiling | Canada ceiling | Interpretation |
| --- | ---: | ---: | --- |
| Packing cubes | US$26.79 | CA$36.50 | Current provisional supply leaves only $4.41 / CA$4.78 for every missing cost |
| Under-sink bin | US$11.16 | CA$14.63 | Exact quote must be at or below ceiling |
| Cable pouch | US$15.33 | CA$20.68 | Ceiling does not justify current market price |
| 8-piece organizer set | US$16.89 | CA$22.85 | Exact quote required |
| Tube squeezer | US$9.60 | CA$12.57 | Likely bundle/add-on economics |
| Five-slot cable strip | US$9.60 | CA$12.57 | Likely bundle/add-on economics |
| Double-layer cable case | US$11.16 | CA$14.63 | Exact quote required |

At a usable 15% promotion the cube ceilings fall to **US$22.73** and roughly
**CA$30.83**, both below or essentially equal to the provisional supply cost
before duty, brokerage, FX, app, and support costs. That promotion is therefore
not launch-safe.

## Landed-cost and cash-risk controls

For each exact option and market record:

1. ordinary item cost, supplier shipping, supplier tax, service, tracking,
   dispatch range, delivery range, and final checkout total;
2. incoterm and importer of record;
3. duty/tariff, import tax, brokerage, customs-entry, carrier administration,
   remote-area, address-correction, and return-to-sender charges;
4. actual Shopify Payments and PayPal percentage/fixed fees, currency conversion
   and payout fees, and whether fees apply to shipping/tax or survive refunds;
5. DSers/order costs, app allocation, packaging, handling, and support cost;
6. a 15% refund/problem planning reserve, plus separate stress cases for one
   defective order and one full chargeback with its CA$/US$15 fee.

Do not substitute a generic customs percentage for a quote. The U.S. duty-free
de minimis treatment was suspended globally in 2025, and Canadian China-origin
shipments generally have only a CA$20 courier/mail threshold; the supplier
shipping line does not establish who pays customs costs. Official references:
[CBP de minimis fact sheet](https://www.cbp.gov/sites/default/files/2025-08/factsheet_suspension_of_duty-free_de_minimis_treatment.pdf),
[CBSA courier imports](https://www.cbsa-asfc.gc.ca/import/courier/menu-eng.html),
and [Shopify international pricing fees](https://help.shopify.com/en/manual/international/pricing/fees).

Maintain enough cash for the first five supplier charges, one full
refund/replacement, and one chargeback. This is separate from ad budget.

## Required proof before a paid test

- [ ] Verify or disable/restrict `FIRST15` in Shopify Admin and reconcile all
      remaining storefront references.
- [ ] Capture exact `5PCS Set Red` option/SKU, ordinary price, stock, tracked
      service, and final supplier checkout total.
- [ ] Capture address-level US quotes for ZIP 10001 and 90001.
- [ ] Capture approved non-personal Manitoba and Ontario quote destinations;
      never use former postal code `R2P 2X1`.
- [ ] Determine DDP versus DDU/DAP and importer of record for each route.
- [ ] Capture actual payment, FX, payout, automation, app, and chargeback fees.
- [ ] Prove the worse destination remains at or above 30% contribution with no
      blank cost.
- [ ] Repeat the same evidence capture for the under-sink bin and cable pouch
      before either becomes an advertised product.

Until these boxes pass, the correct status is **promising economics, no paid
activation**—not “unprofitable,” and not “ready.”
