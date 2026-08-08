# Pet-hair cleanup cohort — passive third-SKU supplier-first audit — 2026-08-08

> **Superseded in part by an authorized controlled Import List test later on 2026-08-08.** Exact item `1005010195873737` was successfully ingested as private DSers product `2086236005481972416`, recovering one Green/CN option, current stock, ordinary option costs, and tracked Canada/US routes. See `pet-hair-third-sku-controlled-import-test-2026-08-08.md`. The original `No Data` search finding below remains historically accurate, but “no product was imported” and the resulting hard rejection are no longer current. The corrected decision is **HOLD**, because materials, washing instructions, inclusions, and surface limitations remain unproved.

## Hard decision (superseded)

**NO THIRD SKU. REJECT the only exact public seed for this cohort.**

The required supplier-first gate failed before candidate ranking:

- DSers keyword search for `reusable pet hair lint brush` returned `No Data`.
- DSers keyword search for `pet hair remover brush` returned `No Data`.
- DSers exact-ID search for `1005010195873737` returned `No Data`.
- DSers Supplier Optimizer returned no supplier rows when seeded with both the exact listing's 200 px image and the same image's original CDN URL.

Because DSers exposed no exact candidate row, it exposed no `Sale` count, ratings, option selector, ordinary option price, option stock, Canada route, United States route, tracking, ETA, or ship-from warehouse. The task explicitly requires stopping when exact-option proof is unavailable, so the cohort remains at two products rather than being padded.

No product was imported, added to Import List, mapped, replaced, or ordered.

## Exact public seed inspected

| Field | Evidence |
|---|---|
| AliExpress item ID | `1005010195873737` |
| Exact public title | `Lint Remover for Clothes Washable Reusable Cleaning Tools Pet Hair Lint Roller Fuzz Remover for Dog Cat Pet Hair Removal` |
| Public evidence URL | https://www.pricearchive.org/aliexpress.com/item/1005010195873737 |
| Public observed price | US$4.01 / CA$5.82; original/reference US$6.07 |
| Price update exposed publicly | 2026-07-18 |
| Public identity category | Home & Garden / Household Merchandises |
| Exact listing image used to seed DSers | `https://cdn.pricearchive.org/images/aliexpress.com/1005010195873737/0/Scf7defda1a4c4a4db82253686c37df16V.jpg` |

The public page warns that, for listings with multiple versions, its history reflects the cheapest version. Therefore US$4.01 is **not** an option-specific repeatable price and cannot be used in a margin model.

## Required evidence that DSers did not expose

| Requirement | Result |
|---|---|
| Visible DSers `Sale` count | Not exposed |
| Reliability / Response / Delivery / Rating | Not exposed |
| Exact option and option name | Not exposed |
| Ordinary repeatable option price | Not exposed |
| Option stock | Not exposed |
| Materials | Not exposed |
| Included pieces | Not exposed |
| Cleaning method | Title says `Washable` and `Reusable`, but instructions and material compatibility were not exposed |
| Canada ship-from | Not exposed |
| Canada method / cost / ETA / tracking | Not exposed |
| United States ship-from | Not exposed |
| United States method / cost / ETA / tracking | Not exposed |

## Claims and surface limits

The title alone is insufficient to claim a material, mechanism, lifespan, adhesion level, cleaning cycle, or broad surface compatibility.

Do not claim:

- safe for all clothing, upholstery, carpets, leather, suede, silk, knits, or vehicle interiors;
- scratch-free, snag-free, damage-free, anti-static, hypoallergenic, non-toxic, or eco-friendly;
- washable indefinitely, restores full performance after washing, or requires no replacements forever;
- removes embedded hair, all pet hair, lint, pills, dust, or debris in a quantified number of passes;
- any dimensions, number of pieces, included cleaning case, or color choice;
- any Canada or US shipping promise.

Without exact material and instructions, use on delicate, loose-weave, coated, leather/suede, wet, oily, or heat-sensitive surfaces must remain unapproved.

## Cohort implication

This exact seed is **REJECTED for the launch cohort**, not because the passive lint-brush concept is inherently unsuitable, but because the current DSers account did not return a supplier record that could satisfy the non-negotiable exact-option and dual-market route gate.

A third product can be reconsidered only if DSers later exposes, at no cost and without importing:

1. an exact passive tool row with visible `Sale` and rating metrics;
2. an exact option with ordinary price and current stock;
3. material, inclusions, instructions and surface limitations;
4. explicit tracked Canada and US routes with ship-from, cost and ETA.
