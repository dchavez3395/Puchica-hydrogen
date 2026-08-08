# Puchica recovery candidate catalog audit — 2026-08-08

## Decision

**No current product or variant is launch-approved.** This is not a decision to
discard the catalog and not a finding that the products are unmapped in DSers.
The present Shopify export lacks enough current supplier-route and economics
evidence to select a three-to-five-product cohort. The Naturehike toiletry bag
has an independently confirmed customer-copy/media mismatch and every variant
is below the 25-unit launch-stock threshold, so that record remains
quarantined. The other products remain preserved for DSers-backed scoring.

This was a read-only audit. No Shopify or DSers data was changed, no deployment
was performed, and no order or advertising action was taken.

## Source snapshot

- Shopify store: `ug91ve-sz.myshopify.com` / Puchica
- Shopify Admin GraphQL API: version `2025-04`
- Query timestamp: recorded in
  `shopify-admin-catalog-2026-08-08.json` as `generatedAt`
- Scope: every Shopify product returned by Admin GraphQL, with variants,
  options, prices, compare-at prices, inventory items, inventory locations,
  unit costs, weight, origin, HS code, tags, metafields, featured media, and up
  to 20 media items.
- Governing controls:
  `docs/puchica-operating-quality-gates.md` and
  `docs/emergency-recovery-plan-2026-08-08.md`

Generated evidence:

- `shopify-admin-catalog-2026-08-08.json` — source-shaped raw Admin export.
- `candidate-variant-inventory-2026-08-08.csv` — normalized 34-row variant
  workboard suitable for spreadsheet review.
- `candidate-variant-inventory-2026-08-08.json` — the same normalized records
  with no CSV escaping ambiguity.

The Shopify `inventoryItem.unitCost` values are recorded as evidence, but they
are not treated as fresh supplier quotes or landed costs. Shopify does not
expose DSers shipping cost, destination ETA, supplier score, AliExpress stock,
or exact option mapping through these fields.

## Catalog-wide results

- 29 products, all `ACTIVE`; 34 variants.
- 21 products have an Admin `onlineStoreUrl`; eight do not.
- 29 products carry the unsupported `puchica-launch-ready` tag.
- One product has an explicit `dsers-mapped` tag: Naturehike toiletry bag.
- Seven variants are stocked at `dsers-fulfillment-service`: six Naturehike
  variants and one water-flosser variant.
- 27 other variants have no DSers location evidence in Shopify. That is not a
  finding that they are unmapped. The owner reports manually mapping the
  current products for Canada, and the repository's 2026-07-25 DSers snapshot
  recorded 57 mapped products with `Unmapped (0)`. Most products in this Admin
  export were created after that older snapshot, so their current exact mapping
  state remains `not inspected` until DSers can be read directly.
- All 34 variants have a Shopify unit cost in CAD; none has destination
  shipping, fees, duties, or reserve evidence needed for contribution margin.
- 23 variants use placeholder-like inventory `999`; five use `50`.
- 23 variants have zero shipping weight.
- All 34 variants are missing origin country and HS code.
- 28 products use a single `Default Title` variant.
- 28 products have a compare-at price within one cent of exactly 1.5 times the
  selling price, a synthetic merchandising pattern that is not acceptable as
  genuine reference-pricing evidence.
- 24 products have fewer than three media items.
- 27 titles exceed the 60-character workflow limit.
- Inventory is distributed across `woodland`, `DropCommerceV2`, and
  `dsers-fulfillment-service`; a location name is not proof of a physical
  supplier warehouse or destination route.

## Confirmed fidelity failure: Naturehike toiletry bag

- Product ID: `gid://shopify/Product/9341750968570`
- Handle:
  `naturehike-camping-hiking-toiletry-bag-travel-cosmetic-bag-beach-pool-surfing-portable-large-capacity-carry-waterproof-bag`
- Mapping evidence: explicit `dsers-mapped` tag, supplier-style option SKUs, and
  all inventory at `dsers-fulfillment-service`.
- Internal route tag: `us-route-verified`. This is historical/internal evidence,
  not a current supplier quote and not Canada evidence.
- Unit cost recorded by Shopify: CA$23.32 for every variant.

Exact variant records:

| Variant ID | Shopify option | SKU | Price CAD | Shopify unit cost CAD | Shopify inventory |
| --- | --- | --- | ---: | ---: | ---: |
| `49961830777082` | BK-L | `14:100018754#BK-L` | 73.28 | 23.32 | 12 |
| `49961830809850` | Grey-L | `14:100018756#Grey-L` | 70.23 | 23.32 | 7 |
| `49961830842618` | BK-S | `14:100018757#BK-S` | 40.23 | 23.32 | 8 |
| `49961830875386` | BN-S | `14:100018755#BN-S` | 40.23 | 23.32 | 4 |
| `49961830908154` | BN-L | `14:200141872#BN-L` | 73.45 | 23.32 | 6 |
| `49961830940922` | Grey-S | `14:100018753#Grey-S` | 40.69 | 23.32 | 11 |

### Critical fidelity failure

The 12 product images show a rectangular zip toiletry case in two sizes:
approximately 22 × 14 × 8 cm and 24 × 16 × 9.5 cm. The Shopify description
instead claims a roll-top 8 L/15 L waterproof dry bag with an adjustable
shoulder strap, MOLLE points, YKK zippers, IPX6 protection, submersion
protection, dimensions up to 35 × 20 × 25 cm, and weights of 260/380 g.

Those are materially different products/configurations. The text must not be
patched around the edges; it requires a clean rewrite from the exact mapped
supplier option after that mapping is reverified. Additional failures:

- “Waterproof” and IPX6 are unsupported; the source media uses narrower
  splash-resistant language and describes a waterproof inner section.
- Option name `Color` combines color and size codes.
- All 12 images reuse one alt text, and that text omits the Brown variants.
- Important dimensions and feature explanations are embedded in images, so
  equivalent accessible text is required.
- Every variant has fewer than 25 units in Shopify.
- Origin, HS code, Canada quote, current US quote, supplier stock, duties,
  shipping, tracking, ETA, fees, reserve, image rights, and brand authorization
  remain unknown.

**Status: quarantined.** It may be re-evaluated after exact DSers/AliExpress
mapping, ordinary-price, stock, Canada and US route evidence are captured.

## Other apparent travel products

These are not recommended as launch-cohort products:

- **Double hammock** — product `9351137427706`, variant `49985110049018`.
  CA$72.95 price / CA$29.18 Shopify unit cost / placeholder stock 999. Inventory
  sits at `DropCommerceV2`, not DSers. Load-bearing safety claims and included
  strap quality require evidence and a sample.
- **Fingerprint padlock** — product `9351895777530`, variant `49987796828410`.
  CA$103.92 / CA$65.42 / stock 50 at `woodland`. Security, battery, biometric
  reliability, warranty, and return risk make it unsuitable for the low-risk
  cohort; DSers mapping is not proven.
- **Temperature-display thermos** — product `9351895548154`, variant
  `49987795419386`. CA$127.33 / CA$80.16 / stock 50 at `woodland`. Food-contact,
  temperature accuracy, battery/electronics, cleaning, and unusually high price
  create avoidable risk; DSers mapping is not proven.

The USB water flosser (`9351188742394` / `49985179910394`) has a DSers inventory
location, but no explicit mapping tag or destination route evidence. It is a
hygiene/electrical product with performance claims and is outside the desired
low-risk organization/travel cohort.

## Required next product evidence

The current catalog does not yet contain three **approved** launch products;
that does not mean it contains no viable products. Verify the owner's current
DSers mappings and evaluate the existing catalog first. Source replacements
only when the present candidates fail route, economics, fidelity, risk, or
competitive-price gates. For each candidate, capture before storefront work:

1. exact Shopify product and variant ID;
2. exact DSers supplier listing, supplier ID, mapped option and supplier SKU;
3. ordinary item cost rather than welcome/coin/flash-sale pricing;
4. current supplier stock and ship-from location;
5. Canada postal-code quote and US ZIP quote: shipping method, cost, tracked
   status, and delivery window;
6. duty/brokerage handling;
7. weight, origin, HS code, materials, dimensions, included quantity, care and
   warnings;
8. image provenance/rights and an image-to-variant fidelity review;
9. conservative margin after shipping, duties, payment fee, active discount,
   and refund/defect reserve;
10. exact customer-facing option names and current availability.

Until those fields pass, candidate state is `not checked` or `quarantined`, not
`approved`.

## Reproduction commands

Run from `C:\Users\dchav\Desktop\Puchica-emergency-recovery` with the existing
local `.env`. The command maps the existing Shopify app secret into the Admin
client's expected process variable without printing it:

```powershell
$envLines = Get-Content .env
foreach ($line in $envLines) {
  if ($line -match '^SHOPIFY_CLIENT_SECRET=(.*)$') {
    $env:SHOPIFY_ADMIN_CLIENT_SECRET = $Matches[1].Trim('"')
  }
}
python scripts/export-recovery-catalog.py
python scripts/build-recovery-candidate-inventory.py
```

Visual fidelity check: the 12 Naturehike CDN media files from the Admin export
were downloaded to a temporary local directory and inspected as a contact sheet.
No image was uploaded or changed.
