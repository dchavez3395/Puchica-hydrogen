# Puchica First Test-Order Validation Runbook

## Purpose

Validate the complete customer-to-supplier workflow before scaling paid traffic. The recommended first purchase is **Compact Bicycle Bell**. It is inexpensive, has straightforward variants, and provides a useful end-to-end control. Recommended second test: **Travel Pet Water Bottle**.

## Before payment

1. Use a real deliverable Canadian or US address.
2. Use an email and phone number that can receive every customer notification.
3. Open a private browser session with analytics consent reset.
4. Confirm the selected variant is available and shows the intended currency and price.
5. Record the product handle, Shopify variant ID, displayed price, discount, tax, shipping charge, and final total.
6. Check the cart drawer, full cart, discount behavior, shipping estimator, and checkout contact fields.
7. Confirm no rejected or hidden product is offered as an upsell.

## Purchase and Shopify checks

1. Complete payment using a normal supported payment method.
2. Record the checkout completion time and Shopify order number.
3. Confirm the storefront success page loads.
4. Confirm the customer receives the order-confirmation email.
5. In Shopify Admin, verify:
   - payment status;
   - order currency and totals;
   - shipping address;
   - tax treatment;
   - selected product and variant;
   - fraud analysis;
   - order timeline entries; and
   - attribution and analytics fields.

## DSers and supplier checks

1. Record when the order first appears in DSers.
2. Confirm the Shopify line item maps to the intended AliExpress supplier product and exact supplier SKU.
3. Confirm destination availability for the actual country and postal/ZIP code.
4. Recheck item cost, shipping cost, service, estimated delivery, stock, and supplier rating.
5. Compare actual landed cost against the scorecard assumption.
6. If cost or shipping exceeds the approved threshold, pause before supplier payment and record the variance.
7. Confirm whether DSers requires manual supplier payment; do not assume mapping means payment is automatic.
8. Place the supplier order only after every mapping and cost field matches.

## Fulfillment and tracking checks

1. Record the supplier-order creation time.
2. Record the supplier shipment time.
3. Confirm the tracking number appears in DSers.
4. Confirm tracking synchronizes back to the correct Shopify fulfillment.
5. Confirm the customer receives a shipping-confirmation email with a working tracking link.
6. Check that the tracking page does not reveal confusing supplier branding.
7. Monitor carrier scans at least every two business days until delivery.

## Delivery and product checks

1. Record delivery date and total calendar days.
2. Photograph the unopened parcel, label, packaging, product, included instructions, and any defects.
3. Check:
   - product identity and selected variant;
   - material and color accuracy;
   - dimensions and weight;
   - functionality;
   - odor, residue, sharp edges, loose parts, or damage;
   - packaging quality;
   - unrequested invoices or promotional material;
   - country-of-origin and warning labels; and
   - whether the storefront description remains accurate.
4. Test the real customer-support workflow with a non-destructive question.

## Go/no-go criteria

The product can remain in the focused launch set only if:

- the correct SKU mapped without manual repair;
- the supplier accepted the Canadian or US destination;
- actual landed margin remains within the approved threshold;
- tracking synchronized to Shopify correctly;
- customer emails and tracking links worked;
- delivery was within a commercially acceptable window;
- the received product matched the listing and was functional; and
- packaging and safety observations were acceptable.

Pause or remove the product if any critical mapping, destination, margin, tracking, quality, safety, or listing-accuracy check fails.
