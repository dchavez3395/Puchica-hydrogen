# Offer spec — personalized ornaments, Q4 2026

The first product shape in this project where demand evidence, supplier cost
and acquisition cost agree at the same time. Nothing here has been sold. Every
figure is published or measured, and the two that are neither are marked.

Companions: `sourcing-record-2026-09-08.md` (what was found),
`route-decision-2026-09-08.md` (why the commodity route closed, and the
corrected acquisition benchmarks this spec is measured against).

## Why this shape

It satisfies the condition every previous candidate failed. A personalized
ornament cannot be price-compared, because no listing exists for one carrying
someone else's name. That is the same mechanism behind every long-running
advertiser found in the Meta Ad Library, and it is what eleven commodity
products lacked.

It is also the cheapest thing in the catalogue to put in a three-unit cart,
which is the second condition. Acquisition cost is charged per ORDER; an
ornament's additional-item shipping is 75 cents.

## Supplier and cost — published, both sides

CustomCat Holiday Ornaments, from their open selling guide. Circle, oval, heart
and star, roughly half an ounce each.

| | PRO tier | Lite tier |
| --- | ---: | ---: |
| Base cost | $3.75 | $5.75 |
| Shipping, first item | $3.99 | $3.99 |
| Shipping, each additional | $0.75 | $0.75 |
| Their suggested MSRP | $11.95 | $11.95 |

CustomCat is US-fulfilled, so there is no duty, no customs event and no 12-17
day transit. `US_DUTY_INCIDENCE` becomes irrelevant to this route rather than
unresolved.

**Their suggested MSRP is the one price that cannot work.** At $11.95 a
four-unit order contributes $22.48, under every acquisition benchmark. Every
operator running these ads for a year or more charges $19.95-$24.99 — roughly
double the supplier's recommendation. That gap is the business.

## Price architecture

Contribution per ORDER, after base, shipping, payment fees (2.9% + $0.30) and a
5% returns reserve. Measured against the corrected Meta benchmarks: $31.16
Lifestyle, $34.85 Toys/Art, $38.99 all-industry.

| Structure | Revenue | Contribution | |
| --- | ---: | ---: | --- |
| **3 x $21.95, free shipping over $65, no discount** | **$65.85** | **$43.61** | clears all three |
| 3 x $21.95 less a 10% multi-buy code | $59.26 | $37.54 | clears two |
| 3-pack SKU at $59.95 | $59.95 | $38.17 | clears two |
| 3-pack SKU at $54.95 | $54.95 | $33.57 | clears one |
| 1 x $21.95 | $21.95 | $12.18 | clears none |

**Recommendation: a $65 free-shipping threshold and no discount at all.**

The threshold outperforms every discount mechanic tested. A 10% multi-buy code
costs $6.06 of contribution; a discounted three-pack costs $5.43. Free shipping
on a half-ounce item costs the $0.75-per-additional-unit carrier rate and
nothing else. This is why the operators use thresholds rather than bundles, and
it is worth stating plainly because a discount feels more generous and is
strictly worse for both sides.

$65 is 3.0 units at $21.95. Observed operator thresholds: febworld 2.7,
trendingcustom 2.8, barods 3.2, happary 3.6.

**The single-unit row is the warning.** One ornament contributes $12.18 against
a $31-39 acquisition cost. An ad pointing at a single product page loses money
on every click that converts. The cart is not an upsell here, it is the product.

## What the winning ads actually look like

Read from the Meta Ad Library, advertisers still running after 180+ days:

- Febworld, **1,406 days**: "Perfect Personalized Gift for Your Loved one! Name can be changed."
- Wander Prints, 406 days: "This ornament is the perfect way to celebrate our love. Every sparkle tells a story, and this one's written just for us"
- giftshare.shop, 363 days: "Personalized pet photo Pixar cartoon style desktop ornament"
- uitton.com, 336 days: "Personalized barber chair tabletop ornament"
- AlmaGems, 411 days: "Festive Family Ornament for Families"

The pattern, consistently: copy is two lines and names the RECIPIENT or the
OCCASION, never a product feature. No specification, no materials, no
dimensions. The creative is a mockup of the ornament carrying a name or photo -
the ad demonstrates the product by being the product, which is why these
campaigns need no video production.

The other pattern is micro-audience permutation. A barber-chair ornament and a
pet-portrait ornament are the same manufacturing step aimed at two narrow
interest audiences. One template re-cut per audience is a structurally cheap
creative pipeline, and it is what the image generation already running through
Antigravity is for.

## Before anything goes live

The undercut gate must pass on evidence, not be bypassed. Per candidate:
`ourRetailUsd`, `itemCostUsd`, `supplierShipUsd`, a sourced `dutyRate` (0 for a
US-fulfilled product, and it must be recorded as sourced rather than assumed),
five or more competitor prices with review counts, and `checkedOn`.

`scripts/screen-candidates.mjs` will report the cart line as conditional. An
ornament IS multi-unit-natural - one per grandchild, one per teammate - so the
three-unit reading applies here in a way it did not for a coffee grinder.

## Risks, stated

- The $31-39 CPA band is spend over ALL orders. True new-customer acquisition
  runs roughly 1.5-2.5x, so $43.61 is arguable rather than comfortable.
- CustomCat's Trustpilot rating was withheld over fake reviews, and there is a
  credible complaint about prices rising after a product starts selling.
  Reliability is not established; the published price sheet is not a contract.
- The PRO tier is a paid subscription. Lite base is $5.75 and still clears at
  three units from $19.95 up, but the spec above uses PRO.
- Design quality is the entire moat. Generic AI output is the saturated end of
  this category, and Etsy removed 7.5 million listings in a year partly over it.
- Nobody has bought one. Every figure here is a model.

## Next actions

1. A free CustomCat account, to confirm the published guide prices match the
   dashboard and to see the ornament catalogue.
2. Decide the Shopify plan before the renewal - building into a store that
   lapses is wasted work.
3. Then: designs, three to five micro-audience permutations, evidence files,
   gate, and the CA$200 Meta test that has been designed and shelved since
   Aug 27 - pointed at a three-unit cart rather than a single item.
