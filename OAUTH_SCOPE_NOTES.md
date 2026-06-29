# OAuth Token Scope Audit (2026-06-29 18:08)

Current token scopes: `read_locations, write_files, write_inventory, write_products`

## What works
- All product reads/writes
- Inventory writes
- File writes (metafields, themes — but only if we own the file)
- Location reads

## What's blocked

| Field | Required scope | Used by | Impact |
|---|---|---|---|
| `orders` | `read_orders` | #3 cross-sell, #5 sales-weighted pricing, #6 sell-through | Can't compute recommendations from order history |
| `customers` | `read_customers` | #4 Klaviyo (some flows) | Can still push emails but can't pull customer lists |
| `shop` (some fields) | varies | diagnostics | Limited |
| `abandonedCheckouts` | `read_checkouts` | abandoned cart analytics | Limited |
| `analytics` | `read_analytics` | traffic/conversion data | Limited |

## How to fix

The Puchica Shopify app needs to be re-installed with additional
scopes. Steps:

1. In Shopify admin: **Settings → Apps and sales channels → Develop apps**
2. Find the app whose client_id matches `ddf2d9f5043ddfb4a2baedef8d7a34e5` (or whatever app is wired to this OAuth client)
3. **Configure → API access scopes** → enable:
   - `read_orders`
   - `read_checkouts`
   - `read_customers`
   - `read_analytics`
   - `read_draft_orders` (sometimes useful)
4. **Save → Install app** → Shopify will redirect to OAuth re-consent
5. Capture the new access_token (24h expiry) → update `.shopify-admin-token`

Alternative: create a new OAuth install with the right scopes. The
client_id stays the same; only the consent screen changes.

## What I built but can't run yet

- `scripts/cross_sell_metafields.py` (#3) — needs read_orders
- `scripts/sales_weighted_pricing.py` (#5) — needs read_orders
- `scripts/inventory_sell_through.py` (#6) — needs read_orders

These are ready in the repo, blocked on the OAuth scope expansion.

## What works without scope change

- All catalog work (already done today)
- Google Shopping feed fix (#1, applied)
- Klaviyo config (#4) — just needs Klaviyo API key, no Shopify scope change
- Description rewrites (#7) — pure catalog, no order data needed

## Token file location

`E:\puchica-storefront\.shopify-admin-token` — gitignored, 24h
expiry. The token's "scope" field tells us what we have.