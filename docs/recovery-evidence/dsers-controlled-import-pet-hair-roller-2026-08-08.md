# DSers controlled Import List test — pet-hair roller — 2026-08-08

## Decision

**REJECT for the two-product pet-hair cohort.**

AliExpress item `1005006271055511` successfully imported into the private DSers Import List and exposes working, tracked Canada and United States routes. However, the best-stocked variant lands at approximately **CA$9.52**, consuming nearly the entire **CA$12 combined two-item cohort ceiling**. The neutral White option lands at approximately CA$9.34 but has only three units in stock. Product identity/material/inclusion evidence is also weaker than required for launch copy.

This is not a route failure. It is a cohort-economics and stock-quality failure.

No product was pushed, mapped, published, ordered, or sent to Shopify.

## Controlled mutation record

| Field | Result |
|---|---|
| Exact source URL added | https://www.aliexpress.com/item/1005006271055511.html |
| DSers private Import List product ID | `2086237783867130560` |
| Import-list count change | 21 → 22 |
| Exact DSers title | Pet Hair Remover Reusable Pet Lint Roller Brush Multi-purpose Sofa Clothes Hair Sticker Roller Sticker Lint Remover |
| Store state | Private Import List only; not pushed or mapped |
| Recoverable deletion state | A visible, enabled per-product `Delete` button is present on the record. It was **not** clicked. |

## Exact option data

Planning FX: `1 USD = 1.3943 CAD`.

| Option | Supplier SKU | Item cost | Stock | CA route | US route | Landed USD | Planning landed CAD |
|---|---|---:|---:|---|---|---:|---:|
| Red | `14:10#Red` | US$4.84 | 26 | AliExpress Selection Standard; CN; US$1.99; 9–13 days; tracking Available | AliExpress Selection Standard; CN; US$1.99; 9–13 days; tracking Available | US$6.83 | **CA$9.52** |
| White | `14:29#White` | US$4.71 | 3 | AliExpress Selection Standard; CN; US$1.99; 9–13 days; tracking Available | AliExpress Selection Standard; CN; US$1.99; 9–13 days; tracking Available | US$6.70 | **CA$9.34** |

DSers shows no tax/import-charge estimate for either variant (`US$0.00` in its variant table). This is not proof that customer duties/taxes will always be zero.

### Cohort economics

- Red leaves only **CA$2.48** of the CA$12 combined landed ceiling for Product 2.
- White leaves only **CA$2.66**, but has only three units.
- Neither option is a defensible component of a two-item cohort under the current cap.

## Physical and catalog metadata

| Field | Result | Confidence |
|---|---|---|
| Reference weight | 0.11 kg | DSers import detail |
| Parcel dimensions | 27 × 14 × 5 cm | DSers import detail |
| Options | Red and White only | DSers import detail |
| Supplier images | 14 exposed; DSers shows 7/14 selected by default | DSers import detail |
| Variant image — Red | https://ae01.alicdn.com/kf/S6cfd0138c10d478fb369d88965596ce1h.jpg | DSers variant table |
| Variant image — White | https://ae01.alicdn.com/kf/Sa8963766ac8c4583a1bc7f9e41b0064ft.jpg | DSers variant table |
| Material | Plastic | Exact-title marketplace mirrors only; **not independently supplier-verified in the accessible DSers fields** |
| Mechanism/style | Manual lint-sticking roller/brush | Exact-title marketplace mirrors only |
| Intended surfaces | Supplier title explicitly names sofa and clothes; mirrors classify it for pet hair | Title/mirror evidence; do not expand to skin, pet grooming, hard floors, or delicate fabrics without testing |
| Included parts | Appears to be one roller brush per selected Red or White SKU; no accessory/bundle option is exposed | Inference from two single-color SKUs and images; supplier inclusion statement not exposed |

DSers reports imported description sections of 822 specification characters and 2,142 overview characters, but the embedded editor contents were not exposed through the accessible read-only page state. Their mere presence is not treated as verified material or inclusion evidence.

Corroborating exact-title mirror used only for material/style and Red/White option context: https://www.ebay.com/itm/306917853314

## Gate result

| Gate | Outcome |
|---|---|
| Exact source imported privately | PASS |
| Exact option and option stock exposed | PASS |
| Canada tracked route | PASS |
| United States tracked route | PASS |
| Neutral option stock | **FAIL — White stock 3** |
| Cohort landed-cost ceiling | **FAIL — CA$9.34–CA$9.52 before Product 2** |
| Material/inclusion certainty | HOLD / insufficient |
| Final cohort decision | **REJECT** |

The record may remain temporarily in the private Import List for audit continuity because it has a visible per-record Delete control. It must not be pushed or mapped without a new explicit decision.
