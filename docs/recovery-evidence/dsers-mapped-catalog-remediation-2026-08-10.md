# DSers-mapped catalog remediation — 2026-08-10

## Binding result

The contained catalog now has **nine customer product pages and ten exact
sellable variants**. Canada has ten approved-variant SKUs. The United States has
eight. The charcoal packing-cube SKU and Large Blue clothes-storage bag remain
Canada-only because their strongest exact DSers route records returned
`No Shipping` to the United States.

This document does **not** authorize ads. The seven products created on August
10 remain Shopify `DRAFT` records without the final storefront approval tags.
Only the two previously released products remain active. Hydrogen continues to
fail closed through product evidence tags, market route tags, product status,
and an exact-SKU allowlist.

## Exact launch matrix

| Product page                                    | Exact sellable SKU(s)                            | Canada          | United States      | Shopify state at close  |
| ----------------------------------------------- | ------------------------------------------------ | --------------- | ------------------ | ----------------------- |
| Charcoal 3-Piece Packing Cube Set               | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | Organic-limited | Blocked — no route | Active; exact SKU gated |
| Black Double-Layer Travel Cable Organizer Case  | `14:193#Double Layers`                           | Organic-limited | Organic-limited    | Active; exact SKU gated |
| White Luggage ID Tag                            | `14:29#white;5:361386#1pcs`                      | Organic-limited | Organic-limited    | Draft                   |
| Ten-Hole White Cable Organizer Clips            | `14:771#10 Holes-White`                          | Organic-limited | Organic-limited    | Draft                   |
| White Semi-Circular Travel Jewelry Case         | `14:29`                                          | Organic-limited | Organic-limited    | Draft                   |
| Large Blue Handled Clothes Storage Bag          | `14:350852#Large Blue`                           | Organic-limited | Blocked — no route | Draft                   |
| Black Hanging Travel Toiletry Organizer         | `14:771#Black`                                   | Organic-limited | Organic-limited    | Draft                   |
| Black Knitted Luggage Wheel Covers — Set of 4   | `14:193`                                         | Organic-limited | Organic-limited    | Draft                   |
| Soft Luggage Handle Wrap — Black & Coffee Brown | `14:193#Black`; `14:350686#coffee color`         | Organic-limited | Organic-limited    | Draft                   |

## Remediation performed

- Kept every new Shopify record in `DRAFT` status; no Online Store publication,
  purchase, order, ad spend, or overselling permission was created.
- Replaced supplier titles and copy with bounded customer-facing descriptions
  that identify the exact option and omit unsupported claims.
- Pruned new products to the exact sellable option(s) and matching supplier
  media.
- Verified the exact DSers source variant, current item cost, stock signal,
  named tracked route, ship-from country, shipping charge, and ETA for Canada
  and the United States before an SKU entered the allowlist.
- Encoded the ten Canadian and eight U.S. exact SKUs in
  `APPROVED_VARIANT_SKUS_BY_MARKET`; product-level approval still requires all
  evidence tags and the market-specific route tag.
- Confirmed the hero implementation uses the same approved product/variant for
  its large image and overlay card.

## Rejected attempts during the tenth-slot pass

- Public luggage-strap listings that DSers would not import.
- A soft silicone cable pouch whose DSers card showed stock but whose detail
  record returned `Variants(0)` and `Images(undefined/0)`.
- A gray shoe organizer with only 20 units whose current exact Shipping Info
  panel returned `NO DATA`.
- A five-piece white luggage-tag split with strong apparent stock whose new
  DSers split record returned `Variants(0)` and `Images(undefined/0)`.

These were not pushed, mapped, published, ordered, advertised, or counted.

## Operational release line

1. Keep ads paused.
2. Review the seven drafts visually on desktop and mobile.
3. Add the required evidence and market-route tags only after that review.
4. Activate the approved drafts in a controlled organic release.
5. Recheck the exact DSers route and stock before each early order.

Nine product pages are sufficient for the organic release. The tenth count is
an exact variant count, not an invented tenth page. A tenth product page should
be added only when another supplier record passes the same no-cost gate.
