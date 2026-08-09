# DSers luggage-cubes controlled draft mapping — 2026-08-08

## Authorized action and containment

One pre-existing private DSers Import List product was pushed once to Shopify for a controlled mapping inspection:

`Luggage Cubes Organizer Portable Travel Storage Bag Compressible Packing Cubes Foldable Waterproof Travel Suitcase Nylon Handbag`

- DSers Import List source ID: `2084090269289939648`
- `Set product status as Draft`: enabled before confirmation
- `Also publish to Online Store`: disabled before confirmation
- No launch-approval tag was added.
- No Hydrogen publication, order, supplier replacement, mapping save, or purchase occurred.

## Created records

- Shopify product ID: `9365959672058`
- Shopify GID: `gid://shopify/Product/9365959672058`
- Shopify status confirmed in admin: **Draft**
- Shopify handle: `luggage-cubes-organizer-portable-travel-storage-bag-compressible-packing-cubes-foldable-waterproof-travel-suitcase-nylon-handbag`
- Shopify channels shown in product table: `0`
- DSers My Products ID: `2086248705456865280`
- Exact supplier item ID recovered from the mapped title link: `3256805096956197`
- Exact supplier URL: `https://www.aliexpress.us/item/3256805096956197.html?supplyId=159831080&gatewayAdapt=glo2usa4itemAdapt&_randl_shipto=US`

## Product economics and stock exposed after push

- DSers supplier cost: US$11.50–13.32
- DSers converted cost: CA$16.04–18.58
- DSers generated Shopify price: CA$40.11–46.46
- DSers card stock: 667
- Shopify admin stock after creation: 663 across 8 variants
- Variants exposed by mapping:
  - S3007 Black / 3PCS L M S Set
  - S3001 Black / 3PCS L M S Set
  - S3008 blue / 3PCS L M S Set
  - S3003 Navy blue / 3PCS L M S Set
  - S3005 sky blue / 3PCS L M S Set
  - S3002 Red / 3PCS L M S Set
  - S3006 Grey / 3PCS L M S Set
  - S3004 Grey / 3PCS L M S Set

## Mapping inspection

### Basic Mapping

- A Default Supplier is present and has the same exact supplier title.
- No Backup Supplier is selected.
- Store options and supplier options display the same eight colors and one size label, `3PCS L M S Set`.

### Advanced Mapping

Advanced Mapping displays all eight store variants, but every row contains:

- `Please select a supplier`
- `Please select a variant`
- `Set Quantity`

No per-variant supplier, supplier SKU, or quantity is assigned in Advanced Mapping. No country-specific Canada or United States supplier mapping is configured or exposed.

## Route result

Exact Canada and United States route cost, ETA, tracking, and ship-from could **not** be validated from this mapped record. The push drawer showed shipping cost CA$0.00 and shipping method `-`, which is not a supplier route quote and must not be used for margin or delivery claims.

## External-state note

DSers My Products count rose from 29 to 31 during the interval. The controlled luggage-cubes draft is one new record. A separate Data Cable Storage Bag draft (`DSers 2086248367047835648`, Shopify `9365959246074`) also appeared, but it was not selected or touched in this controlled action; this report does not attribute its creation without evidence.

## Decision and rollback

**HOLD — successful contained draft creation, failed country/variant mapping gate.**

Do not add launch-approval tags, publish, price for ads, or treat the product as order-ready until exact sellable-option stock and tracked Canada + United States routes are validated and Advanced Mapping is intentionally configured if country-specific suppliers are required.

Rollback path:

1. Delete or archive Shopify draft product `9365959672058` in Shopify admin.
2. Delete DSers My Products record `2086248705456865280` if the test record is no longer required.
3. The original private Import List record may still be retained separately; do not delete it as part of My Products rollback unless intentionally cleaning the sourcing queue.
