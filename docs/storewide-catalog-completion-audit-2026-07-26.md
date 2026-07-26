# Storewide catalog completion audit - 2026-07-26

## Current state

- Shopify products audited: 66
- Previously open DSers quote products: 9
- Previously open quote products now destination-quoted or explicitly supplier-blocked: 9
- Remaining products in `OPEN_DESTINATION_QUOTES`: 0
- Products requiring pricing/content/variant action after quote: 8
- Product blocked by DSers `NO DATA`: 1

Blank quote cells still present elsewhere belong to products already assigned to explicit content, mapping, compliance-reject, economics-excluded, or Managed Markets blocker classes; they are not an untriaged quote queue.

## Completed quote batch

| Product | Variants | Resolution | Workstream | Next action |
| --- | ---: | --- | --- | --- |
| New Girl Dresses Princess Costume Kids Mermaid Cosplay Costume Kids Carnival Birthday Party Prom Costume Party Dresses For girls | 20 | BLOCKED_SUPPLIER_NO_DATA | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US; verify textile composition, sizing, flammability/labeling evidence, and remove ambiguous cosplay claims before activation. |
| Windproof Infant Stroller Gloves Children's Outdoor Sports Mittens Cartoon Printed Hands Warmer Scooter Accessory for Winter | 4 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US; verify material, sizing, attachment design, warnings, and textile labeling before activation. |
| 300/280/200/100Pcs Washer Copper Sealing Solid Gasket Washer Sump Plug Oil For Boat Crush Flat Seal Ring Tool | 4 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US, verify material/dimensions and fitment copy, then apply the normal margin gate. |
| Thermal Underwear Tops Men Winter Clothes Thermal Shirt Autumn Men's Winter Tights High Neck Thin Slim Fit Long Sleeve T-shirt | 42 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US; before activation verify fiber content, size chart, care, origin, textile labeling, and remove unsupported thermal-performance wording. |
| Summer Men's Shorts Cool Sportswear Running Sport Shorts Casual Bottoms Gym Fitness Training Jogging Short Pants Men Black Gray | 72 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US; before activation verify fiber content, size chart, care, origin, textile labeling, and remove unsupported cooling/performance claims. |
| Summer Spring Candy Color Kids Pantyhose Ballet Dance Tights for Girls Stocking Children Velvet Solid White Pantyhose | 39 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US; before activation verify fiber content, sizing, care, origin, and applicable children's textile labeling. |
| Kids Toddler Foot Measure Gauge Shoes Size Measuring Ruler Tool Baby Boy Girl Children's Foot Length Measuring Ruler Fittings | 5 | QUOTE_COMPLETE_ACTION_REQUIRED | C2_DRAFT_REPRICE_CONTENT_REVIEW | Quote Canada and US, verify measurement scale/accuracy and age-appropriate copy, then apply the normal margin gate. |
| Everyday Pullover Hoodie | 48 | QUOTE_COMPLETE_ACTION_REQUIRED | H3_REPRICE_OR_REJECT | Reprice, change variant/supplier, bundle, or reject before launch. |
| Everyday 100% Cotton T-Shirt | 18 | QUOTE_COMPLETE_ACTION_REQUIRED | H3_REPRICE_OR_REJECT | Reprice, change variant/supplier, bundle, or reject before launch. |

## Controls

- Keep every product in this batch excluded/Draft until its pricing, supplier, variant, and content actions pass.
- Exact Canada and U.S. evidence is in `docs/storewide-variant-quote-worksheet-2026-07-26.csv`.
- U.S. launch still requires the separate Managed Markets checkout blocker to be resolved and verified live.
