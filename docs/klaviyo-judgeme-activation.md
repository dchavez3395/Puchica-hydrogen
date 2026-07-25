# Lifecycle and reviews activation gate

**Status: deliberately inactive as of 2026-07-25.** Klaviyo and Judge.me are
installed, but neither should be treated as a live conversion system until the
checks below are complete. The storefront does not currently collect newsletter
or back-in-stock addresses, so no visitor is being given a false promise.

## Klaviyo: build in draft, prove with a test, then enable

1. Confirm the Shopify integration is connected to the live Puchica store and
   that `Viewed Product`, `Added to Cart`, `Started Checkout`, and `Placed
   Order` events appear for a controlled test.
2. Authenticate `puchica.ca` as the sending domain; set a monitored reply-to
   address and make the legal business identity consistent with checkout.
3. Create one consent-first embedded form in Klaviyo. It must state what the
   customer is subscribing to, link to the privacy policy, and honour regional
   consent requirements. Do not re-use the retired Hydrogen `/newsletter`
   endpoint.
4. Build these flows **in draft**:
   - Welcome: only after a confirmed subscription; one offer, no conflicting
     expiry claim.
   - Browse abandonment: only if product availability and market coverage can
     be reconfirmed at click time.
   - Cart/checkout abandonment: suppress after `Placed Order`; never promise
     free shipping, a delivery date, or stock that has not been verified.
   - Post-purchase: order confirmation/fulfilment remains Shopify-owned;
     Klaviyo can add useful care/support information after a confirmed order.
5. Send each flow to internal test addresses. Check mobile layout, sender,
   unsubscribe, discount behaviour, checkout-domain links, and that a second
   test does not enter an inappropriate flow.
6. Enable one flow at a time and review its first real results before adding
   frequency or discounts.

## Back-in-stock is a separate integration

Do not expose a form until Klaviyo's back-in-stock feature is connected to the
correct Shopify variants and a test subscription receives the correct alert.
The retired `/notify-back` route returns a 503 intentionally; it does not keep
email addresses.

## Judge.me: earn proof; do not manufacture it

1. Confirm the app is connected to the current Shopify store and that product
   matching uses the exact live product/variant IDs.
2. Set a verified-purchase request delay only after the supplier's observed
   delivery window plus a reasonable buffer. A generic 7-day request is not
   acceptable for a cross-border dropship order.
3. Send a single internal test after the test-order lifecycle is understood.
   Review sender, moderation, destination URL, and unsubscribe/legal links.
4. Keep widgets hidden until there is genuine customer feedback. Never import,
   seed, or imply reviews that are not tied to verified orders.
5. When real reviews exist, show them on the matching PDP only; do not invent
   aggregate ratings or sitewide counts.

## Release evidence to capture

Record the date, internal test order, market, product variant, sender domain,
and screenshots of the received flow emails in the operational log. If any
test fails, leave the relevant flow/widget off and record the failure rather
than adding a storefront workaround.
