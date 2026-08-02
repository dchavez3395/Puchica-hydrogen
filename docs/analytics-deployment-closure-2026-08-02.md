# Analytics and deployment closure

## Production ownership tuple

- `PUBLIC_CUSTOM_META_ENABLED="false"`
- `PUBLIC_FACEBOOK_PIXEL_ID="996669459615534"`
- `PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED="true"`
- `PUBLIC_GA4_MEASUREMENT_ID="G-KTMM6KWWT6"`
- `PUBLIC_CHECKOUT_DOMAIN="checkout.puchica.ca"`
- `PUBLIC_FREE_SHIPPING_THRESHOLD="75"` only while it matches Shopify rates

Shopify Facebook & Instagram owns Meta browser/server events and CAPI. The
custom Meta bridge must remain disabled to avoid duplicate events. The scoped
custom GA4 bridge owns only `view_item` and `add_to_cart`; Shopify’s native
Google integration owns page view, checkout, and Purchase. Custom GA4 must keep
`send_page_view: false`.

## No-payment preview proof

For CA/CAD and US/USD, test deny, accept, and consent-revocation journeys using
internal-QA UTMs. Verify exact variant ID, value, currency, URL, consent state,
and event count in browser/network evidence plus Meta Test Events and GA4
DebugView/Realtime.

The preview journey may navigate through PDP, add to cart, cart, and checkout,
but must stop before payment. It can prove storefront and checkout-start events;
it cannot prove Purchase attribution.

## Purchase proof

Final Purchase proof requires a separately authorized genuine controlled order.
Before it, ads remain off, DSers auto-order/auto-pay remains off, the exact route
and mapping must pass, and the owner must approve the address, payment method,
and maximum charge. Supplier payment is a separate approval.

Pass requires exactly one GA4 `purchase` and one deduplicated Meta Purchase for
the same Shopify order/transaction, with correct currency and value. Missing,
duplicate, or mismatched Purchase is a hard hold.

## Deployment sequence

1. Record a clean exact SHA and run tests, lint, production build, validation,
   and the fail-closed launch check.
2. Deploy that exact SHA to an approved preview environment only.
3. Run CA/US route, market, PDP, cart, checkout, WCAG, policy, metadata, and
   consent/analytics matrices.
4. Obtain authenticated dashboard evidence.
5. Owner approves the exact production SHA.
6. Deploy through the normal Oxygen path and run the reduced production smoke.

Do not force deploy, fabricate evidence CSVs, or treat a no-payment checkout as
Purchase proof.

