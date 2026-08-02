# Storewide product workboard - 2026-07-26

This board turns the Shopify Admin product gate into the order of operations for finishing the whole store.

## Current board

- A1_REMOVE_FROM_LAUNCH_TAG: 2
- B1_QUOTE_QUICK_WINS: 9
- B2_QUOTE_HIGH_VARIANT: 3
- B3_QUOTE_TIGHT_MARGIN: 10
- C1_DRAFT_REVIEW_BATCH: 12
- H1_RISK_HOLD: 23
- H2_MAPPING_REPAIR: 5
- H3_REPRICE_OR_REJECT: 2

## Do first

These are the live-store controls to handle before promotion or ad spend.

| product | status | decision | reason | action |
| --- | --- | --- | --- | --- |
| Bath Toy Storage Mesh | ACTIVE | HOLD_RISK_REVIEW | Live launch tag is on a hard-risk product. | Remove launch-ready tag or draft before paid traffic; then review category risk. |
| Solar Fairy String Lights for Outdoor Decor | ACTIVE | HOLD_RISK_REVIEW | Live launch tag is on a hard-risk product. | Remove launch-ready tag or draft before paid traffic; then review category risk. |

## Quote batches

For each quoted product, record exact DSers/AliExpress Canada item cost, shipping cost, delivery window, service, stock, and pass/fail in the variant worksheet.

### Batch 1 quote results

Canada DSers quotes captured on 2026-07-26 for all B1 quick-win rows.

| product | result | action |
| --- | --- | --- |
| Adjustable Rhinestone Ring | PASS | Keep candidate; DSers showed US $2.15 shipping, 7~12 days, stock 44. |
| Car Sun Visor Organizer | PASS | Keep candidate; DSers showed US $2.15 shipping, 6~11 days, stock 57. |
| Compact Bicycle Bell | PASS | Keep candidate; DSers showed US $2.15 shipping, 7~12 days, stock 617. |
| Everyday Carabiner Clip Set | PASS | Keep candidate; DSers showed US $2.15 shipping, 6~12 day range by variant, stock 47. |
| Everyday Polarized Sunglasses | PASS_NEEDS_CAP_CHECK | Keep candidate, but recalculate missing worksheet shipping cap before pricing lock; DSers showed US $2.15 shipping, 6~13 day range, stock 104282. |
| Long-Handle Bottle Brush | PASS_TIGHT | Keep only if pricing stays disciplined; DSers showed US $2.15 shipping, 6~11 days, stock 26. |
| No-Drill Shower Shelf | FAIL_SUPPLIER_SWAP_OR_REJECT | Remove from launch flow unless a new supplier/mapping fixes Canada shipping; cheapest checked method was US $48.92 and one SKU returned no shipping. |
| Precision Nail Clippers | MIXED_FAIL | Disable or replace blue SKU; red single passed with US $2.15 shipping but only stock 2. |
| Travel Pet Water Bottle | PASS | Keep candidate; DSers showed US $2.15 shipping, 6~12 day range by variant, stock 24. |

### Batch 2 quote results

Canada DSers representative quotes captured on 2026-07-26 for all B2 high-variant rows.

| product | result | action |
| --- | --- | --- |
| Men's Cotton-Linen Wide-Leg Pants | PASS_REPRESENTATIVE_SAMPLE | Keep candidate; sampled M/L/XL Picture color plus XXL Picture color 1 and all returned US $2.15 shipping, 7~13 day range, stock 111943. |
| Everyday Performance Shorts | PASS_REPRESENTATIVE_SAMPLE | Keep candidate; sampled Black, White, and Gray size rows and all returned US $2.15 shipping, 7~12 days, stock 780. |
| Everyday Fleece Joggers | PASS_TIGHT_REPRESENTATIVE_SAMPLE | Keep candidate only with tight-margin discipline; sampled Navy, Grey, and Black rows and all returned US $2.15 shipping, 6~12 day range, stock 510. |

### Batch 3 quote results

Canada DSers quotes captured on 2026-07-26 for the first tight-margin rows.

| product | result | action |
| --- | --- | --- |
| Multi-Use Organizer Hooks | MIXED | Keep Black/Brown/Light Blue only with stock monitoring; disable, reprice, or replace Pink because DSers showed US $2.15 shipping against a CA$2.87 cap and Shopify inventory is 0. |
| Everyday Zip Hoodie | MIXED | Keep passing rows only with low-stock monitoring; disable, reprice, or replace XL/Grey because DSers showed US $2.15 shipping against a CA$2.66 cap. |
| Adjustable Raised Pet Bowl Set | FAIL_REPRICE_OR_REJECT | Remove from launch flow unless repriced or replaced; sampled Red blue showed US $2.15 shipping and all variant caps are below CA$3.03. |
| Compact Manicure Set | FAIL_REPRICE_OR_REJECT | Remove from launch flow unless repriced or replaced; sampled Black 9 pcs set showed US $2.15 shipping and all variant caps are below CA$3.03. |
| Outdoor Cycling Sunglasses | FAIL_REPRICE_OR_REJECT | Remove from launch flow unless repriced or replaced; sampled one SKU with US $2.15 shipping and one SKU with no Canada shipping, while all variant caps are below CA$3.03. |
| Solar Fairy String Lights for Outdoor Decor | FAIL_RISK_HOLD_REPRICE_OR_REJECT | Keep out of launch flow; sampled Warm White-32m 300LED showed US $2.15 shipping, all caps are below CA$3.03, and product remains an electrical risk hold. |

### B1_QUOTE_QUICK_WINS

| product | variants | cap | risk | action |
| --- | --- | --- | --- | --- |
| No-Drill Shower Shelf | 12 | 5.28 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Travel Pet Water Bottle | 3 | 5.08 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Everyday Carabiner Clip Set | 2 | 4.52 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Car Sun Visor Organizer | 3 | 4.34 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Adjustable Rhinestone Ring | 2 | 4.07 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Compact Bicycle Bell | 6 | 3.77 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Long-Handle Bottle Brush | 2 | 3.31 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Everyday Polarized Sunglasses | 3 | 3.29 |  | Quote exact Canada delivery first; approve if shipping is at or below cap. |
| Precision Nail Clippers | 2 | 3.27 | hygiene_beauty | Quote exact Canada delivery first; approve if shipping is at or below cap. |

### B2_QUOTE_HIGH_VARIANT

| product | variants | cap | risk | action |
| --- | --- | --- | --- | --- |
| Men's Cotton-Linen Wide-Leg Pants | 100 | 4.14 |  | Quote worst-margin and top-selling option groups; reduce option complexity if needed. |
| Everyday Performance Shorts | 21 | 4.00 |  | Quote worst-margin and top-selling option groups; reduce option complexity if needed. |
| Everyday Fleece Joggers | 21 | 3.24 |  | Quote worst-margin and top-selling option groups; reduce option complexity if needed. |

### B3_QUOTE_TIGHT_MARGIN

| product | variants | cap | risk | action |
| --- | --- | --- | --- | --- |
| Multi-Use Organizer Hooks | 4 | 2.87 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Everyday Zip Hoodie | 18 | 2.66 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Breezy Everyday Pants | 28 | 2.61 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Long-Sleeve Performance Tee | 35 | 2.39 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Quick-Dry Training Shorts | 54 | 2.09 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Outdoor Cycling Sunglasses | 30 | 1.76 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Magnetic Hair Clip | 5 | 1.12 | hygiene_beauty | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Compact Manicure Set | 7 | 0.89 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Men's High-Neck Knit Sweater | 54 | 0.85 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |
| Adjustable Raised Pet Bowl Set | 4 | 0.54 |  | Quote before promotion; expect reprice/reject if shipping is not near-free. |

## Drafts and holds

### C1_DRAFT_REVIEW_BATCH

| product | status | variants | issue | action |
| --- | --- | --- | --- | --- |
| 2024 Mens Print Pants Autumn/Winter New In Men's Clothing Trousers Sport Jogging Fitness Running Trousers Harajuku Streetwear | DRAFT | 18 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Pet Supplies Duck Goose Shoes Pet Cole Foot Poultry Boots Pet Duck Boots with Protective Soles Protective Shoe Set Pet Products | DRAFT | 9 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Thermal Underwear Tops Men Winter Clothes Thermal Shirt Autumn Men's Winter Tights High Neck Thin Slim Fit Long Sleeve T-shirt | DRAFT | 42 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Summer Men's Shorts Cool Sportswear Running Sport Shorts Casual Bottoms Gym Fitness Training Jogging Short Pants Men Black Gray | DRAFT | 72 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| 3PCS/Set Men Business Watches Casual Leather Band Analog Male's Quartz Watch Necklace Bracelet Set | DRAFT | 5 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| 1/2PCS Men Business Watches Fashion Men's Steel Band Quartz Watch with Bracelet（Box not Included） | DRAFT | 4 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| 15cm Women's Rabbit Fur Keychain Bag Car Pendant Jewelry Decoration Fashionable Accessory for Bags And Gifts | DRAFT | 11 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Summer Men's MJ Michael Jackson Printed 100%CottonNeutral | DRAFT | 7 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Women Fake Piercing Nose Ring Hoop Septum Piercing Nose Clip Rock HipHoop Stainless Steel Magnet Fashion Body Jewelry Wholesale | DRAFT | 5 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| 2023 Fashion Men Watches Luxury Brand Fashion Mens Quartz Watch Luminous Hands Male Clock Big Dial Waterproof Man Wristwatch | DRAFT | 9 |  | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Digital Watch & Jewellery Gift Set | DRAFT | 4 | hygiene_beauty | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |
| Nail Glue Phototherapy Pen UV Gel Brush Pen Acrylic Nail Art Painting Drawing Liner Brush Manicure Professionnel Brushes Tool | DRAFT | 2 | hygiene_beauty | Repair/verify mapping, quote Canada, review content, then decide whether to tag. |

### H1_RISK_HOLD

| product | status | variants | issue | action |
| --- | --- | --- | --- | --- |
| RGB LED Strip Lights 5m-30m with APP Control | DRAFT | 1 | electrical | Keep held until safety/claims/IP/compliance review is complete. |
| 1:16 Remote-Control Monster Truck | DRAFT | 6 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| New Heated Rivalry Hockey Jersey Long Sleeves Tee Men's | DRAFT | 21 | electrical | Keep held until safety/claims/IP/compliance review is complete. |
| Resistance Bands Set - Exercise & Fitness | DRAFT | 1 | child_safety;medical_health | Keep held until safety/claims/IP/compliance review is complete. |
| Head Back Protector Baby Protect Pillow Learn Walk Head | DRAFT | 1 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| 21 Heated Vest Zones Electric Heated Jackets Men Women Sportswear Heated Coat Graphene Heat Coat USB Heating Jacket For Camping | DRAFT | 32 | electrical | Keep held until safety/claims/IP/compliance review is complete. |
| Baby Music Activity Gym Rug Play Mat Newborn Carpet Pedal | DRAFT | 14 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| ZWN 2.4G Remote Control Excavator Dump Truck RC Model Car Toy Professional Alloy Plastic Simulation Construction Vehicle for Kid | DRAFT | 6 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| Halloween Elsa Dress for Girls Children Party Princess Costume Kids Disguise with Long Cloak Girl Snow Queen Carnival Clothes | DRAFT | 29 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| New Girl Dresses Princess Costume Kids Mermaid Cosplay Costume Kids Carnival Birthday Party Prom Costume Party Dresses For girls | DRAFT | 20 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| 1:64 RC Construction Vehicle Set | DRAFT | 6 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| 1PCS Baby Anti-Fall Head Protection Pillow, Breathable Toddler Safety Cushion, Soft Head Guard Pad for Kids Learning to Walk, Sh | DRAFT | 4 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| Windproof Infant Stroller Gloves Children's Outdoor Sports Mittens Cartoon Printed Hands Warmer Scooter Accessory for Winter | DRAFT | 4 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| Hand-Controlled Mini RC Drone | DRAFT | 3 | child_safety;electrical | Keep held until safety/claims/IP/compliance review is complete. |
| 300/280/200/100Pcs Washer Copper Sealing Solid Gasket Washer Sump Plug Oil For Boat Crush Flat Seal Ring Tool | DRAFT | 4 | electrical | Keep held until safety/claims/IP/compliance review is complete. |
| Baby head pillow anti-fall device Head protective pad summer anti-bump head learning to walk baby four seasons toddler hat | DRAFT | 4 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| 1-20Packs 100Pcs/Pack Wooden Sticks Baby Cotton Swabs Cleaning of Ears Tampons Health Beauty Cotton Swab Cleaning Cotton Buds | DRAFT | 13 | child_safety;medical_health;hygiene_beauty | Keep held until safety/claims/IP/compliance review is complete. |
| Summer Spring Candy Color Kids Pantyhose Ballet Dance Tights for Girls Stocking Children Velvet Solid White Pantyhose | DRAFT | 39 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| Rhinitis Nasal Irrigator Washing for Children Silicone Baby Nasal Aspirator Syringe Baby Nose Cleaner Kids Nasal Washer Reusable | DRAFT | 16 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| Kids Toddler Foot Measure Gauge Shoes Size Measuring Ruler Tool Baby Boy Girl Children's Foot Length Measuring Ruler Fittings | DRAFT | 5 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| 9 Heated Vest Zones Electric Heated Jackets Men Women | DRAFT | 12 | electrical | Keep held until safety/claims/IP/compliance review is complete. |
| Cute Duck Night Light | DRAFT | 1 | child_safety | Keep held until safety/claims/IP/compliance review is complete. |
| USB Heated Cushion 43x43cm Electric Blanket | ARCHIVED | 1 | electrical | Keep held until safety/claims/IP/compliance review is complete. |

### H2_MAPPING_REPAIR

| product | status | variants | issue | action |
| --- | --- | --- | --- | --- |
| Multi-Compartment Desk Organizer | DRAFT | 1 |  | Do not quote yet; repair DSers mapping/SKU first. |
| Jade Roller Face Massager | DRAFT | 1 | hygiene_beauty | Do not quote yet; repair DSers mapping/SKU first. |
| 6-Piece Silicone Spatula Set | DRAFT | 1 |  | Do not quote yet; repair DSers mapping/SKU first. |
| Custom Neon Sign | DRAFT | 1 |  | Do not quote yet; repair DSers mapping/SKU first. |
| Portable Mini Bag Sealer — Handheld Heat Sealer | DRAFT | 1 |  | Do not quote yet; repair DSers mapping/SKU first. |

### H3_REPRICE_OR_REJECT

| product | status | variants | issue | action |
| --- | --- | --- | --- | --- |
| Everyday Pullover Hoodie | ACTIVE | 48 |  | Reprice, change variant/supplier, bundle, or reject before launch. |
| Everyday 100% Cotton T-Shirt | ACTIVE | 18 |  | Reprice, change variant/supplier, bundle, or reject before launch. |

## Completion rule

A product is done only after it has one final state: approved launch with quote evidence, organic-only with reason, draft-later with missing proof, hard hold/reject, or archived.
