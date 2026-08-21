# Bundle fulfilment runbook — The Carry-On Kit

**Applies to:** `PUCHICA-KIT-CARRYON-01` ·
`the-carry-on-kit-toiletry-organizer-packing-cubes-cable-case` · CA$89 · Canada only

DSers maps one storefront variant to one supplier variant. A bundle SKU has no
single supplier variant, so it can never carry `dsers-mapped`. The storefront
gate therefore exempts bundles from that tag and requires
`bundle-fulfilment-verified` instead — which asserts exactly what this document
describes. If this process is not followed, a kit order will sit unfulfilled in
DSers with no error, because DSers will simply not recognise the line item.

## One kit order = three supplier orders

| # | Component | Exact SKU | Supplier item | Cost USD | CA ship USD |
|---|---|---|---|---:|---:|
| 1 | Charcoal 3-Piece Packing Cube Set | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | 1005005283270949 | 12.45 | 1.99 |
| 2 | Black Hanging Travel Toiletry Organizer | `14:771#Black` | 1005006162747124 | 8.32 | 2.16 |
| 3 | Black Double-Layer Cable Organizer Case | `14:193#Double Layers` | 1005006797227273 | 4.05 | 1.99 |
| | **Total** | | | **24.82** | **6.14** |

At the planning rate of CA$1.40/US$1.00 that is **CA$43.34 landed**, against
CA$94 collected (CA$89 + CA$5 shipping). After 3.5% + CA$0.30 payment fees and
a 5% exception reserve, contribution is **≈ CA$42**. That is roughly 1.6× the
best single product in the catalogue and is the reason this SKU exists.

## Steps when a kit order arrives

1. Open the Shopify order. The line item will read `PUCHICA-KIT-CARRYON-01`.
   **Do not** wait for DSers to pick it up — it will not.
2. In DSers, place **three separate orders**, one per row in the table above,
   against the exact SKU shown. Do not substitute a colour or a layer count.
3. Each supplier listing is set to **Max. 1 pcs/shopper**. One unit per order is
   therefore both the cap and the requirement. Ordering two of anything will be
   rejected at the supplier.
4. Use the same customer shipping address on all three.
5. Back in Shopify, fulfil the order **in three parts**, attaching each tracking
   number as it appears. Do not mark the order fulfilled with a single tracking
   number — two of the three parcels would then look delivered when they are not.
6. The PDP already tells the customer the items ship separately and may arrive on
   different days. Keep that sentence in the description; it is what makes the
   three-parcel split honest rather than a surprise.

## Cancellations and returns

- A cancellation must be applied to all three supplier orders. Cancelling one
  leaves a partial kit in transit that cannot be resold as a kit.
- A single-item defect is refunded at the component's own price
  (CA$39.99 / CA$39.99 / CA$24.99), not at one third of CA$89.

## When this evidence goes stale

`bundle-fulfilment-verified` is only true while all three component products
still carry `dsers-mapped` **and** `ca-route-verified`. If any component loses
either tag, remove `bundle-fulfilment-verified` from the kit immediately — the
storefront gate will then hide it, which is the correct outcome.

The cost and route figures above are mirrored in
`exact-offer-cost-route-baseline-2026-08-21.json` as a derived row. They are not
an independent quote: re-derive them whenever a component row changes.

## Still open

- **No kit order has been placed end to end yet.** This runbook is written from
  the verified component mappings, not from a completed three-order test. The
  first real order is the proof. Until then, treat step 2 as unrehearsed.
