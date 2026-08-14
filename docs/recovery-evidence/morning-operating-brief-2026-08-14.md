# Puchica morning operating brief — 2026-08-14

## Bottom line

Puchica is no longer operating from catalog guesses. Production is contained
to exact supplier variants with fresh destination-route evidence, disposable
guest-cart tests passed, checkout URLs resolved without a purchase, and the
next two weeks of organic work are bounded to zero spend. This is a controlled
demand test, not proof of financial stability yet.

## Live production scope

Canada exposes six exact product pages:

- `travel-cable-organizer-case`
- `black-knitted-luggage-wheel-covers-set-of-4`
- `3-piece-packing-cube-set`
- `ten-hole-white-cable-organizer-clips`
- `white-luggage-id-tag`
- `white-semi-circular-travel-jewelry-case`

The United States exposes four exact product pages:

- `travel-cable-organizer-case`
- `black-knitted-luggage-wheel-covers-set-of-4`
- `ten-hole-white-cable-organizer-clips`
- `white-semi-circular-travel-jewelry-case`

Packing cubes and the luggage tag fail closed in the United States. The large
storage bag, hanging toiletry organizer, and luggage-handle wrap fail closed in
both markets. A fresh authenticated DSers check is still mandatory immediately
before paying a supplier for any early order.

## Commerce proof completed without spending

- Canada: one disposable guest cart accepted all six approved exact variants.
- United States: one disposable guest cart accepted all four approved exact
  variants.
- Both generated `checkout.puchica.ca` URLs returned HTTP 200.
- No customer details, payment, order, capture, or supplier action occurred.
- This proves current cart and checkout reachability; it does not prove payment,
  fulfillment, tracking, delivery quality, refund handling, or repeat demand.

## Organic execution

- Day 1 remains public with a caption stating that the held toiletry organizer
  is unavailable and the post is inspiration only.
- Exactly eight future Instagram-only posts are scheduled at 6:30 PM on August
  15, 16, 19, 20, 22, 23, 25, and 26.
- Days 4, 5, 8, and 11 were not scheduled because their assets or copy include
  the held toiletry organizer.
- All eight future entries show `Not currently boosted`; paid promotion remains
  zero.
- Obsolete `WELCOME15` / 15%-off captions were removed from the affected legacy
  Instagram and Facebook posts. The launch post also carries a public comment
  correction that the code is not active.
- Day 14 remains open until real public metrics identify a winner.

### Fresh publishing and attribution verification

- Meta Business Suite month view was rechecked on August 14. It shows the eight
  intended Instagram posts at 6:30 PM on August 15, 16, 19, 20, 22, 23, 25,
  and 26. The early-morning calendar entries are Meta suggestions, not
  scheduled posts.
- The live `puchica.canada` profile has 57 followers and its visible website
  link carries `utm_source=ig`, `utm_medium=social`, and
  `utm_content=link_in_bio`.
- That link completes two redirects to the secure production homepage while
  preserving all three attribution parameters.

## Measurement baseline before the scheduled sequence

Shopify analytics on August 14 reported 339 sessions across the preceding 14
days: 337 direct, one Instagram-referred, and one Facebook-referred. The same
window showed cart and checkout activity from controlled QA, but zero completed
checkouts. The preceding 30 days contained zero orders and CA$0 sales. These
numbers are not evidence of demand; the direct-heavy traffic must not be used
as the Day 7 organic denominator.

Use attributed social traffic and public engagement after the August 15 post
as the demand-test baseline. If social attribution remains near zero, the
problem is distribution before it is product conversion.

## Repeatable production monitor

- `npm run production-health` performs only read-only `GET` requests.
- The August 14 checkpoint passed 35/35 checks across the exact Canada and U.S.
  route sets, held-route headers, feed, sitemap, localized PDP, cart entry, and
  the Instagram bio destination.
- The authenticated organic control-plane dry run now uses the same 6-product
  Canada / 4-product U.S. cohort as production. It also identifies the storage
  bag, hanging toiletry organizer, and handle wrap as three legacy Shopify
  `ACTIVE` products to quarantine. No Admin state was changed; source-level
  route gates continue to fail them closed.

## Cash and runway control

- Owner cash ceiling for Puchica: **CA$200/month**.
- Known current monthly burden: approximately **CA$141** — CA$1 Shopify promo,
  CA$0 Shopify-billed apps, CA$0 DSers Basic, and the owner-estimated CA$140
  ChatGPT charge.
- Uncommitted current capacity: **CA$59**, before unverified domain renewals,
  refunds, foreign exchange, or other direct-billed tools.
- Displayed burden after the Shopify promotion: approximately **CA$189/month**,
  leaving only **CA$11**.
- Keep a **CA$50 cash buffer**, spend **CA$0 on ads**, and make the Shopify plus
  shared-subscription decision by **2026-09-07**, before the CA$1 promotion
  ends after 2026-09-13 and the displayed CA$49 price applies.

## Daily operating loop

1. Confirm the storefront and intended market pages are reachable.
2. Record qualified sessions, product views, add-to-carts, checkout starts,
   orders, useful questions, and any exact-SKU or route contradiction. Exclude
   `codex_qa` and other measurement traffic.
3. On any order, re-open the exact DSers variant and destination before supplier
   payment. Confirm stock, ordinary item cost, shipping cost, ETA, and tracking.
4. Stop the affected SKU or market if mapping, route, tracking, price, or product
   identity differs from the approved evidence; contact the customer before any
   charge or supplier action that cannot be supported.
5. Review the Day 7 and Day 14 scorecards. Do not source new products or expand
   the catalog to avoid confronting weak demand.

## Hard stops

- No paid ads, boosts, new subscriptions, samples, or supplier orders outside
  an actual approved customer-order workflow.
- No discounting of the packing cubes or luggage tag; do not advertise
  `WELCOME15`.
- No held-product content or purchase links until fresh exact-route evidence is
  captured and the production allowlist is deliberately changed.
- No claim that payment, fulfillment, delivery, tax compliance, or financial
  stability is proven by the zero-purchase checkout test.
- Obtain Manitoba/Canada-specific professional advice before relying on the
  current Shopify tax configuration or filing business registrations or taxes.

## Decision thresholds

- Day 7: seek at least 50 qualified organic sessions or a comparably useful
  customer signal. Fewer than 20 qualified sessions means distribution, not
  product demand, is the first problem to fix.
- Day 14: a product-view-to-add-to-cart rate below 2% after qualified traffic is
  a stop/change signal; 2–4.9% is investigate; 5% or more is continue.
- Day 30: continue only if there is a credible path to positive contribution
  after landed cost, payment fees, reserves, refunds, fixed costs, and the
  CA$200 owner cash limit. Otherwise pause or shut down while preserving cash.
