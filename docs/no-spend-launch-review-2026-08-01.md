# Puchica no-spend launch review — 2026-08-01

## Executive decision

- **Storefront:** LIVE and suitable for owner review, organic visits, and
  no-budget testing at `https://puchica.ca`.
- **Paid advertising:** **HOLD.** No campaign, audience, budget, payment, or ad
  activation was created or changed during this release.
- **Why paid traffic remains blocked:** supplier fulfillment evidence is still
  country-level rather than address/ZIP-level, tracking and a fresh exact ETA
  are not proven, the physical product has not been inspected, and the
  Shopify-hosted Purchase event has not been verified with a genuine order.

## What is live and verified

- Home, About, Collections, packing-cube campaign, Shipping, and FAQ returned
  HTTP 200 after the final Production deployment.
- The real Canada-to-United-States market-switch route updated the existing
  cart buyer identity to `US`; the exact five-piece red cube then added at
  `$52.00 USD`.
- The cart add route now checks and synchronizes a stale buyer market before
  adding a product. It fails closed when Shopify cannot confirm the requested
  market.
- Production contains Meta Pixel `996669459615534` and GA4
  `G-KTMM6KWWT6`. ViewContent, AddToCart, and InitiateCheckout are implemented;
  Purchase remains unproven until a genuine Shopify-hosted order completes.
- Mobile DOM checks at a 375 px viewport passed for Home and About. The
  campaign overflow found during Production QA was fixed and rechecked at
  `375 / 375` client-to-scroll width.
- The campaign's Add to Cart control is visible and enabled at mobile width;
  all checked Home, About, and campaign images expose alt text.
- The announcement CTA now has a 24 px-high target. Inline footer email text
  remains an allowed inline-text target exception.
- Automated gates: 28/28 tests, lint, production build, launch-readiness
  control, Shopify Hydrogen validation, and `git diff --check` passed.

## Supplier and economics truth

Fresh read-only DSers/AliExpress evidence at 2026-08-01 21:10 UTC confirms:

- Shopify product: `Red 5-Piece Compression Packing Cube Set`
- Exact supplier option: `5PCS Set Red`
- Mapping: `14:100018786#5PCS Set Red`
- DSers supplier stock: `1024`
- DSers API product cost: `US$20.39`
- Displayed method: `AliExpress Selection Standard`
- Displayed shipping charge: `US$1.99`
- Known supply subtotal: `US$22.38`

At the current `$52.00` U.S. price, the provisional pre-ad contribution is
about `$25.21` or `48.5%` after the documented payment-fee and refund-reserve
assumptions. This is a useful screen, not bankable profit: address-specific
shipping, duties/import charges, tracking, actual refunds, supplier price
movement, and physical quality are not fully evidenced.

The site therefore has a **provisional margin pass** and an **operational paid
traffic hold**. The hold outranks the mathematical margin.

## Creative review pack

The review-only pack is in
`docs/packing-cubes-creative-review-pack-2026-08-01.md` with assets under
`outputs/ad-creative-review/packing-cubes/`.

- Concept A: generated square suitcase lifestyle scene, exactly five red
  organizers visible.
- Concept B: generated vertical hotel-packing lifestyle scene, exactly five
  red organizers visible.
- Concept C: exact supplier product image for product/configuration truth.
- Earlier generated attempts with the wrong piece count were excluded.

The generated scenes must remain lifestyle context; Concept C and the landing
page carry exact product-detail responsibility. Nothing was uploaded to an ad
platform.

## Required next review, in order

1. **Owner storefront review:** inspect Home, About, the packing-cube campaign,
   Shipping, FAQ, cart, and checkout on one phone and one desktop. Record only
   concrete blockers; avoid another broad redesign before product proof.
2. **Legitimate U.S. delivery evidence:** obtain permission to use one real
   U.S. recipient/address. Do not use an invented residence or unconsenting
   address. Recheck the exact variant, final supplier charge, route, tracking,
   and ETA without paying.
3. **Controlled sample approval:** review the complete final amount and address,
   then separately authorize one real order. No purchase is authorized by this
   dossier.
4. **Physical and fulfillment proof:** record order processing, tracking sync,
   delivery time, packaging, zipper/seam quality, measurements, piece count,
   and received condition. Any mismatch rejects or remediates the offer.
5. **Analytics proof:** use that genuine order to confirm one—and only one—Meta
   Purchase and GA4 purchase event with the right value/currency/order ID.
6. **Creative/copy approval:** choose the two best concepts, verify every claim
   against the received product, and approve the final U.S. landing-page URL.
7. **Budget review:** only after steps 1–6, review an explicit channel, audience,
   daily cap, total cap, CAC stop, and fulfillment pause rule. Activation still
   requires a new, explicit user instruction.

## Stop conditions

Do not begin or continue paid traffic if any of these is true:

- supplier cost, stock, mapping, shipping method, or ETA changes materially;
- tracking is absent or fulfillment is not processed on the agreed timeline;
- the received product differs from the exact five-piece red configuration;
- checkout price/currency or market switching is wrong;
- Purchase is missing, duplicated, or reports the wrong value/currency;
- the provisional contribution margin falls below 30%; or
- the user has not explicitly approved the exact spend cap.

## Current honest status

Puchica is no longer blocked by storefront design or basic cart mechanics. The
remaining constraint is operational proof, not more UI work. The shortest safe
path to revenue is one legitimate controlled delivery, analytics confirmation,
then a tightly capped paid test reviewed before activation.
