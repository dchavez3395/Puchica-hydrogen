# Customer-trust Shopify Admin actions — 2026-08-01

> **CURRENT AUTHORITY:** Exact paste-ready policy replacements and their
> operating decisions now live in
> `docs/pre-ad-execution-control-2026-08-02.md`. This file remains a historical
> checklist and does not override that control.

## Recorded Admin status — August 2, 2026

- Privacy: the automated Shopify policy was converted to the reviewed manual
  static policy. Status remains PARTIAL until the code safeguard is deployed
  and live/cache-verified and the privacy-official/seller disclosures pass.
- Shipping: the reviewed replacement was published. Status remains PARTIAL
  until delivery-date/method evidence and the duties, brokerage, destination-
  charge, and refused-delivery responsibility are accepted and disclosed.
- Refund: not published. Status is `FAIL / BLOCKED_OWNER` until the owner
  accepts the return-cost and operational return process.

Manitoba seller-disclosure requirements and exact owner inputs are controlled
by `docs/pre-ad-execution-control-2026-08-02.md`. The former postal code
`R2P 2X1` is prohibited for business, mailing, privacy, return, quote, or
shipping use.

The Hydrogen storefront reads the full refund and shipping policy bodies from
Shopify. Those bodies cannot be changed safely from this repository. The
storefront now adds a cautious refund summary above the Shopify-hosted refund
policy, but the Admin policy remains the controlling text and must be reviewed
before paid traffic.

## Refund policy

In Shopify Admin, open **Settings → Policies → Refund policy** and verify that
the published policy says all of the following without contradiction:

1. A customer must contact `hello@puchica.ca` within 30 days of delivery.
2. A customer must not send an item until Puchica confirms eligibility and
   provides the return instructions and return address.
3. Return-shipping responsibility is explicit for both change-of-mind returns
   and damaged, defective, or incorrect items. Do not direct customers to a
   supplier address or the address printed on the parcel.
4. Any non-returnable categories and required item condition are stated.
5. Refund timing distinguishes Puchica's review from the payment provider's
   processing time.
6. The policy does not promise a refund before the returned item is received
   and reviewed unless Puchica intentionally supports that exception.

If the business has not yet chosen who pays return shipping in each scenario,
keep paid traffic paused until that operational decision is documented in the
policy. Storefront copy must not be used to invent the answer.

## Shipping policy

In Shopify Admin, open **Settings → Policies → Shipping policy** and verify:

1. Canada and the United States are described as selectable storefront
   markets, not as a guarantee that every product ships to every address.
2. Checkout is identified as the source of truth for the selected cart,
   address, available service, customer-facing price, and displayed estimate.
3. There is no blanket free-shipping, no-surprise-fees, worldwide-delivery,
   dispatch-time, or delivery-speed promise unless current operational evidence
   supports it.
4. Tracking language is conditional: tracking is sent after shipment when the
   selected service provides it.

After editing either policy, publish it, open the corresponding live Hydrogen
policy page in each storefront language, and compare the full body with the
checkout presentation before enabling ads.

## Meta analytics environment

The code and `.env.example` use exactly:

```text
PUBLIC_FACEBOOK_PIXEL_ID
```

Set the same Pixel ID in the local environment, Oxygen environment variables,
and the Facebook & Instagram sales channel. Before spend, verify one clean
PageView → ViewContent → AddToCart → InitiateCheckout → Purchase sequence in
Meta Events Manager. The Hydrogen component sends the first four events;
Purchase is expected from Shopify-hosted checkout and must be verified rather
than assumed.
