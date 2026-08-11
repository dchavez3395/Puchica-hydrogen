# Live SEO and indexability gate — 2026-08-10

## Decision

- **English catalog crawl:** PASS for the frozen market matrix.
- **French and Spanish product alternates:** PASS.
- **Portuguese product alternate status/H1:** PASS, but the deployed canonical was wrong and is being repaired in the same bounded release.
- **Market-unavailable product response:** correct HTTP 404, but the deployed response lacked an explicit `X-Robots-Tag`; the same bounded release adds `noindex, nofollow` and `no-store` headers.
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

## Live close conditions for this repair

After deployment, rerun:

1. one representative `pt-br` product and confirm its canonical exactly matches the prefixed URL;
2. both U.S.-blocked product URLs and confirm HTTP 404 plus `X-Robots-Tag: noindex, nofollow` and `Cache-Control: no-store, max-age=0`;
3. the 9-CA / 7-US / 2-US-404 matrix to confirm no release regression.

The separate representative address-to-shipping-rate checkout matrix is not closed by an SEO crawl and remains a pre-ad gate. No address or payment data was submitted in this run.
