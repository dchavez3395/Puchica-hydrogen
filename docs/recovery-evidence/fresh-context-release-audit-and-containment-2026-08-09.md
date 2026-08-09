# Fresh-context release audit and containment — 2026-08-09

## Binding status

**Production is intentionally contained. Do not run ads or reopen commerce until the preview release gate below passes.**

The independent fresh-context audit invalidated the prior launch approval. A Canadian-only packing-cube line remained in the cart after switching the storefront to the United States, repriced in USD, and retained an enabled checkout path. Direct U.S. product-route blocking worked, but it did not protect a cart created before the market change.

## Additional release-invalidating findings

- Product cards and galleries showed configurations and colours that were not the exact approved Shopify variant.
- The toiletry organizer showed visible Naturehike branding without documented authorization. It is removed from the approved launch set and placed on operational hold.
- The earlier launch check was primarily source/test coverage and did not reproduce the stale-cart market-switch sequence against a deployed storefront.
- Analytics receipt and address-specific checkout shipping rates remain unverified release checks; code presence alone is not treated as evidence.

## Containment completed

- Emergency containment commit: `f067f49` (`hotfix: contain storefront after market cart bypass`).
- Commit pushed to `origin/main` and deployed to Oxygen.
- Product, collection, search, cart, and checkout paths are blocked by `STOREFRONT_CONTAINMENT_ACTIVE=true`.
- The homepage now has a contained-state message in the permanent hotfix so the storefront does not display stale launch merchandising while shopping is paused.

## Permanent hotfix implemented locally

- Synchronize the Shopify cart buyer country to the selected storefront market.
- Re-query every existing cart variant and remove lines whose SKU/product evidence is not approved for that market before exposing cart or checkout state.
- Fail closed when market synchronization or line removal cannot be confirmed.
- Apply the same safe-cart operation in root cart loading, cart actions/loaders, cart sync, and market switching.
- Use only the exact approved variant image on discovery cards and product galleries.
- Remove `travel-toiletry-organizer` / `14:100018754#BK-L` from the approved launch set.
- Require an approved available variant in collection/home filtering.

## Current candidate catalog after the hotfix

- Canada: packing cube set and cable organizer only, pending preview verification.
- United States: cable organizer only, pending preview verification.
- Toiletry organizer: operational hold; not sellable or advertised.

This is not a claim that either market is reopened or ad-ready.

## Verification completed

- Automated tests: 56/56 passing.
- Lint: 0 errors (existing debug-script warnings only).
- Production build: passed.
- `git diff --check`: passed before this evidence record.

## Required preview gate before reopening

1. Deploy the hotfix to a private Oxygen preview while production remains contained.
2. In Canada, add the exact approved packing-cube SKU and cable-organizer SKU.
3. Switch to the United States and confirm the packing-cube line is removed while the cable-organizer line remains valid.
4. Confirm direct U.S. routes for Canada-only products remain unavailable.
5. Confirm only exact approved variant media appears on cards and PDPs.
6. Confirm no hydration or missing-option errors occur in the tested flows.
7. Confirm an analytics event is received and capture address-based Canadian and U.S. checkout shipping rates before paid acquisition.

Any failure keeps production contained. Reopening requires a separate production release decision after the preview evidence is recorded.
