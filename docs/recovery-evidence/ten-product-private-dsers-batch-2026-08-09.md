# Ten-product DSers remediation catalog — 2026-08-09

## Decision

The build now has **ten sourced product slots**. Nine have an organic-limited route decision; the semi-circular jewelry case remains a release hold until one exact colour and matching media are selected. This is not permission to publish all ten immediately and not permission to run ads.

Two products are already in the contained Shopify/Hydrogen launch catalog. Eight now also exist as private Shopify drafts with zero publications and no storefront approval tag. They remain customer-invisible until DSers mapping, exact media, copy, inventory, and market gates are checked.

The earlier rule that rejected every DSers variant showing `$0.00` was too strict. DSers frequently leaves the import-grid item-cost cell stale until a destination is selected. The corrected rule is:

1. select an exact option;
2. select a real city in Canada and the United States;
3. require a named tracked shipping method;
4. use the populated destination-specific option cost when available;
5. otherwise use the **highest** live supplier-comparison price as the conservative item cost;
6. require option stock of 20 or more for the initial one-order-at-a-time organic phase;
7. omit unsupported brand, material, waterproof, RFID, safety, or performance claims.

## Binding catalog matrix

FX used for planning: **US$1 = CA$1.4123**. Landed figures include the supplier shipping shown below but not Shopify payment fees, returns reserve, tax, duties, or customer acquisition. Customer duties remain DAP/customer-paid as disclosed in policy.

| # | Customer product | Exact supplier / DSers record | Exact sellable option | Stock evidence | Canada route and conservative landed | U.S. route and conservative landed | Target list price | Decision |
|---:|---|---|---|---|---|---|---|---|
| 1 | 3-piece packing cube set | Ali `3256805096956197`; DSers My Products `2086248705456865280` | `S3007 Black / 3PCS L M S Set`; SKU `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | aggregate 667; exact option recheck required before each early order | AliExpress Selection Standard, CN, US$12.45 + US$1.99, 8–13d, tracked; buffered landed CA$21.62 | **No Shipping** | CA$39.99 | CA organic-limited; U.S. blocked |
| 2 | Double-layer travel cable organizer | Ali `3256806610912521`; DSers My Products `2086248367047835648` | `Double Layers`; SKU `14:193#Double Layers` | store 65; supplier 57 | US$4.14 + US$1.99, 6–11d, tracked; CA$8.66 | US$4.14 + US$1.99, 6–11d, tracked; US$6.13 | CA$24.99 / US$19.00 | CA + U.S. organic-limited |
| 3 | Single white luggage tag | Ali `1005005973213007`; DSers Import `2086647790265434816` | `white / 1pcs`; SKU `14:29#white;5:361386#1pcs` | 9,965 | Selection Standard, US$2.21 + US$1.99, 8d; CA$5.93 | Selection Standard, US$1.39 + US$1.99, 8d; US$3.38 | CA$14.99 / US$10.99 | CA + U.S. organic-limited |
| 4 | Ten-hole white cable clips | Ali `1005004550863005`; DSers Import `2086655776362857152` | `10 Holes-White`; SKU `14:771#10 Holes-White` | 5,811 | Selection Standard, max item US$2.94 + US$1.99, 8d; CA$6.96 | Selection Standard, max item US$2.94 + US$1.99, 7d; US$4.93 | CA$14.99 / US$10.99 | CA + U.S. organic-limited |
| 5 | Six-piece stainless tube-squeezer set | Ali `1005005906323758`; DSers Import `2086654043964703424` | `6pcs`; SKU `14:200006154#6pcs` | 66 | Selection Standard, max item US$6.12 + US$2.16, 8d; CA$11.69 | Selection Standard, max item US$6.12 + US$1.99, 6d; US$8.11 | CA$24.99 / US$18.99 | CA + U.S. organic-limited |
| 6 | Semi-circular travel jewelry case | Ali `1005009878640464`; DSers Import `2086649305156158144` | single-colour option to be retained from its three-option grid; exact colour label remains a draft-release gate | option stocks 960 / 960 / 936 | Selection Standard, max item US$4.45 + US$2.16, 8d; CA$9.34 | Selection Standard, max item US$4.45 + US$1.99, 8d; US$6.44 | CA$22.99 / US$16.99 | **HOLD release** until exact colour and matching media are selected; describe as PU/faux leather only |
| 7 | Foldable handled clothes-storage bag | Ali `1005005504286671`; DSers Import `2086640965725979328` | `Large Blue`; SKU `14:350852#Large Blue` | supplier option 39 | Selection Standard, US$6.65 + US$2.16; CA$12.44 | **No Shipping** to Seattle in exact option check | CA$29.99 | CA organic-limited; U.S. blocked |
| 8 | Black hanging toiletry organizer | Ali `1005009589988221`; DSers Import `2086640609843872448` | `Black`; SKU `14:193#Black` | about 99,994 | Selection Standard, US$10.05 + US$1.99, 11d; CA$17.00 | Selection Standard, US$10.05 + US$1.99, 8d; US$12.04 | CA$39.99 / US$29.99 | CA + U.S. organic-limited |
| 9 | Gray travel shoe bag | Ali `1005008778310005`; private DSers import created 2026-08-09 | `Gray`; SKU `14:366#Gray` | exact option 20 | Selection Standard, US$5.04 + US$2.16; CA$10.17 | Selection Standard, US$2.31 + US$1.99; US$4.30 | CA$24.99 / US$18.99 | CA + U.S. organic-limited; one order at a time and recheck stock |
| 10 | White small wheeled under-sink bin | existing private DSers Import List record | `white S`; SKU `14:200003699#white S` | exact option 26 | Selection Standard, US$8.35 + US$2.16; CA$14.84 | Selection Standard, US$4.96 + US$1.99; US$6.95 | CA$29.99 / US$22.99 | CA + U.S. organic-limited; publish only if the store retains a small-space organization section |

## Storefront remediation rules

- The homepage hero must feature one exact product family. Do not overlay the cable-case card on packing-cube photography.
- Canada may expose all ten products after their draft checks. The United States must hide products 1 and 7.
- Product 10 should not be forced into the travel edit. Either present a separate **Small-space organization** section or leave it draft-only.
- Every product page must show only the selected option and exact matching media. Assorted colour/size collages are not acceptable when those variants are not purchasable.
- No `waterproof`, `RFID blocking`, `compression`, brand authorization, certified, or load-rating claim is allowed without exact documentary evidence.
- No ads until all ten Shopify drafts pass copy/media/market checks, tax presentation is verified, analytics events are smoke-tested, and at least the intended advertised bundle has a fresh DSers route check.

## Immediate implementation order

1. Create the eight new Shopify products as **Draft**, never Online Store published. Use `node scripts/create-candidate-product-drafts.mjs --apply`; the script is idempotent, fails closed, and never adds the storefront approval tag.
2. Keep only the exact options in this matrix; remove unsupported variants and images.
3. Apply the listed prices and market gates.
4. Run checkout and currency checks in Canada and the United States.
5. Replace the homepage mixed-product hero with a single-product packing-system hero.
6. Publish organically in two controlled waves: travel products first; small-space product 10 only in its own section.

## Mutation record

- Private DSers imports were added for inspection only.
- Eight Shopify drafts were created through the idempotent build script. All eight were API-verified as `DRAFT`, with zero publications and no `puchica-catalog-approved-v1` tag.
- Shopify draft IDs: `9367269736698`, `9367269769466`, `9367269802234`, `9367269867770`, `9367269933306`, `9367269966074`, `9367269998842`, and `9367270031610`.
- DSers did not automatically ingest the Shopify-created drafts during the immediate sync check; My Products remained at 31. Supplier mapping therefore remains a release gate, not an inferred success.
- No product in this verification pass was published, ordered, purchased, or advertised.
- Temporary destination changes in DSers product-detail drawers were discarded rather than saved.
