# Shopify → DSers simulated-order and approved-SKU audit — 2026-08-14

## Decision summary

The Shopify → DSers handoff is operational for the exact White Luggage ID Tag
variant, and the stale DSers mapping discovered by the test has been repaired.
All 10 customer-approved SKUs across the nine approved products are also present
in live DSers product records with supplier costs and stock. DSers reports
`Unmapped(0)`.

This is not supplier-fulfillment proof for all nine products. One no-charge
Shopify Payments test-mode order proved the storefront checkout, Shopify order,
fulfillment-request, DSers order-ingestion, exact variant mapping, and supplier
shipping-quote stages for the luggage tag. The other approved products were
verified at the live DSers product/variant-record level without creating
additional orders or supplier liability.

## Controlled test order

| Field | Evidence |
|---|---|
| Shopify order | `#1002` / `gid://shopify/Order/7202106540282` |
| Checkout confirmation | `#WYGX6ARXY` |
| Payment | Shopify Payments test card ending `4242`; CA$19.99 test transaction; no real charge |
| Product | White Luggage ID Tag — White / 1 Piece |
| Shopify SKU | `14:29#white;5:361386#1pcs` |
| DSers supplier | Jesmine Store, AliExpress item `1005005973213007` |
| Supplier variant | `white-1pcs` |
| Supplier item cost | US$2.21 / CA$3.07 observed |
| Canada shipping quote | AliExpress Selection Standard; US$1.99 / CA$2.76; 11–16 days; tracking available |
| Supplier order/payment | None; order remained in DSers `Awaiting order` and no `ORDER`, AliExpress place-order, pay, fulfill, or ship action was used |

### Failure found and repaired

DSers initially ingested the correct Shopify product, option, and SKU but showed:

> Variant deleted or value-changed on Shopify.

The supplier product and `white-1pcs` option were still visible, but DSers was
using its stale Basic Mapping state. The product was explicitly rebound using
Advanced Mapping:

`White / 1 Piece` → Jesmine Store → `white-1pcs` → quantity `1`

After saving Advanced Mapping, the stale-variant warning disappeared. DSers then
resolved the Canada shipping method and total supplier-side estimate to US$4.20
(CA$5.82) without any supplier order being placed.

### Payment and cleanup controls

- Shopify Payments test mode was enabled only for the simulated checkout.
- Test mode was restored to **off** after the order; the payment-settings control
  was verified unchecked with the accessible label `Turn on test mode for
  Shopify Payments`.
- Shopify's fulfillment cancellation request was submitted to
  `dsers-fulfillment-service`.
- At the last check, DSers had not yet acknowledged the cancellation, so Shopify
  still prevented line-item refund/restock and order cancellation. The test order
  remains safely parked: no supplier order exists, no supplier payment exists,
  and live Shopify Payments are restored.

## Approved catalog: exact live DSers records

The values below were read from DSers **My Products → Check Product Detail →
Variants**. `Store` and `Supplier` are the two stock columns shown by DSers.

| Approved product / option | Exact Shopify SKU | DSers product | Supplier item | Observed item cost | Stock: Store / Supplier | Result |
|---|---|---:|---:|---:|---:|---|
| Soft Luggage Handle Wrap — Coffee Brown | `14:350686#coffee color` | `2086899575626530816` | `1005010135233973` | US$3.10 / CA$4.30 | 98 / 98 | PASS |
| Soft Luggage Handle Wrap — Black | `14:193#Black` | `2086899575626530816` | `1005010135233973` | US$3.09 / CA$4.29 | 97 / 97 | PASS |
| Black Knitted Luggage Wheel Covers — Set of 4 | `14:193` | `2086890297381421056` | `1005009589564663` | US$2.63 / CA$3.65 | 4,987 / 4,987 | PASS |
| Black Hanging Travel Toiletry Organizer | `14:771#Black` | `2086883515707817984` | `1005006162747124` | US$8.32 / CA$11.55 | 48 / 48 | PASS |
| Large Blue Handled Clothes Storage Bag | `14:350852#Large Blue` | `2086880829662887937` | `1005005504286671` | US$3.51 / CA$4.87 | 42 / 100 | PASS |
| White Semi-Circular Travel Jewelry Case | `14:29` | `2086879353091653632` | `1005009878640464` | US$4.29 / CA$5.95 | 960 / 960 | PASS |
| Ten-Hole White Cable Organizer Clips | `14:771#10 Holes-White` | `2086877341809967104` | `1005004550863005` | US$2.94 / CA$4.08 | 5,811 / 5,811 | PASS |
| White Luggage ID Tag — White / 1 Piece | `14:29#white;5:361386#1pcs` | `2086874739483213824` | `1005005973213007` | US$2.21 / CA$3.07 | 9,964 / 9,965 | PASS + simulated order |
| Charcoal 3-Piece Packing Cube Set — S/M/L | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | `2086248705456865280` | `1005005283270949` | US$12.45 / CA$17.28 | 291 / 290 | PASS; monitor one-unit drift |
| Black Double-Layer Travel Cable Organizer Case | `14:193#Double Layers` | `2086248367047835648` | `1005006797227273` | US$4.15 / CA$5.76 | 65 / 52 | PASS; monitor sync drift |

All 10 approved SKUs were present in DSers. Every observed supplier stock value
remained above the 25-unit launch floor. The packing-cube and cable-case
store/supplier differences should be monitored because inventory sync is not
instantaneous and storefront stock must never be treated as a permanent
supplier guarantee.

## Operating conclusion

The original blanket statement that products were “mapped” was not a sufficient
control: the luggage tag proved that a product can appear mapped while a changed
Shopify variant key still breaks a real incoming order. The launch control must
therefore distinguish three evidence levels:

1. **Catalog record verified** — exact Shopify SKU appears in DSers with a live
   supplier item, cost, and supplier stock.
2. **Order handoff verified** — a no-charge test order reaches DSers without a
   stale/deleted-variant error and resolves a destination shipping quote.
3. **Supplier fulfillment verified** — a separately approved paid sample is
   ordered, tracked, delivered, and physically inspected.

Current state: all 10 approved variants pass level 1; the White Luggage ID Tag
passes level 2; no product has been represented here as passing level 3.

