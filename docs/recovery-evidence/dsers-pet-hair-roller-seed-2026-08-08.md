# DSers pet-hair roller seed audit — 2026-08-08

## Decision

**REJECT — AliExpress 1005008878462390 is not an approved full-size pet-hair roller.**

The exact ID resolves publicly to a compact washable gel lint-roller ball, not the full-size self-cleaning roller described in the sourcing brief. DSers Find Products returns `No Data` for the exact ID, so there is no DSers Sale count, option-level stock, or Canada/United States route to validate. The product therefore fails both identity and fulfillment verification.

No product was imported, mapped, ordered, or otherwise changed.

## Exact seed evidence

| Field | Verified result | Evidence quality |
|---|---|---|
| AliExpress item ID | `1005008878462390` | Exact-ID public index |
| Exact indexed title | Reusable Pet Hair Remover Roller Washable Fur Remover for Clothes Lint Cleaner for Cats Dogs Portable Animal Hair Removal Tool | Exact-ID public index |
| Product identity | Compact/pocket washable gel lint-roller ball in a plastic casing; **not verified as the requested full-size self-cleaning roller** | Merchant mirror with exact indexed title; useful for mismatch screening, not supplier fulfillment proof |
| Visible rating | 4.6 | Exact-ID Pricearchive index |
| DSers Sale count | Not exposed | DSers exact-ID result was `No Data` |
| Ordinary/public indexed price | US$6.05 on 2026-08-08; Pricearchive range US$4.88–US$6.78 | Exact-ID Pricearchive index; not an option-level DSers quote |
| Planning CAD equivalent | **CA$8.44** at the project planning FX `1 USD = 1.3943 CAD` | Arithmetic only; shipping excluded |
| Public-index CAD display | C$8.79 | Pricearchive's own exchange-rate display; not used for project economics |
| Visible options | Merchant mirror lists 1PCS/2PCS/3PCS/4PCS in Green or White | Mirror evidence only; not verified on DSers/AliExpress option inventory |
| Material | Gel roller inside a plastic casing; the mirror's upstream attribute text also mentions PP and ABS/silicone inconsistently | Conflicting mirror evidence; supplier specification unverified |
| Included parts | One travel lint-roller ball for a 1PCS option; multipack contents scale by option | Mirror evidence only |
| Surface claims | Clothes, sheets, sofas, blankets, and tables; rinse under running water and dry before reuse | Mirror marketing copy; no independent performance validation |
| Option stock | Not exposed | DSers exact-ID result was `No Data` |
| Canada shipping / ETA / tracking / ship-from | **Unverified** | No DSers result/route |
| United States shipping / ETA / tracking / ship-from | **Unverified** | No DSers result/route |

Sources:

- Exact-ID price/title/rating index: https://www.pricearchive.org/aliexpress.com/item/1005008878462390
- Same-title merchant mirror used only to screen identity, options, materials, contents, and surface claims: https://www.walmart.com/ip/18325165072

## Allowed close-match fallback

DSers' image optimizer stayed on its comparison shell without returning supplier rows for the exact indexed product image. Keyword searches for `washable reusable pet hair remover roller` and `pet hair roller` also returned `No Data`. Three visually/semantically close exact IDs were then checked individually in DSers. This was the maximum allowed fallback.

| Exact item ID | Public indexed description | Public price / rating | DSers exact-ID result | Decision |
|---|---|---|---|---|
| `1005008451829063` | Large washable/self-cleaning cat and dog hair roller for furniture/sofa | US$8.82; rating 4.5 | `No Data` | HOLD — no Sale/options/stock/routes |
| `1005006271055511` | Reusable multipurpose sofa/clothes pet lint roller brush | US$6.93; rating 4.7 | `No Data` | HOLD — no Sale/options/stock/routes |
| `1005012238083950` | Portable washable pet-hair remover roller | US$6.26; rating not exposed in the index result | `No Data` | HOLD — no Sale/options/stock/routes |

These alternatives were selected by visual/semantic proximity. **They could not be ranked by DSers Sale because DSers exposed no product rows or Sale values for any of them.** None is approved or import-ready.

Public alternative-index source: https://www.pricearchive.org/search/aliexpress.com/reusable-lint-roller-pet-hair-remover-tool/1

## Gate outcome

- Exact product identity: **FAIL**
- Supplier demand evidence (DSers Sale): **FAIL / unavailable**
- Exact neutral option and stock: **FAIL / unavailable**
- Canada tracked route: **FAIL / unavailable**
- United States tracked route: **FAIL / unavailable**
- Item-only cohort economics: CA$8.44 before shipping, leaving too little confidence for the two-item CA$12 combined landed target: **FAIL pending route, but identity failure already controls**

The correct next step is to discard this seed and source a genuinely full-size roller from a supplier surface that exposes exact option stock and repeatable Canada/United States routes. Do not revive any of the three held alternatives without those exact checks.
