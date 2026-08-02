# No-spend measurement proof — 2026-08-01

## Scope

Authenticated, read-only inspection of Shopify Customer Events, Meta Events
Manager, and GA4, followed by one labelled storefront QA journey. The journey
stopped at checkout, placed no order, entered no payment information, and the
test cart was emptied afterward. No campaign, budget, or advertisement was
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
2. Meta requests confirmation of recently observed domains:
   `puchica.ca`, `puchica-2.myshopify.com`, `ug91ve-sz.myshopify.com`, and
   `puchica.shop`. Confirm current owned domains and investigate the legacy
   `puchica.shop` entry before allowlisting it.

## GA4

- Authenticated property: Puchica.
- Seven-day dashboard showed 5 active users and 93 events.
- Users were reported from both Canada and the United States.
- Page reporting included the Puchica storefront, product pages, and checkout.
- The labelled QA browser session did not appear in Realtime during the
  observation window, so per-action GA4 event proof remains incomplete.

## Duplicate-tracking prevention

Shopify's native Meta and Google app pixels are already connected. The release
also contained optional custom Meta and GA4 loaders. Enabling both paths would
risk counting the same commerce action twice.

The storefront now requires
`PUBLIC_CUSTOM_ANALYTICS_ENABLED=true` before either custom loader can run. The
default is `false`. Keep it false while the Shopify Facebook & Instagram and
Google & YouTube app pixels remain connected.

## Gate decision

- Storefront, cart, and checkout-start path: PASS without purchase.
- Shopify native pixel configuration: PASS.
- Meta pre-purchase event presence: PASS.
- Meta measurement quality: CONDITIONAL; resolve or consciously accept the two
  diagnostics before paid activation.
- GA4 property traffic: PASS.
- GA4 exact per-action realtime proof: HOLD.
- Production deployment and paid activation: HOLD pending the reconciled
  release, final preview QA, and explicit spend approval.
