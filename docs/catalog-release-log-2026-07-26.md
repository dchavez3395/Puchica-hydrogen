# Catalog Release Log ? 2026-07-26

## Current audited launch state

The earlier 26-product baseline below records the state before the storewide destination-shipping and compliance gate removed failing products. The current authoritative workboard contains **18 active launch-tagged products**: 14 with passing U.S. supplier-shipping and price evidence, and 4 kept out of the U.S. catalog because at least one sellable variant cannot ship there.

`Everyday Printed Joggers` became the first additional audited promotion beyond the original 17-product working set. On 2026-07-26 it was:

- renamed and given customer-ready product copy;
- assigned to `Apparel & Accessories > Clothing > Pants > Joggers`;
- repriced across all 18 variants so the Canadian margin gate passes;
- set `ACTIVE`, tagged `puchica-launch-ready`, and published to Online Store and Puchica Storefront;
- verified on its live Canadian product page, all-products collection, and cart;
- verified in Canadian checkout with Standard Shipping at CA$7.99 and Express at CA$20.00; and
- assigned a fixed US$19.99 U.S.-catalog price, above its conservative US$18.99 floor.

The same checkout returned `Shipping not available` after switching to a valid non-personal U.S. test destination. U.S. delivery therefore remains blocked by the documented Managed Markets/Global-e fulfillment-mode conflict.


## U.S.-only draft preparation

Three Canada-failing products now have complete passing U.S. supplier quotes and customer-ready Shopify content/taxonomy, but remain `DRAFT` and untagged:

- `Quartz Watch, Bracelet & Necklace Set` - conservative U.S. floor US$11.99;
- `Stainless-Steel Quartz Watch & Bracelet` - conservative U.S. floor US$12.99; and
- `Digital Watch & Jewellery Gift Set` - conservative U.S. floor US$26.99.

Their fixed U.S.-catalog prices are not recorded as verified: the first value was entered but not re-read after browser control failed, and the other two were not applied. All three remain excluded until a fixed price is saved and re-read and the Managed Markets U.S. checkout returns a real shipping method. See `storewide-us-only-candidate-readiness-2026-07-26.csv`.


## Verified live baseline

The initial inventory blocker is cleared. Shopify has 26 `ACTIVE` products tagged `puchica-launch-ready`, published to the **Puchica Storefront** sales channel. On 2026-07-26 the current tag-based catalog build was deployed to Oxygen production and `https://puchica.ca/collections/all` was verified to render all 26 launch products.

## Published mapped products

- Solar Fairy String Lights for Outdoor Decor
- No-Drill Shower Shelf
- Adjustable Raised Pet Bowl Set
- Compact Manicure Set
- Men's High-Neck Knit Sweater
- Men's Cotton-Linen Wide-Leg Pants
- Everyday 100% Cotton T-Shirt
- Men's Casual Sports Hoodie
- Zipper Hoodie
- Magnetic Hair Clips
- Outdoor Cycling Sunglasses
- Breezy Everyday Pants
- Everyday Performance Shorts
- Quick-Dry Training Shorts
- Everyday Fleece Joggers
- Long-Sleeve Performance Tee
- Long-Handle Bottle Brush
- Multi-Use Organizer Hooks
- Precision Nail Clippers
- Car Sun Visor Organizer
- Compact Bicycle Bell
- Travel Pet Water Bottle
- Everyday Carabiner Clip Set
- Everyday Polarized Sunglasses
- Adjustable Rhinestone Ring
- Bath Toy Storage Mesh

## Gate still in force

The DSers account contains 57 AliExpress-mapped products. Remaining drafts are not assumed launch-ready merely because they are mapped. Each requires its supplier variant, destination delivery economics, claim/safety risk, product information, and Puchica fit to be checked before it receives the `puchica-launch-ready` tag and moves live.

## Shopify mapping audit

An Admin API audit on 2026-07-26 established the current working inventory split:

| Store state | Count | What it means |
| --- | ---: | --- |
| Active + `puchica-launch-ready` | 26 | Published on the Puchica Storefront and visible in Hydrogen. |
| Draft with DSers-style supplier SKU | 30 | Imported/mapped source products retained for review; not customer-facing. |
| Draft without supplier SKU | 9 | Manually created or previously imported placeholders; not fulfillment-ready. |

The 26 active products all have inventory tracking enabled and DSers-style option SKUs. That demonstrates an imported supplier relationship, but it is not a substitute for a destination-level shipping quote or a paid end-to-end order test.

### Immediate cleanup queue

- Validate exact Canada delivery and landed cost for each active product; a Supplier Optimizer check that only returns U.S. quotes is not enough for Canada release.
- Review variable-price products before paid traffic. The largest storefront price ranges currently occur on the No-Drill Shower Shelf, performance apparel, Solar Fairy String Lights, Compact Manicure Set, and magnetic hair clips.
- Keep child-safety, medical/hygiene, electrical/heated, likely-IP, and novelty products in draft even though they remain mapped.
- Promote only the few remaining drafts that pass a product-by-product margin, delivery, image, and policy check; do not inflate the assortment by publishing mapped imports indiscriminately.

## Canada pre-shipping margin screen

The first Canada supplier-optimizer check confirmed that DSers can return destination-specific supplier cost, shipping, delivery days, sale count, and reliability data for **Canada**. The sample supplier offers an 7–8 day Canada delivery estimate with US$1.99–2.15 shipping; that is the evidence standard for the rest of the audit.

Shopify also stores a CAD unit cost for all 497 live variants. Using the customer price after `FIRST15`, less an estimated 2.9% payment fee and CA$0.30 fixed fee, **before shipping and taxes**, the worst variant of each product was screened as follows:

| Result | Products |
| --- | --- |
| Pass (30%+ contribution before shipping) | 24 products |
| Margin review | Everyday Pullover Hoodie; Everyday 100% Cotton T-Shirt |

The two margin-review products were removed from `puchica-launch-ready` on 2026-07-26, so Hydrogen will not sell them until a Canada shipping quote proves that the final contribution is viable. This leaves 24 products in the live launch gate. The other 24 have passed only a **pre-shipping** screen; they still need their exact Canadian delivery quote before paid acquisition is enabled.

### Quote decision rule

For each exact mapped variant, use this conservative decision rule:

`Canada shipping cap = (price × 0.85 × 0.971 − CA$0.30) − unit cost − (price × 0.30)`

The result is the most shipping the variant can absorb while retaining a 30% contribution after `FIRST15` and estimated card fees, before taxes. The *worst* variant cap must be met or the product remains on hold. Current caps range from CA$0.54 (Raised Pet Bowl Set) to CA$5.28 (No-Drill Shower Shelf); several products therefore need either a low Canada shipping quote, a price/variant change, or removal from launch.

## DSers mapping verification

On 2026-07-26, the connected Puchica DSers store (`ug91ve-sz`) was checked directly in **My Products**. It contains **57 mapped AliExpress products**; the initial empty state was a delayed list render, not an unmapped-store condition. The list exposes mapped product costs, customer prices, stock, supplier-management controls, and an `Unmapped(0)` tab, confirming that the DSers-to-Shopify fulfilment relationship exists for this catalogue.

This is not a blanket launch approval. The same review surfaced an explicitly **out-of-stock supplier SKU** in the broader mapped pool, while several products have low stock or economics that still require exact destination quotes. The working release rule remains:

- keep only the vetted 24-product launch gate customer-facing;
- check mapped availability and a Canada destination quote before any paid traffic or promotion;
- replace or hold a product immediately if a mapped supplier SKU becomes unavailable or fails the shipping-cap rule.
