# No-spend measurement proof — 2026-08-01

## Scope

Authenticated inspection of Shopify Customer Events, Meta Events Manager, GA4,
and Oxygen, followed by labelled preview and live storefront QA journeys. Each
journey stopped at checkout. No order was placed and no contact, address, or
payment information was entered. No campaign, budget, or advertisement was
created or activated.

## Shopify Customer Events

- Facebook & Instagram: connected, Server + Web, Optimized.
- Facebook data sharing: Maximum, using Meta Pixel, advanced matching, and
  Conversions API.
- Connected dataset: `Puchica's pixel`, ID `996669459615534`.
- Google & YouTube: connected, Web, Optimized.
- Judge.me, Klaviyo, Reddit, and TikTok pixels are also present. These were not
  changed during this review.

## Meta Events Manager

The connected Meta dataset showed:

| Event | Status | Connection | Observed total | Most recent signal shown |
| --- | --- | --- | ---: | --- |
| PageView | Active | Browser + Server | 479 | 53 minutes earlier |
| InitiateCheckout | Active | Browser + Server | 93 | 2 hours earlier |
| ViewContent | Active | Browser + Server | 55 | 58 minutes earlier |
| AddToCart | Active | Browser | 1 | 2 hours earlier |
| Purchase | No recent activity | Server | 1 | 24 days earlier |

The dataset also showed one connected catalog. Purchase was not retested; the
existing historical signal is not treated as fresh purchase-proof for scaling.

### Active Meta diagnostics

1. PageView has low Conversions API coverage. Meta recommends improving the
   coverage and deduplication keys shared between browser and server events.
2. The domain allowlist was restricted to the four verified production roots
   and subdomains. Unverified legacy domains were not added.

### Live Meta test result

Meta's Website Test Events launcher was kept open while a fresh production
journey loaded the packing-cubes campaign, added the exact red five-piece set,
and reached checkout. No `PageView`, `ViewContent`, `AddToCart`, or
`InitiateCheckout` rows appeared in Test Events during the observation window.
This does not prove the native pixel is broken, because the Overview retains
recent Browser + Server history, but it does mean exact live Test Events proof
is still missing.

A second labelled production journey after the production record reconciled
again loaded the exact red five-piece set, added it to cart, and reached
checkout. Test Events still showed no live rows after the observation window,
so this remains a measurement hold rather than a transient-dashboard issue.

## GA4

- Authenticated property: Puchica.
- Seven-day dashboard showed 5 active users and 93 events.
- Users were reported from both Canada and the United States.
- Page reporting included the Puchica storefront, product pages, and checkout.
- A labelled production checkout session appeared in Realtime as one active
  user. The visible report showed `Checkout - Puchica` with 2 views,
  `begin_checkout` with 2 events, and `page_view` with 2 events.
- `add_to_cart` and `view_item` did not appear in the visible Realtime event
  table during the observation window, so full per-action GA4 proof remains
  incomplete.
- A second production journey increased the visible Checkout page count and
  again surfaced `begin_checkout` and `page_view`, but still did not surface
  `view_item` or `add_to_cart` in the visible Realtime event table.

## Duplicate-tracking prevention

Shopify's native Meta and Google app pixels are already connected. The release
also contained optional custom Meta and GA4 loaders. Enabling both paths would
risk counting the same commerce action twice.

The storefront now requires
`PUBLIC_CUSTOM_ANALYTICS_ENABLED=true` before either custom loader can run. The
default is `false`. Keep it false while the Shopify Facebook & Instagram and
Google & YouTube app pixels remain connected.

Production DOM inspection confirmed that the direct custom Meta/GA script tags
and serialized custom analytics IDs are absent. Shopify's native app pixels
remain the intended owners of commerce measurement.

## Production release proof

- Exact reviewed commit: `6698f9c` (`fix: prevent duplicate native analytics
  events`).
- Preview deployment: `#5151560`, Complete / Ready.
- The Oxygen CLI reported a successful deployment using the existing deployment
  token; no token was created, rotated, deleted, or printed.
- Live `puchica.ca` served the approved North America storefront and the custom
  analytics-disable behavior from the reviewed release.
- A live cart contained the exact red five-piece packing-cube set at $53 USD and
  handed off to `checkout.puchica.ca`. Checkout offered both Canada and the
  United States as delivery countries.
- Shopify Admin now shows production deployment `#5151585` as Current,
  Complete, and Ready on exact commit `6698f9c`. The earlier `5fa190a` card was
  a transient or historical view and is no longer an active release blocker.
- GitHub `origin/main` does not yet contain the reviewed production line. Keep
  automated production deployment disabled until the histories are reconciled
  and verified in preview, because deploying `origin/main` directly could
  overwrite the accepted storefront.

## Gate decision

- Storefront, cart, and checkout-start path: PASS without purchase.
- Shopify native pixel configuration: PASS.
- Meta historical pre-purchase event presence: PASS.
- Meta exact live Test Events proof: HOLD.
- Meta measurement quality: HOLD; exact Test Events proof and the low
  Conversions API coverage/deduplication diagnostic require resolution or a
  documented acceptance before paid activation.
- GA4 property traffic: PASS.
- GA4 live checkout/page-view proof: PASS.
- GA4 full per-action realtime proof: HOLD (`view_item` and `add_to_cart` were
  not visible).
- Production storefront and no-order checkout path: PASS.
- Paid activation: HOLD pending Git-history reconciliation, Meta live-event
  proof, GA4 upstream-event proof, and explicit spend approval.
