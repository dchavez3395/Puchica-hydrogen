# DSers re-verification: routes, costs, and supplier stock — 2026-08-25

Scope: every offer in `APPROVED_CATALOG_OFFERS`. Read directly in DSers on
2026-08-25 through two views per product — **Shipping info** (ship-to Canada,
exact mapped SKU selected in the drawer) and **More Actions › Check details ›
Variants** (exact per-variant cost, storefront price, Stock on Store, Stock on
Supplier).

United States routes were **not** re-read today. Those rows in the baseline are
carried forward from 2026-08-21 and are labelled as such.

## Canada routes — all five single-item offers clear

Every Canadian route resolved to exactly one service. No untracked alternative
was offered on any of them.

| Offer | Mapped SKU | Carrier | From | Shipping | Delivery | Tracking |
|---|---|---|---|---|---|---|
| Black Hanging Travel Toiletry Organizer | `14:771#Black` | AliExpress Selection Standard | CN | US$2.17 | 7–15 days | Available |
| Charcoal 3-Piece Packing Cube Set | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | AliExpress Selection Standard | CN | US$1.99 | 7–15 days | Available |
| White Semi-Circular Travel Jewelry Case | `14:29` | AliExpress Selection Standard | CN | US$2.17 | 8–15 days | Available |
| Black Double-Layer Travel Cable Organizer Case | `14:193#Double Layers` | AliExpress Selection Standard | CN | US$2.17 | 7–14 days | Available |
| Black Travel Tech Case | `14:29#Black` | AliExpress Selection Standard | CN | US$2.17 | 7–15 days | Available |

The Carry-On Kit is a bundle of the toiletry organizer, packing cubes, and cable
case. It has no route of its own: it ships as three separate DSers orders, so
its figures are the sum of those three rows and its delivery window is the
widest of the three (8–15 days), not the narrowest.

### Delivery windows widened slightly since 2026-08-21

The 2026-08-21 baseline recorded 8–14 / 8–13 / 9–14 day windows. Today's
quotes run 7–15 on most offers — one day earlier at the fast end and one day
later at the slow end. Nothing on the storefront currently publishes a numeric
delivery promise (`pages.shipping` states delivery is checked per product and
makes no commitment), so there is no live copy to correct. If a numeric window
is ever published, **15 days** is the figure the current evidence supports, not
14.

## Supplier costs — all five moved, none adversely

| Offer | 2026-08-21 | 2026-08-25 | Change |
|---|---|---|---|
| Charcoal 3-Piece Packing Cube Set | US$12.45 | US$12.01 | −0.44 |
| Black Hanging Travel Toiletry Organizer | US$8.32 | US$8.31 | −0.01 |
| Black Travel Tech Case | US$7.26 | US$7.26 | — |
| White Semi-Circular Travel Jewelry Case | US$4.29 | US$4.30 | +0.01 |
| Black Double-Layer Travel Cable Organizer Case | US$4.05 | US$3.81 | −0.24 |

Kit component cost therefore falls from US$24.82 to US$24.13, and kit Canadian
supplier shipping rises from US$6.14 to US$6.33. Net effect on the kit's landed
supplier cost is a US$0.50 improvement. No margin threshold moves.

## The finding that matters: Shopify inventory was overstating two products

`Stock on Supplier` in DSers is the real ceiling. `Stock on Store` is what
Shopify will sell before `inventoryPolicy: DENY` stops it. Those two had drifted
apart badly.

| Offer | Supplier had | Shopify was selling | Gap |
|---|---|---|---|
| **Black Travel Tech Case** | **8** | **9,933** | 9,925 |
| **Black Double-Layer Cable Organizer Case** | **19** | 65 | 46 |
| Charcoal 3-Piece Packing Cube Set | 289 | 291 | 2 |
| Black Hanging Travel Toiletry Organizer | 48 | 48 | 0 |
| White Semi-Circular Travel Jewelry Case | 959 | 960 | 1 |

The tech case is the worst of these on every axis: it is the highest-priced
single item in the catalog (CA$34.99), it is the one the storefront leans on
hardest, and it could be sold nine thousand times over before Shopify's own
stop-selling rule fired. Every one of those orders past the eighth would have
been unfulfillable at the price we charged, arriving as refunds and chargebacks
rather than as a stockout the customer never sees.

**Corrected on 2026-08-25** — all four drifted variants set down to the supplier
figure at `dsers-fulfillment-service`, reason `correction`:

- `14:29#Black` (tech case): 9,933 → **8**
- `14:193#Double Layers` (cable case): 65 → **19**
- `14:1052#S3007 Black;…` (packing cubes): 291 → **289**
- `14:29` (jewelry case): 960 → **959**

Setting inventory *down* to the supplier figure can only prevent overselling, so
this was safe to do without waiting. It is a snapshot, not a fix: supplier stock
moves, and whatever normally syncs these numbers plainly is not keeping up. The
gap needs a scheduled reconciliation, not another manual pass.

## Open issue: the Carry-On Kit is uncapped

The kit variant `PUCHICA-KIT-CARRYON-01` has `inventoryItem.tracked: false`, so
Shopify will sell it without limit. Its true ceiling today is **19** — the cable
case, its scarcest component.

This was deliberately **not** changed. Turning tracking on and setting it to 19
would double-count: the same 19 cable cases back both the kit and the standalone
cable-case listing, and Shopify has no component-inventory relationship between
them. Resolving it properly means either a bundles app that decrements
components, or accepting a manual cap well below 19 on both listings. That is a
decision, not a correction.

## Not re-verified today

- **United States routes.** Carried forward from 2026-08-21 unchanged. The
  packing-cube US row still rests on an AliExpress listing page rather than
  DSers, and still carries its "re-check before relying on the zero" caveat.
- **Product imagery.** Noted in passing from the Check details tabs: the jewelry
  case has **1** image, the toiletry organizer **3**, the tech case **6**, the
  cable case **12**, the packing cubes **14**. The jewelry case at one image is
  the thinnest listing in the catalog.

## Mapping status

39/39 mapped, `Unmapped: 0`. The eight supplier notifications all concern SKUs
on archived or never-launched products (hair iron, bicycle bell, stroller hook,
sweater, sweatpants, anti-fall pillow) — none touch an approved offer. The
standing caveat holds: DSers only raises supplier-change notifications for
products that have been ordered before, and this store has two orders ever, so
silence on the live six is not evidence of stability. Today's manual read is.

The "Ten-Hole White Cable Organizer Clips" listing still visible in DSers My
Products is **archived** in Shopify and is already in `RETIRED_CATALOG_HANDLES`.
Worth recording why it should stay retired: the supplier listing offers 8-hole,
5-hole, and 1-hole variants only. There is no ten-hole SKU behind that title.
