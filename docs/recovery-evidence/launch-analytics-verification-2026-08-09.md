# Puchica launch analytics verification — 2026-08-09

## Binding status

- **GA4 storefront funnel:** PASS.
- **Shopify storefront analytics:** PASS as a collection surface, but the current baseline is contaminated by launch QA and must not be interpreted as customer demand.
- **Meta Pixel + Conversions API:** CONNECTED / PAID-ADS HOLD. Meta recognizes both connection methods and reports no dataset alerts, but this run did not produce fresh `ViewContent` and `AddToCart` rows in Events Manager. Organic traffic may proceed; paid traffic may not.

No order, payment, ad, campaign, post, or spend was created during this test. A temporary four-unit cable-case cart was removed after the funnel test.

## GA4 destination receipt

Property: Puchica (`G-KTMM6KWWT6`).

The live Canada cable-case route was opened with QA UTM parameters, one unit was added to cart, and checkout was opened without submitting customer or payment information. GA4 Realtime then showed:

| Event | Realtime count observed |
|---|---:|
| `view_item` | 4 |
| `add_to_cart` | 1 |
| `begin_checkout` | 1 |
| `page_view` | 1 |

This proves current destination receipt for the three required pre-purchase funnel stages. Counts include this QA session and are not a conversion-performance baseline.

## Shopify analytics baseline

Shopify reported 13 sessions, 5 sessions with cart additions, 3 sessions that reached checkout, and 0 completed checkouts for 2026-08-09 at inspection time. Much of this is known QA activity. Start organic reporting from the first published-post timestamp and retain the `codex_qa / measurement` source as an exclusion marker.

## Meta destination evidence

Dataset: Puchica's pixel (`996669459615534`).

- Events Manager recognizes **Meta Pixel** and **Conversions API**.
- Dataset overview showed 415 total events over the prior 28-day window and no new alerts or recommendations.
- The Today view showed `PageView` through Browser + Server and `InitiateCheckout` through Server.
- The live storefront loaded `fbevents.js` and emitted same-origin `/api/meta-event` beacons.
- Meta's website Test Events workflow was opened and a fresh product-view, add-to-cart, and checkout test was performed. The fresh events did not appear in the test panel during the bounded observation window.
- Therefore current `ViewContent` / `AddToCart` dashboard receipt and browser/server deduplication are not claimed.

## CAPI contract correction

The server relay used `client_ip` instead of Meta's documented `client_ip_address`, and hashed `_fbp` / `_fbc` cookie values. It now sends:

- `client_ip_address` and `client_user_agent` under `user_data`;
- `_fbp` as `fbp` and `_fbc` as `fbc` without hashing;
- the same event ID to the browser Pixel and server event for deduplication.

Meta's official Business SDK treats `fbc`, `fbp`, and `client_ip_address` as request-context identifiers, while normalizing/hashing customer-information fields separately: https://github.com/facebook/facebook-nodejs-business-sdk#conversions-api

## Release rule

Organic launch remains authorized for the exact frozen market/SKU matrix. Paid Meta advertising remains paused until a post-deployment test shows current `ViewContent`, `AddToCart`, and `InitiateCheckout` activity and confirms browser/server deduplication in Events Manager.
