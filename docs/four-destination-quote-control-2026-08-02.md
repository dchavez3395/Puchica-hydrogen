# Four-destination supplier quote control

## Scope

This gate covers the exact launch offer only:

- Shopify variant: `49961853026554`
- Option: `5PCS Set Red`
- DSers product: `2083036447075794944`
- Supplier item: `1005008568050448`
- Mapped supplier SKU: `14:100018786#5PCS Set Red`
- Current storefront price: US$52 / CA$71.45
- Promotion: none

Do not substitute a different option, supplier, introductory coupon, or optimizer
lead. Any mapping, price, stock, or route change requires a fresh four-row capture.

## Quote destinations

Capture fresh evidence for:

1. ZIP `10001`
2. ZIP `90001`
3. Winnipeg, Manitoba — use Winnipeg City Hall, 510 Main St, R3B 1B9 only as
   a non-personal quote coordinate
4. Toronto, Ontario — use Toronto City Hall, 100 Queen St W, M5H 2N2 only as
   a non-personal quote coordinate

Prefer postal/ZIP-only calculators. These public addresses are never delivery
recipients. If a quote requires an invented recipient, phone number, saved
address, checkout creation, or order, stop and record `ADDRESS_LEVEL_QUOTE_BLOCKED`.
Never use the former `R2P 2X1` address.

## Required evidence per destination

- UTC timestamp and screenshot/evidence reference
- exact Shopify variant, DSers mapping, supplier item, and mapped SKU
- ship-from location and ordinary item price
- exact-option supplier and Shopify stock
- supplier shipping, tax collected, and final pre-payment supplier total
- service, carrier, tracking availability, dispatch range, and delivery range
- incoterm/importer of record
- duty, brokerage, remote-area, address-correction, and return-to-sender exposure
- quote-time FX and Shopify customer-facing price/currency
- payment percentage/fixed fee and U.S. conversion/payout treatment
- DSers/order, packaging, handling, app-allocation, and support costs
- 15% refund/problem reserve

Unknown values remain unknown; they are never entered as zero.

## Pass/fail rule

All four rows must be no older than seven days, use a tracked usable route, and
show supplier and Shopify stock of at least 25. The worst destination must retain
at least 30% pre-ad contribution after every seller-borne variable cost and the
15% reserve.

Conservative current all-in landed-cost ceilings:

- US$26.79 at a US$52 selling price
- CA$36.50 at a CA$71.45 selling price

No shipping, untracked service, changed mapping, a blank cost, or an uncertain
route is `HOLD`, not an estimated pass. `FIRST15` must remain inactive.

