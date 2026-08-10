# Organic release control plane — 2026-08-10

## Binding truth

- The controlled cohort is **nine product pages**, not ten product pages.
- Those pages contain **ten exact Canadian SKUs** because the luggage handle
  wrap has two approved colours.
- The United States has **eight exact SKUs**. The packing-cube option and Large
  Blue clothes-storage bag are Canada-only because the strongest exact route
  records show no U.S. shipping.
- Paid ads remain blocked. This release process authorizes only a deliberately
  executed organic launch after its live preflight passes.

## Why this is different from the earlier workflow

The release is now driven by one product-ID and exact-SKU manifest instead of
product titles, supplier-image similarity, aggregate listing stock, or legacy
Shopify tags. The default command is read-only and fails if a title, exact SKU,
price, inventory signal, market allowlist, product count, or Shopify state does
not match the manifest.

The apply mode performs two controlled operations:

1. It moves every non-cohort `ACTIVE` Shopify product to `DRAFT`, and removes it
   from the Online Store publication when necessary.
2. It adds the evidence and market-route tags, normalizes handles and product
   types, activates the nine cohort records, and publishes only those records
   to Online Store.

Postflight fails unless the exact nine products are the only active Shopify
products, all nine are published, all required evidence tags are present, and
every exact approved variant still has the expected price and positive stock.

## Commands

Read-only preflight:

```powershell
npm run organic-release-check
```

Organic release, only after reviewing the dry-run output:

```powershell
node scripts/manage-organic-release.mjs --apply --confirm-organic-only
```

Rollback the seven newly released products to contained drafts:

```powershell
node scripts/manage-organic-release.mjs --rollback
```

Rollback deliberately does not reactivate the rejected legacy catalog. The two
previously released, exact-gated products remain active.

## Operational order rule

For the first orders, process only one customer order at a time. Before placing
each supplier order, recheck the exact SKU's current stock and destination
route in DSers. Packing cubes may ship only to Canada. The Large Blue storage
bag may ship only to Canada. This is a watchpoint, not a requirement to buy a
sample before launch.

## Remaining growth gap

Ten Canadian SKUs are not the same as ten product pages. A tenth page must not
be invented to satisfy a visual count. It should be added only after a new
coherent organizer passes the same exact-SKU, cost, stock, route, copy, and
imagery gates. Organic learning can begin with nine pages; paid acquisition
remains paused until checkout/tax telemetry and early fulfillment are reviewed.
