# Controlled two-product push safety monitor — 2026-08-08

## Scope

Read-only monitoring after authorization to push only these two existing private DSers Import List records:

1. `Luggage Cubes Organizer Portable Travel Storage Bag Compressible Packing Cubes Foldable Waterproof Travel Suitcase Nylon Handbag`
2. `Data Cable Storage Bag Waterproof Portable Carry Case Storage Bag Travel Organizer Bag for Cable Cord USB Charger`

No product status, tag, mapping, price, inventory, collection, public channel or Import List record was changed during this safety check. The emergency Draft action was not needed because neither test product appeared in Shopify or on the storefront.

## Before / after counts

| Surface | Before evidence | After live check | Change |
|---|---:|---:|---:|
| Shopify products | 29 in `shopify-admin-catalog-2026-08-08.json` | 29 via the connected live Puchica Shopify catalog | 0 |
| DSers My Products | 29 at the start of the controlled monitor | 29 after refresh; both pages inspected | 0 |
| DSers Import List | 23 in the same-day A–H / I–P / Q–Z inventory records | 23 after refresh | 0 |

The connected Shopify shop was confirmed as **Puchica**, `checkout.puchica.ca`, CAD, Canada.

## Push-state result

- The **Data Cable Storage Bag** Import List card displays `Pushed to 1 store(s)`.
- The **Luggage Cubes Organizer** card remains in Import List but does **not** display a pushed marker.
- Neither exact title appears in DSers My Products on page 1 or page 2.
- Shopify returns:
  - no title match for `Data Cable`;
  - no title match for `Luggage Cubes`;
  - zero Draft products;
  - zero products created after `2026-08-08T00:00:00Z`;
  - 29 total products, with the newest still dated 2026-08-05.

Therefore the Data Cable marker is not evidence that a Shopify record successfully materialized. It may represent a stale/pending/failed DSers push state. The luggage push is not evidenced at all. This monitor does not claim that both pushes completed.

## Storefront containment

Neither test item is presently purchasable or discoverable:

1. Neither exists in the connected Shopify catalog.
2. The recovery Hydrogen build also has `STOREFRONT_CONTAINMENT_ACTIVE = true` in `app/lib/launch-catalog.js`.
3. While containment is active, the product, collection, search, cart and checkout-facing routes are blocked or redirected independently of catalog tags.
4. The final approval tag is versioned (`puchica-catalog-approved-v1`); neither Import List title has such a Shopify record or tag.

No emergency Shopify status mutation was necessary.

## Exact rollback / cleanup path

If either product later appears in Shopify:

1. Identify the new product by exact title and creation time; record its Shopify product GID and handle.
2. If status is `ACTIVE`, immediately set the Shopify product to **DRAFT**. Draft is the preferred reversible containment action.
3. Confirm the exact handle returns the contained/not-for-sale experience and does not appear in search, collections, sitemap, cart or checkout.
4. Retain Draft while product data and mapping are inspected. Use **ARCHIVED** only if the record should be kept for audit but removed from normal admin work.
5. Delete the Shopify product only after confirming it is a duplicate/failed test record and recording its GID, handle and DSers relationship. Deletion is less recoverable than Draft or Archive.

DSers rollback:

- If a pushed product appears in **My Products**, first set the Shopify record to Draft, then use the exact My Products card's `Delete` action only if the team wants to sever/remove the DSers managed product. Do not bulk-delete.
- Both Import List cards pre-date this controlled push test and contain accumulated route/evidence work. **Retain them by default.** Removing either card is possible through its exact card-level `Delete` action, but would discard useful evidence and is not required to contain the storefront.
- Do not use `Hide Product` as a substitute for Shopify Draft: the storefront safety source of truth is the Shopify status plus Hydrogen containment.

## Operational verdict

**Contained, but the two-product push test is incomplete.** Current counts and catalog identity prove that no new Shopify product exists. Data Cable has only a DSers-side pushed marker; Luggage Cubes has no pushed marker. Do not repeat either push blindly. First determine why DSers marked Data Cable as pushed without creating a Shopify/My Products record, then perform at most one controlled retry with a before/after count and immediate Shopify identity check.
