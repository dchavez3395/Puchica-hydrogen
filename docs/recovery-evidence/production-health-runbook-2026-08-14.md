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

To check for a genuine order without exposing customer contact or street
address data:

```powershell
npm run first-order-signal
```

The order signal reads the previous seven days by default. Set
`PUCHICA_ORDER_SIGNAL_SINCE` to an ISO timestamp when a longer fixed monitoring
window is required.

For an Oxygen preview or another explicit host:

```powershell
npm run production-health -- --base-url https://example-preview-host
```

## Safety boundary

The storefront monitor sends only `GET` requests. The order-signal monitor sends
one read-only Shopify Admin GraphQL query and prints only order identifiers,
statuses, market, total, product handle, SKU, and quantity. Neither command adds
a product to cart, creates or updates a cart, enters checkout, places an order,
submits customer information, captures payment, fulfills an order, or contacts
a supplier. The `US` storefront checks use only the `pk_market=US`
market-selection cookie.

## Pass condition

- Core storefront, cart entry, robots, sitemap, feed, and French PDP return
  HTTP 200.
- The Instagram `link_in_bio` URL preserves its attribution parameters and
  resolves to the secure production homepage.
- Exactly nine verified handles appear in the Canada feed and product sitemap.
- All nine Canada product routes return HTTP 200 in the Canada market.
- Exactly seven verified product routes return HTTP 200 in the United States.
- The Canada-only packing cubes and Large Blue storage bag return HTTP 404 with
  `Cache-Control: no-store` and `X-Robots-Tag: noindex` in the United States.
- Every operationally held product returns the same fail-closed response in
  both markets.

The first-order signal has three outcomes:

- `WAITING` / exit 0: no genuine actionable order; test, canceled, fully
  refunded, voided, expired, and zero-total orders are excluded.
- `ACTION_REQUIRED` / exit 2: one genuine order contains only exact SKUs
  approved for its destination market; pause before supplier payment and run
  the live DSers cost/stock/route recheck.
- `BLOCKED` / exit 1: an order contains an unapproved SKU or market, lacks an
  active line, or more than one early customer order needs review. Do not place
  a supplier order.

Any failure is a stop signal for the affected route or market. Do not compensate
by approving another supplier product from memory or by changing the expected
set merely to make the monitor green; reconcile fresh Shopify and DSers evidence
first.
