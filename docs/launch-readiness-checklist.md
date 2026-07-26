# Puchica launch-readiness checklist

This checklist preserves every DSers mapping. A product is held from the Hydrogen launch tag when it fails a check; it is not deleted from DSers.

| Step | Status | Evidence / action |
| --- | --- | --- |
| Confirm supplier mappings exist | Complete | DSers **My Products** reports 57 AliExpress-mapped products and `Unmapped (0)`. |
| Preserve mapped supplier catalogue | Complete | No mapped DSers product was deleted. Customer visibility is controlled by the Shopify `puchica-launch-ready` tag. |
| Establish a cautious live catalogue | Complete | 24 products remain customer-facing after the pre-shipping margin screen. |
| Remove unquoted free-shipping exposure | Complete | Disabled the free international rates for Canada, U.S., configured international, and rest-of-world zones. Paid checkout rates remain active. |
| Verify market scope | Complete | Canada and United Kingdom are active. U.S. and Australia/New Zealand remain drafts until their destination quotes are proven. |
| Verify DSers order-placement workflow | In progress | DSers documentation confirms paid Shopify orders sync automatically to **Awaiting order**, then tracking and fulfilment sync back after the supplier is paid and ships. Confirm the account's order-placement and payment settings; do not enable auto-pay until a controlled test order succeeds. |
| Build exact delivered-cost record | In progress | For each launch product, record mapped variant cost, Canada shipping quote, delivery estimate, stock, and 30% contribution result. |
| Benchmark prices | Pending | Compare the approved products against equivalent active sellers, then adjust price only where the delivered-cost gate stays green. |
| Run controlled checkout and fulfilment test | Pending | Test a low-risk product through checkout and DSers order sync. Do not buy from the supplier until the order-review stage has been confirmed. |
| Expand launch inventory | Pending | Add mapped products in batches only after stock, shipping, claim/policy, product-page, and delivered-margin checks pass. |

## Current shipping guardrail

Free shipping is not offered until a destination-specific quote supports it. The existing paid checkout choices are:

- Canada: CA$7.99 standard / CA$20 express.
- U.S.: existing paid international choices, with the unverified free-over-threshold rate disabled.
- Configured international countries: CA$12.99 standard plus carrier-calculated options where available.
- Rest of world: CA$14.99 standard plus carrier-calculated options where available.

This keeps the customer-facing shipping charge separate from supplier shipping cost until the mapped delivery quotes establish whether a free-shipping threshold can be reintroduced safely.

## DSers automation boundary

Mapped products do not mean that supplier money is automatically spent. The expected workflow is:

1. A paid Shopify order synchronizes into DSers automatically.
2. DSers keeps it in **Awaiting order** until it is placed with the mapped supplier.
3. The supplier order must be paid before it can ship.
4. Once the supplier ships, DSers synchronizes tracking and fulfilment back to Shopify automatically.

This is the safe default: automatic order intake, tracking, and fulfilment sync, but a deliberate supplier-payment checkpoint. A future auto-order/auto-pay configuration can be considered only after a controlled test confirms the exact supplier, shipping method, delivery address, and final cost.

## Non-negotiable approval rule

For the lowest-margin variant, use:

`contribution = customer price after FIRST15 and payment fees - Shopify unit cost - exact DSers shipping`

The product may be launched only when the conservative result is at least 30% of the customer price, mapped stock is available, and the destination is supported by the supplier. If any of those change, the launch tag is removed; the DSers mapping remains intact.
