# Puchica First-Sale Launch Kit

_Updated 2026-07-26 after the storewide product, shipping, and checkout gate._

## Current launch position

- 20 products are in the verified launch catalog.
- Five low-complexity products lead storefront discovery:
  - Travel Pet Water Bottle
  - Car Sun Visor Organizer
  - Long-Handle Bottle Brush
  - Multi-Use Organizer Hooks
  - Everyday Carabiner Clip Set
- The remaining classified products are not assumed launch-ready.
- Canada and U.S. checkout both return real shipping methods. The 2026-07-26
  regression reached the payment step without placing an order: Canada showed
  CA$7.99 Standard and CA$20.00 Express; the U.S. showed US$6.00 Standard.
- No paid fulfillment test has been submitted.
- Shopify new-order email and mobile staff notifications are enabled for all orders.
- Google Analytics is active in the Google & YouTube channel. Meta Pixel data
  sharing is set to Maximum; an ad account is not connected.
- All 20 launch products are published to Google & YouTube. Google Merchant
  Center ingestion is still processing and may take up to three days.

## Non-negotiable order of operations

1. Configure measurement before buying traffic.
2. Verify `page_view`, `view_item`, `add_to_cart`, and `begin_checkout`.
3. Run one unpaid end-to-end checkout regression in Canada and the U.S.
4. Place one controlled fulfillment test order only after the owner approves the product, destination, payment method, and maximum total.
5. Test demand with one hero product and one audience at a time.

## First demand experiment

Start with the Travel Pet Water Bottle. It has a clear use case, three variants, verified Canada/U.S. shipping, and a visual demonstration suitable for short-form creative.

### Offer

- Landing destination: the product page or `/#launch-picks`.
- Use the existing `FIRST15` code only while it remains active and its post-discount margin is still within the product gate.
- Never advertise free shipping. Current verified checkout rates are:
  - Canada: CA$7.99 Standard; CA$20.00 Express.
  - U.S.: US$6.00 Standard for the tested single-product cart.

### Creative test

Produce three simple variations from the same product demonstration:

1. Problem: carrying a separate bowl and bottle on a walk.
2. Use: show the product being carried, opened, and offered to a pet.
3. Context: walk, road trip, or park outing.

Avoid leakproof, food-grade, capacity, temperature, or performance claims unless the supplier evidence is recorded in the product gate.

## Measurement and stop/go thresholds

Run the first test until it reaches either 300 qualified landing-page sessions or CA$100 in spend, whichever happens first.

| Signal | Continue | Investigate | Stop or change |
| --- | ---: | ---: | ---: |
| Product-view to add-to-cart | 5%+ | 2–4.9% | under 2% |
| Add-to-cart to checkout start | 35%+ | 20–34.9% | under 20% |
| Checkout start to purchase | 25%+ | 10–24.9% | under 10% |
| Purchase conversion | 1.5%+ | 0.5–1.49% | under 0.5% |

Do not diagnose a product from clicks alone. If tracking is absent or duplicate, pause spend until measurement is repaired.

## Controlled fulfillment test

Use one hero variant with healthy supplier stock. Before placing the order, record:

- Shopify order total and currency;
- customer-visible shipping service and estimate;
- DSers order import time;
- supplier mapping and selected variant;
- whether DSers can submit the order without remapping;
- tracking-number sync back to Shopify;
- actual dispatch and delivery dates;
- packaging, product condition, and claim accuracy.

The test is successful only when the order completes this full loop. A mapped SKU and a checkout shipping rate do not prove automatic fulfillment on their own.

## Next product decision

After the first test has enough sessions:

- keep the Travel Pet Water Bottle if it meets the continue thresholds;
- change the creative or landing page if engagement is healthy but add-to-cart is weak;
- move to the Car Sun Visor Organizer only after the first product has a clear result;
- do not broaden paid traffic across all 20 products simultaneously.