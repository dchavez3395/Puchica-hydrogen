# Active catalog launch gate — 2026-07-25

Source: live Shopify Admin catalog audit. This is an operational approval list,
not a request to publish additional products.

## Current state

- **Shopify Admin state (2026-07-25, after launch safeguards):** 6
  active products; 62 drafts. Fifteen products were moved to draft, not deleted:
  the five SKU-less/unverified products, two branded apparel listings, and two
  child-oriented listings with unresolved stock/safety checks, one electrical
  wearable pending safety and destination validation, and three products with
  supplier/destination data exposed as customer-facing variant labels.
- **Customer-facing launch catalog:** six approved products only. Hydrogen now
  enforces an allowlist across homepage rails, collection pages, search, and
  direct product URLs so an unreviewed product cannot surface from a stale
  Storefront API response. The RC Monster Truck is now Draft because its
  duplicate supplier variant labels and DSers validation remain unresolved.
- All currently active products have media, but only the solar string lights
  have received a deliberate title, description, SEO and tag pass.
- The sole paid test order, Shopify **#1001** (Freeze Protection Plant Covers,
  CA$13.85 to Brandon, MB), is still unfulfilled. Its only Shopify fulfillment
  record is cancelled and has no tracking. Reconcile the DSers order path,
  supplier charge, shipping method and tracking sync before a second test or
  any traffic launch.
- **DSers validation (2026-07-25):** the connected store has 74 mapped
  AliExpress products and no items in any actionable order state (pending,
  awaiting order/payment/shipment/fulfillment or fulfilled). The side-menu
  badge still shows one AliExpress item, but it is not an order that can be
  processed from the queue. Treat #1001 as an incomplete test, not as supplier
  fulfillment proof; do not charge a supplier or fulfill it without an explicit
  test-order decision.
- DSers does expose live source cost, configured US/Canadian selling prices and
  stock for its mapped products. It does **not** establish a cost or mapping for
  the five Shopify-only default-variant products below.

### DSers mapped-price snapshot (2026-07-25)

The figures below are DSers' currently configured Canadian ranges, not a final
margin calculation. They demonstrate that a source mapping exists; each
sellable variant still needs its actual checkout delivery quote for Canada and
the United States before approval.

| Active product | DSers CA source cost | DSers configured CA price | DSers stock |
| --- | ---: | ---: | ---: |
| Solar Fairy String Lights | CA$5.30–10.27 | CA$13.24–25.66 | 199 |
| Hand-Controlled Mini RC Drone | CA$7.14–20.80 | CA$17.79–51.93 | 50 |
| Elevated Pet Bowl Set | CA$15.30–17.54 | CA$34.99 | 14 |
| RC Monster Truck | CA$23.65–37.12 | CA$92.99 | 31 |
| RC Construction Vehicle Set | CA$21.93–26.40 | CA$56.99 | 70 |
| Automatic Pet Food & Water Bowl | CA$14.41–17.49 | CA$39.99 | 384 |

Do not compare the lowest selling price to the highest source cost across this
table: DSers applies pricing at variant level. The approval check is the
matched source variant plus its destination-specific shipping charge.

### Destination quote evidence

**Solar Fairy String Lights decision (July 25):** moved to Draft after the
observed US supplier quote showed the live selling price did not clear the
contribution-margin rule after shipping and payment fees. Reprice only from
verified Canada and US landed quotes before reactivation.

| Product / source variant | Destination | Supplier cost | Shipping | Estimate | Status |
| --- | --- | ---: | ---: | --- | --- |
| Solar Fairy String Lights, White / 7m 50 LED | United States | US$3.79 | US$1.99 via AliExpress Selection Standard | Jul 31–Aug 5, checked Jul 25 | Quotable; verify a Canadian destination before promotion |

This is an observed supplier-page quote, not a promise to customers. Shipping
remains variable by destination, variant and order date; checkout is the source
of truth for the customer-facing rate.

### Checkout test evidence (no payment submitted)

- A local checkout was created for one Solar Fairy String Lights variant with a
  non-customer test contact and generic Brandon, Manitoba address. No payment,
  order, or supplier fulfillment was submitted.
- Checkout returned **Standard Shipping CA$7.99** and **Express CA$20.00** for
  that Canadian test address. These are store checkout rates; they are not a
  supplier-specific landed-cost quote.
- The checkout country selector offered **Canada** and **United Kingdom** only.
  **United States is not currently enabled as a checkout destination.** Do not
  advertise US or wider Western-market availability until Shopify Markets,
  shipping zones/rates, duties/taxes, and DSers supplier coverage are configured
  and a US address completes the same no-payment test.
- **Checkout routing:** the legacy `puchica-2.myshopify.com` domain serves the
  old Online Store theme and must never be used as a Hydrogen checkout host.
  The storefront rewriter now fails away from that host, but launch still
  requires a dedicated `checkout.puchica.ca` subdomain connected in Shopify
  Domains and assigned to Shopify checkout/Online Store routing. Re-run the
  no-payment checkout test after DNS verification before sending any traffic.

## Hold for DSers + pricing validation

| Product | Shopify issue | Launch-gate requirement |
| --- | --- | --- |
| RGB LED Strip Lights 5m–30m | No SKU, `Default Title`, inventory 999 | Confirm exact DSers variant, CA/US shipping and landed cost; add supplier SKU. |
| Jade Roller Face Massager | No SKU, `Default Title`, inventory 999 | Confirm exact DSers variant, CA/US shipping and landed cost; add supplier SKU. |
| Portable Mini Bag Sealer | No SKU, `Default Title`, inventory 999 | Confirm exact DSers variant, CA/US shipping and landed cost; add supplier SKU. |
| Multi-Compartment Desk Organizer | No SKU, `Default Title`, inventory 999 | Confirm exact DSers variant, CA/US shipping and landed cost; add supplier SKU. |
| Resistance Bands Set | No SKU, `Default Title`, inventory 999 | Confirm exact DSers variant, CA/US shipping and landed cost; add supplier SKU. |

## Active products needing copy / variant cleanup before promotion

- 100% Pure Cotton T-Shirt With Round Neck Shoulder Design
- 1:64 Bluetooth Remote Control Crane And Forklift
- 6-piece set of fashion electronic watch necklace earrings
- 9 Heated Vest Zones Electric Heated Jackets Men Women
- Baby Music Activity Gym Rug Play Mat Newborn Carpet Pedal
- Head Back Protector Baby Protect Pillow Learn Walk Head
- Men's Casual Sports Hoodie Spring Autumn Fashion Solid
- New Men's High Neck Sweater Solid Color Pullover Knitted
- Pet Bowls Automatic Water Dispenser Feeder Cat Dog Food
- Pet supplies: Cat bowls/water bowls, dog bowls, tip-over
- RC Monster Truck 1:16 Scale Remote Control Car 2.4GHz
- summer men's cotton and linen oversized wide leg pants
- Watch Wrist Hand Controlled Induction Aircraft mini RC Drone

### Findings from the 2026-07-25 live active-product read

- Several descriptions are plainly assigned to the wrong product category:
  the jewellery set uses home copy, the activity gym uses pet copy, and both
  pet-bowl listings use kitchen copy. Replace these before any paid traffic.
- Supplier or destination metadata is visible to shoppers as option names or
  values on some listings (for example `United States`, `image color`, and
  duplicate colour labels). Normalize customer-facing colour, size and model
  names against the mapped DSers variants before promotion.
- The activity gym has many zero-stock variants and the head-protector listing
  has only two units reported in Shopify. Both were moved to Draft and must
  remain there until DSers confirms each sellable variant and destination
  availability.
- The drone and RC truck also have zero-stock variants. Their product pages
  must prevent selection of unavailable variants and retain only source-mapped
  choices.
- The head-protector is a child safety-adjacent item. Do not make safety or
  injury-prevention claims without substantiation, and defer it from launch
  until its documentation and CA/US delivery are confirmed.

## Ready-for-recommendation candidate

- Solar Fairy String Lights for Outdoor Decor — SKU-bearing variants, curated
  title/copy/SEO/tags and non-placeholder inventory. Pricing is still not
  approved until supplier shipping is quoted per destination.

## Immediate merchandising holds

- The five default-variant products above have now been moved to **Draft**.
  Their `999` Shopify stock could have created a sale DSers cannot automatically
  place. Remap them in DSers, add source SKUs and destination quotes, then
  re-activate individually.
- The Baby Music Activity Gym Rug and Head Back Protector are now **Draft**:
  their live Shopify stock/variant state and child-safety marketing need a
  documented DSers and compliance review before reactivation.
- The USB-heated vest is now **Draft**: it is an electrical wearable and needs
  supplier safety documentation, mapped-variant checks and CA/US delivery
  evidence before it can be sold or promoted.
- The digital watch set, hoodie, and wide-leg pants are now **Draft**: their
  variants expose supplier or destination metadata (`United States`, `image
  color`, and `Picture color`) instead of customer-ready option values. Repair
  the DSers mappings and option labels before reactivation.
- The RC monster truck remains **Active** but is a pending draft candidate: its
  option labels include duplicated supplier model strings. Shopify's product
  write connector returned an internal error on 2026-07-25; retry the status
  change when the connector is healthy, or repair its mapped option values
  first.
- The Michael Jackson-branded T-shirt and Heated Rivalry jersey have now been
  moved to **Draft**. Keep them out of promotion unless the rights/supplier
  authorization can be documented.

## Definition of "approved for launch"

1. DSers product and every sellable Shopify variant match.
2. Supplier SKU is present in Shopify or the mapping is documented.
3. Source item cost and a checkout-equivalent delivery quote are recorded for
   Canada and the United States.
4. Selling price clears the agreed contribution-margin rule after payment fees,
   expected refunds and promotional discount allowance.
5. Title, options, colour/size names, images, tags, description and SEO are
   customer-ready.
6. Product belongs to a non-empty customer-facing collection.
