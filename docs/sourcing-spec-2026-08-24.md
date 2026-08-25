# Is dropshipping dead? No. — 2026-08-24

Run `npm run sourcing-spec`. This document is the reasoning; the script is the
tool you take to DSers.

## Correcting the earlier analysis

`business-model-comparison-2026-08-24.md` concluded that AOV had to exceed about
CA$92 and that the answer was baskets, repeat purchase, or organic-only. That
was **too strong, and it was reasoning from a flawed assumption**: a flat CA$42
CPA applied to every product regardless of price.

Cost per acquisition is not a constant. The same benchmark set puts Lifestyle &
Boutique at CA$42 and Electronics at CA$69, because a more expensive product
takes more persuading. **A CA$120 product never had a CA$42 CPA.**

But CPA does not scale down forever either. Whatever you sell, a cold click from
a stranger costs roughly the same, and enough have to land before one converts.
So CPA has a floor:

```
CPA = max(CA$28 floor, 40% of order value)
```

Crossover: **CA$70.** Below it the floor dominates. Above it, CPA scales with
price while a good margin scales too.

**This single expression explains the whole problem.**

## Your margins were never the issue

| Product | Retail | Contribution | Margin | Est. CPA | Floor-bound | Profit/order |
| --- | ---: | ---: | ---: | ---: | :---: | ---: |
| Black Travel Tech Case | CA$34.99 | 23.09 | **57.7%** | CA$28.00 | yes | −4.91 |
| White Jewelry Case | CA$22.99 | 16.52 | **59.0%** | CA$28.00 | yes | −11.48 |
| Cable Organizer Case | CA$19.99 | 14.11 | **56.5%** | CA$28.00 | yes | −13.89 |
| Charcoal Packing Cubes | CA$39.99 | 18.43 | 41.0% | CA$28.00 | yes | −9.57 |

Three of four carry margins **above 56%** — genuinely healthy, better than many
working stores. Every one still loses money, and every one is floor-bound.

The diagnosis is not "bad products", "bad margins", or "dropshipping is dead."
It is: **priced below the CA$70 crossover, so they pay the CA$28 minimum CPA no
matter how good their margin is.** Under the crossover, cutting supplier cost
barely helps; raising price is the only lever that moves.

## The sourcing spec

| Retail | Est. CPA | Contribution needed | Max landed | Max landed % | Max supplier |
| ---: | ---: | ---: | ---: | ---: | ---: |
| CA$90 | CA$36.00 | CA$51.43 | CA$27.58 | 31% | US$19.70 |
| CA$150 | CA$60.00 | CA$85.71 | CA$42.44 | 28% | US$30.31 |

**The rule:** retail **CA$90–150**, supplier cost at or under **a third of
retail**, duties prepaid. That is an ordinary dropshipping product — just not a
cheap one.

Test any candidate before importing it:

```
npm run sourcing-spec -- --retail 129 --cost 26 --ship 4
```

## The catch at higher ticket: customs

A CA$35 product declares under CAD$20 and CBSA never sees it. A CA$129 product
declaring CA$42 crosses **both** the CAD$20 duty and CAD$40 tax thresholds, so
assessment becomes near-certain.

Unprepaid, the customer is billed roughly **CA$18–24 on the doorstep** — duty,
tax, plus the CA$9.95 carrier handling fee. That is a refund and a chargeback,
not a sale.

**Prepay the duties.** It costs about CA$8.70 on a CA$129 order, and it is both
cheaper than the refunds a doorstep surprise causes and the honest thing to
sell. The script models this and warns when a candidate would bill the customer.

## What this means for the plan

**You can do regular dropshipping.** DSers, hands-off fulfilment, one supplier
order per customer order, minimum intervention — exactly what you asked for. The
autonomy requirement was never in conflict with viability. The price point was.

**Scrapping the current catalog is the right call.** Not because the products
are bad, but because all six sit under the crossover, and no amount of margin
work rescues a CA$20–40 item from a CA$28 CPA floor.

**What changes at CA$90–150:**

- Fewer, better products — research depth matters more than catalog size
- Prepaid duties, disclosed clearly at checkout
- Higher customer expectations: an 8–14 day wait is tolerable at CA$25 and
  irritating at CA$130. Consider suppliers with Canadian or US warehouses
- More refund and chargeback exposure per order, so the exception reserve
  should be revisited once real orders exist
- Longer consideration cycle, so creative works harder

**What does not change:** the store, the gates, the fulfilment model, the
autonomy. All of it already works and carries over unchanged.

## Caveats

The CA$28 floor and the 40% proportion are modelled from published benchmarks,
not measured on this store. **If your real CPA is CA$18, the crossover drops to
CA$45 and some current products become viable.** That remains the highest-value
number you do not have, and the Stage 1 smoke test is still how you get toward
it.

Edit the constants in `scripts/lib/sourcing-spec.mjs` as real figures arrive.
