# Pet-hair third SKU — controlled DSers Import List test — 2026-08-08

## Scope and external state change

With explicit authorization, exact AliExpress item `1005010195873737` was added to the private DSers Import List only. DSers assigned private product ID `2086236005481972416`; Import List count changed from 20 to 21. The item was **not** pushed to Shopify, mapped, published, or ordered. The card has a visible `Delete` action, so the change is recoverable by deleting this Import List item. It was left in the private Import List for follow-up.

## Exact listing and option identity recovered

| Field | DSers evidence |
|---|---|
| Exact source URL | https://www.aliexpress.com/item/1005010195873737.html |
| Exact title | `Lint Remover for Clothes Washable Reusable Cleaning Tools Pet Hair Lint Roller Fuzz Remover for Dog Cat Pet Hair Removal` |
| DSers private product ID | `2086236005481972416` |
| Imported variants | 1 |
| Exact option | Ship From `CN`; Color `Green` |
| Supplier SKU | `14:175#Green;200007763:201441035` |
| Current option stock | 499 |
| Reference weight | 0.08 kg |
| Default parcel dimensions | 10 × 6 × 6 cm |
| Imported media | 7 selected of 14 supplier images |

## Exact route and landed-cost evidence

All amounts below are the precise Green/CN option, not a listing-wide minimum.

| Destination | Item cost | Shipping | Tax/import shown | Total | Method | Ship from | ETA | Tracking |
|---|---:|---:|---:|---:|---|---|---|---|
| United States | US$3.39 | US$4.37 | US$0.00 | US$7.76 | YunExpress Standard Shipping | CN | 9–15 days | Available |
| Canada | US$4.01 | US$4.41 | `--` | US$8.42 | AliExpress standard shipping | CN | 8–15 days | Available |

DSers' Shipping Info dialog explicitly states that these are estimates and are not pushed to the store.

## What Import List did and did not prove

Proved:

- exact one-option identity, supplier SKU, ordinary destination-dependent option price, current stock, ship-from, shipping method, shipping cost, ETA, and tracking availability for both markets;
- one Green unit is the only imported configuration;
- parcel weight/dimensions and image count.

Not proved:

- supplier `Sale` count or supplier/product ratings;
- material composition, number of functional cleaning surfaces, included pieces beyond what the single-option identity implies, or cleaning/washing instructions;
- compatibility with delicate, loose-weave, coated, leather, suede, wet, oily, or heat-sensitive surfaces;
- whether “washable” restores performance or how many cleaning cycles are supported;
- image-license/creative reuse rights outside the supplier-import workflow.

The Description tab loaded editor shells with character counters, but DSers exposed no readable specification or overview text in the inspection. The title's words `Washable` and `Reusable` are supplier claims, not sufficient documentary proof for customer-facing promises.

## Decision

**HOLD — not launch-ready and not yet a third-SKU PASS.**

The controlled import resolved the exact-option and dual-market route blocker at acceptable landed costs, but the passive-tool safety/content gate still fails because material, washing instructions, inclusions, and surface limitations remain undocumented. Do not claim broad fabric/upholstery compatibility or publish the supplier title verbatim. A no-cost supplier-documentary source that identifies material, mechanism, cleaning method, and excluded surfaces is still required. No purchase or sample order is required by this gate.
