# Storewide product gate operating plan - 2026-07-26

## Current scope

The current Shopify Admin snapshot contains 66 products and 933 variants:

- 26 active products
- 39 draft products
- 1 archived product
- 24 active products with the `puchica-launch-ready` tag

The new working files are:

- `docs/storewide-product-gate-2026-07-26.csv`
- `docs/storewide-variant-quote-worksheet-2026-07-26.csv`
- `docs/storewide-product-gate-2026-07-26.md`

These files are read-only audit outputs. They do not publish, draft, delete, or reprice products.

## Decision buckets

| Decision | Count | Meaning |
| --- | ---: | --- |
| `LIVE_QUOTE_REQUIRED` | 20 | Active launch products that need exact Canada DSers quote evidence before paid promotion. |
| `LIVE_QUOTE_AND_CONTENT_REVIEW` | 2 | Active launch products that need quote evidence plus claims/content review. |
| `HOLD_RISK_REVIEW` | 25 | Products with hard risk flags such as child safety, electrical/heated, medical/health, likely IP, RC/drone, or similar. |
| `DRAFT_QUOTE_AND_CONTENT_REVIEW` | 12 | Drafts with mapping/cost evidence that can be reviewed in batches. |
| `HOLD_MAPPING_REQUIRED` | 5 | Do not quote yet; repair DSers mapping/SKU evidence first. |
| `HOLD_REPRICE_OR_REJECT` | 2 | Current economics fail before supplier shipping. |

## Immediate active-catalog actions

1. Remove or hold the launch tag from hard-risk active products until review is complete:
   - Bath Toy Storage Mesh
   - Solar Fairy String Lights for Outdoor Decor

2. Keep these active only with content review before promotion:
   - Magnetic Hair Clip
   - Precision Nail Clippers

3. Keep these two out of launch economics until repriced, replaced, bundled, or rejected:
   - Everyday 100% Cotton T-Shirt
   - Everyday Pullover Hoodie

## Quote-first queue

Work through the 20 `LIVE_QUOTE_REQUIRED` products first. For each product, open the exact mapped DSers product, pick the worst-margin or representative sellable variant, and fill the quote worksheet:

- mapped source option
- source item cost
- Canada supplier shipping cost
- delivery estimate
- shipping service
- available stock
- pass/fail against the Canada shipping cap

Prioritize products with the best headroom and low operational risk:

1. No-Drill Shower Shelf
2. Travel Pet Water Bottle
3. Everyday Carabiner Clip Set
4. Car Sun Visor Organizer
5. Adjustable Rhinestone Ring
6. Everyday Performance Shorts / Fleece Joggers / Zip Hoodie only after apparel sizing/content review

Products with very low cap need quote proof before they are treated as launch-safe:

- Adjustable Raised Pet Bowl Set: CA$0.54 cap
- Men's High-Neck Knit Sweater: CA$0.85 cap
- Compact Manicure Set: CA$0.89 cap
- Outdoor Cycling Sunglasses: CA$1.76 cap
- Quick-Dry Training Shorts: CA$2.09 cap

## Draft expansion rule

After the active catalog has quote evidence, review drafts in small batches only. A draft can move toward launch only after:

1. DSers variant mapping is visible and non-zero.
2. Every customer-selectable Shopify option maps to a current supplier option.
3. Unit cost and Canada supplier shipping quote are recorded.
4. Claims, category, images, title, SEO, and option labels are customer-ready.
5. The worst sellable variant clears the 30% contribution rule.

## Stop rules

Do not promote or activate products with:

- child safety or infant/toddler use
- heated/electrical claims without specs and policy review
- medical, therapeutic, pain, posture, or health claims
- likely IP, costume, or branded-character risk
- unmapped variants or empty supplier SKU evidence
- negative Canada shipping cap before quote

## Completion definition

The store is "done" only when every product has one of these final states:

- approved active launch product with quote evidence
- active but organic-only with documented reason
- draft for later with documented missing proof
- hard hold/reject with documented reason
- archived with documented reason

