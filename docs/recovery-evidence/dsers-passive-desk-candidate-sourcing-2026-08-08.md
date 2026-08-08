# DSers passive desk candidate sourcing — 2026-08-08

## Scope and controls

- Read-only review in the signed-in DSers session.
- No products were imported, mapped, edited, ordered, or paid for.
- Target: passive, unbranded desk/cable organization products with Canada and United States routes.
- Exclusions applied: powered products, magnets near critical devices, branded goods, medical/food-contact goods, and load-bearing products.

## Result

**No candidate is launch-approved from this pass.** Two exact AliExpress item IDs have Canada and United States route rows in DSers, but DSers Supplier Optimizer does not expose the exact variant/option, available stock, or an explicit tracking flag. They remain route-verified **HOLD** candidates until those fields are reconciled on the actual supplier listing or after a non-publishing import-list inspection.

| Candidate | Exact supplier item | Ordinary item cost | Canada route | United States route | Sales shown | Option | Stock | Tracking | Decision |
|---|---|---:|---|---|---:|---|---|---|---|
| Elastic organizer board with zipper pocket and stretch straps | AliExpress `1005010001612249` | US$8.60 | AliExpress Selection Standard; US$1.99; 8 days | AliExpress Selection Standard; US$1.99; 6 days | 163 | Not exposed | Not exposed | Not explicitly exposed | **HOLD** |
| Clamp-on/under-desk cable-tray visual match | AliExpress `1005012706861057` | US$13.95 | AliExpress Selection Standard; US$2.16; 8 days | AliExpress Selection Standard; US$1.99; 6 days | 71 | Not exposed | Not exposed | Not explicitly exposed | **HOLD** |

Supplier URLs:

- `https://www.aliexpress.com/item/1005010001612249.html`
- `https://www.aliexpress.com/item/1005012706861057.html`

## Candidate-specific cautions

### 1. Elastic organizer board — `1005010001612249`

- DSers Find Products displayed the exact item title, US$8.60 cost, 163 orders, and US$1.99 shipping.
- The exact item ID was found again in Supplier Optimizer for both Canada and the United States, so the route rows reconcile at the item-ID and cost level.
- It is more of a portable cable/cosmetics insert than a dedicated desk organizer, so positioning fit is only moderate.
- Variant count, selected colour/size, inventory, and explicit tracking evidence remain unavailable in the read-only optimizer view.

### 2. Clamp-on cable-tray visual match — `1005012706861057`

- The exact item ID appeared as the top AliExpress result in a DSers visual search using a representative clamp-on under-desk cable-tray image.
- Canada and United States rows reconcile at the same US$13.95 item cost and exact item ID.
- DSers did not display a product title, exact dimensions, clamp range, load rating, selected option, stock, or explicit tracking flag in the optimizer table.
- Because a cable tray can carry a power strip, fit/load claims must be verified before use in copy or ads. Do not market it as load-bearing until the supplier specification is confirmed.

## Search failures and data-quality blockers

1. **DSers Find Products keyword search was stale.** Changing the query to `desk cable clips` and `desk drawer organizer` left the page on the same generic “Picks For You” feed. Those cards were not treated as query results.
2. **Supplier Optimizer is image-similarity based.** A similar-looking match is not proof of identical dimensions or variants. Only rows whose exact AliExpress item ID could be captured were retained.
3. **DSers displays its own warning that Supplier Optimizer data may be incorrect.** Route data therefore needs a final listing-level reconciliation before launch.
4. **The read-only optimizer table omits option and stock.** Sales count is not inventory and was not recorded as stock.
5. **Tracking is not a dedicated field in the table.** `AliExpress Selection Standard` was recorded as the method, but tracking was left unverified rather than inferred.

## Public seeds not promoted to candidates

These exact public AliExpress IDs were found during the focused search, but they were not promoted because their exact ID did not reconcile in the DSers visual-match results or because exact route/option/stock evidence was unavailable:

- `1005012360881333` — clamp-on under-desk cable tray
- `1005006861546633` — clamp-on metal mesh cable tray
- `1005007084214211` — clamp-on cable-management tray
- `1005012001983494` — adhesive PVC under-desk raceway
- `1005012270432335` — 18-piece adhesive cable clips
- `1005008760210403` — seven-compartment cable organizer box

## Next safe gate

For either HOLD candidate, inspect the exact supplier listing or a non-publishing import-list detail view and capture: full title, every variant, chosen option, available stock, dimensions/materials, explicit tracked status, ship-from location, and ordinary non-welcome-deal cost. Re-run Canada and United States quotes on that exact option. Do not publish or advertise until all fields reconcile.
