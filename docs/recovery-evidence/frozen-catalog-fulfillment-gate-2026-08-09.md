# Frozen-catalog fulfillment gate — 2026-08-09

**Fresh signed-in verification:** 2026-08-09T18:38:44-05:00
**Scope:** read-only inspection of the two exact frozen storefront variants. No remap, import, save, order, push, deletion, or spend occurred.

## Binding outcome

| Exact frozen variant | Canada | United States | Binding outcome |
|---|---|---|---|
| Packing cubes — Shopify variant `50041051676922`; SKU `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | **GO_ORGANIC_LIMITED** | **FAIL — No Shipping** | Canada-only, one organic order at a time with an order-time DSers route/availability recheck |
| Cable case — Shopify variant `50041043681530`; SKU `14:193#Double Layers` | **GO_ORGANIC_LIMITED** | **GO_ORGANIC_LIMITED** | Canada and U.S., one organic order at a time with an order-time DSers route/stock recheck |

This does **not** authorize paid advertising.

## 1. Charcoal 3-Piece Packing Cube Set

### Current Shopify → supplier binding

- Storefront handle: `3-piece-packing-cube-set`
- Shopify variant: `50041051676922`
- DSers My Products ID: `2086248705456865280`
- DSers Import List source ID: `2084090269289939648`
- Supplier item ID: `3256805096956197`
- Current Basic Mapping default supplier: `Luggage Cubes Organizer Portable Travel Storage Bag Compressible Packing Cubes Foldable Waterproof Travel Suitcase Nylon Handbag`
- Store option `Charcoal / 3-Piece Set (S/M/L)` maps by position to supplier option `S3007 Black / 3PCS L M S Set`.
- Exact supplier SKU: `14:1052#S3007 Black;5:200004186#3PCS L M S Set`
- Backup supplier: none selected.
- Advanced Mapping: all eight rows are blank (`Please select a supplier`, `Please select a variant`, `Set Quantity`). The live product therefore uses Basic Mapping/default supplier, not a country-specific Advanced Mapping rule.

### Exact cost and availability

- Exact option ordinary item cost: **US$12.45**
- Canada supplier shipping: **US$1.99**
- Canada landed supplier amount before tax/duty/exception reserve: **US$14.44**
- DSers My Products aggregate stock: **667**
- Exact per-option supplier-stock column: not exposed for this source record.
- Visible mapped product and nonzero aggregate availability are sufficient for a limited organic test, but exact option availability must be checked again before every order is submitted.

### Routes

| Market | Method | Ship from | Cost | ETA | Tracking |
|---|---|---|---:|---:|---|
| Canada | AliExpress Selection Standard | CN | US$1.99 | 8–13 days | Available |
| United States | **No Shipping** | — | — | — | — |

### Product-truth contradiction check

- Storefront title: `3-Piece Packing Cube Set — Small, Medium & Large`.
- Storefront media label: `Charcoal 3-Piece Packing Cube Set — Small, Medium & Large`.
- Supplier option is named `S3007 Black`; storefront intentionally presents the dark neutral as `Charcoal`. Current supplier/store imagery is materially aligned, but shade naming is an order-time watchpoint.
- Storefront describes three standard zippered polyester cubes and explicitly says they are not vacuum bags or a mechanical compression system.
- Storefront dimensions: approximately 20×30 cm, 25×35 cm, and 30×40 cm. This is consistent with the approved small/medium/large configuration used in the frozen copy.
- Clothing/accessories are expressly excluded.

**Verdict:** Canada `GO_ORGANIC_LIMITED`; United States `FAIL`. An organic Canadian sale can be fulfilled cautiously today after confirming the exact SKU still appears with the same Canada route at order time.

## 2. Black Double-Layer Travel Cable Organizer Case

### Current Shopify → supplier binding

- Storefront handle: `travel-cable-organizer-case`
- Shopify variant: `50041043681530`
- DSers My Products ID: `2086248367047835648`
- DSers Import List source ID: `2082947114649846464`
- Supplier item ID: `3256806610912521`
- Current My Products Shipping Info resolves the mapped supplier and allows exact supplier SKU `14:193#Double Layers` to be selected.
- Exact supplier label: `Double Layers 1` / shipping selector label `Double Layers`.
- The dedicated Basic/Advanced Mapping drawer was not reopened successfully before the bounded stop line; backup-supplier and Advanced-Mapping fields remain unknown. Fulfillment evidence comes from the current mapped My Products record plus its exact source variant table and exact-SKU Shipping Info—not Supplier Optimizer or a listing-level range.

### Exact cost and stock

- Exact option ordinary item cost: **US$4.14**
- Supplier shipping: **US$1.99** to either market
- Exact landed supplier amount before tax/duty/exception reserve: **US$6.13**
- Stock on Shopify/store in the exact source grid: **65**
- Stock on AliExpress in the exact source grid: **57**
- Import List aggregate stock: **157**
- My Products aggregate stock: **158**
- The one-unit aggregate discrepancy does not affect the exact approved option, whose current supplier stock is explicitly nonzero, but it remains an order-time sync watchpoint.

### Routes

| Market | Method | Ship from | Cost | ETA | Tracking |
|---|---|---|---:|---:|---|
| Canada | AliExpress Selection Standard | CN | US$1.99 | 6–11 days | Available |
| United States | AliExpress Selection Standard | CN | US$1.99 | 6–11 days | Available |

### Product-truth contradiction check

- Storefront title and media identify a **Black Double-Layer Travel Cable Organizer Case**.
- Supplier SKU is the double-layer configuration; its exact source-grid image is the dark/black option used for the frozen storefront.
- Storefront dimensions are approximately 19×11×5.5 cm and describe two layers, elastic loops, mesh pockets, zipper closure, and a wrist strap.
- Storefront excludes pictured cables, chargers, and electronics and avoids a submersible-waterproof claim.
- No material contradiction was observed between the exact approved supplier option and frozen customer-facing title, media label, contents, or dimensions.

**Verdict:** Canada and United States `GO_ORGANIC_LIMITED`. One organic sale can be fulfilled cautiously today after rechecking exact stock and the destination route before placing the supplier order.

## Operating rules

1. Keep paid ads paused.
2. Accept only the exact approved SKU for each listing.
3. Hide packing cubes from the U.S.; the exact SKU currently has `No Shipping` there.
4. Before fulfilling every initial organic order, reopen DSers Shipping Info for the exact SKU and destination and reconfirm method, cost, ETA, tracking, and stock.
5. Stop sales immediately if the exact option disappears, supplier stock reaches zero, the route changes to `No Shipping`, or landed cost materially exceeds this evidence.
