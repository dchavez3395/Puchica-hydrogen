# Puchica production health runbook — 2026-08-14

## Purpose

Run one repeatable, read-only check against production before daily organic
work and after every deployment. It verifies the exact public Canada and United
States product sets, feed and sitemap discovery, localized routing, and the
fail-closed headers on every held product.

## Command

```powershell
npm run production-health
```

For a machine-readable log:

```powershell
npm run production-health -- --json
```

For an Oxygen preview or another explicit host:

```powershell
npm run production-health -- --base-url https://example-preview-host
```

## Safety boundary

The monitor sends only `GET` requests. It does not add a product to cart, create
or update a cart, enter checkout, place an order, submit customer information,
capture payment, or contact a supplier. The `US` checks use only the
`pk_market=US` market-selection cookie.

## Pass condition

- Core storefront, cart entry, robots, sitemap, feed, and French PDP return
  HTTP 200.
- The Instagram `link_in_bio` URL preserves its attribution parameters and
  resolves to the secure production homepage.
- Exactly six verified handles appear in the Canada feed and product sitemap.
- All six Canada product routes return HTTP 200 in the Canada market.
- Exactly four verified product routes return HTTP 200 in the United States.
- The Canada-only packing cubes and luggage tag return HTTP 404 with
  `Cache-Control: no-store` and `X-Robots-Tag: noindex` in the United States.
- Every operationally held product returns the same fail-closed response in
  both markets.

Any failure is a stop signal for the affected route or market. Do not compensate
by approving another supplier product from memory or by changing the expected
set merely to make the monitor green; reconcile fresh Shopify and DSers evidence
first.
