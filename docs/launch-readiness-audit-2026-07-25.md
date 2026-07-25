# Puchica launch-readiness audit — 2026-07-25

## Current operating picture

- Shopify catalog: 69 products total; 21 active, 47 draft, 1 archived.
- DSers: 74 AliExpress products mapped in the connected store view; zero unmapped open orders.
- Orders: one paid, unfulfilled test order remains. Do not place or fulfill another supplier order until its DSers path, cost, shipping, and tracking handoff are confirmed.
- Storefront: homepage categories now point only to audited, populated collections; empty-category links, the unsupported World Cup rail, and the single-product oversized Sports rail have been removed locally.

## Release blockers

1. **Fulfillment proof** — the paid order must be reconciled in DSers and its supplier cost, shipping method, tracking sync, and customer-notification path checked before adding traffic.
2. **Five active products are unpublished to the online store** — Portable Mini Bag Sealer, Jade Roller Face Massager, Resistance Bands Set, Multi-Compartment Desk Organizer, and RGB LED Strip Lights. Their inventory is also placeholder-like (999) and their variants do not have supplier SKUs.
3. **Product content quality** — eight active descriptions use the wrong category template (for example pet copy on a baby product, RC-toy copy on resistance bands, and kitchen copy on pet bowls). This is a conversion and compliance issue.
4. **SEO gaps** — the Solar String Lights and Wrist-Controlled RC Drone currently have no SEO title or meta description.
5. **Variant availability** — Baby Music Activity Gym has 13 of 14 variants at zero stock; RC Monster Truck has 3 unavailable variants; Wrist-Controlled Drone has 1 unavailable variant. Low total inventory also affects the Head Back Protector (2), Activity Gym (6), and adjustable pet bowls (15).
6. **Collection taxonomy** — product types `Beauty`, `Office`, and `Electronics` do not naturally resolve to the intended department collection rules. The active products are still visible elsewhere, but these types need a deliberate taxonomy/tag decision before collection automation is trusted.

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

