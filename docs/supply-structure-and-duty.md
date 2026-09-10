# Supply structure and duty — non-electrical goods

Companion to `claude/sourcing-findings.md`, which holds the lighting-side
findings, the voltage gate and screening rules 1–13. This doc adds rules
**14 and 15**, the finding that closes the anchor-product question, and the
HTS 4602 duty read. Read both.

## The multi-niche sweep — 2026-09-09, and it closes the anchor question

Daniel asked for spread across niches and price points so the store is not
only for people spending close to $100. A 107-listing sweep across nine
searches was run to find it. The result is not more products; it is a
structural finding about what AliExpress can and cannot supply.

### Two measurement errors found first, both of which invalidate earlier work

**14. The search-grid price is unreliable and must never be computed with.**
Measured by opening the listing page for four candidates ranked off the grid:

| listing | grid price | listing-page price |
|---|---|---|
| 3256809216685443 wicker wall planter | $25.13 | **$6.89** |
| 3256808529476592 corner shelf | $76.95 | **$32.97** |
| 3256802101982868 seagrass basket (4K+ sold) | $8.46 | $7.45 |
| 3256807353520391 candle holder (2K+ sold) | $19.03 | $18.62 |

The grid is roughly right on high-volume listings and badly wrong on
low-volume ones, where it appears to surface a multi-pack or pre-discount
figure. **Grid for discovery only. Every number that enters a decision comes
off the listing page.** The AliExpress price *filter* is equally unreliable —
all four above were returned inside price bands they do not belong to.

**15. "N sold" on the grid is the listing-group total, not the seller's
volume.** On low-volume listings the product page splits it:

    This seller: 21 sales | Total sales: 101

Two separate candidates, surfaced at grid figures of 101 and 606, both showed
**21 sales** for the seller actually being bought from. High-volume listings
show a plain "4,000+ sold" with no split and are trustworthy. Every ranking in
this file that came off an Orders-sorted grid without a listing-page check is
weaker than it looks.

### Woven natural goods are a sub-$20 supply pool. There is no woven anchor.

Unfiltered `rattan woven basket` sorted by Orders: **7 of 8 listings under
$10, one under $20, none at $20 or above.** Every search run with a price
floor above $20 either returned an unrelated category or a handful of
23-to-50-sale one-offs:

| search | price floor | what came back |
|---|---|---|
| rattan wall mirror | $30 | LED vanity mirrors, bathroom mirrors, a 50-pc wholesale lot. **Zero rattan wall mirrors.** |
| seagrass basket large blanket | $20 | **Li-Ning basketball shoes** — matched on "basket" |
| rattan storage basket large | $22 | 2 real items: 50 sold and 23 sold |
| woven floor basket plant | $25 | collapsed to attach tier on listing-page check |

This is the third time the same shape has appeared (rattan mirrors, floor
baskets, large seagrass). It is not bad candidate selection. **Woven goods
cannot produce an anchor product at any price the CPA benchmarks require.**

The only anchor lane that has ever cleared the gate is lighting, and the
reason is now legible: the electrical component is what carries the price.
That is the same fact the voltage section reports from the other side —
the thing that makes lighting marginable is the thing that makes it scarce.

**Catalogue structure the evidence supports:** lighting is the anchor tier and
the only thing paid traffic points at. Woven goods are the attach tier at
$25-40 retail, bought alongside an anchor, never acquired on. That answers the
sub-$100 customer without pretending a $9 basket can pay a $47.93 CPA.

Attach-tier shelf found (all high-volume, so grid prices are trustworthy
within a few percent, and all confirmed non-electrical):

| listing | price | sold | item |
|---|---|---|---|
| 3256802101982868 | $7.45 verified | 4,000+ | Zerolife seagrass basket |
| 3256807353520391 | $18.62 verified | 2,000+ | metal molecular candle holder |
| 3256808343209670 | ~$12.01 | 1K+ | wicker picnic basket |
| 3256802840183828 | ~$9.06 | 1K+ | rattan wicker rectangular basket |
| 3256807801240170 | ~$14.33 | 1K+ | imitation rattan rectangular basket |
| 3256811824647058 | ~$6.04 | 1K+ | ceramic succulent pot |
| 3256806780680235 | ~$11.73 | 1K+ | 3pc metal candle holder set |

None of these have been clamp-tested. Rule 4 still applies to every one.

## Duty on non-electrical woven goods — HTS 4602, read 2026-09-09

Read from the primary source, USITC Harmonized Tariff Schedule 2026
Revision 18, via the `/reststop/exportList` JSON endpoint. **General
(Column 1) MFN rates only:**

| HTS | article | MFN |
|---|---|---|
| 4602.11.07.00 | bamboo, baskets/bags, **wickerwork** | **Free** |
| 4602.11.09.00 | bamboo, baskets/bags, other | 10% |
| 4602.11.35.00 | bamboo, other articles, **wickerwork** | **Free** |
| 4602.11.45.00 | bamboo, other articles, other | 6.6% |
| 4602.12.14.00 | rattan, baskets/bags, **wickerwork** | **Free** |
| 4602.12.16.00 | rattan, baskets/bags, other | 5% |
| 4602.12.35.00 | rattan, other articles, **wickerwork** | **Free** |
| 4602.12.45.00 | rattan, other articles, other | 6.6% |
| 4602.11.05.00 / 4602.12.05.00 | fishing baskets or creels | 5% |
| 4602.11.21.00 | bamboo luggage/handbags/flatgoods | 6.2% |
| 4602.12.25.00 | rattan luggage/handbags, other | 18% |

Compare lighting: 9405.11.80 is 3.9% MFN.

**The wickerwork / "other" split is a Free-vs-10% swing on bamboo and
Free-vs-5% on rattan.** It is therefore a sourcing criterion, not paperwork.
The definition lives in an Additional U.S. Note to Chapter 46 and **has not
yet been read** — it is not carried in the JSON export. Read it before
classifying anything.

### What is NOT established: the Section 301 adder for 4602

Do not assume it is zero and do not assume it is 25%. What was tried:

- `hts.usitc.gov` and `content.govdelivery.com` are **blocked by this
  session's egress policy** — 403 on CONNECT, logged in the agent proxy's own
  failure record. Reachable through the browser, not the container.
- CBP CROSS ruling **N320608** ("The tariff classification of baskets from
  China") renders 435 characters of page chrome and no ruling body. Failed.
- HTS **Chapter 99** downloads as a PDF with compressed streams; text is not
  extractable in-page. U.S. note 20(f) — the enumerated subheading list that
  9903.88.03 actually points at — was never reached.
- The HTS JSON `footnotes` field is **empty for all of 4602**. This proves
  nothing: a **control test on 9405.11.80**, which is known to carry Section
  301, returned an empty `footnotes` field as well. The field carries no
  Section 301 information at all. Reading absence here as "no 301" would have
  produced a confidently wrong duty stack.
- A third-party summary of CBP's July 2026 forced-labour HTS list reported
  4602.12 codes appearing under Malaysia, Cambodia and Guatemala sections.
  **Not relied on** — the host is egress-blocked, so it was never checked
  against the primary document.

The practical resolution is unchanged and is the same one the lighting stack
needs: **the DSers Tax&Fee line on the first real order.** That single
measurement now settles the duty basis for both tiers.

## The clamp sweep — 2026-09-09/10. Baskets are zero for six.

### First: a much cheaper clamp test

The stock ceiling does not need the type-999-into-the-quantity-box method.
It is readable straight out of `window._d_c_` on the listing page:

    const s = JSON.stringify(window._d_c_ || {});
    s.match(/"maxBuyCountStr":"[^"]*"/g)      // per-SKU ceiling
    s.match(/"totalAvailableInventory":\d+/g) // listing-wide total

`maxBuyCountStr` returns one entry per SKU, reading either `"N available"`,
`"Only N left"`, or `"Sold out"`. This is the rule-4 number, per SKU, in one
call with no clicking, no dropdowns and no DSers overlay to peel off. It also
sidesteps the failure where a click lands but the widget does not update.

Caveat found in use: a value of exactly `"100 available"` repeated across
several SKUs looks like a display cap rather than true depth. Treat a listing
whose SKUs all read exactly 100 as soft, not as 100 confirmed.

### Results — ten listings clamped

| listing | item | material | price (page) | total inv | verdict |
|---|---|---|---|---|---|
| 3256802101982868 | Zerolife seagrass basket, **4,000+ sold** | seagrass | $7.45 | **12** (5/2/3/2) | reject |
| 3256808343209670 | wicker picnic basket, 1K+ | wicker | $12.01 | **21** (13/8/8) | reject |
| 3256802840183828 | rattan rectangular basket, 1K+ | rattan | $9.06 | **6**, 3 SKUs sold out | reject |
| 3256807801240170 | "imitation rattan" basket, 1K+ | **plastic** | $14.33 | **15** | reject |
| 3256808868437180 | tote basket, 986 sold | natural | $9.69 | **1** | reject |
| 3256811824647058 | ceramic succulent pot, 1K+ | ceramic | $6.04 | **7** | reject |
| 3256810099237500 | taper ribbed candle holder | metal | $9.65 | **77**, 2 sold out | reject |
| 3256807353520391 | molecular candle holder, 2,000+ | metal | $18.62 | **7,939** (897/1306/1283/929/1789/1735) | **PASS** |
| 3256806780680235 | 3pc European candle holder, 1K+ | metal | $11.73 | **10,155** — but 3 SKUs at "Only 2 left" | **PASS, SKU-conditional** |
| 3256810386345059 | 3pc metal candle holder | metal | $3.48 | 307, four SKUs at exactly "100 available" | **PASS, soft** |

### The finding

| category | clamped | passed |
|---|---|---|
| baskets | 6 | **0** |
| ceramic pots | 1 | 0 |
| candle holders | 4 | **3** |

**Baskets are zero for six across four different materials** — seagrass,
wicker, rattan and plastic. A material-driven explanation was drafted and
then killed by the plastic test: the imitation-rattan basket is not a natural
material and failed exactly like the natural ones. **The thin stock tracks
the basket/storage category, not the material.**

Note how badly the sold count misleads here. The seagrass basket has 4,000+
sold against 12 units of stock; the tote basket has 986 sold against **one**.
Volume history says nothing about whether the thing can be bought tomorrow.

**Consequence for the catalogue, stated plainly because it is inconvenient:**
the obvious brand extension for a woven-lighting store is woven baskets, and
woven baskets are the single thing that cannot be sourced at depth. The attach
tier that actually exists is tabletop decor in metal — less on-brand, but
real and deep. Either the brand stretches to cover it or the attach tier
stays empty.

Nothing here has been costed. `3256807353520391` at $18.62 with 7,939 units
is the only candidate that passed cleanly and is the one to take through
shipping, images, the Amazon weakness gate and the undercut model next.
Its duty classification is **not** 4602 — it is metal, not plaiting material,
so the HTS read above does not cover it and a fresh classification is needed.

## The candle holder taken to verdict — and rule 16, which reorders the screen

`3256807353520391`, Shenyushop Store (Trader), the only clean clamp pass.

**Full SKU map**, every reading verified by reading the selection label back
after the click (two earlier clicks landed but the page had shifted and the
SKU never changed — the read-back is the only reason two SKUs were not
recorded at the wrong price):

| SKU | price | stock |
|---|---|---|
| 1PCS Black | $18.62 | 929 |
| 1PCS Silver | $19.03 | 1,306 |
| 1PCS Gold | $19.03 | 897 |
| 3PCS Black | $46.49 | 1,789 |
| 3PCS Silver | $47.02 | 1,283 |
| 3PCS Gold | $47.02 | 1,735 |

Alloy and stainless steel, 31 x 18 x 16 cm, 0.800 kg — real dimensional data,
unlike the baskets (one claimed 5 x 5 x 5 cm at 0.010 kg).

**Rule 2 checked and CLEARED for once.** The page reads "51% off $38.00",
which is the shape of the limited-quantity promo trap. It is not one here:
the DSers Import List API cost reads **$18.62 ~ 47.02**, identical to the
page. Rule 2 still applies everywhere else; this listing simply passes it.

**The new clamp read is cross-validated.** `totalAvailableInventory` from
`_d_c_` gave 7,939; DSers independently reports Stock 7,939. Two sources,
same number.

### Gate results

| gate | result |
|---|---|
| rule 4 clamp | **pass** — 897–1,789 per SKU, all six deep |
| rule 5 shipping | **pass** — free, Sep 17–23, 86.7% ≤ 14 days |
| rule 9a Amazon reviews < 3000 | **pass** — max 997, median 162 |
| rule 9b sellable under category median | **FAIL** |

Amazon, `molecular candle holder centerpiece`: 48 organic, median **$21.73**,
33 of 48 under $30. Amazon, `candlestick holders set of 3 centerpiece metal`:
60 organic, median **$20.39**, max **$53.99**, nothing at $60 or above.

The 1PCS costs $18.62 into a $21.73 median. The 3PCS costs $47.02 into a
category whose ceiling is $53.99. **Both SKUs fail for the same reason: the
category is cheap on Amazon.** Selling the 1PCS under the median leaves about
$3 before duty.

**Verdict: reject.** Deep stock was necessary and not sufficient.

Considered and rejected: relaxing rule 9b for attach items, on the argument
that a customer already committed to an anchor does not comparison-shop the
add-on. It would let this product through at ~$34 retail for ~$14
contribution, and it would fix nothing — a customer who later finds the same
holder for $20 is a refund and a trust problem on the whole $120 order, not
just on the $34 line. **Rule 9b stands for attach items.**

### Rule 16 — measure the SPREAD first, clamp second

Ten listings clamped in this sweep produced three clamp passes and **zero
sellable products**. Every one died on price headroom, which is a check that
was being run last.

The material section of `sourcing-findings.md` already had the answer in it:
rattan and bamboo command roughly 3x what rope does for the same fixture.
That is a *spread* measurement — Amazon page-1 median against AliExpress
supplier cost — and the spread, not the volume and not the stock, is what
predicts whether a product can be sold at all.

**Screen in this order:** Amazon median vs AliExpress cost (rule 9b) FIRST,
on the category, before touching individual listings. Then clamp the
survivors. Clamping is now a single JS read, so it is cheap and belongs
second. Sold counts and stock depth are worth nothing without headroom.

Candle holders are closed as a category on this basis, at every price point
tested, regardless of how deep the inventory runs.

## Rule 17 — the search method was the bottleneck, not AliExpress

Daniel pushed back on the suggestion that AliExpress cannot supply the attach
tier. He was right, and the earlier conclusion was drawn from a biased sample:
**all thirteen clamped listings came in through one door — Orders-sorted
keyword search on aliexpress.us.** That is a sample of one search behaviour,
not of the platform.

### The two sorts fail in opposite directions

| surface | relevance | stock depth |
|---|---|---|
| aliexpress.us, Orders sort, multi-word query | on-category | **1–77 units** |
| DSers Find Products, Orders sort, multi-word query | **collapses** | 3,000–10,000 orders |

The DSers collapse is the same single-word matching failure already recorded
for `plug in rattan wall lamp`. Query `macrame wall hanging tapestry` sorted
by Orders returned: adhesive wall hooks (10,000 orders), a wooden banana rack,
30pcs double-sided tape, iron-on hem tape, custom photo banners. **Zero
macrame.** The engine matches any common word — "wall", "hanging",
"tape(stry)" — and the highest-order item matching any common word is always
a cheap commodity consumable.

So the sort that surfaces depth destroys relevance, and the sort that keeps
relevance never shows depth. That, not the platform, is why every on-category
listing clamped thin.

### The fix, verified

**Single distinctive word + Category filter + Orders sort, in DSers.**

`rattan` + Category `Home & Garden` + Orders returned, on-category and deep:

| product | cost | orders |
|---|---|---|
| Natural Rattan Bread Proofing Basket (banneton) | $5.53–22.72 | **3,000** |
| Rattan Bread Proofing Basket, oval | $5.98–17.27 | **3,000** |
| Handwoven Rattan Tray & Storage Basket with lid | $8.14–10.48 | 1,000 |
| UPORS Rattan Bread Proofing Basket | — | — |

Multi-word queries are the failure mode on BOTH surfaces. Use one word and
let the category filter do the narrowing.

### Bulk stock screening — the thing the DSers subscription is actually for

DSers Find Products exposes **no stock filter and no stock sort** (Product
Constraints offers only a price range; Sort offers Default / Orders / Price).
But the **Import List shows Stock per product**, and Find Products imports up
to **20 at a time**.

So: select up to 20 → Add to Import List → read all twenty stock figures from
one page. Twenty stock readings for one page load instead of twenty. Delete
the rejects afterwards.

First run of it, five rattan candidates:

| cost range | listing stock |
|---|---|
| $11.52 – 18.77 | **248** |
| $9.89 – 22.24 | **307** |
| $6.05 – 17.14 | 66 |
| $7.57 – 8.93 | 43 |
| $11.01 – 13.73 | 69 |

Two clear 100+, which nothing from the aliexpress.us door ever did. **CORRECTION — this filter does not work the way it was first written up
here.** DSers Stock is the listing-wide sum, which is the number rule 4
already warns is meaningless, and the two listings above that looked like
passes both died on the per-SKU clamp (see below). The bulk screen is valid
only as a ONE-SIDED reject: a listing showing Stock 6 cannot contain a deep
SKU, so drop it. A high total says nothing whatever. Every survivor still
needs its own `_d_c_` clamp, one listing at a time, so the throughput gain is
in gathering candidates, not in deciding them.

### The screen, in final order

1. **Amazon median vs supplier cost** on the CATEGORY (rule 16). No headroom,
   no further work.
2. **DSers bulk stock screen** — one word + category + Orders, import 20,
   read Stock, keep the deep ones.
3. **Per-SKU clamp** via `maxBuyCountStr` in `_d_c_` (rule 4).
4. Shipping, spec/voltage, images, undercut model.

### Bannetons — measured, and marginal

Amazon `banneton bread proofing basket rattan`: 60 organic, median **$21.97**,
p75 $24.99, max $37.99, max reviews **919** (rule 9a passes), median reviews 65.

Against $9.89–11.52 at the low end of the two deep listings, selling at $19.99
to stay under the median returns **$8.50–10.10** — under the $12.00
`MIN_CONTRIBUTION_USD` floor. Fails, but by the narrowest margin of anything
tested. Worth revisiting if the per-SKU clamp shows the cheap SKU is the deep
one, or if a cheaper supplier turns up through the corrected search method.

## Bannetons clamped — and the bulk screen disproved, 2026-09-10

| listing | sold | DSers listing stock | best single SKU | verdict |
|---|---|---|---|---|
| 1005004276749125 Natural Rattan banneton, $5.53 | 10,000+ | 66 | **10** | reject |
| 1005006691583009 Oval banneton, $5.08 | 10,000+ | **307** | **9** | reject |
| 1005005077838719 UPORS banneton, $7.56 | 2,000+ | **248** | **2**, most SKUs Sold out | reject |

Banneton A's twelve SKUs read 3, 2, 9, 10, 3, 9, 4, 4, 4, 2, 8, 3. Banneton
B's read 6, 1, 2, 5, Sold out, 3, 6, 9, 4, 7, 2, 9. Ten thousand units sold
between them and nothing above ten on any SKU a customer could actually pick.

**This is the direct disproof of the DSers bulk stock screen.** B and C were
the two that cleared the 100-unit listing-wide bar and both are dead. The
listing-wide figure and the per-SKU figure are not correlated closely enough
for the former to filter on.

### Running tally for the whole sourcing effort

**Sixteen listings clamped across seven categories. Zero sellable products.**

- 3 passed the clamp (all candle holders) and all 3 failed rule 9b on price
- 13 failed the clamp on stock, including 2 that the DSers bulk screen passed

Two structural conclusions were drawn during this work and one of them was
wrong — "natural materials cannot hold stock" was killed by a plastic basket
failing identically. The second, that woven goods are a sub-$20 supply pool,
still stands but has not been stress-tested the same way. Treat both with
suspicion; what is solid is the per-listing measurements above.
