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

## Superseding preview result

The independent fresh-context auditor issued a functional **PASS** on the superseding private Oxygen preview:

- Canada exposed exactly packing cubes at CA$39.99 and the cable organizer at CA$24.99.
- Canada accepted both exact approved variants and showed a CA$64.98 cart.
- Switching that cart to the United States automatically removed the Canada-only packing cubes and retained the cable organizer at US$19.00.
- The Shopify U.S. checkout loaded with the cable organizer only. No checkout submission or order occurred.
- Direct route matrix: Canada packing 200 / cable 200 / toiletry 404; United States packing 404 / cable 200 / toiletry 404.
- The homepage, collection, mobile navigation, About page, and search prompts no longer expose the held toiletry item.
- Each product rendered exactly one approved variant image: `Sbeb36a7c05ed495fbad54adc75fbfb1cC.webp` for the charcoal 3-piece packing set and `S7a92614fd71b4e70b1612704b2391995y.webp` for the black double-layer cable organizer.

The private preview's required custom authentication header prevented an interactive browser-console audit. The locked product route no longer sends the removed supplier option matrix through Hydrogen's option mapper, eliminating the known missing-option warning path. Automated tests, lint, launch check, production build, and the preview functional gate are still required after this final source change.

This functional pass authorizes a controlled storefront release only. It does not authorize paid ads; address-specific shipping rates and analytics receipt remain separate paid-acquisition gates.

### Final snapshot after option-mapper removal

- Private Oxygen preview: `https://01kzks7rdytrx91kqnzwfa2t4f-96696c77fd963319c44d.myshopify.dev`
- Tests: 56/56 passed.
- Lint: 0 errors; 31 pre-existing debug-script warnings.
- Release control: passed for exactly two Canada SKUs and one United States SKU.
- Production build: passed.
- Final preview cart smoke repeated successfully: both items added in Canada; the United States switch purged packing cubes and retained the cable organizer with a checkout URL.
- Final route matrix repeated: Canada 200/200/404 and United States 404/200/404 for packing/cable/toiletry.

No order, payment, ad spend, or checkout submission occurred.

## Production release result

- Release commit: `1f158a1` (`release: reopen audited travel storefront`).
- Commit pushed to `origin/main` and deployed to the Oxygen Production environment.
- Live homepage returned 200 with `CA · CAD · EN` and links to exactly packing cubes plus the cable organizer.
- Live production cart smoke repeated the preview result: both products added in Canada; switching to the United States removed packing cubes, retained the cable organizer, and exposed the U.S. checkout handoff.
- Live route matrix repeated: Canada 200/200/404 and United States 404/200/404 for packing/cable/toiletry.
- No order, payment, checkout submission, ad activation, or ad spend occurred.
