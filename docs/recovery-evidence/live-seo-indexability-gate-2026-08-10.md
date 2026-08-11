# Live SEO and indexability gate — 2026-08-10

## Decision

- **English catalog crawl:** PASS for the frozen market matrix.
- **French and Spanish product alternates:** PASS.
- **Portuguese product alternate status/H1/canonical:** PASS live.
- **Market-unavailable product response:** PASS live at HTTP 404 with explicit
  `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store, max-age=0`.
- **Organic commerce:** may remain live. Paid traffic stays paused for the separate analytics, real-device, address/rate, and first-order gates.

## Robots and sitemap

`https://puchica.ca/robots.txt` returned HTTP 200 and permits approved `/products` and `/collections` routes. It blocks cart, account, API, search, campaign, discount, filtered/sorted collection, and policy-index paths as intended. It declares `https://puchica.ca/sitemap.xml`.

The sitemap index returned HTTP 200 and links product and page sitemaps. The product sitemap contains exactly the nine frozen product-page URLs. The pages sitemap includes home, `/collections/all`, About, Contact, FAQ, and Shipping.

Every product sitemap entry supplies reciprocal `en`, `fr`, `es`, and `pt-br` alternates. Rendered product pages also expose `x-default`.

## Exact market crawl

Every HTTP 200 product response had one H1, a canonical URL, five rendered hreflang links, Product JSON-LD, and no `noindex` directive.

| Market | Expected result | Observed |
|---|---:|---:|
| Canada | 9 product pages at HTTP 200 | 9 / 9 |
| United States | 7 product pages at HTTP 200 | 7 / 7 |
| United States | packing cubes + Large Blue storage bag at HTTP 404 | 2 / 2 |

The two U.S.-blocked pages did not expose Product JSON-LD. This matches the exact CA-only route evidence and storefront SKU gate.

## Localized crawl

All 27 non-English product URLs advertised by the sitemap returned HTTP 200 with one H1:

| Locale | URLs tested | HTTP 200 |
|---|---:|---:|
| French | 9 | 9 |
| Spanish | 9 | 9 |
| Portuguese (`pt-br`) | 9 | 9 |

French and Spanish pages self-canonicalized correctly. All nine Portuguese pages incorrectly canonicalized to the unprefixed English URL because Shopify's `PT_BR` language enum was lowercased to `pt_br`, while the SEO allowlist expects `pt-br`.

## Bounded repair

`app/routes/products.$handle.jsx` now normalizes Storefront language enum underscores to URL hyphens before choosing the SEO locale. It also routes every product-not-found outcome through one fail-closed response with:

- HTTP 404;
- `Cache-Control: no-store, max-age=0`;
- `X-Robots-Tag: noindex, nofollow`.

Regression tests cover both the `PT_BR` normalization and all four product 404 call sites.

Validation before deployment:

- 67 / 67 tests passed;
- release check passed;
- lint completed with 0 errors and 31 pre-existing utility-script warnings;
- clean client and SSR production builds completed successfully.

## Live production closure

The bounded repair is live at commit
`fe1c7e89872bacbb40de1ceafdad5560ff7d764f`, Oxygen asset `4183654`, and client
bundle `entry.client-CUoq0yXM.js`. Shopify CLI build, upload, completion, and
routability verification exited successfully. The public custom domain
returned HTTP 200.

Post-deployment verification passed:

1. `https://puchica.ca/pt-br/products/travel-cable-organizer-case`
   self-canonicalized to that exact prefixed URL;
2. both U.S.-blocked product URLs returned HTTP 404 plus
   `X-Robots-Tag: noindex, nofollow` and
   `Cache-Control: no-store, max-age=0`;
3. the final route matrix passed 9/9 Canadian HTTP 200 pages, 7/7 U.S. HTTP 200
   pages, and 2/2 intended U.S. HTTP 404 pages.

The separate representative address-to-shipping-rate checkout matrix is not
closed by this SEO crawl and remains a pre-ad gate. No address, order, payment,
catalog, DSers, discount, or advertising mutation occurred in this run.
