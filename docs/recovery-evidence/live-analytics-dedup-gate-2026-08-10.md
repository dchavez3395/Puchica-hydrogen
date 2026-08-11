# Live analytics and deduplication gate — 2026-08-10

## Decision

- **Organic commerce:** unchanged; the frozen cohort may remain live.
- **GA4 pre-purchase measurement:** previously destination-received, but the new bounded run was not eligible to refresh that proof because controlled browsers are deliberately filtered as bots.
- **Meta Pixel + CAPI:** connected, but **PAID HOLD**. Fresh `ViewContent`, `AddToCart`, `InitiateCheckout`, and browser/server deduplication were not received in Meta Test Events during the bounded run.
- **Purchase measurement:** not yet provable because no genuine order was placed. Paid traffic remains unauthorized.

No order, payment, campaign, post, ad, or spend was created. Diagnostic cart changes were reversed.

## Reversible live funnel trace

The U.S. handle-wrap PDP was opened with `codex_qa / measurement` UTM parameters. The exact approved Black variant was added at US$11.00, the cart showed the pre-existing approved cable case plus the Black handle wrap for a US$30.00 subtotal, and `Continue to Checkout` reached `checkout.puchica.ca` without submitting contact, delivery, or payment information.

The Black handle-wrap line was then removed. The pre-existing cable-case line remained intact at US$19.00. A separate Meta Test Events browser session started empty, added one Coffee Brown handle wrap for diagnosis, and was restored to empty.

The live document exposed the configured destinations:

- GA4 `G-KTMM6KWWT6` and its `gtag.js` script;
- Meta dataset `996669459615534`, `fbevents.js`, and the Meta configuration script;
- the same-origin `/api/meta-event` relay in the deployed application contract.

## Meta Events Manager evidence

Signed-in Events Manager showed dataset `Puchica's pixel` (`996669459615534`) with both Meta Pixel and Conversions API connection history. The overview displayed:

| Event | Dashboard state shown during this run | Connection shown |
|---|---|---|
| `PageView` | Active; last received 38 minutes earlier | Browser + Server |
| `InitiateCheckout` | No recent activity; last received 9 days earlier | Browser + Server |
| `ViewContent` | No recent activity; last received 8 days earlier | Browser + Server |
| `AddToCart` | No recent activity; last received 9 days earlier | Browser only |

The dashboard also displayed one diagnostic and a recommendation to improve PageView events covered by CAPI. These are not reasons to disable organic commerce, but they prevent an honest paid-attribution pass.

Meta's website Test Events workflow was opened for the QA-tagged handle-wrap URL. A fresh product view and add-to-cart action were completed while the Test Events page remained open. No fresh event row appeared in the bounded observation window, so receipt and deduplication are not claimed.

## Why the automated run cannot be treated as a customer event

`app/lib/bot-detection.js` intentionally returns `true` when `navigator.webdriver === true`. `MetaPixel` and `GoogleAnalytics4` both stop before publishing custom storefront events for those sessions. The controlled QA browsers expose that automation signal, so the absence of fresh custom events in this run is expected filtering—not proof that a normal shopper is untracked and not evidence that tracking works.

The code-level deduplication contract remains correct: `MetaPixel` generates one event ID, sends it to the browser Pixel as `eventID`, and mirrors the same value to `/api/meta-event` as `event_id`; the server relay passes that same ID to CAPI. Code correctness is not destination receipt.

## Binding close conditions before paid traffic

1. In a normal, non-automated browser session, keep Meta Test Events open and produce one `ViewContent`, one `AddToCart`, and one `InitiateCheckout` from the approved market/SKU funnel.
2. Confirm the browser and server copies share the same event ID and deduplicate into one event per action.
3. From the first genuine organic order, confirm exactly one Meta `Purchase` and one GA4 `purchase` with the correct order ID, value, and currency.
4. Establish the organic baseline timestamp and exclude `codex_qa / measurement` traffic from performance interpretation.

Until all four conditions are recorded as PASS, ads remain paused.
