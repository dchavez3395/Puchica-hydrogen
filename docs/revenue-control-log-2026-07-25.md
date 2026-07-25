# Revenue-control log — 2026-07-25

This log records customer-facing changes made to keep the storefront truthful
while DSers mapping, landed cost, destination coverage, and lifecycle tools are
being validated. It is not a launch approval.

## Changes made

- **Checkout host:** `checkout.puchica.ca` is connected, HTTPS-enabled, and
  primary for the Online Store checkout handoff. The Hydrogen checkout fallback
  now rejects both historical `myshopify.com` hosts in favour of the dedicated
  checkout host.
- **Solar Fairy String Lights:** moved to Draft. The observed US source quote
  (US$3.79 item + US$1.99 shipping) did not support the live CA$13.31 variant
  price after payment fees or a first-order discount.
- **RC Monster Truck:** moved to Draft. Its duplicate supplier-facing variant
  labels and unverified DSers mapping made it unsuitable for a customer-facing
  launch catalog.
- **Unavailable variants:** no longer selectable in the product form. The
  storefront will not invite shoppers to choose a variant that cannot be sold.
- **Shipping claims:** removed the cart's unverified free-shipping threshold
  and its duplicate return/shipping reassurance strip. Checkout is the source
  of truth for item- and destination-specific delivery cost.
- **Email capture:** removed the popup, homepage, and footer sign-up surfaces.
  The previous implementation created random-password Shopify customer accounts
  with marketing consent but did not create a verified Klaviyo subscription or
  customer-safe welcome flow.
- **Ad draft:** marked as hold-only because its old copy contains unsupported
  catalog, rate, return, origin, and international-shipping promises.

## Remaining revenue gates

1. Record an actual supplier item-plus-shipping quote for every sellable
   variant in Canada and the United States.
2. Confirm the contribution margin after Shopify payment fees, a discount
   buffer, and expected refunds. Do not run paid traffic until each advertised
   variant has a positive, documented result.
3. Reconcile Shopify test order #1001 with DSers before any supplier charge,
   fulfillment, or traffic launch.
4. Connect Klaviyo's Shopify integration, sender identity, consent language,
   and events; then build the welcome, abandoned-checkout, and post-purchase
   flows without enabling sends until a test contact passes.
5. Enable Judge.me only with verified-purchase requests and real review data.
