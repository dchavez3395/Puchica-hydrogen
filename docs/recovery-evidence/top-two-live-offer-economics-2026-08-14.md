# Top-two live-offer checkout and economics gate — 2026-08-14

## Decision

**PASS for controlled organic traffic; HOLD paid advertising.** The black
double-layer cable organizer and black hanging toiletry organizer both expose
working Canada and United States checkout routes, calculate market-correct
shipping, and clear the 30% pre-ad contribution floor under the dated cost
assumptions below. Neither offer has a real supplier purchase, delivery,
quality, refund, or customer-support proof, and no real organic order has been
fulfilled. Positive theoretical CAC room is therefore not ad authorization.

No payment data was entered and no order was submitted during this check.

## Live checkout evidence

Observed at 16:20–16:25 CDT using the current exact Shopify variants and public
institutional QA destinations. The reserved address data was not saved to a
customer account.

| Market / offer | Exact Shopify variant | Merchandise | Standard Shipping | Checkout total |
| --- | --- | ---: | ---: | ---: |
| Canada / cable organizer | `50041043681530` | CA$24.99 | CA$5.00 | CA$29.99 |
| United States / cable organizer | `50041043681530` | US$19.00 | US$8.00 | US$27.00 |
| Canada / toiletry organizer | `50056171684090` | CA$39.99 | CA$5.00 | CA$44.99 |
| United States / toiletry organizer | `50056171684090` | US$30.00 | US$8.00 | US$38.00 |

The older toiletry draft variant `50051764322554` is not the live variant; its
direct cart permalink returned `Link no longer exists`. The production PDP
exposed `50056171684090`, which produced the valid checkouts above.

## Supplier cost basis

The exact item costs come from the same-day Shopify/DSers SKU audit. The
shipping quotes come from the later same-day DSers route recovery. Both use
AliExpress Selection Standard from China with tracking.

| Offer / market | Item | Supplier shipping | Landed basis | Supplier ETA |
| --- | ---: | ---: | ---: | --- |
| Cable / Canada | US$4.15 | US$2.16 | CA$8.83 at CA$1.40/US$1 | 7–13 days |
| Cable / United States | US$4.15 | US$1.99 | US$6.14 | 7–12 days |
| Toiletry / Canada | US$8.32 | US$1.99 | CA$14.43 at CA$1.40/US$1 | 8–13 days |
| Toiletry / United States | US$8.32 | US$1.99 | US$10.31 | 8–13 days |

## Contribution screen

Assumptions are deliberately conservative: payment cost equals 3.5% of the
full checkout charge plus 0.30 in the sale currency; refund/exception reserve
equals 5% of the full checkout charge; supplier landed cost includes the item
and supplier shipping; tax remittance, currency leakage, duties/brokerage,
monthly overhead, and ad spend are excluded.

`Merchandise-only contribution` excludes the customer shipping charge from
revenue while still charging the fee and reserve against the actual full
checkout total. `Collected-total contribution` includes the customer shipping
charge because Shopify collects it.

| Market / offer | Merchandise-only contribution | Merchandise margin | Collected-total contribution | Collected margin | Room above 30% floor |
| --- | ---: | ---: | ---: | ---: | ---: |
| Canada / cable | CA$13.31 | 53.2% | CA$18.31 | 61.0% | CA$9.31 |
| United States / cable | US$10.27 | 54.0% | US$18.27 | 67.6% | US$10.17 |
| Canada / toiletry | CA$21.43 | 53.6% | CA$26.43 | 58.8% | CA$12.93 |
| United States / toiletry | US$16.16 | 53.9% | US$24.16 | 63.6% | US$12.76 |

## Binding operating rule

- Keep both offers live for organic measurement in their approved markets.
- Do not discount either offer during the initial evidence window.
- Recheck exact mapping, stock, item cost, route, and quote before every real
  supplier order.
- Treat duties/brokerage as unresolved customer-experience risk even though the
  current policy says destination charges not collected by Puchica are the
  customer's responsibility.
- Keep ads at CA$0 until at least one real organic order is paid, ingests into
  DSers, is supplier-purchased with owner approval, delivers acceptably, and
  produces clean analytics/support evidence.

Machine-readable calculations are in
`top-two-live-offer-economics-2026-08-14.csv`.
