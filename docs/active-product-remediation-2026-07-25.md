# Active product remediation — 2026-07-25

Source: Shopify Admin variant read plus a read-only DSers My Products audit.
All amounts below are DSers' displayed Canadian ranges. They exclude the
destination-specific supplier shipping quote, Shopify payment fee, discounts
and returns allowance, so none is approval for paid traffic.

## Decision table

| Product | Shopify price | DSers CA cost | DSers stock | Decision |
| --- | ---: | ---: | ---: | --- |
| Everyday 100% Cotton T-Shirt | CA$45.99 | CA$26.82-30.39 | 37 | Hidden from Hydrogen. Reprice or replace before reactivation. |
| Men's High-Neck Knit Sweater | CA$39.99 | CA$15.77-19.88 | 24,868 | Organic-only candidate after delivery, sizing and copy checks. |
| Pet Food & Water Bowl Set | CA$39.99 | CA$14.41-17.49 | 384 | Organic-only candidate after copy and delivery checks. |
| 1:64 RC Construction Vehicle Set | CA$56.99 | CA$21.93-26.40 | 70 | Organic-only candidate after model, age and delivery checks. |
| Adjustable Raised Pet Bowl Set | CA$34.99 | CA$15.30-17.54 | 14 | Low-stock organic-only hold. |
| Hand-Controlled Mini RC Drone | CA$17.81-51.99 | CA$7.14-20.80 | 50 | Best margin shape, but keep organic-only until all source/delivery checks pass. |

## Product-specific actions

### Everyday 100% Cotton T-Shirt — hold

- Shopify has 18 colour/size variants and no SKU values.
- `Advanced Gray` is a supplier-style option label; normalize only after the
  DSers variant-value mapping is recorded.
- At its maximum DSers cost, the current selling price is 1.51x cost before
  supplier shipping and fees. It cannot support a first-order discount or ads.
- Keep hidden from the Hydrogen allowlist; do not delete the product.

### Men's High-Neck Knit Sweater — organic-only hold

- 54 size/colour variants, no SKUs.
- Public values mix casing: `black`, `WHITE`, `Dark Grey`, `Light Grey`.
- Current SEO description is generic apparel filler rather than product-specific
  material, fit, care and delivery information.
- Before publishing in an apparel collection, verify the size chart and a
  Canada/US source quote for representative variants.

### Pet Food & Water Bowl Set — organic-only hold

- Five colour variants; public values mix casing: `green`, `PURPLE`.
- The SEO description is kitchen copy and must be replaced.
- Confirm capacity, material, dimensions and whether water dispensing works as
  described before making any product claim.

### 1:64 RC Construction Vehicle Set — organic-only hold

- Six variants are currently stored as a `Color` option even though the values
  combine colour and vehicle type (`Excavator-Green`, `Dump Truck-Yellow`).
- Do not rename the option or values until the DSers mapping grid is captured;
  option changes can break automated fulfilment mapping.
- Replace generic RC copy with the exact included vehicle/model, controls,
  power/charging information, age guidance and dimensions.

### Adjustable Raised Pet Bowl Set — organic-only hold

- DSers stock is only 14 across the product card; Shopify shows a smaller
  per-variant quantity set, so it needs a source refresh before promotion.
- `Red blue` is not customer-ready copy, and the SEO description is kitchen
  copy. Hold label changes until DSers variant matching is recorded.
- Confirm bowl material, dimensions, elevated height and cleaning instructions.

### Hand-Controlled Mini RC Drone — organic-only hold

- Shopify shows `Green` out of stock; `Yellow` and `Red` are available.
- SEO title and description are both empty.
- The inspected source page showed Red selected, a 4.1 rating from 795 reviews,
  5,000+ sold, US$5.15 source item cost and US$1.99 US shipping via AliExpress
  Selection Standard. This is a US quote, not a Canada quote.
- The source warns that the item is not suitable for children under 36 months.
  Do not market it to toddlers or make safety/performance claims without
  substantiation.

## Required per-variant clearance sequence

1. Record the exact Shopify option value and matching DSers source option.
2. Quote that source option to a Canadian and US address, including shipping,
   delivery estimate and tracking method.
3. Calculate net contribution after Shopify payment fees, FIRST15 allowance and
   a returns reserve.
4. Only then normalize labels, add Shopify SKUs if the DSers mapping supports
   them, write product-specific SEO and feature the product.
