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
- **Storefront-price discrepancy:** the Construction Vehicle Set is CA$56.99
  in Shopify Admin but renders as CA$54.14 on the live Canadian storefront
  (a 5% difference). Treat storefront price as the customer-facing price for
  margin calculations. Audit market price adjustments and active discounts
  before approving any price or promotion.
- **Verified pricing configuration:** the Canada catalog has a -5% overall
  adjustment and no fixed product prices. `FIRST15` is the only active
  discount. Checkout currently offers CA$7.99 Standard below CA$75, free
  Standard at CA$75+, and CA$20 Express. This confirms the storefront price
  math but not supplier shipping, which remains the individual launch gate.

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
6. Read-only audit Shopify Markets and active discounts before using any
   advertised price or stacking FIRST15 with another offer.
