# Normal-browser cart and checkout trace — 2026-08-14

## Decision

**Organic storefront and real customer checkout: PASS. Paid advertising: HOLD.**

The tracked TikTok customer path, approved product, cart creation, checkout
handoff, Shopify funnel recording, and GA4 destination receipt all passed
without placing an order or entering customer/payment information. Meta receipt
and browser/server deduplication remain unproved because the currently signed-in
Events Manager account exposed no dataset.

## Customer path tested

The public route `https://puchica.ca/tiktok` redirected to the approved cable
organizer PDP with these intact campaign parameters:

- `utm_source=tiktok`
- `utm_medium=organic_social`
- `utm_campaign=travel_edit_organic_202608`
- `utm_content=profile_bio_cable_case`

A fresh Chrome customer session added one approved Black Double-Layer Travel
Cable Organizer Case, SKU `14:193#Double Layers`, to the cart at USD 19.00. The
cart drawer showed quantity one and a valid `checkout.puchica.ca` handoff.
Checkout rendered the same product, variant, quantity, subtotal, contact and
delivery fields, shipping-method placeholder, and policy links.

The trace stopped at the empty checkout form. No contact, address, or payment
data was entered. No checkout was submitted, no order or payment was created,
and no supplier or fulfillment action occurred.

## Stale-cart defect and repair

The first bounded trace exposed a real failure mode: an expired/error-shaped
Storefront cart cookie could be treated as a usable cart, causing an approved
add-to-cart request to fail and the PDP to report an out-of-stock state.

Commit `64ef45ea17ce79fc81eb334a27d3d16570cda052` now validates that a recovered
cart has a Shopify Cart GID. If not, the route creates a new cart with the
approved lines and buyer country instead of trying to mutate the invalid cart.

Verification before release:

- `npm test`: 97/97 passed.
- `npm run build`: passed.
- `npm run lint`: zero errors; 31 existing unrelated warnings.
- Local stale-cookie POST: HTTP 200, replacement cart cookie, correct line and
  quantity one.

The exact commit was pushed and deployed to Oxygen Production at
`https://01m01c9cycgfrxpztzzxcw2bhy-f9aa94aa3bf86abb6754.myshopify.dev`.
The live `puchica.ca` asset path changed to deployment asset `4221843`.
A post-deployment production stale-cookie POST returned HTTP 200 with a new
cart, the approved SKU, and quantity one. The fresh Chrome customer trace then
passed through the visible cart and checkout.

## Destination and operating evidence

GA4 Realtime for the Puchica property showed the live checkout page and the
pre-purchase event sequence during the bounded trace:

- `view_item`
- `add_to_cart`
- `begin_checkout`

At observation time, Realtime showed four `view_item`, two `add_to_cart`, and
one `begin_checkout` events across the active bounded sessions. Those counts are
QA evidence, not customer demand.

Shopify analytics for the current day showed 21 sessions, four sessions with a
cart addition, three sessions reaching checkout, and zero sessions completing
checkout. Shopify grouped the current sessions as direct; therefore the intact
UTM redirect is proven, but platform-level TikTok attribution is not claimed
from this bounded observation.

`npm run production-health` passed 36/36 live checks. `npm run
first-order-signal` remained `WAITING`, ignored the single known historical/test
order, and found no genuine actionable customer order. `npm run
organic-economics` kept every row on paid-ad `HOLD` while preserving positive
current organic contribution estimates for the approved offers.

## Remaining Meta boundary

The storefront continues to load the configured Meta Pixel ID
`996669459615534` and its same-origin CAPI relay. However, the signed-in Events
Manager context for ad account `94486754` showed an empty Datasets view on this
date. It did not expose the previously documented Puchica dataset, so fresh
`ViewContent`, `AddToCart`, `InitiateCheckout`, event-ID matching, and
browser/server deduplication could not be verified.

A second read-only Events Manager inspection at 2026-08-14 22:09 CDT clarified
the account state: the `Puchica` business portfolio showed **0 business
assets**, while the only selectable item under `Other assets` was ad account
`94486754`. The overview therefore continued to offer `Connect data` rather
than exposing a dataset. No business asset, dataset, integration, campaign,
billing setting, or ad was created or changed.

Do not spend on Meta ads until the owner selects or reconnects the correct
business/dataset context and a fresh bounded trace proves receipt and
deduplication. This Meta boundary does not block organic posts, organic visits,
or genuine customer checkout.

## Next gates

1. Complete a short physical-phone/tablet visual and checkout-handoff sign-off.
2. Select or reconnect the correct Meta dataset and prove the three pre-purchase
   events plus browser/server deduplication.
3. Continue the seven-day/100-session organic evidence window, excluding QA.
4. Process the first genuine order one at a time through the exact DSers
   pre-payment, dispatch, tracking, delivery, and contribution runbook.
5. Only after those gates pass, propose one offer, one market, a capped budget,
   and explicit stop rules for owner approval.
