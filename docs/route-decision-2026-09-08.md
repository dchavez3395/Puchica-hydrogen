# Route decision — 2026-09-08

Companion to `sourcing-record-2026-09-08.md`. That file records what was found.
This one records what it means and which route replaces the one that closed.

## The question this answers

Blank slate, roughly 100 products, priced to sell in both the US and Canada
(different suppliers per market is acceptable), a fully operational store on the
dropshipping model. The stated thesis: if the images, copy, SEO and ads are good
enough, a buyer will pay somewhat more than Amazon or AliExpress rather than
matching them one-for-one.

## The thesis is correct, and it has one condition

It is not wishful. Our Place sells the Always Pan at roughly $145 on their own
site while the identical pan has been under $100 on Amazon, and they run 535
active Meta ads against that. Ruggable, Caraway, HexClad and FUNNYFUZZY all sell
objects available elsewhere and win on presentation.

The condition is what every one of them has in common: **the SKU cannot be
looked up.** HexClad is the only seller of a HexClad pan, so no side-by-side
exists. The premium is not really paid for better photography. It is paid
because there is nothing to compare against.

On an identical, findable item the premium is bounded — judgment, not a measured
figure, but on the order of 10-25%. On a $50 product that is five to twelve
dollars. On a $250 product it is $40-60. Whether either covers a customer is
answered in the CPA section below, and the answer is worse than this file
originally said. And price is not the only axis: Amazon also carries two-day delivery, free
returns and zero perceived risk. Better copy beats a higher price. It rarely
beats price plus speed plus trust on the same object.

## Why MOQ-1 dropshipping cannot meet the condition

Two independent research passes reached the same wall.

At single-unit quantities with no inventory, every obtainable product is
reverse-image-searchable. Branded packaging does not fix it — the object inside
the box still matches a listing. So presentation gets compared against the cheap
version, which is the fight that has now been lost eleven times.

Supplier findings, recorded so they are not re-researched:

- **Zendrop** holds no inventory. Their own help centre states the stock figure
  shown on every product is arbitrary — a default 50,000 to stop the system
  triggering out-of-stock warnings. Custom packaging and private label are gated
  behind a high-volume Private Agent Program with undisclosed MOQ and price.
- **Sellvia**: 361 BBB complaints in three years, not accredited; a reported
  19% referral fee, 15-23% product processing, and a 25% payout reserve held for
  125 days. Its US-warehouse claim is contradicted by independent readings of
  its own terms. Avoid.
- **Doba**: pass-through aggregator with per-order dropship fees on most
  products, and its own reviews report roughly 90% of "wholesale" prices at or
  above Amazon retail.
- **Modalyst**: documented stock phantoms — products listed available that turn
  out unfulfillable, suppliers leaving without listings being removed.
- **Spocket** and **DropCommerce** have the best genuine US supplier quality of
  the marketplaces, but neither can put a bundle in one parcel. Spocket states
  it directly: two suppliers means separate shipping charges and two tracking
  numbers.
- **CJdropshipping** is worth an account only to interrogate an agent. Pricing
  is invisible from outside (every product URL redirects to a bot wall), its US
  stock is largely seller-consigned rather than CJ-owned, and its custom
  packaging documentation names only Chinese warehouses for packaging storage.
  Its Trustpilot rating is currently withheld for a guidelines breach with fake
  reviews removed.
- **EPROLO** carries the only unambiguous public no-MOQ branding claim and no
  monthly fee. Unverified whether that branding applies to US-warehouse orders.

## The three routes that do meet the condition

1. **Print on demand**, where the product carries your own design. One US
   provider, one parcel, no minimum, and nothing to compare against because the
   item does not exist elsewhere.
2. **Private inventory** in a supplier's US warehouse — buy one small batch,
   brand it once, dropship from it. This is what CJ's 30% deposit programme and
   $0.63/CBM/day storage exist for. Requires capital and holding stock.
3. **US wholesale from small brands** via Faire or Abound, self-fulfilled.
   Genuinely uncommon product, at the cost of holding and shipping it yourself.

Routes 2 and 3 both require inventory, which is outside the stated model. Route
1 does not.

## Recommendation: route 1

Print on demand for home and gift goods keeps every stated constraint — no
inventory, no minimums, dropship model, US domestic fulfilment — and removes the
comparison problem entirely rather than trying to out-present it.

- **Printful** runs US facilities in Charlotte NC and Dallas TX with no order
  minimums. Published branding: free custom packing slip with logo, $0.50 per
  insert, $0.50 picking fee for custom packaging, each with a $25/month storage
  minimum.
- **Printify** fulfils custom-label candles through Candle Builders in
  Newfields NH — 4oz to 13.75oz, fourteen scents, your label, no minimum.

What it fixes, point by point:

- No Amazon listing can undercut a design that exists nowhere else.
- Domestic US shipping: no duty, no 12-17 day transit. `US_DUTY_INCIDENCE`
  becomes moot rather than unresolved.
- A 100-SKU catalogue becomes cheap, because one design spans many products.
- The presentation IS the product, so `Product_Optimization_Workflow.docx` stops
  being a polish layer and becomes the manufacturing step. Its weakness — that
  it sets price by multiplier with no market input — is answered by the undercut
  gate, which stays in front of it.
- Timing: candles run about 35% of annual sales in Q4, and gift buyers
  comparison-shop far less than utility buyers.

Existing capability this uses: image generation already runs through Antigravity
with Nano Banana Pro on the PC.

## The acquisition cost, corrected 2026-09-08

This file and `sourcing-record-2026-09-08.md` were first written against an
assumed customer acquisition cost of $20-28, inherited from
`scripts/lib/sourcing-spec.mjs` with no campaign behind it. That figure is
wrong, and it is wrong in the direction that matters.

Measured category benchmarks for Meta, US:

- Home & Garden CPA **$47.93**, conversion rate 1.24% (down 3.57% year over
  year) while CPA rose 6.71%, category AOV $110.41 — Triple Whale, across
  40,000+ brands, Aug 2025-Jul 2026.
- Home & Garden CPA **$37.20 average, $26.84 top quartile, $20.37 top decile**
  — MHI, across 1,247 accounts and $87M of spend.

So the $20-28 previously used is roughly what the best 10% of advertisers
achieve, not a norm. The real bar for a store with no audience is contribution
of about **$45-70 per order**, not the $12 floor in `check-undercut.mjs` and not
the $30-60 assumed when this file was written.

What that reprices, retroactively:

- The coffee grinder at $19.62 contribution was not short by $0.38. It was
  short by roughly $18-28.
- Nothing examined in this project has ever been within range, including the
  two candidates called passes in the sourcing record.
- The eleven product failures are one arithmetic error repeated, not eleven
  separate sourcing misjudgements.

The $12 floor in the gate is deliberately NOT changed. It tests whether a unit
makes money, which is a different and still-useful question. Acquisition is
reported separately and stays advisory, because a category benchmark is not this
store's measured CPA and never will be until a campaign runs.

## Honest risks

- POD margins are thinner than expected once base cost and shipping are counted.
- Generic AI wall art is saturated. The moat is a specific aesthetic point of
  view, not SKU volume.
- Printful's pack-in programme explicitly excludes home decor and drinkware —
  the categories most wanted here. Custom outer packaging is not excluded and is
  the route to test.
- Printify applies full shipping per item when products differ in type or
  provider, which penalises mixed bundles. Keep bundles within one provider and
  one product family.

## The open question, and it is the only one

Printful and Printify base product prices are dashboard-only. They are published
nowhere and repeated fetches confirmed it. Until an account exists, the gate
cannot be run on this route and no margin claim here should be believed.

Printify is free and requires no card.

## Next actions

1. Create a free Printify account; leave it signed in so base costs for candles,
   mugs and home goods can be read and run through `scripts/screen-candidates.mjs`
   against real market prices.
2. If POD economics clear, build one coherent collection rather than 100
   unrelated SKUs, and keep bundles inside a single provider.
3. US first, Canada second. Canadian dropship stock barely exists, and running
   two supplier routes and two price lists before knowing whether anything sells
   is work spent ahead of evidence.

## Fallback if POD economics fail

The niche research ranked **decorative game objects** first on demand grounds —
design-led backgammon, chess and domino sets. One Kings Lane sells these at
$160-215, Tizo at $205-544, and the category's most visible DTC player has 73
reviews on its flagship. Roughly 70% of toy and game revenue lands in Q4, the
strongest seasonality measured. It is bought as decor, so the cheap clone
problem does not apply at the lucite/brass/marble tier.

The reason it is a fallback and not the recommendation: no turnkey dropship
supplier was found for it. Alibaba lists custom acrylic manufacturers but
pricing and MOQ could not be read. If it comes back at MOQ 500, the niche
converts from dropshipping to light inventory and falls outside the model.
