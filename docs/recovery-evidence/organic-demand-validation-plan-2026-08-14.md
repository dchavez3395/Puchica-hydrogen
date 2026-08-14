# Organic demand validation plan — 2026-08-14

## Objective

Prove whether the cable organizer or toiletry organizer can produce qualified
shopping intent before expanding the live catalog or spending on ads. The
packing-cube set remains a Canada-only supporting offer.

## Current baseline

- Shopify at the latest check: 15 sessions, 11 visitors, two cart-add sessions,
  two checkout-reached sessions, zero completed checkouts, zero real orders,
  and CA$0 sales.
- All 15 sessions were direct. The cart and checkout activity matches controlled
  QA and is excluded from demand.
- TikTok cable-organizer post: 2 views, 1 brand-account like, 0 comments. The
  brand-account like is not qualified engagement.
- Instagram toiletry post: no visible likes or comments and no qualified store
  traffic attributed to social.

## No-spend funnel corrections completed

- TikTok bio now reads: `Travel organizers for Canada + U.S. Shop puchica.ca 🇨🇦`.
- The three unrelated legacy TikTok pins were removed, making the current cable
  organizer the first chronological profile post. TikTok desktop would not pin
  the commercial-content post; it reports that this action requires the mobile
  app.
- Instagram bio now reads: `Travel organizers for Canada + U.S. 🧳 Shipping
  shown at checkout. Shop below.`
- Instagram's existing tracked `www.puchica.ca` link remains active. Link editing
  and pin management are mobile-only account actions.
- The storefront homepage priority now matches the cross-market validation
  cohort: cable organizer first, toiletry organizer second, Canada-only packing
  cubes third.

## Measurement window

Run the organic test for 14 calendar days while aiming for at least 100
non-owner, non-QA product-page sessions across the two hero offers. Fourteen
days without 100 qualified sessions means distribution was insufficient; it
does not prove that the products failed.

## Decision rules

1. Exclude owner, automated, test-order, direct checkout-QA, and supplier/admin
   activity from demand.
2. Before 100 qualified product sessions, use engagement only to improve
   creative clarity; do not change price or add products from noise.
3. After 100 qualified product sessions:
   - zero add-to-carts means the creative/offer needs replacement before more
     distribution;
   - add-to-carts but zero checkout starts means the PDP, market availability,
     price presentation, or shipping explanation needs repair;
   - checkout starts but zero orders means trust, delivery, payment, or final
     price friction needs investigation;
   - one real paid order starts the controlled DSers and delivery-proof
     lifecycle, not paid scaling.
4. Keep paid ads at CA$0 until a real order is delivered and the product,
   packaging, delivery time, support, analytics, and refund path are recorded.
5. Add no new live product until either hero offer produces real intent or the
   100-session review identifies a specific unmet need worth testing.

## Content pacing

- Keep the existing eight-post Instagram schedule unchanged.
- Record the TikTok cable post at its two-hour and 24-hour checkpoints.
- Do not publish the second TikTok concept before the two-hour checkpoint.
- At 24 hours, continue with the same hook only if it produced qualified reach
  or engagement; otherwise release one prepared alternative concept and test a
  materially different problem/visual hook.

## Offer-clarity preparation

- The cable and toiletry hero product pages now show a compact `What arrives`
  block immediately below the buy form. It states the empty organizer included,
  verified approximate dimensions, and the pictured contents that are not
  included.
- The facts are translated across the English, French, Spanish, and Portuguese
  storefront dictionaries and are intentionally limited to the two validated
  hero handles.
- A second cable-organizer TikTok concept is prepared around the materially
  different `What actually arrives?` hook. It uses the exact approved product
  image, states the verified dimensions and exclusions, and remains unpublished
  pending the first post's measurement checkpoint.

## Production deployment verification

- Commit `69263ac` was deployed to Shopify Oxygen production with deployment
  description `organic-hero-offer-alignment`.
- Deployment URL:
  `https://01m0142z38bcx80w8aqnwvk1ry-f9aa94aa3bf86abb6754.myshopify.dev`.
- Automated tests passed 83 of 83; `npm run launch-check` and the production
  build passed.
- Post-deployment production health passed all 35 checks.
- The live homepage was verified with the cable organizer as the featured hero;
  the toiletry organizer is second and the Canada-only packing cubes are third
  in the campaign priority.
- No ad spend, supplier order, payment capture, fulfilment, or store-setting
  change was made during this deployment.
