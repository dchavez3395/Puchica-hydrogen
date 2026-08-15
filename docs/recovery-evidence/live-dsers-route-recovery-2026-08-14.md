# Live DSers route recovery — 2026-08-14

## Decision

Restore the exact audited SKUs for the Large Blue storage bag, Black hanging
toiletry organizer, White luggage tag in the U.S., and both handle-wrap colours.
Keep the storage bag Canada-only. Keep paid advertising off.

The production build deployed at 11:43 CDT intentionally held the storage bag,
toiletry organizer, and handle wrap because an earlier same-day DSers check
returned missing routes. A later read-only recheck in the authenticated DSers
account resolved each exact SKU to an available tracked route.

## Fresh route evidence

All quotes used **AliExpress Selection Standard**, shipped from **CN**, and
reported tracking as **Available**.

| Customer offer | Exact supplier SKU / DSers selector | Canada | United States | Storefront decision |
| --- | --- | --- | --- | --- |
| Large Blue storage bag | `14:350852#Large Blue` / `Large Blue` | US$1.99, 7–12 days | US$1.99, 7–12 days | Restore Canada; keep U.S. held |
| Black hanging toiletry organizer | `14:771#Black` / `Black` | US$1.99, 8–13 days | US$1.99, 8–13 days | Restore CA + U.S. |
| White luggage ID tag | `14:29#white;5:361386#1pcs` / `white-1pcs` | US$1.99, 9–15 days | US$1.99, 9–14 days | Keep CA; restore U.S. |
| Handle wrap — Coffee Brown | `14:350686#coffee color` / `coffee color` | US$1.99, 10–15 days | US$1.99, 10–15 days | Restore CA + U.S. |
| Handle wrap — Black | `14:193#Black` / `Black` | US$1.99, 10–15 days | US$2.16, 9–15 days | Restore CA + U.S. |

## Existing launch-SKU reconfirmation

The other exact launch offers were also rechecked in the same authenticated
DSers session. Every route used the same tracked CN method and was available:

| Customer offer | Canada | United States |
| --- | --- | --- |
| Black double-layer cable organizer (`14:193#Double Layers`, selector `Double Layers 1`) | US$2.16, 7–13 days | US$1.99, 7–12 days |
| Charcoal 3-piece packing cubes (`14:1052#S3007 Black;5:200004186#3PCS L M S Set`) | US$1.99, 8–14 days | Supplier route exists at US$1.99, 8–14 days; storefront remains held |
| Ten-hole white cable clips (`14:771#10 Holes-White`) | US$1.99, 8–14 days | US$1.99, 8–14 days |
| White jewelry case (`14:29`) | US$1.99, 9–14 days | US$1.99, 9–14 days |
| Black wheel covers (`14:193`) | US$1.99, 8–14 days | US$1.99, 8–14 days |

Every other currently in-stock Shopify variant on the two multi-variant
supplier records was also checked. Those supplier routes exist, but the
Hydrogen exact-SKU gate continues to expose only the audited customer offers.

## Financial screen

Shopify Admin unit costs and the fresh Canada shipping quotes were screened at
a planning FX rate of CA$1.40 per US$1, a conservative 3.5% + CA$0.30 payment
fee, and a 5% refund/exception reserve. The recovered products remain
contribution-positive before advertising:

| Product | Price CAD | Item cost CAD | Planned pre-ad contribution CAD |
| --- | ---: | ---: | ---: |
| Black hanging toiletry organizer | 39.99 | 11.59 | 21.91 |
| Large Blue storage bag | 29.99 | 4.89 | 19.46 |
| Handle wrap — Black | 14.99 | 4.31 | 6.32 |
| Handle wrap — Coffee Brown | 14.99 | 4.32 | 6.31 |

## Release guardrails

- Do not deploy until the full automated test suite and production health suite
  pass on the release commit.
- Re-run the live production catalog and direct-PDP checks immediately after
  deployment.
- Keep paid advertising at CA$0 until a real organic order is fulfilled and the
  first-delivery evidence is recorded.
- Recheck the exact SKU, inventory, route, and quote before every supplier
  order. No supplier order was placed during this audit.

## Production deployment and storefront verification

- Shopify Oxygen deployment `#5253276` is **Production / Current / Complete /
  Ready** for commit `2c36934` on `codex/overnight-growth-2026-08-14`.
- The supplier-route release itself is deployment `#5253174`, commit `0407508`.
- The final automated suite passed `82/82`; the production build completed.
- The Canada collection exposed nine approved product pages. A fresh direct
  HTTP check returned `200`, an H1, and Add-to-cart markup for all nine:
  handle wrap, cable clips, jewelry case, cable organizer, Large Blue storage
  bag, packing cubes, white luggage tag, black toiletry organizer, and black
  wheel covers.
- The United States matrix remains eight approved SKUs across seven PDPs. The
  handle-wrap PDP contains two approved colours; packing cubes and the Large
  Blue storage bag remain Canada-only.
- A reversible Canada cart check added the Black handle wrap at CA$14.99 and
  removed it again. The cart was empty afterward. Checkout was not opened.
- No order, supplier order, payment, advertising spend, or other purchase was
  made.

## Browser-instrumentation note

The controlled QA browsers inject their own document-root nodes before React
hydrates (`#codex-browser-sidebar-comments-root` in the in-app browser and
`#codex-agent-overlay-root` plus a temporary favicon mutation in controlled
Chrome). Those mutations reproduce React hydration warnings even on unchanged
builds and are not storefront DOM output. Raw production HTML retains one
`html` element, one `body`, valid closing tags, and the nine live PDP checks
above. No additional storefront change was made in response to the
tool-injected warning.
