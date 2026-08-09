# Live frozen-catalog storefront QA — 2026-08-09

Audit window: 2026-08-09 14:44–15:00 CDT
Target: `https://puchica.ca` (live Oxygen asset deployment path observed under `.../302231/4173481/...`)
Local repository reference at audit time: `28448c6`; unrelated dirty worktree changes were not treated as deployed evidence.
Method: public desktop and 390 × 844 mobile browser checks, keyboard-only checks, browser console/resource inspection, and a separate isolated HTTP cart session. Cart actions were reversible test interactions. Checkout was opened by GET only; no form was submitted and no order, login, ad, or admin mutation occurred.

## Hard verdict

- **Organic storefront: HOLD.** The purchase path works, but the live site blocks product and collection crawling, publishes an empty product sitemap, exposes stale held/wrong-market products to returning shoppers through Recently viewed, and emits production hydration errors.
- **Paid ads: HOLD.** The same catalog/runtime defects affect landing-page integrity, and Meta browser-pixel delivery is not proven even though a same-origin CAPI beacon was observed.
- **P0:** none found. **P1:** four issues below.

## P1 release blockers

### P1-1 — Product discovery is blocked from organic crawlers

Reproduction:

1. GET `https://puchica.ca/robots.txt`.
2. Under both `User-agent: *` and `User-agent: adsbot-google`, observe:
   - `Disallow: /products`
   - `Disallow: /*/products`
   - `Disallow: /collections`
   - `Disallow: /*/collections`
3. GET `https://puchica.ca/sitemap/products/1.xml`; the response is HTTP 200 but the `<urlset>` is empty.

This prevents normal crawling of the two sellable PDPs and collection even though those pages have canonical tags and Product JSON-LD. The pages sitemap lists only home, About, Contact, FAQ, and Shipping.

### P1-2 — Returning shoppers can see held and wrong-market products

In a US session with prior product history, Home → **Open search** → **Recently viewed** visibly rendered:

- Black Double-Layer Travel Cable Organizer Case — `$19.00 USD` (valid US item)
- Charcoal 3-Piece Packing Cube Set — `CA$39.99 CAD` (CA-only item)
- Black Large Travel Toiletry Organizer — `CA$49.99 CAD` (held item)

The packing and toiletry links then return 404 in the US, but their visible cards, images, and CA prices violate the frozen-market presentation. This comes from persisted client-side Recently viewed data, so a fresh browser may not reproduce it; the affected population is returning browsers with legacy snapshots. Direct US route enforcement still works.

The release owner reported local, pending v4 exact-SKU and market-aware history filtering. It is not counted as live evidence until deployed and retested with contaminated legacy storage.

### P1-3 — Production hydration/runtime errors occur on normal pages

A fresh Home load emitted React minified errors `#418` and `#423`; the latter is consistent with React abandoning server hydration and switching the root to client rendering. Both product pages repeatedly emitted:

`[h2:error:getProductOptions] product.options.optionValues is missing.`

The cable PDP also reproduced React `#418`/`#423`. Add-to-cart completed despite the errors, but an erroring hydration path is not an acceptable known state for organic or paid launch traffic.

### P1-4 — Meta browser-pixel readiness is not proven

Observed on a fresh Home load:

- `connect.facebook.net/en_US/fbevents.js` script requested.
- Same-origin `https://puchica.ca/api/meta-event` beacon requested.
- No `facebook.com/tr` browser-pixel request was observed.
- The inspected page runtime exposed no initialized `fbq` function.

This proves request/code presence only—not Shopify, GA, or Meta receipt, processing, attribution, or deduplication. Do not start paid Meta traffic until the browser event and CAPI event are both verified with matching event IDs in Events Manager or equivalent delivery diagnostics.

## Passing functional evidence

### Frozen catalog, exact variants, media, and market purge

An isolated session produced this deterministic matrix:

| Check | Canada | United States |
|---|---:|---:|
| Packing PDP | 200 | 404 |
| Cable PDP | 200 | 200 |
| Toiletry PDP | 404 | 404 |
| Collection | packing + cable | cable only |

- Packing add payload: variant `50041051676922`; visible PDP media was one approved product image, `Sbeb36a7c05ed495fbad54adc75fbfb1cC.webp`, alt `Charcoal 3-Piece Packing Cube Set — Small, Medium & Large`.
- Cable add payload: variant `50041043681530`; visible PDP media was one approved product image, `S7a92614fd71b4e70b1612704b2391995y.webp`, alt `Black Double-Layer Travel Cable Organizer Case`.
- CA cart contained both lines and subtotal `CA$64.98`.
- After CA → US, packing was absent, cable remained at `$19.00`, and the packing route was 404.
- Checkout GET returned 200 on `checkout.puchica.ca/.../en-us` and contained cable only with USD; no invalid packing line and no submission.

### Desktop/mobile and accessibility signals

- Desktop and 390 × 844 mobile layouts exposed the catalog, PDP, quantity controls, Add to cart, cart drawer, and checkout link without an interaction blocker.
- The first keyboard Tab focused the skip link; subsequent controls followed a logical header-to-content order.
- Keyboard focus used a 3 px blue outline plus halo. Sample blue-on-white contrast was 6.44:1.
- Visible buttons and form fields inspected on PDP/cart/search had accessible names; quantity controls, cart, dialogs, and close controls were labeled.
- Shipping & Returns used native `details`/`summary` semantics and toggled with Enter.
- Cart quantity and Add states used polite live regions (`ADDING…`, `ADDED ✓`).
- Sample text contrast passed: body 17.75:1, muted text 5.79:1, dark CTA/footer text 17.41:1 against white.

These are targeted WCAG signals, not a claim of full WCAG conformance.

### Copy, policies, and on-page SEO

- Prices and exact variant copy were coherent with the gated catalog.
- `30-day return window` copy matched the live refund policy (`contact us within 30 days of delivery`).
- Shipping copy consistently states rates and estimates are shown at checkout and are not guaranteed.
- Home, collection, About, shipping, refund, and both PDPs returned 200 with specific titles/canonicals; held toiletry returned 404.
- Product JSON-LD contained the approved exact image, SKU, market currency/price, InStock offer, seller, and BreadcrumbList.

Non-blocking SEO note: each product response contains two H1 tags in the SSR HTML, while only one H1 is visually rendered. Fix after the P1 indexing and hydration defects.

## Analytics evidence boundary

- Shopify: outbound Monorail `v1/produce` and `unstable/produce_batch` fetch/beacon resources were observed.
- GA4: `gtag.js?id=G-KTMM6KWWT6` loaded. On the CA cable path, outbound `g/collect` requests were observed for `view_item` and `add_to_cart`, carrying variant `50041043681530`, price `24.99`, and CAD.
- Meta: loader and same-origin CAPI beacon observed as described in P1-4; browser-pixel event not observed.

No destination receipt or downstream dashboard processing was verified.

## Required retest gates

1. Deploy the pending history-filter, robots, sitemap, and hydration/product-options fixes; verify the live bundle changes.
2. Retest both a fresh browser and a browser seeded with legacy toiletry/packing history: search drawer and recommendations must fail closed by exact approved SKU and active market; robots must allow approved PDP/collection crawling; the product sitemap must list only the approved canonical PDP URLs.
3. Require a clean console on Home and both PDPs, then capture analytics delivery evidence: Shopify/GA outbound events with successful responses and Meta browser + CAPI events with deduplication. Keep ads paused until all three gates pass.
