# Existing DSers Import List inventory — A–H and digit-leading titles — 2026-08-08

## Scope and controls

Read-only inventory of pre-existing private DSers Import List records whose exact title begins with A–H or a digit. Controlled test additions with AliExpress IDs `1005010195873737`, `1005006271055511`, and `1005008596551859` were excluded.

- Private Import List count observed: 23 total records across two pages.
- In-scope pre-existing records: **9**.
- No Shipping Info drawers were opened.
- No product was deleted, pushed, mapped, published, edited, saved, or ordered.
- AliExpress item IDs were not exposed on these card/detail surfaces and were not inferred.

## Important DSers UI integrity finding

Opening edit drawers rapidly can temporarily show the previously opened product's title, weight, dimensions, and variant count. Three stale reads were discarded. The affected records were reopened individually and accepted only after the detail title matched the card title.

This means automated/bulk extraction from the Import List needs a title-identity assertion and a wait for the prior drawer to fully close. Card-level data should not be joined to detail metadata by screen order alone.

## Inventory

| Exact title | DSers import ID | Visible cost | Aggregate stock | Variants / options summary | Weight; dimensions | Risk class | Audit disposition |
|---|---|---:|---:|---|---|---|---|
| 1pc Creative Toothpaste Tube Squeezer Simple Toothpaste Roller Stainless Steel Labor Saving Toothpaste Tube Wringer Presser | `2083035425531822784` | US$2.25 | 400 | 1 variant; 6/6 images | 0.02 kg; 10 × 3 × 1 cm | Passive; hygiene/fit caution | HOLD — route and tube compatibility unverified |
| 10 Pcs Travel Hangers Cruise Ship Essentials Accessories Portable Folding Clothes Hanger Foldable Drying Rack | `2083035318770008768` | US$0.00 | 0 | 1 variant; 6/6 images | 0.01 kg; 25 × 12 × 12 cm | Passive | **REJECT — zero stock and zero cost** |
| 6/8P Travel Bag Set Organizer Clothes Luggage Travel Organizer Blanket Shoes Organizers Suitcase Pouch Packing Cubes Storage Bag | `2083034863323120320` | US$3.04–13.31 | 705 | 13 variants; 19/51 images | 0.35 kg; 33 × 27 × 4 cm | Passive | HOLD — very broad option/cost range; exact set not reconciled |
| Cable Organizer Cord Management Wire Holder Flexible USB Cable Winder Tidy Silicone Clips For Mouse Keyboard Earphone Protector | `2083035043632120512` | Card: US$0.80–1.50 | 3,702 | 10 variants: 1/5/8/10-hole; White/Black/Transparent; 16/26 images | 0.01 kg; 16 × 14 × 1 cm | Passive | **HOLD — variant grid shows every Product Cost as US$0.00 while card shows US$0.80–1.50** |
| 2 Tier Under Sink Organizer Sliding Cabinet Basket Organizer Storage Rack with Hooks Hanging Cup Bathroom Kitchen Organizer | `2082949476235936448` | US$7.09–22.12 | 7 | 45 variants; 11/24 images | 0.02 kg; 30 × 20 × 20 cm | Safety / load-bearing | **REJECT — stock 7, extreme range, implausible 0.02 kg parcel weight** |
| 2 Floors Automatic Egg Dispenser For Countertop Cooler Kitchen Organizer | `2082948932931289792` | US$3.45 | 84,434 | 1 variant; 6/6 images | 0.40 kg; 25 × 20 × 5 cm | Ingestible / food-contact | HOLD outside low-risk cluster — food-contact claims/materials require validation |
| Data Cable Storage Bag Waterproof Portable Carry Case Storage Bag Travel Organizer Bag for Cable Cord USB Charger | `2082947114649846464` | US$3.04–4.30 | 105 | 7 variants: Single Layer, Single Layer 1/2, Double Layers, Double Layers 1/2/3; 13/34 images | 0.07 kg; 20 × 12 × 2 cm | Passive | **Best low-risk HOLD** — exact option and routes still needed |
| 3Pcs/set Black/Blue/Grey Compressible Travel Storage Bag Portable Large Capacity Storage Bag Suitcase Luggage Packing Cubes | `2082932185985254080` | US$11.07–12.17 | 10 | **Variants(0); Images(undefined/0)** | Not exposed | Passive | **REJECT — incomplete/zombie import record and low stock** |
| Drawer Organization 8/26/47pcs Tool Tray Tool Box Organizer Tray Dividers Set Workbench Cabinet Bins Tool Chest Garage Hardware | `2082765175615718080` | US$8.72–19.89 | 413 | 6 variants; 12/28 images | 0.69 kg; 24 × 16 × 15 cm | Passive | HOLD — 8/26/47-piece identity and broad cost range need option-level reconciliation |

### Cable organizer option labels

The ten exposed options are:

- 8 Holes-White
- 5 Holes-White
- 8 Holes-Transparent
- 8 Holes-Black
- 10 Holes-White
- 10 Holes-Black
- 1 Holes-Black
- 1 Holes-White
- 5 Holes-Black
- 5 Holes-Transparent

The detail grid reports `0.00` Product Cost and blank shipping/total fields for every option, directly contradicting the card cost range. The card-level stock total must not be treated as sellable option stock until this is resolved.

## Risk-class count

| Risk class | Count | Records |
|---|---:|---|
| Passive | 6 | Toothpaste squeezer, travel hangers, travel bag set, cable organizer, data-cable pouch, drawer trays |
| Safety / load-bearing | 1 | 2-tier under-sink organizer |
| Ingestible / food-contact | 1 | Egg dispenser |
| Passive but incomplete import | 1 | 3-piece compression-bag record |
| Electrical | 0 | — |
| Battery | 0 | — |
| Branded | 0 visibly identified in this subset | — |
| Sharp | 0 | — |

## Coherent low-risk cluster assessment

The strongest coherent theme is **passive small-item and travel organization**, but it is not yet a launch-ready cluster:

1. **Data-cable pouch** is the cleanest candidate: passive, 105 aggregate stock, manageable US$3.04–4.30 card range. It still needs exact option stock and Canada/U.S. routes.
2. **Cable organizer clips** are thematically strong and inexpensive at card level, but the US$0.00 variant-grid contradiction blocks approval.
3. **Drawer organizer trays** fit the organization niche but the 8/26/47-piece options and US$8.72–19.89 range are too ambiguous without option-level reconciliation.
4. **6/8-piece travel bag set** also fits, but its 13 variants and US$3.04–13.31 range require a selected-set audit.

The hangers, 3-piece compression-bag record, and 2-tier under-sink organizer should not advance. The egg dispenser should stay outside a low-risk cohort because it is food-contact.

## Recommended next supplier checks

In order:

1. Data-cable pouch — select one Single/Double Layer option; inspect option stock and CA/US routes.
2. Cable organizer — determine whether the US$0 variant grid is stale/broken or the card range is wrong before any route work.
3. Drawer organizer — reconcile one exact piece-count option before shipping.
4. 6/8-piece travel bags — reconcile one exact set/color only if the first three fail.
