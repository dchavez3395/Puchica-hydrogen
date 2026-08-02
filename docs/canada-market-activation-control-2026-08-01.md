# Canada market activation control — 2026-08-01

## Live state

- Canada market: `gid://shopify/Market/40250409210`
- Status: **ACTIVE**
- Currency: CAD
- Exact launch variant: `gid://shopify/ProductVariant/49961853026554`
- Exact variant: `5PCS Set Red`
- Canada contextual price: **CA$71.45**
- U.S. contextual price: **US$52.00**
- Available storefront markets: **CA · CAD** and **US · USD**
- General delivery profile: `gid://shopify/DeliveryProfile/114654281978`
- Canada delivery zone: all provinces and territories
- Standard Shipping: **CA$7.99** for orders through CA$74.99
- Free Shipping: **CA$75+**
- Paid advertising: **HOLD**

## Evidence captured

1. Shopify Admin market activation completed without mutation errors.
2. The legacy Canada catalog adjustment was normalized from a 5% decrease to
   0%, restoring the intended **CA$71.45** price.
3. A live Storefront API request in Canadian context resolved `CA`, `CAD`, the
   exact product and variant, **CA$71.45**, and `availableForSale: true`.
4. The live campaign displayed `CA · CAD · EN` and **CA$71.45 CAD**.
5. Adding the exact red five-piece variant produced one correct cart line at
   **CA$71.45 CAD** and a checkout URL on `checkout.puchica.ca` using `/en-ca`.
6. A no-payment checkout test with the public Brandon City Hall address
   (Manitoba) returned **Standard Shipping — CA$7.99** and a **CA$79.44** total.
7. The QA cart item was removed after the test. No order or payment was made.

## DSers supplier evidence

- DSers product: `2083036447075794944`
- Supplier item: `1005008568050448`
- Canada was accepted as the synchronization destination for the mapped
  product.
- DSers showed 1,024 supplier units in stock.
- Canada-mode supplier cost for the exact high-cost red five-piece variant was
  **US$20.62 / CA$28.93**.
- DSers Supplier Optimizer matched the existing mapped supplier by its exact
  U.S. product cost range (**US$4.38–20.39**) and returned **AliExpress
  Selection Standard**, **US$1.99 estimated shipping**, and **7 delivery days**
  for Canada.
- After evidence capture, the product synchronization view was returned to the
  existing U.S. setting. This did not remove Canada from Shopify Markets.

The optimizer quote is country-level rather than postal-code-level, and DSers
warns that some Supplier Optimizer data may be incorrect. Treat it as strong
preflight evidence, not proof of the final supplier checkout charge.

Using the conservative exact-variant item cost (CA$28.93) and converting the
US$1.99 shipping quote at the same DSers display exchange rate gives an
estimated supplier total of about **CA$31.72**. Against CA$71.45 merchandise
revenue plus CA$7.99 customer shipping, the pre-fee spread is about **CA$47.72**.
That is ample room for payment fees and a returns/duty reserve, but paid traffic
remains on hold until a final no-payment supplier checkout or fulfillment test
confirms the actual postal-code-specific charge.

## Remaining launch controls

1. Confirm the optimizer's US$1.99 / 7-day estimate at the supplier checkout
   for one Manitoba and one Ontario postal code, stopping before payment.
2. Finalize the landed-contribution model with payment fee, returns reserve,
   and possible duty/import exposure.
3. Run a small controlled Canadian fulfillment test when a suitable delivery
   address is available; stop and review before any paid acquisition.
4. Keep advertising spend disabled until the broader ad-readiness review is
   explicitly approved.

No customer order, supplier purchase, payment, or advertising spend was made
during this activation and QA pass.
