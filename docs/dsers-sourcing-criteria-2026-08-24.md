# DSers sourcing criteria — 2026-08-24

The research brief for rebuilding the catalog. Pairs with
`docs/sourcing-spec-2026-08-24.md`, which establishes *why* the price band is
CA$90–150.

```
npm run sourcing-spec                                     # the price/cost spec
npm run sourcing-spec -- --retail 129 --cost 26 --ship 4  # one candidate
npm run sourcing-spec -- --csv <worksheet.csv>            # score a batch
```

Start from `docs/recovery-evidence/sourcing-worksheet-template.csv`.

## First: most "high-ticket dropshipping" advice does not apply to you

Search for high-ticket dropshipping products and you get rowing machines,
standing desks, pressure washers, ergonomic chairs, portable power stations.
**Those are not AliExpress products.** That model is brand-authorized
dropshipping from domestic distributors — you apply to the brand, hold a resale
certificate, and maintain a supplier relationship. It can work well, but it is
not DSers and it is not hands-off.

Inside your actual constraint — DSers, AliExpress, one person, minimum
intervention — the field is narrower but real: **unpowered, uncertified,
unsized goods between CA$90 and CA$150.**

## Hard disqualifiers

These are not preferences. They are legal, safety, or platform requirements a
one-person store cannot satisfy, and the scorer rejects them outright no matter
how good the margin looks — which matters, because the fattest margins in this
band cluster in exactly these categories.

| Flag | Why it ends the evaluation |
| --- | --- |
| **Mains electrical** | Needs CSA or cUL certification. A supplier listing is not certification; selling uncertified is an offence. |
| **Wireless / Bluetooth** | Needs ISED certification and an IC ID. Cannot be inherited from a supplier listing. |
| **Lithium battery** | Shipping restrictions, fire liability, refusal risk in transit. |
| **Regulated goods** | Cosmetics need Health Canada notification; food and supplements CFIA; toys and children's products the CCPSA; any health claim makes it a medical device. |
| **Branded or licensed** | Counterfeit and IP exposure — a takedown and a frozen payment processor waiting to happen. |

**Also mandatory, and usually missed:** Canadian consumer products generally
require English **and** French safety information and instructions. A supplier
shipping English-only packaging hands you a compliance problem at the border.
Ask before importing, not after the first order.

## Scored penalties

| Flag | Penalty | Why |
| --- | :---: | --- |
| Sized (apparel, footwear) | −3 | 20–40% return rates. The largest support burden in ecommerce, and it scales with order value. |
| Fragile | −2 | Breakage over an 8–14 day route, and a replacement costs full landed cost again. |
| Needs assembly / support | −2 | Every support email is unpaid labour, working directly against a hands-off store. |
| Bulky | −1 | Supplier shipping rises faster than product cost, and Canadian route availability thins. |

## What to actually look for

Working backwards from the filters, a good candidate is:

- **Unpowered.** No plug, no radio, no cell.
- **One size.** Not worn, or fits everyone.
- **Not fragile.** Survives three weeks in a container and a Cainiao van.
- **Unbranded.** Generic by design, so the brand can be yours.
- **Demonstrable in 8 seconds.** If you cannot show the problem and the fix in a
  vertical video without narration, the ad will not work.
- **Solves a specific, annoying problem** for an identifiable person.
- **Worse or pricier on Amazon** — or absent. If Amazon has it Prime-shipped for
  less, you lose on both price and delivery.

### Category hypotheses

These survive every hard filter and plausibly hit the price band. **They are
hypotheses, not verified quotes** — I could not read live AliExpress pricing.
Validate each with a real DSers reading before believing any number.

| Category | Why it fits | Watch for |
| --- | --- | --- |
| **Car camping / overlanding** — rooftop cargo bags, SUV mattresses, awnings, seat platforms | Unpowered, unsized, high willingness to pay, strongly visual | Bulk raises supplier shipping and thins Canadian routes |
| **Pet gear (non-consumable)** — strollers, large carriers, grooming tables, elevated feeders | Emotional purchase, weak price sensitivity, easy to demonstrate | Assembly and support burden; size/weight fit questions |
| **Non-electric fitness** — pilates/reformer bars, resistance systems, weighted vests, balance trainers | Compact, unpowered, clear before/after | Injury-claim exposure; make no health claims |
| **Garden and outdoor structures** — raised beds, small greenhouses, plant systems | Seasonal but high intent, unregulated | Bulky; strongly seasonal in Canada |
| **Furniture-scale home organization** — shoe cabinets, storage benches, closet systems | Genuinely high ticket, visual transformation | Assembly, bulk, damage in transit |
| **Craft and hobby equipment** — quilting and sewing tools, resin and casting kits | Passionate niche, low competition, unpowered | Small audiences; check demand exists at all |

Best two for a first attempt: **car camping** and **pet gear**. Both carry high
willingness to pay, demonstrate well on video, and need no certification.

## Process

1. **Research 15–20 candidates** in DSers. Read the exact variant cost and the
   Canadian route — not the listing headline.
2. **Fill the worksheet.** One row each, flags honest.
3. **Score the batch.** `npm run sourcing-spec -- --csv <file>`
4. **Take the SHORTLIST rows only.** If nothing shortlists, the band is wrong or
   the research was too shallow — do not lower the bar.
5. **Order a sample of each finalist.** At CA$90–150 a customer expects the
   product to be good. You cannot know that from photographs, and this is the
   one place spending your own money is clearly worth it.
6. **Then** run it through `npm run acquisition-gate` as a real offer.

## What changes operationally at this price point

- **Prepay duties.** A CA$129 order declaring CA$42 crosses both thresholds; the
  customer would otherwise be billed CA$18–24 at the door. Costs ~CA$8.70.
- **Delivery matters more.** An 8–14 day wait is tolerable at CA$25 and
  irritating at CA$130. Prefer suppliers with Canadian or US warehouses where
  they exist.
- **Fewer, better products.** Research depth now beats catalog size. Six good
  offers beat six hundred, and you already learned that the expensive way.
- **Revisit the exception reserve.** 5% was set for CA$20–40 items. Higher-ticket
  orders carry more refund and chargeback exposure per order; revise once real
  orders exist.

## Caveat

The CA$28 CPA floor and the 40% proportion are modelled from published
benchmarks, not measured on this store. Category price points above are
unverified hypotheses. **The filters are firm; the numbers are provisional.**
Edit the constants in `scripts/lib/sourcing-spec.mjs` as real figures arrive.
