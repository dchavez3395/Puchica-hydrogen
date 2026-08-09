# Puchica all-hands launch-readiness decision — 2026-08-09

## Binding decision

- **Storefront repair release:** GO after the verified build is deployed and production smoke-tested.
- **Unpaid/organic promotion:** HOLD until the two exact DSers mappings and current Canada/United States routes are revalidated in a fresh signed-in session.
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

## Remaining hard gates

### 1. Fresh DSers exact-SKU verification

The connected DSers session was logged out during this audit. Historical screenshots were deliberately not presented as current proof. After login, capture for each exact frozen SKU:

- Shopify variant to supplier variant mapping;
- supplier stock;
- ordinary item cost;
- Canada and United States shipping method, cost, ETA, tracking availability, and ship-from;
- a contradiction check against the storefront title, media, contents, and dimensions.

No remap, import, new product, order, or supplier swap is authorized during this read-only check.

### 2. Production retest after deployment

Verify the same three pages, `robots.txt`, product sitemap, market switching, search drawer, cart purge, and checkout handoff on `puchica.ca`.

### 3. Analytics before paid traffic

Prove GA4 and Meta event receipt with browser and server events deduplicated by the same event ID. Page code loading is not proof of receipt. Do not unpause ads until ProductView, AddToCart, and InitiateCheckout are observed in the relevant diagnostics.

## Stop rules

- Do not expand the catalog until the two frozen products pass current fulfillment verification.
- Do not reintroduce the toiletry organizer without supplier-brand authorization and exact SKU/route/economics proof.
- Do not advertise a discount that is not active at checkout.
- Do not unpause paid ads from a clean build alone.
- If a DSers route, mapping, exact option, or price is ambiguous, hold the affected market instead of substituting a lookalike supplier.
