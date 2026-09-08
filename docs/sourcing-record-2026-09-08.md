# Sourcing record — 2026-09-08

The first pass that started from demand instead of from supply, and the first
one where anything passed.

This supersedes nothing. `sourcing-shortlist.md` and
`sourcing-shortlist-2026-08-26.md` remain the record of the earlier passes; this
is the record of a different method and its result.

## Why the method changed

Every prior pass ran the same shape: find something cheap to source, then check
whether the market already sells it cheaper. Ten products died that way. The
undercut gate (`scripts/check-undercut.mjs`) made that check compulsory and
early, which was right, but it did not change what was being fed into it.

The problem is that a filter tuned to "cheap to source AND not already cheaper
on Amazon" can only ever return obscure things, because anything with real
demand is already served. The output was windshield covers in September and
hockey strap racks — products that passed because nobody wanted them.

So this pass inverted it. Start from what is demonstrably selling now, accept
that it is available elsewhere, and ask only afterwards whether it can be
sourced with enough room to fund a customer.

## What the demand side found

Read live off amazon.com on 2026-09-08, US locale, ZIP 10001, filtered to
$50-250 and sorted by true best-seller rank. Review counts are what the page
displayed, not estimates.

Categories where the leader has hundreds of reviews rather than tens of
thousands — meaning no incumbent owns the shelf:

| Category | Leader | Reviews | Price | Velocity |
| --- | --- | ---: | ---: | --- |
| Makeup vanity desk, lighted mirror | LIVELYGLOW B0H1C3Y6LT | 1,485 | $125.99 | #1 in category, BSR #4,097 H&K |
| Cat litter box enclosure | Evermagin B0G2RMJC9Z | 92 | $109.99 | 900+/month, #4 in category |
| Furniture-style dog crate | Hzuaneri B0DNYV7FZ1 | 1,140 | $124.99 | 700+/month, #2 in category |
| Toddler standing tower | OMEW B0GWQXY92V | 844 | $58.99 | 3K+/month |
| Garden hose reel cart | WERMAH B0DWK6KZ9N | 177 | $139.99 | 500+/month |
| Galvanized raised garden bed | Land Guard B0FZ8VPGMF | 221 | $69.99 | 500+/month |
| Entryway shoe cabinet | QIVOMIX B0F7RTLXRM | 530 | $99.99 | 1K+/month |

A 92-review listing holding a top-5 category rank is the clearest weak-lock
signal in the set.

Recurring complaint pattern across eight of nine "Customers say" summaries, in
the sellers' own aggregated wording: structural collapse under normal use,
assembly (missing hardware, screws stripping out of particle board), and stated
dimensions that do not match what arrives. These are specification and QC
failures, not design failures.

## What the sourcing side found

Costs from AliExpress with `shipFromCountry=US`, checked 2026-09-08. CJdropshipping
could not be read — every product URL redirects to a bot wall — so its prices
are still unknown and it is the main gap in this record.

| Category | Landed cost as % of Amazon retail | Verdict |
| --- | ---: | --- |
| Galvanized raised garden bed | 25-35% | passed on COST, superseded - see below |
| Garden hose reel cart | 40-44% | passed on COST, superseded - see below |
| Furniture-style dog crate | 54% like-for-like | MISS |
| Cat litter box enclosure | 51-81%, most above 70% | MISS |
| Makeup vanity desk | 85-102% | DEAD |
| Entryway shoe cabinet | 71-100% | DEAD |
| Toddler standing tower | 96-111% | DEAD |

## Why the dead ones are dead

Factory cost out of China runs 15-40% of Amazon retail across all seven
categories (Made-in-China.com, MOQ 20-1,000). That margin is not unclaimed. The
Amazon leaders — LIVELYGLOW, Evermagin, Hzuaneri, Land Guard — are Chinese-owned
brands buying containers off those same factories and running FBA.

Buying a single unit from a US warehouse means buying downstream of the importer
who has already taken the spread. You pay approximately what the consumer pays,
because you are standing in the same queue as the consumer.

That is the mechanism behind every failure in this project, stated properly for
the first time. It is not that good products are hard to find. It is that
between the factory and a unit-quantity buyer there is a company whose entire
business is capturing that gap.

The route into categories 1, 5 and 7 is container import at MOQ 50-500. That is
not dropshipping and should not be attempted under the label.

## Two caveats that could invalidate both passes

1. **The passing prices may not be reorderable.** AliExpress US-warehouse
   listings label their discounts "New shoppers save $171.10" — first-order
   coupons, not standing prices. On the best-selling vanity the promo was
   $122.39 against a $303.36 list. The garden bed and hose cart discounts were
   shallower (18-40%), which is why they are reported as passes, but none of it
   is a verified reorder price.
2. **Stock depth looks like liquidation.** Most US-warehouse SKUs in these
   categories showed "only 1 left" or "4 left". That is not replenishable
   dropship supply.

Both are answerable with a free CJdropshipping account, which exposes real
reorder pricing and needs no card, no US entity and no EIN. Until that exists,
treat the two passes as unconfirmed.

## Seasonality

Both survivors are spring products. Raised garden beds and hose reel carts sell
February through June, and the figures above are early-September, off-peak.
Testing either one now means advertising a garden bed in October.

## Both "passes" were superseded later the same day

Read the two rows above as a COST result only. Neither survived what came after,
and both failures were found by checking rather than by argument.

**Supply.** Opened in a browser rather than a server-side fetch. The garden-bed
listings showed anchor pricing - $22.78 struck against $70.44, $29.87 against
$126.51 - while the honestly-priced ones were $282.99 and $122.64, at or above
Amazon retail. Sold counts across the whole first page were 22, 13, 4, 3, 3, 3,
2, 1, 1, 1. The hose cart's $62.63 does look like a real standing price against
265 sales and 600+ cross-platform, but its listing reads **"Only 3 left."**
AliExpress US-warehouse stock is somebody's leftover container, not a
replenishing supply line, and that is structural to the channel rather than bad
luck on two SKUs.

**Acquisition.** The benchmarks this file was written against were wrong twice
over, and the corrected version is in `route-decision-2026-09-08.md`. Against
Triple Whale medians of $31-39 per ORDER, nothing examined in this project has
been in range as a single unit. The one qualification worth keeping: CPA is per
order, and every operator studied in personalized gifting engineers a
roughly three-unit cart, so a multi-unit-natural product can clear on a cart
where it cannot clear on a unit. Neither a garden bed nor a hose reel is
multi-unit-natural. Nobody buys three hose carts.

**Timing.** Both are spring products. Even had they survived, neither is
sellable in September.

The honest summary of this pass: the demand-first method worked and is worth
repeating, and the two candidates it produced are closed.

## What this means

There is, for the first time, a candidate with demand evidence and a workable
cost ratio. There is not a candidate that can be sold this month.

Next actions, in order:

1. Open a free CJdropshipping account and pull real reorder pricing for
   galvanized raised garden beds and hose reel carts. This is the only thing
   standing between "maybe" and "yes".
2. If the reorder price holds under about 40% of retail, build the offer around
   the three complaints above — rolled safety edges and truthful stated height
   on the garden bed, leak-free brass fittings and wheels that turn on grass on
   the hose cart. Those are reviewable differentiators that cost nothing to
   specify.
3. Do not pay for a storefront through a winter with nothing to sell.

## Eliminated — do not re-research

- GFurn: 63 products, 62 sold out, only a gift card purchasable (their own
  product feed, 2026-09-08). Montreal-based, so cross-border to US customers
  regardless.
- ShipItFurniture (Syncee): US warehouse, free shipping to all 50 states, 1-3
  days, verified across all 102 rate rows. Sourcing is sound; pricing is not.
  Kimonte dining table costs $99.99 against $114.77 delivered at 1StopBedrooms.
  A row-of-3 leather home theater seating costs $2,093.59 against $726.66 at
  Wayfair. Catalogue also contains impossible prices (a 3-tier bookcase at
  $4,725), so the feed is not trustworthy.
- Vanity desks, shoe cabinets, toddler towers: cannot be sourced below retail at
  unit quantities. Container import only.
