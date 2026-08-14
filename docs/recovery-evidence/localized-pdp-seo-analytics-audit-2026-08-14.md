# Localized PDP, SEO, and analytics audit — 2026-08-14

Scope: zero-cost storefront verification. This audit does not authorize paid
ads or claim that a consent-gated analytics event has been received by an
external dashboard.

## Live findings before the patch

The French Canada cable-organizer PDP was checked in the live storefront:

- the page, price, exact approved SKU image, trust copy, and add-to-cart control
  rendered successfully;
- the canonical URL correctly used
  `https://puchica.ca/fr/products/travel-cable-organizer-case`;
- the header cart control's fallback URL was `/cart`, which dropped the active
  language if JavaScript did not open the drawer;
- Product, Offer, and BreadcrumbList structured-data URLs incorrectly pointed
  to the unprefixed English product path.

## Fix and local verification

The cart fallback now uses `LocalizedLink`. Product and breadcrumb structured
data now receive the active language key. The Product name in structured data
also uses the same approved-variant presentation as the visible H1.

The built local production preview verified:

- cart fallback URL: `/fr/cart`;
- canonical URL: localized French product URL;
- Product `@id`, Offer `@id`, Offer `url`: localized French product URL;
- every BreadcrumbList item: localized French path;
- Product structured-data name matches the visible H1.

Automated checks after the change:

- `npm test`: 70/70 passing;
- `npm run lint`: zero errors, 31 pre-existing console warnings in diagnostic
  scripts;
- `npm run build`: passing;
- `npm run launch-check`: passing before the patch and retained in the release
  gate suite.

## Analytics configuration result

The production Oxygen environment was pulled to a temporary audit file and
checked without displaying any values. Production has both explicit storefront
analytics enablement flags set to `true`, and both the GA4 Measurement ID and
Meta Pixel ID are present. The temporary environment file was then deleted.

The controlled browser did not load GA4 or Meta scripts in its current privacy
state. Because both integrations call Hydrogen's consent-aware `canTrack()`
gate before loading a vendor script, this observation is not evidence of a
broken configuration. A real consent-granted debugger receipt remains required
before paid promotion can be considered.

## Browser-control artifact excluded

The controlled browser injects
`#codex-browser-sidebar-comments-root` directly under `<html>`. React reports a
hydration mismatch for that injected node in both production and local runs.
The raw server response was separately checked: its document structure is
valid and closes at `</body></html>` with no trailing router content. No
storefront change was made for this tooling-only warning.

## Production release and live verification

The verified change was deployed to the Production Oxygen environment on
2026-08-14 with description `localized-pdp-seo-cart-fix`. Shopify CLI completed
its upload, completion check, and routability check successfully. The linked
storefront now reports that description as its current production deployment.

Independent checks against `https://puchica.ca` after deployment confirmed:

- `/feed.xml` returns HTTP 200 and contains exactly nine approved product
  items;
- all nine feed products return HTTP 200 in the Canada market with CAD Product
  structured data;
- the seven US-approved products return HTTP 200 in the US market with USD
  Product structured data;
- `3-piece-packing-cube-set` and
  `large-blue-handled-clothes-storage-bag` remain excluded in the US market
  with HTTP 404, `Cache-Control: no-store, max-age=0`, and
  `X-Robots-Tag: noindex, nofollow`;
- the live French cable-organizer PDP returns HTTP 200, self-canonicalizes to
  its `/fr/products/...` URL, exposes `/fr/cart` as its non-JavaScript cart
  fallback, and has no bare `/cart` fallback;
- the live Product and Offer IDs/URLs and every BreadcrumbList item are
  localized under `/fr`, and the Product name matches the visible H1.

No payment, order, supplier action, ad spend, or customer-data mutation was
performed during this release or verification.
