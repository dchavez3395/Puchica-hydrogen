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
- TikTok cable-organizer post at the latest signed-in check: 21 views, 2 likes,
  and 0 comments. One like is the known brand-account like; the other has no
  profile, attributed-session, checkout, or order signal and is not counted as
  demand.
- Instagram toiletry post exact insights: 0 interactions, 0 likes, 0 comments,
  0 saves, 0 shares, 0 profile activity, 0 profile visits, 0 external-link
  taps, and 0 follows. Views were still pending. No qualified store traffic was
  attributed to social.

## No-spend funnel corrections completed

- TikTok bio now reads: `Travel organizers for Canada + U.S. Shop
  puchica.ca/tiktok 🇨🇦`. The short path adds fixed TikTok organic attribution
  and redirects to the cable-organizer product page.
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

### Offer-clarity follow-up deployment

- Commit `4fea623` was deployed to Shopify Oxygen production with deployment
  description `hero-offer-clarity`.
- Deployment URL:
  `https://01m014t3rhfnjfaqb4q6113cmd-f9aa94aa3bf86abb6754.myshopify.dev`.
- Automated tests passed 85 of 85; `npm run launch-check` and the production
  build passed.
- Post-deployment production health passed all 35 checks.
- Direct live reads returned HTTP 200 and verified the new `What arrives`
  content on both the cable-organizer and hanging-toiletry-organizer pages.
- The backup TikTok remained unpublished. No ad spend, supplier order, payment,
  fulfilment, or customer-data mutation was made.

### TikTok attribution deployment

- Commit `2d629db` was deployed to Shopify Oxygen production with deployment
  description `tiktok-organic-attribution`.
- Deployment URL:
  `https://01m015b2t7y6s88wjf15cacvc2-f9aa94aa3bf86abb6754.myshopify.dev`.
- Automated tests passed 87 of 87; `npm run launch-check` and the production
  build passed. Post-deployment production health passed all 36 checks.
- A direct live read of `https://puchica.ca/tiktok` followed to the exact
  cable-organizer PDP with the fixed `tiktok / organic_social` campaign values
  and returned HTTP 200.
- The signed-in TikTok profile was updated and a fresh public-profile read
  verified the exact `puchica.ca/tiktok` bio. No content was published, deleted,
  boosted, or promoted and no money was spent.

## Motion-source and quality audit

- Shopify Admin GraphQL reports 13 ready image nodes and no video or external
  video node for the cable organizer. The toiletry organizer has three ready
  image nodes and no video or external video node.
- The signed-in DSers My Products page did not expose supplier footage. The
  only other local motion file was an unrelated beach interview and was not
  used.
- `outputs/motion-first-cable/final/cable-organizer-motion-first-v1-12s.mp4`
  is therefore honestly classified as image-derived motion graphics, not a
  filmed product demonstration. It animates exact black-product pixels through
  four continuous sequences and never fabricates a hand, customer, or use case.
- The master is 12.4 seconds, 1080 × 1920, 30 fps, H.264, silent, and remains
  unpublished pending the first TikTok post's 24-hour checkpoint.
- An every-third-frame luminance-difference comparison measured meaningful
  movement in 85.4% of the new master's sampled intervals, versus 2.2% for the
  old Day 2 card video and 11.0% for the first cable presenter/card test. Visual
  QA also passed against the generated 12-frame contact sheet.
