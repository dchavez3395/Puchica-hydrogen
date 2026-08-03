# DSers two-ZIP landed-cost runbook - 2026-08-01

## Live status at 2026-08-01

- **Fresh read-only verification at 2026-08-01 21:10 UTC:** DSers still maps
  `Red 5-Piece Compression Packing Cube Set` and reports supplier stock `1024`.
  The linked AliExpress listing was reselected to the exact `5PCS Set Red`
  option and showed the stable DSers API product cost `US$20.39` plus
  `AliExpress Selection Standard` at `US$1.99`. No order, settings change, or
  payment action was performed. The current supplier page did not expose a
  destination ZIP or a fresh exact delivery range, so this refresh confirms
  mapping, stock, and the country-level cost only; it does not upgrade the
  two-ZIP or tracking gate.

- `24PCS (6S14M4L)` drawer organizer: **NO_GO_QUOTE / HOLD_ROUTE**. With the
  exact mapped option selected and destination set to United States, DSers
  returned `No Shipping`. It is now excluded from storefront launch surfaces.
- `5PCS Set Red` compression cubes: preliminary U.S. route found via
  `AliExpress Selection Standard`, shipping `US$1.99`, estimated `8-13 days`,
  tracking available, ship-from China. This is **not yet a two-ZIP pass**:
  DSers' panel exposed country/state/city rather than ZIP-level evidence, and
  the exact variant item cost and U.S. checkout price still require capture.
- Next gate: obtain address-specific evidence for `10001` and `90001`, complete
  the landed-cost fields, and evaluate the worse route against 30%. No sample
  or supplier order is authorized by this preliminary result.

## Scope and decision

Collect destination-specific evidence for exactly two products, in this order:

1. `24-Piece Drawer Organizer Tray Set` / `24PCS(6S14M4L)` / Shopify variant
   `49941590704378` / mapped SKU `14:350853#24PCS(6S14M4L)`.
2. Only if the drawer set fails or cannot be quoted, `Red 5-Piece Compression
Packing Cube Set` / `5PCS Set Red` / Shopify variant `49961853026554` /
   mapped SKU `14:100018786#5PCS Set Red`.

Use ZIP `10001` (New York, East) and ZIP `90001` (Los Angeles, West). These are
quote probes, not a claim of nationwide coverage. Record both quotes even when
they are identical. Do not place an order while collecting quotes.

## Canada-based merchant constraint

Puchica does not currently have a U.S. delivery address. Treat evidence in
three levels so a price lookup is never mistaken for fulfillment proof:

1. **Country screen (no address, no payment):** DSers `Shipping Info` can show
   the exact SKU's methods, cost, and time for the United States. DSers' current
   help documentation describes this as a country search, not a ZIP-specific
   guarantee. This can reject a bad supplier cheaply, but cannot prove either
   ZIP row.
2. **Address quote probe (full legitimate address, no payment):** a supplier or
   checkout quote using a complete address supplied with the recipient's
   permission can test the displayed price, route, and Shopify rate before
   payment. It is still only a quote: stock, final supplier charge, dispatch,
   tracking, customs treatment, and delivery remain unproven.
3. **Controlled delivery (payment and consenting recipient):** only a paid
   supplier order to a real U.S. recipient can prove actual charge, dispatch,
   tracking sync, transit time, delivery, packaging, and received condition.

A ZIP alone is useful for comparing displayed routes, but is not a deliverable
address. Do not create an order with a random residence, invented name/phone,
or an address whose owner has not consented. DSers requires complete customer
details when it places supplier orders, and it synchronizes that address to
AliExpress.

### Minimum-cost sequence

1. In DSers, perform the no-payment **United States country screen** for the
   drawer variant. Capture ordinary item price, every tracked shipping method,
   cost/time, mapping, ship-from, and stock. Do not alter the existing `Price
   for` country merely to inspect it: DSers warns that changing it can break a
   mapping when the supplier does not support the destination.
2. Run the 30% gate using the most conservative tracked U.S. method plus all
   known costs. If it clearly fails, reject the drawer set without seeking an
   address or placing an order, then repeat only for the compression cubes.
3. If it passes, secure permission from one real U.S. recipient. Lowest-cost
   preference is a trusted friend/family member or collaborator who will keep
   the parcel, photograph labels, record unboxing, count/measure the contents,
   and report delivery. A commercial receiving/forwarding address is acceptable
   only after confirming it accepts this parcel type and all fees; it tests
   delivery to that facility, not residential delivery nationwide.
4. Use that legitimate full address to verify the Shopify checkout rate and
   exact supplier quote before payment. Shopify can simulate checkout payment,
   but a simulated payment does not cause a supplier shipment and must never be
   sent to fulfillment.
5. Authorize one real controlled order only after the quote and analytics gates
   pass. DSers documents that `Place Order` creates an unpaid AliExpress order;
   the parcel does not proceed until payment on AliExpress. Review the final
   price, address, variant, and method again immediately before paying.
6. Have the recipient preserve packaging and record the required evidence. If
   hands-on inspection by the Canadian merchant is essential, ask the recipient
   to forward the same accepted parcel afterward rather than buying a second
   unit. Record forwarding as research/sample expense, not supplier landed cost
   for a U.S. customer.
7. One successful U.S. delivery unlocks only a small paid test. It does not
   prove both coasts. Preserve the `10001` and `90001` quote probes, then let the
   first genuine customer order in the other region supply the second actual
   delivery observation before scaling.

Use `dsers-two-zip-quote-evidence-2026-08-01.csv` for the evidence. It has one
row per exact variant and destination. Do not overwrite one ZIP with the other.

## Before opening DSers

Record these Shopify facts once:

- store/admin currency;
- actual customer-facing merchandise price at a U.S. checkout, before tax and
  excluding customer-paid shipping;
- any automatic or product-specific discount that will run during the test;
- Shopify Payments percentage and fixed fee for the actual plan/card mix; and
- the gate currency. USD is preferred for a U.S. test. If any charge is in
  another currency, record the quote-time FX source, timestamp, and multiplier.

Do not treat the observed Admin values `69.76` and `71.45` as U.S. checkout
prices until currency and market adjustment are confirmed in checkout.

## Logged-in DSers collection workflow

Repeat every step for each destination ZIP.

1. In DSers, open **My Products** and locate the exact Shopify product and
   variant by variant ID, option text, and mapped SKU. Capture a screenshot of
   the mapping and record the supplier name, supplier URL/product ID, supplier
   variant, automation owner, and ship-from country.
2. Open the supplier product through DSers. Set destination country to United
   States, enter the ZIP, select quantity one, and reselect the exact variant.
   Never accept a visually similar configuration.
3. Record the ordinary item price. Exclude new-user, first-order, coins,
   account-specific, app-only, bundle, and expiring coupon prices unless the
   promotion is guaranteed for every fulfillment order. If only a promotional
   price is displayed, mark `quote_usable=NO` and record why.
4. Open all available shipping methods. Choose the least expensive method that
   provides end-to-end tracking and an explicit delivery range. Record method,
   shipping charge, tracking, dispatch estimate, delivery minimum/maximum,
   and the displayed arrival dates. Do not choose an untracked route merely to
   pass margin.
5. Record supplier stock for the exact variant and ship-from location. If DSers
   and the supplier disagree, use the lower value and describe the discrepancy.
6. Record checkout-estimated sales tax separately, but do not add customer
   sales tax collected/remitted by Shopify to merchandise revenue. Record any
   duty, tariff, brokerage, import tax, or supplier/order charge paid by
   Puchica. Unknown charges remain blank and fail the gate; do not enter zero.
7. Capture the quote screen with destination, variant, quantity, item price,
   shipping method/cost, and ETA visible. Save the evidence path or URL and UTC
   timestamp in the CSV.
8. Refresh once and confirm the values. If they change, preserve the newer quote
   and note the earlier value. Never average the East and West routes.

## Currency normalization

Use one gate currency per row. For a supplier charge in another currency:

```text
normalized charge = displayed charge x quote-time FX-to-gate-currency
```

Record the FX source and timestamp. Normalize item cost, supplier shipping,
duties/fees, and the U.S. checkout price before doing margin math. Never mix
CAD and USD values in one formula.

## Row calculation

Use rates as decimals (`10% = 0.10`). Customer-paid shipping revenue is excluded
from the initial gate because its net retention is not yet measured.

```text
R = US checkout merchandise price x (1 - promo rate)
F = (R x payment percentage rate) + payment fixed fee
L = item cost + supplier shipping + duty/tariff/brokerage/import tax
    + automation/order-processing charge + packaging/handling
Q = return/refund reserve
C = R - F - L - Q
contribution margin = C / R
maximum landed cost = R - F - Q - (0.30 x R)
```

The row passes economics only when `L <= maximum landed cost` and
`contribution margin >= 0.30`. A missing charge, unknown tracking result, or
unusable promotional quote is a failed row, not zero.

## Worst-route product decision

For each product:

```text
worst landed cost = MAX(L for 10001, L for 90001)
worst contribution = MIN(C for 10001, C for 90001)
worst contribution margin = MIN(margin for 10001, margin for 90001)
```

Set `GO_SAMPLE` only when both rows have usable tracked quotes, supplier and
Shopify inventory are at least 25, both rows clear 30%, and the exact mapping
and content checks pass. Otherwise use:

- `NO_GO_QUOTE` for missing, promotional-only, untracked, or incomplete quote;
- `NO_GO_MARGIN` when either ZIP is below 30%;
- `NO_GO_MAPPING` when the exact variant cannot be proven;
- `NO_GO_STOCK` when either inventory source is below 25; or
- `NO_GO_CONTENT` / `NO_GO_RISK` for unresolved product evidence.

If the drawer set passes, stop quoting products and proceed to sample approval.
If it fails, preserve the evidence and run the identical process for the red
compression cubes. Do not purchase AutoDS or change automation ownership.

## Evidence the operator must return

For each of the four prepared rows, return:

- mapping screenshot and quote screenshot/evidence path;
- supplier identity, link/product ID, exact supplier variant and ship-from;
- destination ZIP and UTC timestamp;
- ordinary item cost and currency;
- tracked shipping method, charge, delivery range, and dispatch estimate;
- exact supplier stock;
- any Puchica-paid duties, taxes, automation, handling, or packaging charges;
- actual U.S. checkout merchandise price/currency and active discount;
- actual payment fee terms;
- reserve assumption and its basis; and
- quote usability note, including any promotion or DSers/supplier mismatch.

The final calculation can be completed only after these values are captured.
