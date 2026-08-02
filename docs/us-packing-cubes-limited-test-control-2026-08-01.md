# U.S. packing-cubes limited-test control — 2026-08-01

> **CURRENT ACTION GATE: PAID HOLD.** This file defines the maximum controls
> that would apply if a later activation review explicitly exercised the
> country-level first-order-monitoring exception. It is not the current launch
> recommendation. The later no-spend review and
> `launch-measurement-product-readiness-audit-2026-08-01.md` are authoritative:
> obtain legitimate delivery/fulfillment evidence and verify Purchase before
> recommending activation. The passing readiness checker validates this
> control file's structure; it does not prove tracking, delivery, product
> quality, production events, or authorization to spend.

## Decision

`GO_LIMITED_TEST_READY` applies only to the exact `5PCS Set Red` Shopify
variant `49961853026554`. It does not authorize spend by itself and it does not
authorize scaling.

The former U.S.-recipient sample requirement remains part of `GO_PAID_TEST`
and the scale gate. It is not required for this first tightly capped learning
test because the owner does not have a consenting U.S. recipient.

## Verified country-level economics

- Storefront price: US$52.00.
- DSers stable API item cost: US$20.39.
- AliExpress Selection Standard: US$1.99.
- Provisional landed supply cost: US$22.38.
- Payment assumption: 2.9% + US$0.30.
- Refund reserve: US$2.65, or 5% of merchandise revenue.
- Pre-ad contribution: US$25.212.
- Break-even CAC: US$25.212.
- Target CAC: US$17.6484.
- Daily cap: US$17.6484.
- Absolute test cap: US$100.

These are country-level figures. The six-day DSers estimate is internal
planning evidence, not a customer-facing delivery promise.

## Activation boundary

Ads remain off until all of the following are true:

1. The storefront changes are deployed and the exact campaign page is healthy.
2. Meta and GA4 production identifiers are present.
3. ViewContent, AddToCart, and InitiateCheckout fire once with the exact variant.
4. The Shopify-hosted Purchase event path is verified or a documented manual
   Shopify-order fallback is accepted for this capped test.
5. Three exact-product creatives are ready and link to the campaign page.
6. Item cost, shipping, availability, price, and margin are refreshed within
   seven days of activation.
7. The owner explicitly approves the exact maximum spend at activation time.

## First-order operating rule

The first genuine order is a fulfillment checkpoint:

- manually confirm exact SKU and supplier route before placing the supplier order;
- do not enable auto-pay;
- record actual supplier charge and processing time;
- require tracking within 48 hours after fulfillment;
- watch the order through delivery and contact the customer proactively if late;
- stop ads on any product mismatch, defect, complaint, route change, or missing tracking.

## Scaling remains blocked

Do not increase the test above US$100 or expand beyond U.S. Meta Sales traffic
until at least five paid orders are delivered, actual contribution remains at
least 30%, refund/defect rate is below 10%, and the Purchase event is reliable.
