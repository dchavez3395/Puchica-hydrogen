# Puchica all-hands launch-readiness decision — 2026-08-09

## Binding decision

- **Storefront repair release:** DEPLOYED and production smoke-tested as Oxygen deployment asset `4174165` from commit `184432b`.
- **Unpaid/organic promotion:** **GO_ORGANIC_LIMITED.** Packing cubes may be sold in Canada only. The cable case may be sold in Canada and the United States. Recheck the exact DSers SKU, stock, and destination route before fulfilling each initial order.
- **Paid ads:** HOLD. The cable case has acceptable contribution economics, but packing-cube and bundle CAC headroom is thin and Meta browser/CAPI receipt and deduplication are not yet proven.
- **Catalog:** frozen. Canada may expose only the exact charcoal three-piece packing-cube SKU and exact black double-layer cable-case SKU. The United States may expose only the exact black double-layer cable-case SKU. No toiletry organizer or other legacy product may surface.

This is not a new niche or product reset. It is a controlled repair of the existing two-product travel launch.

## What the independent live audit found

Before this repair, the live storefront had four release-invalidating defects:

1. `robots.txt` blocked all product and collection crawling, and the product sitemap was empty.
2. Recently viewed could leak the held toiletry organizer and the Canada-only packing cubes into the United States search drawer, with the wrong currency.
3. Fresh page loads emitted React hydration failures and the product page emitted a missing-options warning.
4. Product pages rendered separate mobile and desktop H1 elements instead of one stable semantic page heading.

The audit also confirmed that the core market gates worked: Canada exposed the two exact SKUs, the United States exposed cable only, a Canada cart could be created, invalid Canada-only cart lines were purged after switching to the United States, and the United States checkout handoff remained cable-only.

## Repairs implemented locally

- Removed the broad product/collection `robots.txt` blocks while retaining cart, account, search, API, campaign, discount, and filtered-URL exclusions.
- Added exact variant SKU and availability data to the sitemap query so the launch gate can emit only approved product URLs.
- Added `/collections/all` to the static sitemap.
- Versioned and market-bound recently viewed storage. Records now require both an approved exact SKU and the active market before rendering.
- Removed optimistic product-option logic from the frozen exact-SKU PDP.
- Buffered server output and moved deferred React Router chunks before the closing document tags to prevent hydration mismatch.
- Replaced duplicate desktop/mobile product headings with one H1 and a responsive CSS grid layout.

## Local verification completed

- `node --test --test-force-exit tests/*.test.js`: **61/61 passed**.
- ESLint: **0 errors**; 31 pre-existing debug-script console warnings.
- `npm run launch-check`: **PASS**. The script explicitly does not authorize paid ads.
- `npm run build`: **PASS** for client and Oxygen server bundles.
- `git diff --check`: **PASS**.
- Fresh local browser loads:
  - Home: no errors or warnings; hero uses the charcoal three-piece packing-cube product and matching media.
  - Cable PDP: no errors or warnings; one H1; exact double-layer cable copy and price.
  - Packing PDP: no errors or warnings; one H1; exact three-piece non-compression copy and price.
- Local product sitemap contains exactly:
  - `/products/3-piece-packing-cube-set`
  - `/products/travel-cable-organizer-case`

## Production verification after deployment

- Live `robots.txt` no longer blocks ordinary product or collection pages.
- Live product sitemap contains exactly the packing-cube and cable-case URLs.
- Fresh isolated loads of Home, cable PDP, and packing PDP show one H1 each and no Puchica runtime errors.
- Canada exposes both exact products; the United States exposes cable only and returns the controlled 404 for packing cubes.
- The United States search drawer no longer leaks the Canada-only packing cubes, the held toiletry organizer, or CAD prices.
- The Home hero uses the exact product featured for the active market: packing cubes in Canada and the cable case in the United States.

The Codex test browsers inject their own sibling `<div>` directly under `<html>` (`codex-agent-overlay-root` or `codex-browser-sidebar-comments-root`). When that overlay survives a full market-navigation reload, React correctly reports a hydration mismatch against the extra test element. The raw live Oxygen HTML contains only `<head>` and `<body>`, places all deferred router chunks before `</body>`, and has zero bytes after `</html>`. Clean initial loads in the isolated browser have no errors. The injected testing overlay is therefore not recorded as a storefront defect.

## Checkout and economics

No order or payment was submitted.

| Cart | Merchandise | Shipping | Checkout total before tax | Decision |
| --- | ---: | ---: | ---: | --- |
| Canada packing cubes | CA$39.99 | CA$5.00 | CA$44.99 | Organic-margin viable; not conservatively ad-safe |
| Canada cable case | CA$24.99 | CA$5.00 | CA$29.99 | Margin-qualified |
| Canada both | CA$64.98 | Free | CA$64.98 | Organic-margin viable; limited CAC room |
| United States cable case | US$19.00 | US$8.00 | US$27.00 | Margin-qualified |

The checkout test showed no active automatic discount. `FIRST15` is expired and must not be advertised. No tax line appeared. Given the owner's stated facts (not GST/HST registered and still below the small-supplier threshold), that is not by itself a release blocker; threshold and registration status must be monitored. CRA source: https://www.canada.ca/en/revenue-agency/services/tax/businesses/topics/gst-hst-businesses/when-register-charge.html

The contribution model uses the Shopify Basic online-card fee schedule, with a higher international/Amex stress case. Current Shopify pricing source: https://www.shopify.com/ca/pricing

## Fresh DSers fulfillment verification

The two frozen products were rechecked in a fresh signed-in DSers session on 2026-08-09. This check used the exact mapped My Products records, exact supplier variants, and destination-specific Shipping Info. It did not use Supplier Optimizer lookalikes or stale listing ranges.

| Product | Exact mapping and cost | Canada | United States | Decision |
| --- | --- | --- | --- | --- |
| Packing cubes | Shopify `50041051676922` → DSers `2086248705456865280` → supplier SKU `S3007 Black / 3PCS L M S`; item US$12.45 | US$1.99, tracked, 8–13 days, CN | No Shipping | Canada `GO_ORGANIC_LIMITED`; U.S. blocked |
| Cable case | Shopify `50041043681530` → DSers `2086248367047835648` → supplier SKU `14:193#Double Layers`; item US$4.14 | US$1.99, tracked, 6–11 days, CN | US$1.99, tracked, 6–11 days, CN | Canada + U.S. `GO_ORGANIC_LIMITED` |

The packing-cube record exposes aggregate stock 667 but not a separate exact-option stock column, so exact option availability is an order-time watchpoint rather than a launch blocker. The cable case exposes 57 units on AliExpress and 65 on the store. Product title, media, configuration, exclusions, and dimensions materially align with the mapped supplier variants.

## Remaining operating gates

### 1. Controlled initial fulfillment

- Accept one initial organic order at a time.
- Before placing the supplier order, reconfirm the exact SKU, supplier stock, destination route, cost, ETA, and tracking in DSers.
- Keep packing cubes unavailable in the United States.
- Stop the affected product immediately if its exact option disappears, stock reaches zero, the route becomes unavailable, or landed cost materially increases.

### 2. Analytics before paid traffic

Prove GA4 and Meta event receipt with browser and server events deduplicated by the same event ID. Page code loading is not proof of receipt. Do not unpause ads until ProductView, AddToCart, and InitiateCheckout are observed in the relevant diagnostics.

## Stop rules

- Do not expand the catalog until the two frozen products pass current fulfillment verification.
- Do not reintroduce the toiletry organizer without supplier-brand authorization and exact SKU/route/economics proof.
- Do not advertise a discount that is not active at checkout.
- Do not unpause paid ads from a clean build alone.
- If a DSers route, mapping, exact option, or price is ambiguous, hold the affected market instead of substituting a lookalike supplier.
