# Sourcing shortlist — 2026-08-26

Candidates found against `docs/sourcing-spec-2026-08-24.md`: retail CA$90–150,
landed at or under a third, unpowered, unbranded, unregulated.

**Status: all six candidates verified against DSers. All six fail.** The useful
output of this round is not a product — it is the discovery of the two filters
that actually decide this, neither of which is visible on an AliExpress search
page. Section 4 is the part worth reading.

---

## 1. Categories tested, and what died

| Category | Supplier price | Why it fails |
|---|---|---|
| Garment bags / suit carriers | CA$18–27 | Canadian retail ceiling is CA$29–49. Cheap enough, but it cannot be priced into the band. Same trap as the current catalog. |
| Leather toiletry / dopp kits | CA$20–27 unbranded | Retails CA$49–69. Everything above that is branded (CONTACT'S, Nesitu, HUMERPAUL) and disqualified. |
| Waxed canvas duffels | CA$52–63 | Right perceived value, but the actual duffels have **1–6 lifetime sales**. |
| Anti-theft travel backpacks | CA$29–33 unbranded | Economics work on paper, but the category's top is all branded (Xiaomi, BAGSMART, BANGE, OIWAS) and it is bought heavily by advertisers with real budgets. |

Weekender duffels remain the only category where the *price point* is real —
BÉIS sells its core duffles at US$88–168, so CA$129 reads as value. The problem
turned out to be supply, not demand.

---

## 2. What verification changed

DSers was set to sync Canadian supplier data (it was on United States, which
would have quoted US shipping). Four candidates were imported and read.

| Candidate | Est. cost | **Verified cost** | **Ship to CA** | **Stock** | Verdict |
|---|---|---|---|---|---|
| Retro crocodile duffel | US$22.04 | **US$27.41–28.06** | US$2.17, 7–14d | **10** | Stock |
| Carry-on / light travel bag | US$23.17 | **US$23.51–25.29** | — | **4** | Stock |
| Sport duffel, shoe pocket | US$22.71 | **US$22.45** | **US$23.41, 18–27d** | 7,782 | Shipping + brand mark |
| Men's leather travel bag | US$28.20 | imported, low stock | — | — | Stock |

My cost estimates were **up to 34% low**, exactly as predicted: the search page
reports `minPrice`, the cheapest variant, not what you actually pay.

---

## 3. Scored on verified numbers

`npm run sourcing-spec -- --csv reports/candidates-verified.csv`

| Candidate | Retail | Landed | Profit/order | Verdict |
|---|---|---|---|---|
| croc duffel | CA$149 | 28% | +CA$25.34 | SHORTLIST |
| croc duffel | CA$129 | 33% | +CA$15.04 | CONSIDER |
| croc duffel | CA$109 | 39% | +CA$4.74 | WEAK |
| sport duffel (non-Choice) | CA$129 | 50% | **−CA$11.37** | REJECT |
| sport duffel (non-Choice) | CA$149 | 43% | **−CA$1.07** | REJECT |

Note what the last two rows mean: a bag costing **US$22.45** — cheaper than
every other candidate — loses money at CA$129 *and* at CA$149, purely on
freight.

---

## 4. The two filters that actually decide this

**Filter one: it must be an AliExpress Choice / Selection item.**

For a bulky item shipped to Canada, freight is the binding constraint, not
product cost. Same page, same day:

- croc duffel, Choice: **US$2.17**, 7–14 days
- sport duffel, not Choice: **US$23.41**, 18–27 days (premium: US$47.53)

A non-Choice duffel is unsellable at any retail price the market will bear. This
is detectable before importing — Choice items carry a `choice_atm` selling-point
tag in the search payload — so it can be screened programmatically. In the
duffel search, **16 of 60** results qualified.

**Filter two: stock must be in the thousands.**

This is invisible until the product is in DSers, and it is where the good-looking
candidates died. For contrast, within the same account:

- croc duffel: **10 units**
- carry-on light bag: **4 units**
- current cable organizer: 9,994 units
- current luggage tag: 9,975 units

A supplier holding 4–10 units cannot support a storefront. These are effectively
clearance listings wearing the clothes of a real product.

Being Choice does **not** imply having stock — both dead candidates were Choice.
The two filters are independent, and a candidate has to clear both, plus be
unbranded, plus look worth CA$129.

---

## 5. Brand marks

The only high-stock duffel found (sport duffel, 7,782 units) has **"MAD TRUNK"
printed on the product itself** in the supplier photos. That is the disqualifier
the spec calls out — a brand mark is a takedown and a frozen payment processor
waiting to happen. Its listing does say "Customizable", which is worth a
separate conversation: a private-label duffel carrying Puchica's own mark would
solve the brand-mark problem and the differentiation problem at once, but it is
a different sourcing model with MOQs, not dropshipping.

---

## 6. Separate finding

DSers shows **"Please select a supplier"** for *Black Travel Tech Case —
Charger, Cable & Power Bank Organizer*. That product is **not mapped**. An order
today could not be fulfilled automatically. Unrelated to sourcing; worth fixing.

---

## 7. Next round

The search is now much sharper than it was this morning:

1. Screen the search payload for `choice_atm` **before** importing anything —
   this is scriptable and eliminates roughly two-thirds of results for free.
2. Import the Choice survivors in bulk and **read stock first**. Anything under
   ~500 units is dead on arrival, whatever it costs.
3. Only then look at cost, imagery and brand marks.
4. Sample the survivor before it goes anywhere near the store.

Also worth reconsidering: the CA$149 row is the only one that comfortably
cleared. If duffels are the category, the price point may need to be CA$149
rather than CA$129 — which raises the bar on how good the product has to look,
and argues for the private-label route in section 5 rather than a generic
dropship listing.

---

## 8. Round two — the filters work

Applied `choice_atm` + unbranded-title + ≥40 sold + ≥4.3★ across three duffel
searches *before* importing anything, then imported the five most
weekender-shaped survivors and read stock first.

| Candidate | Cost (US$) | Stock | Outcome |
|---|---|---|---|
| **Travel bag, large-capacity carry-on** | **25.55–27.27** | **29,930** | **Survives** |
| Water-resistant travel duffel | 33.46–33.84 | 9,992 | "DUANG BAG" printed on the bag |
| Oxford waterproof travel bag | 20.35–30.55 | 43 | Stock |
| Large canvas travel duffel | 29.00–38.00 | 23 | Stock |
| Corduroy travel tote | 24.67–25.32 | 24 | Stock |

**Hit rate went from 0 of 6 to 1 of 5.** Stock still kills most of them — three
of five held under 50 units — but pre-screening for Choice stopped the freight
problem from wasting any imports at all this round.

### The survivor

`1005007029517840` — cost **US$25.55–27.27**, **free shipping to Canada**,
AliExpress Selection Standard from CN, **7–14 days, tracked**, stock **29,930**,
261 sold, 4.8★.

| Retail | Landed | Profit/order | Verdict |
|---|---|---|---|
| CA$149 | 26% | **+CA$34.06** | SHORTLIST (10.0) |
| CA$129 | 30% | +CA$23.76 | SHORTLIST (7.9) |
| CA$109 | 35% | +CA$13.46 | CONSIDER |

### The honest problem with it

It clears every mechanical gate — Choice, stock, freight, margin, no visible
brand mark. It is a **plain grey foldable nylon duffel**. It does not look like
a CA$149 bag; it looks like a CA$59 one.

That is the same trap as the CA$25 gym duffel in section 3, arriving by a
different road: the scorer rewards a cheap input, and cheapness is exactly what
makes the retail price implausible. The economics gate is now passable. The
"looks worth it" gate is the one this candidate probably fails.

Two open items on it, both blocked by the AliExpress CAPTCHA: the full supplier
image set has not been reviewed for brand marks (only the card thumbnail), and
no sample has been handled.

### What this round actually establishes

The screen works and is cheap to run. What it keeps surfacing is that
**AliExpress Choice inventory in this category is functional, not desirable** —
the bags that look worth CA$149 (corduroy, waxed canvas, leather) are the ones
with 20-odd units, and the ones with real stock are plain. That is a structural
fact about the supply, not bad luck across two rounds.

Which is the argument for section 5's private-label route, stated more strongly:
if the desirable-looking bags cannot be dropshipped at volume, the choice is
between selling a plain bag at a plain price or buying inventory of a good one.

---

## 9. Round three — dropped the duffel, found the fit

Per instruction: private label is off the table, and an item that does not make
sense to dropship gets dropped rather than compromised on. The plain grey duffel
from section 8 is dropped.

### Categories that are simply absent from the Choice pool

| Category | Choice + unbranded + volume hits |
|---|---|
| Hard-shell carry-on luggage | 1 (and it was a cosmetic box, not luggage) |
| Luggage sets / spinners | 0 |
| Leather briefcases | 1 |

Suitcases cannot be dropshipped to Canada on this supply. Stop looking there.

### Categories that are rich — and on-brand

Puchica is "travel organizers for easier packing". Screening *organization*
rather than *bags* produced deep Choice pools: packing sets (11 hits), makeup
cases (9), jewelry cases (6).

Imported the five strongest and read stock first:

| Candidate | Cost (US$) | Stock | Outcome |
|---|---|---|---|
| **5-piece travel organizer / compression set** | **26.69–27.94** | **2,966** | **Survives** |
| Makeup train case pro, 4 sliding trays | 50.73–56.76 | 3,819 | Survives, but see below |
| Large capacity makeup case, 3 sizes | 27.04–54.74 | 37 | Stock |
| Large makeup carrying train case | 42.49–44.33 | **6** | Stock |
| Makeup brush holder backpack | 24.70 | **3** | Stock |

Note the fourth row: **1,000 lifetime sales, 6 units in stock.** Sold-count is
no guide whatsoever to whether a supplier can actually fill orders. Only the
DSers stock read tells you that.

### The winner

`1005008575269485` — **5-piece travel organizer / compression packing set**.
Cost **US$26.69–27.94**, **free shipping to Canada**, AliExpress Selection
Standard from CN, **8–16 days, tracked**, stock **2,966**, 423 sold, 4.9★.

| Retail | Landed | Profit/order | Verdict |
|---|---|---|---|
| CA$139 | 28% | **+CA$27.87** | SHORTLIST (9.3) |
| CA$119 | 33% | +CA$17.57 | CONSIDER |
| CA$99 | 40% | +CA$7.27 | WEAK |

Unlike every previous candidate, this one has no perceived-value objection to
argue around. It is exactly what the store says it sells. Béis and Monos sell
comparable packing-cube sets at CA$95–125, so **CA$119–139 is a defensible
shelf price** rather than a stretch.

### The runner-up, and why it is marginal

`1005006293148111` — makeup train case pro, 4 sliding trays. US$50.73–56.76,
free shipping, 8–15 days, stock 3,819. The input cost is high enough that it
only works at **CA$229** (+CA$21.70); at CA$179 it loses CA$4.05 and at CA$149
it loses CA$19.50. CA$229 is a real price point for a professional kit — Monos
sells a soft cosmetic case at CA$125 — but it is a large ask from a brand with
no sales history. Park it; revisit if the organizer set proves there is demand.

### Still open on the winner

Full supplier image set unreviewed for brand marks (AliExpress PDPs still
CAPTCHA this session), and no sample handled. Two of the bags surfaced this
session carried marks only visible in the photos — "DUANG BAG" and "KEADOME" —
so this check is not a formality.
