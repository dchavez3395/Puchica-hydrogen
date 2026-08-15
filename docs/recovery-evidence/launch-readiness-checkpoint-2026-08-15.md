# Puchica launch-readiness checkpoint — 2026-08-15

## Decision

The storefront remains open for controlled organic commerce. Paid advertising
remains `HOLD`. No order, supplier purchase, payment, fulfilment, public post,
ad, discount, tax setting, or banking setting was created or changed during
this checkpoint.

## Production and checkout

- Binding Production commit: `45fead935e80983f62afaa1ba88c4a57aa64e3a3`.
- `npm run production-health` passed 36/36.
- `npm run launch-check` passed.
- The paid-launch check failed closed because no `GO_LIMITED_TEST` control or
  complete `GO_PAID_TEST` candidate exists.
- A controlled Canadian cable-organizer trace added the exact approved Black
  Double-Layer variant, showed CA$24.99 CAD in cart, and reached the branded
  Shopify Checkout with contact, delivery, shipping, payment, policy and order
  summary sections present.
- No customer or payment data was entered and `Pay now` was not used. The QA
  cart line was removed afterward and the storefront cart returned to empty.

## Shopify operating state

- The connected shop is Puchica, on the Basic plan, operating in CAD and CDT.
- The pre-QA August 15 ShopifyQL snapshot showed two sessions, one visitor,
  zero cart-add sessions, zero checkout-reached sessions, zero completed
  checkouts and zero conversion.
- Social-referrer sessions since August 15: zero.
- Orders created since August 15: zero; sales and total sales: zero.
- The nine expected products are the only live Active catalog cohort. Shopify
  reports the live variants and inventory; storefront allowlists continue to
  expose only the exact approved SKUs by market.

## DSers mapping and order safety

- The existing authenticated Puchica DSers store reports 38 AliExpress-mapped
  products and zero unmapped products.
- All nine live Puchica product pages appear in DSers with supplier listings,
  including cable organizer, toiletry organizer, packing cubes, storage bag,
  luggage tag, jewelry case, cable clips, wheel covers and handle wraps.
- Every actionable order queue is zero: Pending, Awaiting order, Awaiting
  payment, Awaiting shipment, Awaiting fulfilment, Fulfilled and Failed orders.
- Shopify test order `#1002` appears only under Canceled. DSers states that the
  item is canceled on Shopify, shows no AliExpress order number or tracking
  number, and disables `ORDER AGAIN`.
- Therefore the test order cannot advance to a supplier from the current queue
  without a new deliberate owner action.

## Meta connection and remaining proof

- Business portfolio: `1567358971667584`.
- Dataset/Pixel: `1616698610095354` (`Puchica Storefront`).
- `hello@puchica.ca` is confirmed as the portfolio contact email.
- The CAPI token is stored only as a Shopify Production secret. Meta accepted a
  synthetic non-PII server event, and the deployed relay accepts canonical
  `puchica.ca` event sources and returns `204`.
- Events Manager shows processed browser `PageView` events for the dataset.
- A fresh automated product/cart/checkout trace did not appear in Meta Test
  Events because Puchica intentionally blocks analytics when
  `navigator.webdriver` or another bot signal is present. The anti-bot control
  was not weakened to manufacture evidence.
- `ViewContent`, `AddToCart`, `InitiateCheckout`, matching browser/server event
  IDs and Meta deduplication therefore remain open for one normal
  owner-controlled browser trace.

## Remaining launch gates

1. Complete the physical-phone/tablet visual and checkout-handoff check.
2. While Events Manager is open, run one normal-browser product view, cart add
   and checkout handoff; stop before entering payment data. Confirm the three
   Meta pre-purchase events and deduplication.
3. Continue the 14-day / 100-qualified-session organic evidence window while
   excluding `codex_qa / measurement` traffic.
4. Process the first genuine customer order one at a time through the DSers
   pre-payment, dispatch, tracking, delivery and support runbook.
5. Verify GA4 and Meta Purchase values from that genuine order and calculate
   actual delivered contribution.
6. Document the owner's intended tax treatment with appropriate professional
   guidance before making tax claims or changing Shopify tax settings.
7. Only then propose one offer, one primary market and one explicitly approved
   capped paid test.
