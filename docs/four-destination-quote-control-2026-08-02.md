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

## Authenticated DSers result — 2026-08-02

Captured at `2026-08-02T18:50:26Z` from DSers **My Products → Shipping info**.
No order, checkout, saved address, recipient, phone number, mapping change, or
payment was created.

DSers confirmed the mapped supplier item `1005008568050448` and the exact
selected SKU `5PCS Set Red`. The current My Products card displayed supplier
stock `1,023`, a US$4.38–20.39 item-cost range, and a CA$6.15–28.61 converted
cost range. The range is not an exact-option item-cost quote.

| Requested destination | DSers input scope | Exact-SKU result | Decision |
| --- | --- | --- | --- |
| Winnipeg, MB R3B 1B9 | Canada only | `No Shipping` | `HOLD_NO_ROUTE` |
| Toronto, ON M5H 2N2 | Canada only | `No Shipping` | `HOLD_NO_ROUTE` |
| ZIP 10001 | United States only | AliExpress Selection Standard; ships from CN; free shipping; 7–12 days; tracking available | `ADDRESS_LEVEL_QUOTE_BLOCKED` |
| ZIP 90001 | United States only | Same country-level result | `ADDRESS_LEVEL_QUOTE_BLOCKED` |

The Shipping info tool accepts a **country**, not a city, postal code, ZIP code,
or street address. It therefore cannot produce four destination-specific rows.
The Canadian result is a hard route failure for this supplier SKU. The U.S.
result is useful country-level preflight evidence, but it does not satisfy the
two-ZIP gate and does not prove the exact item cost, duties, brokerage,
return-to-sender exposure, or final landed charge.

Operational consequence: do not advertise this exact packing-cube offer in
Canada. Keep paid traffic off in both countries until the supplier route is
replaced or independently verified at the required destination level and the
economics are recalculated from complete charges.
