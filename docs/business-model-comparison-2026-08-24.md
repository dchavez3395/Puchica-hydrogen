# Which business can fund a customer? — 2026-08-24

> **Superseded in part — see `docs/sourcing-spec-2026-08-24.md` (same day).**
> This document assumes a flat CA$42 CPA at every price point. That is wrong:
> CPA scales with price, and it also has a floor. The corrected model is
> `CPA = max(CA$28, 40% of order value)`, which puts the crossover at CA$70 and
> shows that ordinary dropshipping does work above it. The path comparison and
> the basket/repeat findings below remain valid; the "AOV must exceed CA$92"
> conclusion does not.

Run `npm run compare-models`. This document is the reading; the script is the
arithmetic.

The acquisition gate proved no current offer can pay for its own customer. This
asks the prior question — what *would* have to be true — and tests the three
paths genuinely available: keep dropshipping accessories, print on demand from
a Canadian facility, or import Salvadoran goods.

## The constraint exists before you pick a product

At a CA$42 benchmark CPA, keeping 30% of contribution as profit, each acquired
customer must produce **CA$60 of contribution**. That implies:

| Contribution margin | Required AOV |
| ---: | ---: |
| 35% | CA$171.43 |
| 45% | CA$133.33 |
| 55% | CA$109.09 |
| 65% | CA$92.31 |

Puchica today is roughly **CA$35 AOV at 46% margin**.

**No single item under about CA$90 can fund cold paid traffic — whatever it is
and whoever makes it.** That is arithmetic, not pessimism, and it is the single
most important sentence in this analysis. It applies equally to an AliExpress
cable case, a print-on-demand t-shirt, and a bag of Salvadoran coffee. Changing
the product does not escape it.

## The three paths

| Path | AOV | Landed | Contribution | Margin | Short by | Orders to fund | Route |
| --- | ---: | ---: | ---: | ---: | ---: | ---: | --- |
| A. AliExpress accessories (current) | CA$39.99 | 13.20 | 23.09 | 57.7% | CA$36.91 | 3 | **neither** |
| B1. POD tee, single | CA$55.00 | 27.19 | 22.83 | 41.5% | CA$37.17 | 3 | **neither** |
| B2. POD three-item order | CA$145.00 | 71.99 | **60.39** | 41.6% | — | 1 | **basket** |
| C1. Salvadoran coffee, one bag | CA$29.00 | 8.00 | 18.23 | 62.9% | CA$41.77 | 4 | **repeat** |
| C2. Salvadoran gift set | CA$95.00 | 33.00 | 53.63 | 56.4% | CA$6.38 | 2 | **repeat** |

| Path | Capital | Autonomy | Delivery | Differentiation |
| --- | --- | --- | --- | --- |
| A. AliExpress | none | high | 8–14 days | none |
| B. POD | none | high | **2–5 days** | design |
| C. Import | CA$3,000–5,000 | low | 2–4 days | origin story |

## What actually separates them

Not the product. Not the supplier. **The basket and the repeat rate.**

A POD tee on its own fails by almost exactly as much as an AliExpress cable
case — CA$37.17 versus CA$36.91. Three of the same tees in one order passes.
The margin barely moves between them (41.5% → 41.6%); the *basket* does all the
work. A bag of coffee fails permanently on one order and works comfortably on
four.

This is why "find a better product" has never been the answer, and why two
months of catalog work could not have succeeded. The catalog was never the
variable.

## The one advantage POD has that nothing else does

Printful prints Canadian orders in **Mississauga, Ontario**. That means:

- **No CBSA entry.** No de minimis threshold, no duty, no GST at the border, no
  carrier handling fee, and no possibility of a customer being asked for money
  at the door — the entire risk documented in `canada-landed-cost-2026-08-24.md`
  simply does not exist.
- **2–5 day delivery** instead of 8–14. That is a week of your biggest
  competitive weakness, removed.
- **Zero inventory capital**, same as dropshipping.

It also happens to be the only path where a Salvadoran identity is *authentic*
rather than decorative, because on POD the design **is** the product. A
Salvadoran name on a generic packing cube is a sticker. A Salvadoran design on a
shirt is the thing being sold.

## Three strategies, and only three

1. **Sell baskets, not items.** Sets and multi-packs near CA$100, merchandised
   so the second and third item are the default rather than an upsell. This is
   what the Carry-On Kit was reaching for and why it was the right instinct
   priced wrongly.
2. **Sell something people re-buy.** Consumables turn a first-order loss into a
   lifetime profit. **Travel organizers are bought once and never again** —
   the quiet structural reason this catalog was always going to struggle,
   independent of execution.
3. **Do not buy the customer.** Every number above assumes CA$42 CPA. Content
   and community cost time instead of money, and at CA$0 CPA *every* path here
   is profitable on the first order — including the current one.

**Strategy 3 is the only one the current catalog can execute today**, and it is
what the seven-day organic test in `CURRENT-SCOPE.md` was already reaching for.
The other two require changing what Puchica sells.

## Recommendation

**Short term (no new capital, no new decisions):** run the organic test on the
current catalog. Strategy 3 is available now and the store is already built for
it. Stage 1 paid remains a systems check only — see the campaign brief.

**Medium term, if you want a business rather than an experiment:** POD with a
basket-shaped offer. It is the only path that combines zero capital, high
autonomy, domestic fulfilment, a real delivery advantage, and an honest use of
the brand's identity. The requirement is a design point of view, which is
genuine work and is not something the store can supply for you.

**Import is a real business but a different one.** It needs CA$3,000–5,000 in
inventory, gives up the autonomy that was your original requirement, and only
funds acquisition through repeat purchase — so it lives or dies on a retention
rate Puchica has never observed. Worth revisiting once something works; not the
place to start from zero.

**What would change this recommendation:** a measured CPA materially below
CA$42. Every verdict here is anchored to a benchmark, not an observation. If
your real CPA turns out to be CA$20, Path A becomes viable and this whole
document is moot. That is the single highest-value number you do not have.

## Caveats

Nothing here is a quote. Printful base costs are public 2026 pricing summaries,
not your account. Import costs and margins are category norms. Repeat rates are
estimates for the category, and Puchica has never observed one. **The ranking is
informative; any single absolute number is provisional.** Assumptions and
sources live in `docs/recovery-evidence/business-model-assumptions-2026-08-24.json`
and are meant to be edited as real figures arrive.
