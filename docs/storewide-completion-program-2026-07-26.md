# Storewide completion program - 2026-07-26

This is the continuous execution queue for every product not yet CA/US launch-confirmed. Products leave this queue only with a verified launch, hold, rejection, or archive state.

## Baseline

- Total Shopify products: 66
- CA/US checkout-confirmed and active: 20
- Remaining program queue: 46

## Operating rules

1. Do not count triage as confirmation.
2. Do not activate a product without sellable mapped variants, destination evidence, margin, content/compliance, market publication, and live checkout.
3. Disable destination-failing variants rather than allowing accidental overselling.
4. If required supplier or compliance evidence cannot be obtained, record a final hold/reject/archive decision instead of leaving an ambiguous Draft.
5. Regenerate the product gate, pricing ledger, workboard, and checkout ledger after every activation tranche.

## Queue by tranche

### 1_REMEDIATED_DRAFTS — 5 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 6 | Children's Solid-Color Tights | DRAFT_PRICE_CONTENT_TAXONOMY_VERIFIED | Keep Draft; replace or separate the failing variant and complete children's textile/compliance review. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 7 | Everyday Crew-Neck T-Shirt | DRAFT_PRICE_CONTENT_TAXONOMY_VERIFIED | Keep Draft; replace or separate the no-Canada-shipping variant and verify textile facts before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 8 | Men's Everyday Shorts | DRAFT_PRICE_CONTENT_TAXONOMY_VERIFIED | Keep Draft; replace or separate the failing variant and verify textile specifications before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 9 | Men's High-Neck Base-Layer Top | DRAFT_PRICE_CONTENT_TAXONOMY_VERIFIED | Keep Draft; replace or separate Coffee / 3L and verify textile specifications before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 10 | Printed Children's Winter Mittens | DRAFT_PRICE_CONTENT_TAXONOMY_VERIFIED | Keep Draft; replace or separate C/E/F and complete children's textile/compliance review. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |

### 2_US_ONLY_DUAL_COUNTRY_REPAIR — 3 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 3 | Digital Watch & Jewellery Gift Set | DRAFT_US_PRICE_CONTENT_READY_MARKET_BLOCKED | Keep Draft until the Managed Markets US checkout blocker is resolved; then verify live US-only visibility and delivery before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 4 | Quartz Watch, Bracelet & Necklace Set | DRAFT_US_PRICE_CONTENT_READY_MARKET_BLOCKED | Keep Draft until the Managed Markets US checkout blocker is resolved; then verify live US-only visibility and delivery before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 5 | Stainless-Steel Quartz Watch & Bracelet | DRAFT_US_PRICE_CONTENT_READY_MARKET_BLOCKED | Keep Draft until the Managed Markets US checkout blocker is resolved; then verify live US-only visibility and delivery before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |

### 3_VARIANT_AND_CONTENT_REPAIR — 2 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 1 | New Girl Dresses Princess Costume Kids Mermaid Cosplay Costume Kids Carnival Birthday Party Prom Costume Party Dresses For girls | DRAFT_QUOTE_COMPLETE_REPRICE_REQUIRED | Quote Canada and US; verify textile composition, sizing, flammability/labeling evidence, and remove ambiguous cosplay claims before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |
| 2 | Precision Nail Clippers | DRAFT_QUOTE_COMPLETE_CONTENT_REVIEW | Complete content/compliance review and contribution validation before activation. | Passing sellable variants; CA/US margin and catalog prices; content/compliance; both live checkouts; final Active or Hold. |

### 4_SUPPLIER_REPLACEMENT_OR_REJECT — 6 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 11 | Adjustable Raised Pet Bowl Set | DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED | Keep excluded; replace supplier or reprice before spending time on US quotes or activation. | Replacement supplier passes Canada and US economics, or product rejected/archived. |
| 12 | Compact Manicure Set | DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED | Keep excluded; replace supplier or reprice before spending time on US quotes or activation. | Replacement supplier passes Canada and US economics, or product rejected/archived. |
| 13 | Magnetic Hair Clip | DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED | Keep excluded; replace supplier or reprice before spending time on US quotes or activation. | Replacement supplier passes Canada and US economics, or product rejected/archived. |
| 14 | No-Drill Shower Shelf | DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED | Keep excluded; replace supplier or reprice before spending time on US quotes or activation. | Replacement supplier passes Canada and US economics, or product rejected/archived. |
| 15 | Outdoor Cycling Sunglasses | DRAFT_CANADA_QUOTE_FAIL_KEEP_EXCLUDED | Keep excluded; replace supplier or reprice before spending time on US quotes or activation. | Replacement supplier passes Canada and US economics, or product rejected/archived. |
| 16 | Portable Mini Bag Sealer — Handheld Heat Sealer | MAPPED_SUPPLIER_REPLACEMENT_REQUIRED | Keep Draft; replace the supplier or reject the product before Canada/U.S. launch. | Replacement supplier passes Canada and US economics, or product rejected/archived. |

### 5_MAPPING_AND_SYNC — 3 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 17 | 6-Piece Silicone Spatula Set | MAPPED_AND_QUOTED_SYNC_REQUIRED | Keep Draft until cost, SKU, stock, pricing, and both-country checkout are re-read after synchronization. | Supplier mapping and Shopify cost/SKU/stock synchronized, or product archived. |
| 18 | Multi-Compartment Desk Organizer | MAPPED_AND_QUOTED_SYNC_REQUIRED | Keep Draft and excluded until DSers-to-Shopify supplier metadata and inventory synchronize; then re-read cost, stock, storefront visibility, and both-country checkout. | Supplier mapping and Shopify cost/SKU/stock synchronized, or product archived. |
| 19 | Custom Neon Sign | CONFIRMED_UNMAPPED_KEEP_EXCLUDED | Keep Draft and excluded. Archive if unwanted, or deliberately import/map a verified supplier before quoting. | Supplier mapping and Shopify cost/SKU/stock synchronized, or product archived. |

### 6_RISK_EVIDENCE_OR_REJECT — 23 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 20 | 1:16 Remote-Control Monster Truck | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 21 | 1:64 RC Construction Vehicle Set | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 22 | 15cm Women's Rabbit Fur Keychain Bag Car Pendant Jewelry Decoration Fashionable Accessory for Bags And Gifts | HOLD_CONTENT_COMPLIANCE_REVIEW | Verified material/species origin, lawful sourcing/import evidence, and accurate disclosure; otherwise reject. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 23 | 1PCS Baby Anti-Fall Head Protection Pillow, Breathable Toddler Safety Cushion, Soft Head Guard Pad for Kids Learning to Walk, Sh | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 24 | 2023 Fashion Men Watches Luxury Brand Fashion Mens Quartz Watch Luminous Hands Male Clock Big Dial Waterproof Man Wristwatch | HOLD_CONTENT_COMPLIANCE_REVIEW | Keep Draft; remove or substantiate waterproof/luminous/brand claims, verify battery/material specifications and labeling, then reconsider for quoting. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 25 | 21 Heated Vest Zones Electric Heated Jackets Men Women Sportswear Heated Coat Graphene Heat Coat USB Heating Jacket For Camping | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 26 | 9 Heated Vest Zones Electric Heated Jackets Men Women | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 27 | Baby head pillow anti-fall device Head protective pad summer anti-bump head learning to walk baby four seasons toddler hat | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 28 | Baby Music Activity Gym Rug Play Mat Newborn Carpet Pedal | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 29 | Bath Toy Storage Mesh | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 30 | Cute Duck Night Light | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 31 | Hand-Controlled Mini RC Drone | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 32 | Head Back Protector Baby Protect Pillow Learn Walk Head | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 33 | Jade Roller Face Massager | MAPPED_SHIPPING_PASS_RISK_HOLD | Keep Draft for hygiene/beauty review and supplier-metadata synchronization; do not activate from shipping evidence alone. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 34 | Nail Glue Phototherapy Pen UV Gel Brush Pen Acrylic Nail Art Painting Drawing Liner Brush Manicure Professionnel Brushes Tool | HOLD_CONTENT_COMPLIANCE_REVIEW | Supplier ingredient/SDS and compliant labeling evidence, or confirmed non-chemical brush-only mapping. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 35 | Pet Supplies Duck Goose Shoes Pet Cole Foot Poultry Boots Pet Duck Boots with Protective Soles Protective Shoe Set Pet Products | HOLD_CONTENT_COMPLIANCE_REVIEW | Species-specific sizing, material, supervision, and welfare/safe-use evidence before reconsideration. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 36 | Resistance Bands Set - Exercise & Fitness | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 37 | RGB LED Strip Lights 5m-30m with APP Control | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 38 | Solar Fairy String Lights for Outdoor Decor | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 39 | Summer Men's MJ Michael Jackson Printed 100%CottonNeutral | HOLD_CONTENT_COMPLIANCE_REVIEW | Documented authorization or licensed supplier provenance; otherwise reject. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 40 | USB Heated Cushion 43x43cm Electric Blanket | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 41 | Women Fake Piercing Nose Ring Hoop Septum Piercing Nose Clip Rock HipHoop Stainless Steel Magnet Fashion Body Jewelry Wholesale | HOLD_CONTENT_COMPLIANCE_REVIEW | Material composition, nickel/heavy-metal compliance evidence, and cleaned customer-facing content. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |
| 42 | ZWN 2.4G Remote Control Excavator Dump Truck RC Model Car Toy Professional Alloy Plastic Simulation Construction Vehicle for Kid | HOLD_RISK_REVIEW | Keep held until safety/claims/IP/compliance review is complete. | Required safety/compliance/IP evidence recorded and product approved, or final hold/reject/archive. |

### 7_ARCHIVE_CONFIRMED_REJECTS — 4 products

| # | product | current state | required action | completion test |
| ---: | --- | --- | --- | --- |
| 43 | 1-20Packs 100Pcs/Pack Wooden Sticks Baby Cotton Swabs Cleaning of Ears Tampons Health Beauty Cotton Swab Cleaning Cotton Buds | REJECT_CONTENT_COMPLIANCE | Keep Draft and excluded; reconsider only with complete supplier compliance documentation and legally reviewed claims. | Product archived and absent from launch channels. |
| 44 | Halloween Elsa Dress for Girls Children Party Princess Costume Kids Disguise with Long Cloak Girl Snow Queen Carnival Clothes | REJECT_CONTENT_COMPLIANCE | Keep Draft and excluded; reconsider only with documented licensed supplier provenance and children's apparel compliance evidence. | Product archived and absent from launch channels. |
| 45 | New Heated Rivalry Hockey Jersey Long Sleeves Tee Men's | REJECT_CONTENT_COMPLIANCE | Keep Draft and excluded; reconsider only with documented licensed supplier provenance. | Product archived and absent from launch channels. |
| 46 | Rhinitis Nasal Irrigator Washing for Children Silicone Baby Nasal Aspirator Syringe Baby Nose Cleaner Kids Nasal Washer Reusable | REJECT_CONTENT_COMPLIANCE | Keep Draft and excluded; reconsider only after regulatory classification and complete supplier compliance documentation. | Product archived and absent from launch channels. |

