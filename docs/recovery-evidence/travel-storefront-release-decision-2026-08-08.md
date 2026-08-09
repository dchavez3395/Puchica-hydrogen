# Puchica travel storefront release decision — 2026-08-08

## Binding decision

Puchica is a focused three-product travel-organization shop. Stop product
sourcing and niche switching. DSers remains the fulfillment app; AutoDS is not
required for this release.

The earlier Advanced Mapping concern was a false blocker. These products use a
single supplier per Shopify variant, so correct Basic Mapping is sufficient.
DSers showed `Unmapped(0)` after the Shopify title, option, and price updates.

## Release cohort

| Product | Shopify product | DSers My Products | Customer price | Release state |
|---|---|---|---:|---|
| 3-Piece Packing Cube Set — Small, Medium & Large | `9365959672058` / `3-piece-packing-cube-set` | `2086248705456865280` | CA$44.99 | Active, mapped, approved |
| Travel Cable Organizer Case — Single & Double Layer | `9365959246074` / `travel-cable-organizer-case` | `2086248367047835648` | CA$19.99–24.99 | Active, mapped, approved |
| Travel Toiletry Organizer — Zippered Small & Large Bag | `9341750968570` / `travel-toiletry-organizer` | `2083032587397234688` | CA$39.99–49.99 | Active, mapped, approved |

All three are published to Online Store and Hydrogen, and carry every required
release-evidence tag:

- `puchica-catalog-approved-v1`
- `dsers-mapped`
- `cost-verified`
- `margin-verified`
- `copy-verified`
- `imagery-verified`
- `ca-route-verified`
- `us-route-verified`

## Verified DSers route evidence

- Packing cubes, selected S3007 route: AliExpress Selection Standard from CN,
  US$1.99; United States 8–13 days and Canada 8–15 days; tracking available.
- Cable case, Double Layers route: United States US$1.99 / 6–11 days and
  Canada US$2.16 / 8–14 days; tracking available.
- Toiletry organizer, BK-L route: United States US$1.99 / 7–12 days and
  Canada free / 8–14 days; tracking available.

These are DSers estimates. The storefront correctly says shipping is shown at
checkout and does not promise a fixed delivery date.

## Product-truth corrections

- Packing cubes are described as three standard zippered polyester organizers,
  not vacuum or mechanical compression bags.
- Cable-case copy separates the single- and double-layer layouts and states
  that pictured electronics are not included.
- Toiletry-organizer copy no longer claims IPX6, submersion, roll-top closure,
  MOLLE construction, or an unrelated dry-bag capacity.
- Supplier codes were replaced with customer-readable option names while the
  mapped supplier SKUs were preserved.

## Storefront release controls

- Emergency containment is off.
- Homepage, collection, search, sitemap, and merchandising surfaces query only
  the versioned final approval tag.
- Product routes re-check every evidence tag and availability before rendering.
- Cart, search, account, and product navigation are restored.
- Homepage, collection, About, Shipping, search, and empty-cart copy now describe
  only the travel edit; the abandoned high-ticket/trending positioning is not
  present on the tested customer routes.
- The disabled legacy five-piece packing-cube campaign still redirects safely.

## Verification completed

- `npm test`: 53/53 passing.
- `npm run lint`: zero errors; pre-existing debug-script console warnings only.
- `npm run build`: production client and server builds passed.
- `npm run launch-check`: storefront release gate passed.
- Local browser smoke test passed for homepage, catalog, all three product pages,
  About, Shipping, FAQ, Contact, and cart.

## What is still blocked

Paid ads remain paused. This is not a product-sourcing block.

Before authorizing any ad spend:

1. Capture a live Shopify checkout delivery quote for one Canadian destination
   and one United States destination without placing an order.
2. Recalculate contribution margin using the actual checkout result for each
   advertised product or bundle.
3. Confirm Meta and GA4 events in production, including one non-duplicated
   checkout-start event.
4. Agree on the exact product, market, daily cap, total test cap, and stop rules.

No sample purchase is a hard release requirement, and no product order or ad
spend was made during this recovery.
