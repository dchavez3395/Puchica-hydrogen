# Puchica launch-readiness audit — 2026-07-25

## Current operating picture

- Shopify catalog: 66 products total; **1 active**, 64 draft, and 1 archived. The only customer-facing product is Men's High-Neck Knit Sweater.
- DSers: 57 AliExpress products mapped in the connected store view; zero unmapped open orders. This is a sourcing pool, not the number of products that should be published.
- Orders: one paid, unfulfilled test order remains. Do not place or fulfill another supplier order until its DSers path, cost, shipping, and tracking handoff are confirmed.
- Storefront: the Hydrogen launch allowlist now contains only the active sweater handle. The loss-making cotton T-shirt, the safety/delivery-unreviewed drone and RC construction set, and the pet bowl with stale supplier options were moved to Draft; their Shopify and DSers records remain intact.

## Current release blockers

1. **Fulfillment proof**: reconcile the paid DSers test order and confirm supplier charge, Canadian shipping method, tracking sync, and customer-notification path before adding traffic.
2. **Exact Canada supplier quote**: the active sweater requires an exact selected-variant Canadian supplier-shipping quote, delivery window, and tracking check before traffic or lifecycle automation is scaled.
3. **Apparel return readiness**: the sweater has 54 mapped variants. Verify its size chart, material, garment measurements, and care instructions against the supplier listing before promoting it.
4. **Pet-bowl mapping repair**: the supplier page no longer matches Shopify/DSers options. Rebuild its current variant mapping, stock, and Canada quote before reconsidering it for launch.
5. **Collection cleanup**: Shopify retains 11 empty legacy collections. Hydrogen filters them out of customer navigation, but archive them in Shopify only after confirming that no campaign, redirect, or external link still depends on them.
6. **SKU integrity**: the active sweater retains DSers source-format option IDs as SKUs. That is intentional for mapping; do not normalize them until DSers confirms mapping is independent of the Shopify SKU field.

## Historical pre-triage blockers (superseded)

1. **Fulfillment proof** — the paid order must be reconciled in DSers and its supplier cost, shipping method, tracking sync, and customer-notification path checked before adding traffic.
2. **Five active products are unpublished to the online store** — Portable Mini Bag Sealer, Jade Roller Face Massager, Resistance Bands Set, Multi-Compartment Desk Organizer, and RGB LED Strip Lights. Their inventory is also placeholder-like (999) and their variants do not have supplier SKUs.
3. **Product content quality** — eight active descriptions use the wrong category template (for example pet copy on a baby product, RC-toy copy on resistance bands, and kitchen copy on pet bowls). This is a conversion and compliance issue.
4. **SEO gaps** — the Solar String Lights and Wrist-Controlled RC Drone currently have no SEO title or meta description.
5. **Variant availability** — Baby Music Activity Gym has 13 of 14 variants at zero stock; RC Monster Truck has 3 unavailable variants; Wrist-Controlled Drone has 1 unavailable variant. Low total inventory also affects the Head Back Protector (2), Activity Gym (6), and adjustable pet bowls (15).
6. **Collection taxonomy** — product types `Beauty`, `Office`, and `Electronics` do not naturally resolve to the intended department collection rules. The active products are still visible elsewhere, but these types need a deliberate taxonomy/tag decision before collection automation is trusted.

## DSers catalog curation rule

The current DSers set is a sourcing pool, not a launch catalog. A mapping only establishes a supplier connection; it does not approve a product for the storefront.

Puchica should remain a focused lifestyle store rather than a general catalogue of mapped AliExpress products.

### Candidate departments

- **Useful home**: practical organization, lighting, small home upgrades, and desk/storage products.
- **Everyday outdoors**: low-risk activity accessories, where supplier facts and shipping are verified.
- **Pet essentials**: simple, non-medical pet accessories with clear sizing and no unverified safety or feeding claims.
- **Seasonal apparel**: a deliberately small apparel edit only after sizing, material, delivery, return expectations, and Canadian landed margin are confirmed.

### Exclude by default

- Products with health, treatment, therapeutic, or medical claims.
- Electrical/heated products until safety, plug/voltage, certifications, and delivery support are verified.
- Child-safety-sensitive toys and products with age-related claims until supplier evidence is reviewed.
- "Luxury brand", logo, or potentially counterfeit-style watches/accessories.
- Low-trust novelty products, animal products with unclear welfare/safety implications, and items that cannot support shipping, FIRST15, fees, and a target margin.

### Current examples from the mapped set

- **Possible launch candidates, pending quote/content review**: Solar Fairy String Lights, Compact Manicure Set, Travel Pet Water Bottle, No-Drill Shower Shelf, Compact Bicycle Bell, Men's High-Neck Knit Sweater, Men's Cotton-Linen Wide-Leg Pants, and the active pet bowl products.
- **Keep off the storefront until a deliberate exception is approved**: faux piercing jewelry, rabbit-fur keychains, generic/luxury-branded watches, nail-treatment items, heated clothing, cotton-swab health/beauty items, and safety-sensitive RC toys without complete supplier/shipping review.
- **Immediate risk check**: any supplier SKU marked out of stock cannot be treated as sellable until the exact variant mapping is replaced and revalidated.

## Product-edit sequence

Use one controlled product as a proof run before applying the workflow to the full active catalog:

1. Confirm supplier mapping, landed cost, shipping method, estimated delivery, and variant inventory in DSers.
2. Rewrite customer-facing title, description, options, and SEO from verified supplier facts; do not invent material, safety, or performance claims.
3. Set a consistent product type, department tag, and collection membership.
4. Check image sequence, alt text, price/compare-at logic, and storefront product page on mobile and desktop.
5. Verify checkout and DSers order handoff with a non-charged test only; ask for explicit approval before any supplier charge or customer-facing send.

## Automation path after fulfillment is proven

- Klaviyo: confirm Shopify integration, consent settings, sender identity/domain, and event tracking. Build but do not enable the welcome, abandoned-checkout, post-purchase, and win-back flows until their copy and discounts are approved.
- Judge.me: enable only verified-purchase review requests after delivery/tracking timing and brand voice are reviewed. Do not display manufactured testimonials or aggregate counts.
- Shopify: keep new imported DSers products as Draft until mapping, margins, content, SEO, image rights, and collection placement pass the product-edit sequence.

## Storefront work completed locally

- Department cards and product cards now stretch to consistent row heights.
- Direct collection fetching prevents stale/empty homepage department tiles.
- Breadcrumb category links use real department destinations.
- Unsupported free-shipping/Toronto/prepaid-label language was removed from the primary English storefront surfaces in this change set; older policy and translated copy remain a separate policy-verification pass.
