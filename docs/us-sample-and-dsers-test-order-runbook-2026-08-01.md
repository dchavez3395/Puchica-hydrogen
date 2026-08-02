# U.S. sample and Shopify-to-DSers test-order runbook — 2026-08-01

> **SCOPE UPDATE:** This is the optional sample and full-route validation track
> for scaling. The current capped launch exception is controlled by
> `docs/us-packing-cubes-limited-test-control-2026-08-01.md`. It does not require
> a U.S. sample address, but it does not authorize spend or scaling by itself.

## Purpose and hard boundary

This runbook proves one U.S. organization offer without enabling automatic
supplier spending. It covers two supplier samples and one controlled paid
Shopify order. It does **not** authorize Codex, DSers, Shopify, AliExpress, or
any other service to place an order, charge a card, contact a recipient, or
change a live setting.

All ten current launch products remain DSers-owned. AutoDS must not be connected
to any SKU in this runbook.

## Current sample candidates

The drawer route failed before purchase. Order no unit unless its current gate
below is `GO_SAMPLE` and the user approves the final charge:

| Candidate | Product                                  | Exact customer option | Current gate        | Action                                                     |
| --------- | ---------------------------------------- | --------------------- | ------------------- | ---------------------------------------------------------- |
| A         | 24-Piece Drawer Organizer Tray Set       | `24PCS(6S14M4L)`      | `HOLD_ROUTE`        | Do not sample; exact U.S. selection returned `No Shipping` |
| B         | Red 5-Piece Compression Packing Cube Set | `5PCS Set Red`        | `GO_LIMITED_TEST_READY` | Use capped control; complete this runbook before scaling |

Do not substitute another drawer-tray option. If Candidate B fails, quote the
White Small Wheeled Under-Sink Organizer Bin
(`white S`, variant `49961827041530`) as the backup. Any substitution requires a
new quote packet and user approval before purchase.

## Gate 0 — reconcile the previous test

Do not create another paid test until Shopify order **#1001** is reconciled.

Live review on 2026-08-01 confirmed that #1001 is marked **Canceled**, its
single item was removed, the current order total is `$0.00`, and DSers has no
order waiting in **Awaiting order**. Shopify still shows the original `$13.85`
as paid and offers a **Refund** action, so the financial reconciliation remains
open until the user explicitly authorizes that refund and it is confirmed back
to the original payment method.

- [ ] Confirm whether #1001 ever generated an AliExpress/supplier order or card
      charge. Capture the supplier order ID and charge if one exists.
- [ ] Confirm its Shopify payment, cancellation, fulfillment and notification
      history. Its current record shows a cancelled fulfillment and no tracking.
- [ ] Confirm DSers has no actionable duplicate for #1001 in Awaiting order,
      Awaiting payment, Awaiting shipment or Awaiting fulfillment.
- [ ] User chooses and performs the final disposition: cancel/close the internal
      test if no goods are expected, or document the existing supplier order and
      finish its reconciliation. Do not silently reuse or fulfill it.
- [ ] Record the result in the candidate-control evidence notes.

**Stop:** any unknown supplier charge, open supplier order, or unresolved DSers
record blocks all later steps.

## Gate 1 — build the quote packet before either sample

Complete the corresponding rows in
`us-organization-candidate-control-2026-08-01.csv`. A blank field is a failed
gate.

For each exact variant:

1. In DSers My Products, open the Shopify product and confirm the current mapped
   AliExpress listing, supplier identity, exact option, supplier SKU, source
   image and non-zero mapped stock.
2. Confirm DSers is the only automation owner. Record the supplier URL/ID and
   take a screenshot of the mapping.
3. Quote tracked shipping to one user-authorized East/Central U.S. ZIP and one
   user-authorized West U.S. ZIP. Record destination, timestamp, item cost,
   shipping, service, ship-from country, dispatch range, delivery range,
   tracking and supplier stock for each quote.
4. Complete a no-payment Shopify checkout to the same two ZIPs. Record the
   actual merchandise price/currency, discount, customer shipping, tax display
   and delivery language. Do not submit payment.
5. Record the actual payment-plan percentage and fixed fee, quote-time FX rate,
   duties/tariffs/brokerage/import tax, automation fee, packaging/handling and
   return reserve. Use zero only when evidence shows the charge is zero.
6. Calculate the worst-ZIP pre-ad contribution using the current 30% formula in
   `us-organization-launch-control-2026-08-01.md`.
7. Set `GO_SAMPLE` only when the exact mapping exists, both routes are tracked,
   supplier and Shopify stock are each at least 25, the worse quote clears 30%,
   content matches the variant, and no safety/IP/compatibility hold remains.

**Stop:** a different option, untracked service, `Variants (0)`, stock below 25,
an unpriced import charge, or contribution below 30% is a no-go—not a reason to
estimate.

## Gate 2 — user approval to buy the two samples

Present one approval packet containing:

- exact product, option and mapped SKU for Samples A and B;
- supplier name/URL and seller score/order history visible at decision time;
- item, shipping, tax/duty and total charge for each sample in the card currency;
- tracked service and delivery range to the authorized recipient;
- combined maximum authorized charge; and
- screenshots of mapping, both U.S. quotes and final supplier checkout pages.

The user must confirm in writing:

1. both exact variants (or explicitly approve only one);
2. authorized U.S. recipient name, address, email and phone;
3. maximum charge per sample and combined maximum;
4. payment method to use; and
5. permission for the user to submit the two supplier orders.

Place samples directly from the supplier listing linked by DSers, not through
the live Shopify checkout. This tests the physical products without creating
two storefront conversions. The user reviews and submits each purchase. Do not
enable DSers auto-order or auto-pay.

Immediately after purchase, record supplier order ID, exact option/SKU, order
timestamp, item charge, shipping, tax/duty, card-currency total, FX result,
service and promised delivery. Save the invoice/receipt and screenshots.

## Common sample acceptance criteria

Both samples must meet every critical criterion:

- exact ordered variant, colour and piece count arrive with no substitution;
- no unexpected brand, competitor invoice, supplier promotion or customer-
  confusing insert appears in the parcel;
- no crack, sharp edge, exposed hardware, strong persistent chemical odour,
  mildew, staining or contamination;
- packaging protects all pieces and is clean enough to send to a customer;
- supplier tracking works from first carrier scan through delivery;
- first carrier scan occurs no later than the quoted dispatch maximum plus two
  days;
- delivery occurs no later than the quoted delivery maximum plus two days;
- actual landed charge is no more than 5% above the approved quote; and
- product, instructions, measurements and contents agree with the live page.

Any safety defect, wrong variant, missing piece, unannounced substitution,
broken tracking, customer-confusing supplier material, or critical mismatch is
`NO_GO_SUPPLIER`. Do not average a critical failure against the other sample.

## Sample A — drawer tray acceptance

- [ ] Count exactly 24 pieces: 6 small, 14 medium and 4 large, subject to final
      confirmation against the supplier listing before order.
- [ ] Measure every tray. Each dimension is within the greater of 3 mm or 2% of
      the verified listing measurement.
- [ ] Inspect every piece for cracks, warping, sharp edges, discoloration and
      unstable bases.
- [ ] Record packed dimensions, weight, material, nesting and odour after opening
      and again after 24 hours.
- [ ] Test in one shallow and one standard drawer; record minimum usable drawer
      depth and whether the arrangement blocks closure.
- [ ] Load with utensils or comparable items and complete 50 drawer open/close
      cycles. No tray may tip, crack, or migrate enough to block the drawer.
- [ ] Clean only as the supplier instructs; after 24 hours, no warping, colour
      transfer, tackiness or finish change is acceptable.
- [ ] Capture original vertical before/after footage and close-up defect photos.

Sample A passes only if all 24 pieces are usable and the exact configuration can
be represented truthfully on the product page.

## Sample B — compression cube acceptance

- [ ] Count exactly five pieces and identify each included size/function against
      the verified supplier listing.
- [ ] Measure each empty piece. Each dimension is within the greater of 2 cm or
      5% of the verified listing measurement.
- [ ] Confirm the delivered colour is red and matches the listing closely enough
      that the existing media is not misleading.
- [ ] Inspect seams, mesh/fabric, handles, zipper tracks, pulls and compression
      hardware for loose threads, holes, skipped stitches and sharp components.
- [ ] Cycle every zipper 50 times empty and 25 times with a normal clothing load.
      No snag, separation, pull failure or seam distortion is acceptable.
- [ ] Pack a repeatable clothing load; record uncompressed and compressed
      dimensions and weight. Compression must reduce depth without damaging the
      zipper, seam or contents.
- [ ] Leave the packed set compressed for 24 hours, reopen it and re-inspect the
      seams, zipper and permanent deformation.
- [ ] Capture original vertical packing/compression footage and defect photos.

Sample B passes only if every included piece is usable, contents match the page,
and the compression demonstration can be repeated without overclaiming.

## Gate 3 — choose the controlled-order product

Candidate A is `HOLD_ROUTE` and cannot enter this gate. Use Candidate B, the
exact red five-piece compression cube set, only after it passes the quote,
economics, sample, and user-approval gates. `GO_TEST_ORDER` requires:

- Sample B passed all physical and delivery criteria;
- a fresh quote to the controlled-order ZIP still clears 30% contribution;
- current supplier and Shopify stock remain at least 25;
- Shopify option, SKU and DSers mapping remain unchanged;
- the live product page shows only the exact tested five-piece red
  configuration; and
- checkout, payment and shipping amounts match the approved order packet.

If Sample B fails, stop. Do not automatically substitute another product;
prepare a separate user decision packet using the same gates.

## Gate 4 — one controlled Shopify-to-DSers order

### Before checkout

- [ ] Keep DSers auto-order and auto-pay disabled.
- [ ] User confirms test customer name, controlled email, U.S. address and phone.
- [ ] User confirms the exact variant, intended launch discount (including no
      discount), customer shipping service and maximum Shopify checkout total.
- [ ] User confirms the real payment method and authorizes one storefront charge.
- [ ] Start screen recording and note local/UTC time.

### Shopify checkout and intake

1. The user opens the live storefront on a mobile device or 390 px browser,
   selects exactly one approved hero variant and completes the normal checkout.
   Do not create the order in Shopify Admin.
2. Record Shopify order number, payment status, line item/variant ID, discount,
   shipping, tax, checkout total, currency and confirmation email time.
3. Confirm the order appears in DSers Awaiting order with the same line item,
   exact supplier option, quantity one and delivery address within 60 minutes.
4. If absent at 60 minutes, refresh/re-authenticate once and inspect the sync log.
   If still absent after two hours, set `NO_GO_AUTOMATION`; do not recreate the
   order or place a manual supplier duplicate.
5. Confirm there is one DSers record only and that no supplier order or charge
   was created automatically.

### Manual supplier-payment checkpoint

Before clicking any DSers/AliExpress order or payment button, present the user:

- Shopify and DSers order IDs;
- exact supplier, option and SKU selected by DSers;
- recipient and tracked shipping service;
- fresh quoted item, shipping, tax/duty and total supplier charge; and
- variance from the approved quote.

The user must separately approve the supplier charge ceiling and click/place
the supplier order. If the option changed, service is untracked, address is
wrong, or charge is over the approved quote by more than 5%, stop and do not
pay.

### Shipment, tracking and delivery

- [ ] Record AliExpress/supplier order ID, actual charge and payment timestamp.
- [ ] Confirm DSers moves through Awaiting shipment without marking Shopify
      fulfilled before valid carrier tracking exists.
- [ ] When the supplier issues tracking, record carrier, tracking number and
      first scan. DSers must sync it to the same Shopify order within 24 hours.
- [ ] Confirm Shopify creates one fulfillment and sends one shipment notification
      under the current “fulfill items in bulk” preference.
- [ ] Open the customer tracking link on mobile; it must resolve to the same
      carrier/package without exposing an unrelated recipient.
- [ ] Recipient records delivery date, parcel condition, inserts and product
      condition. Reapply the Sample A physical checks to the delivered unit.
- [ ] Record refund/cancellation behavior only if a real defect requires it; do
      not create a return merely to simulate one.

## Final pass/fail decision

`FULFILLMENT_GATE_PASS` requires all of the following:

1. exact Shopify variant mapped automatically to the exact supplier variant;
2. no duplicate order and no unapproved automatic supplier charge;
3. supplier charge at or below quote plus 5%;
4. tracked delivery by quoted maximum plus two days;
5. tracking synchronized to Shopify within 24 hours of supplier issuance;
6. one correct Shopify fulfillment and one shipment notification;
7. customer tracking link worked end to end;
8. delivered product passed the physical sample criteria; and
9. final actual pre-ad contribution remained at least 30%.

Otherwise record one explicit failure code:

- `NO_GO_MAPPING`
- `NO_GO_AUTOMATION`
- `NO_GO_DUPLICATE`
- `NO_GO_COST`
- `NO_GO_TRACKING`
- `NO_GO_DELIVERY`
- `NO_GO_PRODUCT`
- `NO_GO_ECONOMICS`

Paid traffic remains at zero until the failure is repaired and another
controlled order passes. Do not enable auto-order/auto-pay from a single pass;
consider that only after at least five clean paid customer orders.

## User confirmation points

| ID  | Required confirmation                                                   | Earliest time it can be requested                  |
| --- | ----------------------------------------------------------------------- | -------------------------------------------------- |
| U1  | Final disposition of Shopify #1001                                      | Before any new order                               |
| U2  | Authorized East/Central and West quote ZIPs                             | Before quote packet                                |
| U3  | Authorized U.S. sample recipient/contact details                        | Before supplier checkout                           |
| U4  | Samples A/B, per-order cap, combined cap and payment method             | After both `GO_SAMPLE` packets are complete        |
| U5  | Acceptance or rejection of each delivered sample                        | After recorded QA                                  |
| U6  | Test customer identity/address, offer, shipping and Shopify charge cap  | Before controlled storefront checkout              |
| U7  | Exact DSers supplier selection, tracked service and supplier charge cap | After DSers intake, before supplier order/payment  |
| U8  | Final fulfillment result and permission to begin any paid test          | After delivery and actual-economics reconciliation |

No confirmation can be inferred from an earlier approval, and U4/U6/U7 each
authorize only the single transaction described in its packet.
