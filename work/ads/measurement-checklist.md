# Measurement readiness — puchica.ca — 2026-09-18

## What is wired (verified live)
- `PUBLIC_CUSTOM_META_ENABLED=true`, `PUBLIC_FACEBOOK_PIXEL_ID=996669459615534`: `fbevents.js`
  loads on production and `MetaPixel.jsx` subscribes to Hydrogen analytics.
- `PUBLIC_GA4_STOREFRONT_EVENTS_ENABLED=true`, `PUBLIC_GA4_MEASUREMENT_ID=G-KTMM6KWWT6`: `gtag.js`
  loads and `GoogleAnalytics4.jsx` subscribes.
- Meta CAPI relay `/api/meta-event` is configured (`META_CAPI_ACCESS_TOKEN` present: an
  off-origin POST gets 403, so the handler runs past the no-token 204). Browser and server
  events share `event_id`, so Meta dedupes them.
- Shopify `Analytics.Provider canTrack` = `!isBotClient() && customerPrivacy.analyticsProcessingAllowed()`
  (root.jsx). Both pixels also call `isBotClient()` before installing.

## Which events fire, and from where

| funnel step | Meta (browser + CAPI) | GA4 | source |
|---|---|---|---|
| page view | PageView | page_view (gtag config) | storefront `page_viewed` |
| view_item | ViewContent (content_ids, value, currency) | view_item | storefront `product_viewed` |
| view collection | — | view_item_list (≤10 items) | storefront `collection_viewed` |
| view cart | — | view_cart | storefront `cart_viewed` |
| add_to_cart | AddToCart | add_to_cart | storefront `product_added_to_cart` |
| remove_from_cart | — | remove_from_cart | storefront `product_removed_from_cart` |
| search | — | search | storefront `search_viewed` |
| **begin_checkout** | InitiateCheckout — **Shopify checkout only** | begin_checkout — **Shopify Google channel only** | checkout.puchica.ca |
| add_payment_info | Shopify checkout | Shopify Google channel | checkout.puchica.ca |
| **purchase** | Purchase — **Shopify checkout only** | purchase — **Shopify Google channel only** | checkout.puchica.ca |

The storefront deliberately does NOT emit begin_checkout / purchase (docs/analytics-ownership.md:
Shopify's checkout already does, with its own event ids; a second copy would double the count
that campaigns optimise on).

## Bot gating — what it does and does not catch
- CI Playwright (105 checks per deploy, `check-production-health`, keyboard-walk, axe): blocked —
  Playwright sets `navigator.webdriver = true` and a HeadlessChrome UA. Confirmed: sessions since
  2026-09-18 are humans only.
- Lighthouse: NOT blocked. It spoofs a Moto G user agent and hides `webdriver`, so today's
  ~8 Lighthouse runs each fired PageView / ViewContent into Meta and GA4. Negligible volume;
  do not run Lighthouse in CI without `--extra-headers` + a UA containing "lighthouse", or
  those runs will pollute conversion baselines.

## Missing before paid traffic
1. **Meta: DONE 2026-09-20, and it found three defects.** Events Manager for pixel
   996669459615534 showed only `PageView` and `InitiateCheckout` in 28 days, both from
   `checkout.puchica.ca`. The storefront had never delivered an event:
   - CSP `frame-src` blocked `www.facebook.com`; fbevents 2.9.4xx delivers through a hidden
     frame, so `fbq('track', …)` ran and nothing left the page. Fixed in e8b33f1.
   - The same CSP trial showed `font-src` blocking every self-hosted woff2 (the built stylesheet
     is on cdn.shopify.com, so `url(/fonts/…)` resolved there). Production had system fonts
     since 96352b7. Fixed in e8b33f1 by inlining `@font-face`.
   - Meta drops website server events whose `user_data` is only IP + UA (proved with two direct
     POSTs to `/api/meta-event`: with `_fbp` processed, without it silently gone). Page-load
     beacons fire before the pixel writes `_fbp`. The storefront now writes `_fbp` itself in
     Meta's format, on `.puchica.ca`. Fixed in the two commits after e8b33f1.
   Verified in Test events (code set temporarily as `META_CAPI_TEST_EVENT_CODE` on Oxygen, then
   removed): PageView, ViewContent and AddToCart each arrive as a Browser + Server pair with one
   event id. `InitiateCheckout`/`Purchase` remain Shopify checkout's. Note there is a second,
   empty dataset "Puchica Storefront" (1616698610095354); everything uses 996669459615534.
   Re-check after any CSP change: open a PDP in a normal browser with the Test events tab open.

   **Test order 2026-09-20 (#1003, Shopify Payments test mode, CAD 74.99 on the 4242 card,
   no money moved, mode switched off again straight after):**
   - GA4 Realtime showed the full chain for the session: view_item → add_to_cart →
     add_shipping_info → **purchase** (key event, 1 purchaser), plus the "Checkout - Receipt"
     page view. Google side verified end to end.
   - Meta (overview re-read ~1 h later): the same checkout produced InitiateCheckout
     (Browser • Server) and **AddPaymentInfo (Server)** on pixel 996669459615534, so
     Shopify's Meta integration is live on the right dataset — but **no Purchase row
     appeared**. Shopify does not forward test-mode orders as Purchase (and the browser copy
     could not fire from Daniel's Chrome, which blocks fbevents.js). Purchase on Meta is
     therefore verified only by inference: same integration, same pixel, every other checkout
     event present. The first real order settles it; look for a Purchase row within an hour
     of it. Storefront ViewContent/AddToCart now show as Browser • Server on the overview.
   - Side finding, matters for the FIRST REAL ORDER: DSers picked the order up automatically
     into "Awaiting order" and flagged the line "Variant deleted or value-changed on Shopify —
     click Mapping" and "No shipping method selected". The product is mapped in My Products
     (supplier attached, cost $21.52); the flag is DSers noticing the option value rename from
     the 17th–18th. When a real order lands: open it in DSers → Mapping → confirm the supplier
     variant → choose the shipping method → then Order. DSers never orders on its own.
   - Housekeeping: fulfilment-cancellation requested from DSers with a "test order, do not
     order" note; Shopify hides "Cancel order" until DSers releases the fulfilment. Archive if
     it never does — test orders are excluded from analytics.
2. **Google: audited 2026-09-20.** GA4 G-KTMM6KWWT6 is correct: the test order's session
   showed view_item → add_to_cart → add_shipping_info → purchase (key event) in one property, so
   storefront and checkout land together. **Merchant Center (account 5811543280) is the
   problem: an account-level "Misrepresentation" issue, all 20 products Not approved in
   Canada, no free listings and no Shopping ads possible.** Root cause found: Merchant
   Center's claimed store is checkout.puchica.ca (the Online Store domain) and Shopify's
   Google channel emits `https://checkout.puchica.ca/products/<handle>` as every product link
   (`Product.onlineStoreUrl`). The live Online Store theme ("Radiant") serves a stub on every
   path that canonical/meta-refresh/JS-redirects to the puchica.ca **homepage**, so Google's
   landing-page check sees product links that don't land on the product. Fix prepared but not
   applied (theme writes are gated): theme copy "Radiant — path redirect to puchica.ca
   (2026-09-20)" (gid 167501922554) exists; its layout/theme.liquid needs the else-branch that
   redirects to `https://puchica.ca{{ request.path }}` (canonical + meta refresh + JS,
   `noindex, follow`), then publish the copy. All standard paths exist on puchica.ca
   (/products/*, /collections/*, /policies/*, /pages/contact, /pages/about). After publishing:
   Merchant Center → Business info → also add/verify puchica.ca as the online store, then
   "Request review" on the Misrepresentation issue (one request per ~7 days; be sure the site
   shows business address + contact + return/shipping policies in the footer first — it does).
   Google Ads: no account linked; not needed until Shopping/PMax is on the table.
3. **Google Ads conversion action**: none exists yet (no Google Ads account linked). Needed before
   any Google campaign: link Ads ↔ GA4, import `purchase` as the primary conversion,
   `add_to_cart` as secondary.
4. **Meta aggregated event measurement**: verify domain `puchica.ca` (and `checkout.puchica.ca`
   as the same domain) in Business Settings → Brand safety → Domains, and prioritise
   Purchase > InitiateCheckout > AddToCart > ViewContent.
5. **Consent**: `customerPrivacy.analyticsProcessingAllowed()` returns true by default for Canada
   (no consent banner required); Quebec's Law 25 expects a cookie notice — the storefront has none.
   Recommend Shopify's cookie banner via Settings → Customer privacy before scaling spend.
6. **Test order check** (do once, ~10 min): place a CA$0 test order via a 100% discount code in
   Shopify test mode and confirm one Purchase in Meta Events Manager and one purchase in GA4
   DebugView — proves the checkout half of the funnel end-to-end. Not done tonight (no discounts
   / no orders were to be created).
