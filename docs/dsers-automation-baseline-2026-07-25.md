# DSers automation baseline — 2026-07-25

## What is already connected

- Shopify store `ug91ve-sz` is connected to DSers.
- DSers **My Products** shows 57 AliExpress-sourced records.
- DSers fulfilment preference is set to **Fulfill items in bulk**: an order is marked fulfilled only after all items receive tracking, then one customer notification is sent.
- The existing customer-facing sweater has been restored while the wider catalogue is reviewed.

## What needs product-level work before scaling

- **Shipping:** the only configured default is global AliExpress Standard Shipping, with DSers displaying an average of **18 days** and **US$7.33**. There are no Canada-, U.S.-, or UK-specific rules yet.
- **Option-value automation:** DSers Automated Mapping currently has **no value-pair rules**. This is not automatically a defect, but any Shopify ↔ supplier spelling/color/size mismatch must be mapped explicitly per product.
- **Variant proof:** an import/card record and a displayed cost range are not a substitute for confirming the exact saleable Shopify variant maps to an available supplier option.
- **Supplier order payment:** DSers can sync Shopify orders and tracking, but supplier purchase/payment should remain a controlled action until the connected AliExpress account, order workflow, and first real fulfillment are verified. Do not assume an order can be paid automatically merely because it synced into DSers.

## Target operating loop

1. Customer pays through the branded Shopify checkout.
2. DSers receives the Shopify order with the exact mapped supplier variant.
3. DSers applies the market-specific shipping rule and supplier order information.
4. Supplier order is placed through the configured DSers/AliExpress workflow.
5. DSers receives tracking and syncs it back to Shopify; Shopify sends the customer update.

## Build order

1. Audit and repair an initial validation cohort’s mappings and Canada quotes, then scale through the full approved lifestyle assortment in batches; the cohort is not the store’s catalog ceiling.
2. Add Canada-specific shipping rules only after the selected suppliers’ services and costs are known.
3. Run a controlled paid test on one approved product, then confirm the DSers order, supplier charge, tracking sync, and notification sequence.
4. Use that proof to expand the catalog in verified batches and enable the U.S. market; do not rely on the generic global shipping rule for a Western-market launch.
