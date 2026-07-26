# Catalog Release Log — 2026-07-26

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
