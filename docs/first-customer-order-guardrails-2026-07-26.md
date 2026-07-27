# Puchica First-Customer Order Guardrails

Use this process for the first completed customer order for each product and for the first Canadian and US orders. These checks replace a paid test order; they do not make supplier execution risk disappear.

## Before paying the supplier

1. Confirm Shopify shows a paid order with no high-risk fraud warning.
2. Match the Shopify product, variant title, SKU, quantity, and customer country to the DSers line item.
3. Open the mapped supplier product and confirm the exact supplier SKU.
4. Requote the actual destination and record:
   - item cost;
   - shipping cost and currency;
   - shipping service;
   - estimated delivery window;
   - stock; and
   - tracking availability.
5. Recalculate contribution margin using the actual order revenue after discounts, item cost, shipping, payment allowance, and any tax absorbed by the store.
6. Confirm the address is complete and uses the expected postal/ZIP format.

## Automatic stop conditions

Do not pay the supplier until reviewed if any condition applies:

- DSers maps to a different color, size, model, bundle quantity, or supplier SKU.
- The destination has no tracked shipping option.
- The quoted delivery maximum exceeds 20 business days.
- Actual contribution margin falls below 25%.
- Shipping cost is more than CA$2.00 above the approved quote.
- The supplier item price is more than 15% above the approved quote.
- The variant is low stock, unavailable, or requires a supplier substitution.
- The supplier rating, recent order volume, or recent review pattern has materially deteriorated.
- The customer address, fraud result, payment state, or order currency looks inconsistent.

## Resolution order

1. Check whether another already-approved mapped supplier or shipping service solves the issue.
2. Recalculate margin before accepting a higher cost.
3. If fulfillment remains unsafe or uneconomic, contact the customer promptly with an honest option: wait, choose an equivalent variant, or receive a refund.
4. Disable the affected variant or product until its mapping, economics, and destination availability are corrected.
5. Record the decision in the Shopify order timeline and product workboard.

## After supplier payment

- Confirm the supplier order number is attached to the correct Shopify order.
- Check daily until tracking is created.
- Confirm tracking returns to Shopify and triggers the shipping email.
- Review the tracking link from the customer perspective.
- Monitor the shipment through delivery.
- Ask the customer for feedback only after the delivery window has elapsed.
- Treat any quality, packaging, wrong-item, or delivery complaint as product-gate evidence.

## Graduation to normal processing

A product may leave manual first-order review only after one order:

- mapped to the exact SKU;
- retained at least 25% contribution margin;
- generated tracked fulfillment correctly;
- synchronized tracking to Shopify;
- arrived within the accepted window; and
- produced no unresolved quality, safety, listing-accuracy, or packaging issue.

Keep manual review active separately for the first Canadian and first US order because destination shipping services and costs can differ.
