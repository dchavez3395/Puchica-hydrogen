# OAuth Scope Expansion — Action Required (2026-06-29 18:23)

The current OAuth token (`ddf2d9f5043ddfb4a2baedef8d7a34e5`) still
reports these scopes:
```
read_locations, write_files, write_inventory, write_products
```

After Daniel's "you should have every single permission now" at
18:20 CDT, I refreshed the token via client_credentials and the
scope string is unchanged. The new scopes (read_orders, read_customers,
read_publications, read_checkouts, read_analytics) are NOT in the
returned token.

## Why this happens

Three possible causes:

1. **Wrong app expanded.** If you expanded scopes on a different
   custom app on the store (not the one matching client_id
   `ddf2d9f5043ddfb4a2baedef8d7a34e5`), the changes don't affect
   our token.

2. **App needs re-install.** Shopify doesn't auto-apply new scopes
   to existing client_credentials grants. The flow is:
   - Configure scopes in admin
   - Uninstall the app
   - Re-install the app (re-consent)
   - New token picks up the new scopes

3. **App uses interactive OAuth instead of client_credentials.**
   Our integration uses client_credentials (machine-to-machine).
   Some apps only support interactive OAuth (redirect flow).
   In that case, expanding scopes only takes effect for new
   interactive installs, not for client_credentials.

## What to do

In Shopify admin:

1. **Settings → Apps and sales channels → Develop apps**
2. Find the app whose client_id is `ddf2d9f5043ddfb4a2baedef8d7a34e5`
   - Apps → "App credentials" tab → look at "Client ID"
3. **Configure → API access scopes** → confirm these are ALL enabled:
   - read_products ✓ (already have)
   - write_products ✓ (already have)
   - read_orders ✗ (need this)
   - read_customers ✗ (need this)
   - read_publications ✗ (need this)
   - read_checkouts ✗ (need this)
   - read_analytics ✗ (need this)
   - read_locations ✓ (already have)
   - write_files ✓ (already have)
   - write_inventory ✓ (already have)
4. **Save** if any are unchecked
5. **Install app** (or "Reinstall" if it's already installed)
6. Capture the new token (Settings → Apps → API credentials → Install)

Once the new token is saved to `.shopify-admin-token`, all blocked
scripts unblock immediately:
- scripts/cross_sell_metafields.py
- scripts/sales_weighted_pricing.py
- scripts/inventory_sell_through.py
- sales_channels_audit.py (publication counts)

## Alternative: send the new token to me directly

If you have the new token JSON, just paste it into
`E:\puchica-storefront\.shopify-admin-token` in this format:

```json
{
  "access_token": "shpat_...",
  "scope": "read_orders,read_products,read_customers,read_publications,read_checkouts,read_analytics,read_locations,write_files,write_inventory,write_products",
  "expires_in": 86399,
  "expires_at": 1782834468
}
```

I'll detect the new scope set on the next script run and proceed.

## What I can do while blocked

I can continue with everything that doesn't need orders/customer/
publication/checkout/analytics access. Today that includes:
- Catalog work (done)
- Google Shopping feed fix (done)
- Description quality audit (done)
- Sales channels audit (done)

What's blocked on the OAuth scope expansion:
- #3 cross-sell metafields
- #5 sales-weighted pricing
- #6 inventory + sell-through
- (Klaviyo is a separate blocker — needs Klaviyo API key)