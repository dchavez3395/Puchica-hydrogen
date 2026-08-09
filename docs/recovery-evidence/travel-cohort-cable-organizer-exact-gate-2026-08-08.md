# Travel cohort exact gate — cable organizer

**Date:** 2026-08-08
**Scope:** read-only comparison of two pre-existing DSers Import List records; no import, push, mapping, publication, order, or catalog mutation.
**Decision:** **Data Cable Storage Bag (`2082947114649846464`) is the only winner, but remains HOLD until its selected option stock and customer-facing option identity are verified.** The Multifunctional bag (`2082775213726106304`) is **REJECT** on stress-case economics.

## Decision table

| Gate | Data Cable Storage Bag | Multifunctional Travel Digital Cable Storage Bag |
|---|---|---|
| DSers Import List ID | `2082947114649846464` | `2082775213726106304` |
| Exact inspected option | `14:193#Double Layers` / DSers label `Double Layers 1` | `14:175#Gray` / Gray |
| Ordinary item cost | US$4.14 | US$11.69 |
| Option stock | **Not exposed in the variant grid**; card aggregate 105; the selected SKU returned live CA and US routes | 9,916 |
| Reference parcel data | 0.07 kg; 20 × 12 × 2 cm | 0.15 kg; 24 × 11 × 3 cm |
| Images | 13 selected of 34 | 8 selected of 19 |
| U.S. route | AliExpress Selection Standard; CN; US$1.99; 6–11 days; tracking available | AliExpress Selection Standard; CN; US$1.99; 7–12 days; tracking available |
| Canada route | AliExpress Selection Standard; CN; US$1.99; 6–11 days; tracking available | AliExpress Selection Standard; CN; US$1.99; 8–13 days; tracking available |
| All-in supplier landed | US$6.13 / **CA$8.55** | US$13.68 / **CA$19.07** |
| 15%-discount economics at CA$29 / US$22 | CA contribution CA$13.71 / 55.6%; US contribution US$10.68 / 57.1% | CA contribution CA$3.18 / 12.9%; US contribution US$3.13 / 16.7% |
| Hard result | **HOLD — preferred winner** | **REJECT** |

Planning conversion uses the recovery program's dated rate **US$1 = CA$1.3943**. `Landed` here is the exact ordinary option cost plus the exact displayed tracked shipping. Duties/brokerage, if Puchica absorbs them, still need to be added.

## Competitive retail gate

The existing supplier-first travel brief already established a defensible regular retail band for a passive travel cable/electronics pouch of **CA$24–36 / US$18–27**. Source: `next-cohort-sourcing-brief-2026-08-08.md`. No new broad market search was needed.

The conservative stress model is unchanged:

```text
revenue = regular retail × 85%
payment fee = revenue × 3.5% + 0.30
refund/defect reserve = revenue × 5%
contribution = revenue - payment fee - reserve - landed
required contribution = 30% of discounted revenue
```

At the bottom and top of the established band:

| Candidate | CA$24 regular / 15% off | CA$36 regular / 15% off | US$18 regular / 15% off | US$27 regular / 15% off |
|---|---:|---:|---:|---:|
| Data Cable | 48.1% | 62.6% | 49.5% | 63.5% |
| Multifunctional | -3.5% | 28.2% | 0.1% | 30.6% |

The Multifunctional bag fails the 30% target throughout the Canadian band and only barely clears it at the very top of the U.S. band. It therefore has no acceptable cross-border price position under the required promotion stress.

## Supplier documentation findings

### Data Cable Storage Bag — selected double-layer option

- Exact supplier title: `Data Cable Storage Bag Waterproof Portable Carry Case Storage Bag Travel Organizer Bag for Cable Cord USB Charger`.
- Specifications: brand `Urgrico`; model `SM05/SM03`; material `Nylon`; rectangular; package marked `Yes`; origin Mainland China.
- Overview instead describes waterproof Oxford fabric with a soft sponge interior, interior compartment, hand strap, zipper closure, and separate single- and double-layer types.
- Intended stored items include cords, cables, USB drive, phone, charger, mouse and flash drive.
- **Unresolved:** exact pocket/loop count, lining material, care, exact included parts, and an explicit statement that pictured electronics are not included.
- **Material contradiction:** the specification says nylon; the overview says Oxford fabric plus sponge.
- **Waterproof claim is not approval-grade:** no test method or rating is supplied. Store copy should use a restrained material description only after reconciliation; do not claim waterproof.
- **Option identity risk:** `Double Layers 1` does not name its colour. The supplier SKU code `14:193` is not customer-ready evidence of a neutral finish. The option image/colour must be visually confirmed and renamed before publication.
- **Stock limitation:** DSers exposed aggregate card stock 105 but no per-option stock column for this seven-option import record. Live CA and US routes prove the SKU is currently selectable, not the quantity available.

### Multifunctional Travel Digital Cable Storage Bag — Gray

- Specifications: unbranded; model `MD005`; fabric/polyester; padded; `24 × 11 × 3 cm`; rectangular; elastic-band closure; black and gray.
- Overview describes padded, water-repellent nylon and storage for cables, chargers, SD cards, USB drives, earphones/AirPods, USB cables, clippers and other accessories.
- **Unresolved:** pocket/loop count, lining material, care, exact included parts, and an explicit pictured-items exclusion.
- **Material contradiction:** specifications say fabric/polyester while overview says nylon.
- **Water-repellent claim remains unsupported** by a test method/rating.
- Gray has strong exact stock (9,916), but inventory cannot cure a landed-cost failure.

## Hard decision and next action

1. **REJECT Multifunctional (`2082775213726106304`)** for this launch cohort. Its CA landed cost is already above the CA$18.52 maximum allowed even at CA$36 regular retail after a 15% promotion and 30% contribution target.
2. **Advance only Data Cable (`2082947114649846464`) as the winner, at HOLD.** It has viable exact CA/US tracked routes, acceptable delivery estimates, and strong economics at the established band.
3. Before promotion to the launch cohort, verify in the exact supplier listing/mapping flow that `14:193#Double Layers` has at least 25 units, visually confirm its neutral colour, and normalize the customer option name. Also reconcile nylon versus Oxford/sponge and remove unsupported waterproof language.
4. If those checks pass, use a regular anchor around **CA$29 / US$22**; it preserves more than 55% contribution under the 15% discount stress before any merchant-paid duties/brokerage.
