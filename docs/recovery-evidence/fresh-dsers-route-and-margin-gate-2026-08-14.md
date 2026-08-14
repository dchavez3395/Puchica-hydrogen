# Fresh DSers route and margin gate — 2026-08-14

> **Superseded later on 2026-08-14:** DSers route recovery restored the storage
> bag in Canada, the toiletry organizer in Canada and the United States, both
> approved handle-wrap colours, and the luggage tag in the United States. Use
> `live-dsers-route-recovery-2026-08-14.md` and
> `top-two-live-offer-economics-2026-08-14.md` for the current decision. The
> observations below remain preserved as the earlier checkpoint.

**Observation:** 2026-08-14T02:21:41-05:00
**Method:** signed-in, read-only DSers My Products and exact-SKU Shipping Info
inspection. No mapping, supplier, variant, setting, order, payment, push, save,
or deletion action was performed.

## Binding result

The prior nine-product approval is revoked. Fresh exact-SKU checks support a
smaller but still multi-product catalog:

- **Canada:** six products / six exact SKUs;
- **United States:** four products / four exact SKUs;
- **full hold:** Large Blue storage bag, Black hanging toiletry organizer, and
  the Black & Coffee Brown handle-wrap product;
- **market correction:** the White luggage ID tag remains Canada-only.

This is an **organic-limited** decision. It does not authorize paid ads,
discount activation, supplier ordering without a paid customer order, or
automatic fulfillment.

## Exact route matrix

| Product / exact supplier option | DSers stock | Canada | United States | Decision |
| --- | ---: | --- | --- | --- |
| Cable organizer — `14:193#Double Layers` / `Double Layers` | 140 | Selection Standard, CN, US$2.16, 7–13 days, tracked | Selection Standard, CN, US$1.99, 7–12 days, tracked | Keep CA + US |
| Packing cubes — `14:1052#S3007 Black;5:200004186#3PCS L M S Set` / `S3007 Black-3PCS L M S Set` | 666 | Selection Standard, CN, US$1.99, 8–14 days, tracked | No shipping result | Keep CA only |
| Luggage ID tag — `14:29#white;5:361386#1pcs` / `white-1pcs` | 169,040 | Selection Standard, CN, US$1.99, 9–15 days, tracked | No shipping result | Keep CA only; revoke US |
| Cable clips — `14:771#10 Holes-White` / `10 Holes-White` | 55,649 | Selection Standard, CN, US$1.99, 8–14 days, tracked | Selection Standard, CN, US$1.99, 8–14 days, tracked | Keep CA + US |
| Jewelry case — `14:29` / `WHITE` | 2,851 | Selection Standard, CN, US$1.99, 9–14 days, tracked | Selection Standard, CN, US$1.99, 9–14 days, tracked | Keep CA + US |
| Wheel covers — `14:193` / `black` | 14,976 | Selection Standard, CN, US$1.99, 8–14 days, tracked | Selection Standard, CN, US$1.99, 8–14 days, tracked | Keep CA + US |
| Storage bag — `14:350852#Large Blue` / `Large Blue` | 345 | No shipping result | No shipping result | Full hold |
| Toiletry organizer — `14:771#Black` / `Black` | 842 | No shipping result | No shipping result | Full hold |
| Handle wrap — `14:193#Black` / `Black` | 195 product aggregate | No shipping result | No shipping result | Revoke exact SKU |
| Handle wrap — `14:350686#coffee color` / `coffee color` | 195 product aggregate | Selection Standard, CN, US$2.16, 9–15 days, tracked | Selection Standard, CN, US$2.16, 9–15 days, tracked | Route passes, but hold whole product |

The handle-wrap product is held as a whole because its customer-facing title
and option promise explicitly cover both Black and Coffee Brown. Silently
removing Black would leave the product, SEO, analytics, and checkout identity
materially misleading even though Coffee Brown still has a route.

## Current supplier cost and conservative landed basis

The My Products cards showed repeatable item-cost ranges, not coupon or welcome
prices. Canada landed-cost screening uses the maximum displayed CAD item cost
plus DSers supplier shipping converted at a conservative **CA$1.40 per US$1**.
U.S. screening uses the maximum displayed USD item cost plus supplier shipping.

| Product | Current item-cost range | Conservative CA landed | Conservative US landed |
| --- | ---: | ---: | ---: |
| Cable organizer | US$3.05–4.31 / CA$4.24–6.00 | CA$9.02 | US$6.30 |
| Packing cubes | US$11.51–13.33 / CA$16.01–18.54 | CA$21.33 | Not sellable |
| Luggage ID tag | US$2.21–5.53 / CA$3.07–7.69 | CA$10.48 | Not sellable |
| Cable clips | US$1.70–2.94 / CA$2.37–4.09 | CA$6.88 | US$4.93 |
| Jewelry case | US$4.29–4.46 / CA$5.97–6.20 | CA$8.99 | US$6.45 |
| Wheel covers | US$2.58–2.63 / CA$3.59–3.66 | CA$6.45 | US$4.62 |

## Single-item contribution screen

Observed checkout shipping remains CA$5 below CA$50 and US$8 for the tested
single-item flow. Calculations reserve 3.5% of collected revenue plus 0.30 for
payment costs and 5% for refunds/exceptions. Tax remittance, duties, currency
leakage, and fixed overhead are excluded.

| Market / product | Collected | Landed | Current contribution | Margin | 15% merchandise-stress margin | Decision |
| --- | ---: | ---: | ---: | ---: | ---: | --- |
| CA cable | CA$29.99 | CA$9.02 | CA$18.12 | 60.4% | 56.0% | Organic-limited |
| US cable | US$27.00 | US$6.30 | US$18.10 | 67.1% | 64.2% | Organic-limited |
| CA packing | CA$44.99 | CA$21.33 | CA$19.54 | 43.4% | 36.0% | Organic-limited; no discount |
| CA luggage tag | CA$19.99 | CA$10.48 | CA$7.51 | 37.6% | 30.7% | Organic-strict; no discount or ads |
| CA cable clips | CA$19.99 | CA$6.88 | CA$11.11 | 55.6% | 51.0% | Organic-limited |
| US cable clips | US$19.00 | US$4.93 | US$12.16 | 64.0% | 61.4% | Organic-limited |
| CA jewelry case | CA$27.99 | CA$8.99 | CA$16.32 | 58.3% | 53.7% | Organic-limited |
| US jewelry case | US$25.00 | US$6.45 | US$16.13 | 64.5% | 61.4% | Organic-limited |
| CA wheel covers | CA$19.99 | CA$6.45 | CA$11.54 | 57.7% | 53.4% | Organic-limited |
| US wheel covers | US$19.00 | US$4.62 | US$12.46 | 65.6% | 63.1% | Organic-limited |

## Implementation and stop rules

The storefront exact-SKU allowlists were reduced to the route-backed set. The
three full-hold handles were also added to the operational hold list so stale
Shopify tags cannot reopen them.

Before every initial organic fulfillment, recheck the exact SKU, destination,
stock, method, supplier shipping cost, ship-from country, ETA, and tracking.
Stop the affected market immediately if any of these occurs:

1. the exact SKU disappears or resolves to a different supplier option;
2. stock reaches zero;
3. the route returns `No Shipping`;
4. tracking becomes unavailable;
5. conservative landed cost exceeds the value in this record by 10%;
6. the order would require a product, colour, quantity, or claim not present in
   the exact approved option.

No sample purchase is required to enforce this gate. A customer-paid order
still requires an order-time route check before any supplier purchase.
