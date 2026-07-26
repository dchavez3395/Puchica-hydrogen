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


## Verified Draft remediation

Eight quote-complete Draft products were remediated in Shopify without activation:

- 196 variant prices were changed from verified Canada quote economics and 232 variants were re-read with zero price mismatches;
- unsupported supplier, material, performance, warehouse, guarantee, and composition claims were removed;
- customer-facing titles, descriptions, SEO, product types, and Shopify taxonomy were corrected; and
- all eight products remained `DRAFT`.

Nine individual Canada no-shipping variants across seven of the products still require supplier replacement or separation. Product-specific textile, measurement, dimensional, storefront, and checkout gates also remain. The authoritative record is `storewide-draft-remediation-2026-07-26.csv`; these products are remediated, not launch-approved.

## U.S.-only draft preparation

Three Canada-failing products now have complete passing U.S. supplier quotes and customer-ready Shopify content/taxonomy, but remain `DRAFT` and untagged:

- `Quartz Watch, Bracelet & Necklace Set` - conservative U.S. floor US$11.99;
- `Stainless-Steel Quartz Watch & Bracelet` - conservative U.S. floor US$12.99; and
- `Digital Watch & Jewellery Gift Set` - conservative U.S. floor US$26.99.

Fixed U.S.-catalog prices were applied to every mapped variant and re-read through Admin GraphQL at US$11.99, US$12.99, and US$26.99 respectively. All three remain excluded until the Managed Markets U.S. checkout returns a real shipping method and U.S.-only storefront delivery is verified. See `storewide-us-only-candidate-readiness-2026-07-26.csv`.


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

The first Canada supplier-optimizer check confirmed that DSers can return destination-specific supplier cost, shipping, delivery days, sale count, and reliability data for **Canada**. The sample supplier offers a 7–8 day Canada delivery estimate with US$1.99–2.15 shipping; that is the evidence standard for the rest of the audit.

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

## Final gate correction

Later product-by-product Canada and U.S. quote work supersedes the initial 26-product baseline. The current live gate is 17 active launch-tagged products with 374 variants.

- Eight tight-margin variants across `Long-Sleeve Performance Tee` and `Men's High-Neck Knit Sweater` were repriced and re-read; their Canada shipping caps are now CA$3.21–CA$3.27.
- `Precision Nail Clippers` was moved to Draft and its launch tag removed because both mapped variants fail U.S. shipping.
- The only three U.S.-no-service SKUs still inside active products have inventory zero and are unavailable for sale.
- No active launch variant remains below the observed CA$3.03 Canada shipping floor.

The earlier published-product list is retained as historical evidence, not the current launch assortment.
## Full active-catalog U.S. checkout confirmation

The final active gate contains 17 products and 374 variants. U.S. margin validation was completed for the remaining three products:

- `Everyday Fleece Joggers`: 11 below-floor sellable variants received a US$26.99 fixed catalog price; all 20 sellable variants now meet the floor.
- `Everyday Zip Hoodie`: all 17 sellable variants received a US$34.99 fixed catalog price.
- `Multi-Use Organizer Hooks`: existing US$14.99–15.49 fixed prices already exceed the US$10.99 floor.

All three products were restored to the Puchica U.S. catalog. Their known no-U.S.-shipping variants remain inventory-zero and unavailable.

A combined live checkout containing one sellable variant from every active product initially exposed an inactive `Free Shipping Over $75` method, creating a rate gap above CA$74.99. The existing method was activated without changing its CA$75 threshold or zero price. The same 17-product cart was then re-tested using a non-personal New York destination and returned `Free Shipping Over $75` as a real delivery method.

The 17-product active gate is now confirmed for Canada economics, U.S. supplier service, U.S. pricing, U.S. catalog availability, and live U.S. checkout delivery.
## Draft no-shipping variant controls

Nine known destination-failing variants across seven remediated Draft products were set to inventory zero with overselling denied and re-read through Admin GraphQL. This safely separates the failing variants without discarding their passing sibling variants:

- Children's Foot Measuring Gauge — `blue`
- Children's Solid-Color Tights — `Pink / 1 to 2 Yrs / China Mainland`
- Copper Washer Assortment — `200Pcs M5-M14`
- Everyday Crew-Neck T-Shirt — `Black / L`
- Men's Everyday Shorts — `XXXL / Dark Blue 001`
- Men's High-Neck Base-Layer Top — `Coffee / 3L`
- Printed Children's Winter Mittens — `C`, `E`, and `F`

These controls advance fulfillment readiness but do not clear outstanding material, measurement, sizing, textile-labeling, or children's-product evidence gates. All seven parent products remain Draft.
