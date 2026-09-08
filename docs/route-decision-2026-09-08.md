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

## The acquisition cost, corrected TWICE on 2026-09-08

This file first assumed $20-28, inherited from `scripts/lib/sourcing-spec.mjs`
with no campaign behind it. The first correction replaced it with $37.20 and a
Home & Garden anchor of $47.93. **Most of that first correction was also wrong**
and is superseded here.

What was wrong with it. Three of the four figures came from a table (MHI,
claiming 1,247 accounts and $87M of spend) that is derived arithmetic rather
than measurement: every CPA in it reproduces to the cent from its own CPC
divided by CVR, Home & Garden and Jewelry land within $0.12 across all three
quantiles with the top-decile ordering inverted, and the publisher is agency
lead-generation SEO. Those numbers are retired and a test now fails if they
reappear.

What survives, from Triple Whale, 40,000+ brands, Aug 2025-Jul 2026 - which
publishes no Gifts, Jewelry or Personalized category at all:

| Industry | CPA | CVR | AOV |
| --- | ---: | ---: | ---: |
| Overall, 17 industries | $38.99 | 1.53% | $73.36 |
| Home & Garden | $47.93 | 1.24% | $110.41 |
| Toys, Art & Collectibles | $34.85 | 1.53% | $69.61 |
| Lifestyle & Boutique | $31.16 | 1.62% | $64.87 |

Home & Garden was the wrong proxy in both directions: it carries the LOWEST
conversion rate of all seventeen industries precisely because it is considered,
high-ticket furniture, and the second-highest AOV. A $22 personalized ornament
is the structural opposite. The defensible band for this kind of store is
$31-39, and the all-industry median is the honest default.

Two caveats that matter more than the numbers:

1. These are spend divided by ALL orders, not cost per NEW customer. The
   identity ROAS = AOV / CPA holds exactly at the overall level, which proves
   it. True new-customer CAC runs roughly 1.5-2.5x.
2. **CPA is per ORDER, not per unit.** The earlier reading compared one unit's
   contribution against a per-order CPA and concluded nothing could ever clear.
   That was an error of about 3x.

## What the operators actually do

Ten stores running continuous Meta ads in personalized gifting were torn down.
Every one that publishes a free-shipping threshold sets it at roughly three
units of its own modal price:

| Store | Free shipping over | Modal price | Units |
| --- | ---: | ---: | ---: |
| febworld | $59.00 | $21.96 | 2.7 |
| trendingcustom | $70.00 | $24.99 | 2.8 |
| barods | $69.99 | $21.99 | 3.2 |
| happary | $79.00 | $21.99 | 3.6 |

Nobody sets a $79 threshold on a $21.99 product by accident. It is calibrated
so the shipping concession only pays out on a three-item cart - which turns a
$22 ticket into a $66-70 order and makes a $31-39 CPA survivable. Supporting
mechanics observed: size ladders that beat the discount codes (barods $21.99 /
$25.29 / $29.69, +35% on one click, against a 10% multi-buy code), anchor
prices at 1.5-2x so the discount costs no real margin, and on the one store
with genuine independent volume (trendingcustom, 23,260 Trustpilot reviews) a
full post-cart stack: gift box $4.99, gift wrap $2.99, greeting card, shipping
protection, priority processing.

None of them has a repeat-purchase mechanic. Gifting is episodic; these are
one-shot acquisition businesses.

This does NOT apply to every product. It is a property of multi-unit-natural
goods - one ornament per grandchild. Nobody buys three coffee grinders. The
screener prints the cart line as explicitly conditional for that reason.

## Q4 runs the opposite way to the assumption

CPMs spike - Cyber Monday 2024 ran 138% above the annualised average - but
measured across 33,000 shops during BFCM 2025, CPA FELL to $34.06 against
$38.99 full-year, and ROAS rose 20%. Conversion and basket size climb faster
than media cost. For a gifting business Q4 is the cheapest acquisition window
of the year, not the most expensive.

## A caveat on the ad-longevity evidence

Continuous ad presence is weaker evidence than it looks in this category.
barods, febworld and happary share a theme AND the same typo in their shipping
policy ("businiess days"); getnamenecklace, insgifts and joymemento share a
shipping ladder and returns copy verbatim. These are clone networks with near
zero marginal cost per storefront. barods has run 986 days with 68 Trustpilot
reviews at 1.7 stars; trendingcustom has run 336 days with 23,260 reviews and
the full offer stack. The stores that visibly have the AOV architecture are the
ones with real volume - that correlation is the signal, not the day count.

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
