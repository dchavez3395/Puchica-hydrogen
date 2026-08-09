# Puchica travel storefront release decision — 2026-08-08

## Binding decision — corrected after reconciliation

The three-product travel edit is a **private design preview, not a production
approval**. DSers remains the intended fulfillment app and AutoDS is not
required, but `Unmapped(0)` proves only that DSers recognizes the Shopify
records. It does not prove every sellable variant has a current route, exact
landed cost, adequate stock, or defensible margin in both countries.

Production deployment and paid ads remain blocked until the contradictions
below are closed. This correction supersedes the earlier approval wording in
this file.

## Preview cohort and current gate

| Product | Shopify product | DSers My Products | Customer price | Release state |
|---|---|---|---:|---|
| 3-Piece Packing Cube Set — Small, Medium & Large | `9365959672058` / `3-piece-packing-cube-set` | `2086248705456865280` | CA$44.99 | **HOLD** — live mapping and inventory exist, but route/cost evidence conflicts and the price is above the defensible generic market band |
| Travel Cable Organizer Case — Single & Double Layer | `9365959246074` / `travel-cable-organizer-case` | `2086248367047835648` | CA$19.99–24.99 | **CONDITIONAL HOLD** — strongest option is Black / Double Layer; exact CA+US route exists for that SKU, but all variants are not independently approved |
| Travel Toiletry Organizer — Zippered Small & Large Bag | `9341750968570` / `travel-toiletry-organizer` | `2083032587397234688` | CA$39.99–49.99 | **REJECT FOR U.S. / HOLD FOR CANADA** — inspected BK-L option has a Canada route and `No Shipping` to the U.S.; brand and price remain unresolved |

All three currently carry the following Shopify tags, but reconciliation found
that the tags overstate the underlying evidence and must not authorize
production:

- `puchica-catalog-approved-v1`
- `dsers-mapped`
- `cost-verified`
- `margin-verified`
- `copy-verified`
- `imagery-verified`
- `ca-route-verified`
- `us-route-verified`

## Reconciled DSers evidence

- Packing cubes: current DSers card shows CA$16.04–18.58 item cost and stock 667.
  The earlier controlled mapped-record audit could not validate an exact route
  or landed cost, while a later summary claimed an S3007 CA+US route. Treat the
  contradiction as unresolved rather than choosing the more favourable result.
- Cable case, Double Layers route: United States US$1.99 / 6–11 days and
  Canada US$1.99 / 6–11 days; tracking available. Current DSers card shows
  CA$4.24–6.00 item cost and aggregate stock 105. This proves the inspected
  Double Layers SKU, not every published colour/layer variant.
- Toiletry organizer, BK-L route: Canada US$1.99 / 7–12 days with tracking;
  United States `No Shipping`. Current DSers card shows CA$17.17–23.12 item
  cost and aggregate stock 132. Five other variants remain route-unverified.

DSers routes are estimates. Shopify's checkout shipping profile is a separate
store-level customer charge and does not prove supplier fulfillment or absorb
unshown duties, tax, brokerage, refunds, or acquisition cost.

## Fee and pricing reconciliation

- The live store is on Shopify **Basic** with Shopify Payments accepting
  payments. Shopify Canada's current published Basic rates are 2.8% + CA$0.30
  for an online standard card and 3.5% + CA$0.30 for online Amex or an
  international card: `https://www.shopify.com/ca/pricing`.
- The earlier 3.5% + CA$0.30 model is therefore conservative for payment fees,
  but it did not cure missing exact supplier routes or weak market pricing.
- Shopify charges customers CA$5 below CA$50 and CA$0 from CA$50 in Canada;
  the United States profile charges CA$9.99. Those amounts are revenue collected
  by Puchica and are not the same as the shipping DSers/AliExpress charges to
  fulfill the order.
- Cable case, inspected Black / Double Layer: US$4.14 item + US$1.99 supplier
  shipping = US$6.13, approximately CA$8.55 at the dated planning FX rate. At
  CA$24.99 plus CA$5 customer shipping, it has a defensible pre-ad margin under
  both published Shopify fee rates. It is the only current variant with a
  sufficiently reconciled route and price case.
- Packing cubes: DSers currently shows CA$16.04–18.58 item cost before supplier
  shipping. Even if the favourable CA+US route claim is reproduced, CA$44.99 is
  above the earlier defensible CA$24.99–34.99 market band for generic packing
  cubes. Lowering the price would compress paid-acquisition room.
- Toiletry organizer: the inspected BK-L option is Canada-only and its supplier
  item range is CA$17.17–23.12 before supplier shipping. The current CA$49.99
  Large price may produce an accounting margin, but it is not commercially
  approved because U.S. fulfillment, brand authorization, variant routes, and
  competitive positioning are unresolved.
- Customer-paid duties are the intended policy. That limits merchant cost but
  does not remove checkout/conversion risk, and DSers did not prove a fixed
  duty amount for these routes.

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

## Oxygen preview and Shopify shipping-profile gate — 2026-08-08

- A private, authenticated Oxygen preview was deployed successfully at
  `https://01kzjawec9anp9dq0fzt95b3mg-96696c77fd963319c44d.myshopify.dev`.
- Ten hosted routes passed: homepage, all-products collection, all three launch
  product pages, About, Shipping, FAQ, Contact, and cart. Each route rendered a
  main region without a storefront error, 404, or abandoned catalog language.
- Shopify's live General delivery profile contains all three launch products.
- The Canada zone charges CA$5.00 below CA$50.00 and CA$0.00 from CA$50.00 up.
- The United States cross-border zone charges CA$9.99.
- The old Zendrop delivery profile contains no products, zones, or rates and is
  therefore non-blocking.
- No address, checkout submission, payment, product order, or ad spend was used
  to obtain this evidence.
- The in-app QA browser injects a Codex sidebar node directly under `<html>`.
  The resulting React hydration warnings are a test-surface artifact; the
  deployed storefront markup and product imagery passed hosted inspection.
- Production deployment remains intentionally pending merchant visual approval.
  Paid ads remain paused independently of the storefront release decision.
