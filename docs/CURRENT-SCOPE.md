# Puchica current operating scope

- **Status date:** 2026-08-15
- **Binding storefront commit:** `45fead935e80983f62afaa1ba88c4a57aa64e3a3`
- **Production:** `https://puchica.ca` / deployment `fix: accept canonical Meta event sources`
- **Decision:** organic commerce is live and limited; paid advertising is
  paused.

## How to use this file

This is the canonical starting point for every new Puchica work session. It
supersedes older product counts, niche proposals, soft-launch assortments, and
launch decisions in dated documents. Older files remain evidence and history,
not current authorization.

If sources disagree, use this order:

1. Customer safety, legal truthfulness, platform rules, and fresh verified data.
2. The exact product/SKU gates in code and live Shopify state.
3. This scope and `docs/puchica-operating-quality-gates.md`.
4. The newest product-specific evidence record.
5. Older plans, audits, and sourcing notes as historical context only.

No successful build, Shopify status, DSers connection, supplier sales count,
or attractive product image overrides the exact product gate.

## North-star objective

Build a repeatable, truthful, profitable first-sales loop for Puchica's focused
travel and organization assortment:

`qualified visit -> exact product -> safe cart/checkout -> exact DSers order -> tracking -> delivery -> measured contribution`

The immediate objective is not more products, another niche, another supplier
platform, or more design work. It is to prove that this loop works with the
current catalog and learn which offer deserves a small paid test.

## Binding current state

| Area                | Current truth                                                                                                     |
| ------------------- | ----------------------------------------------------------------------------------------------------------------- |
| Storefront          | Shopify Hydrogen on Oxygen at `puchica.ca`                                                                        |
| Repository          | `codex/overnight-growth-2026-08-14`; Production storefront commit is `45fead9`                                    |
| Production artifact | Shopify Oxygen deployment `#5255529`, `Current` / `Ready`, description `fix: accept canonical Meta event sources` |
| Fulfillment stack   | Shopify + DSers + exact AliExpress supplier mappings                                                              |
| Catalog             | 9 Active product pages; 29 rejected legacy products quarantined as Draft                                          |
| Canada              | 10 exact approved SKUs across 9 pages                                                                             |
| United States       | 8 exact approved SKUs across 7 pages                                                                              |
| Market exclusions   | Packing cubes and Large Blue storage bag are Canada-only                                                          |
| Publications        | Every approved product is published to Online Store and Puchica Storefront                                        |
| Organic selling     | `GO_ORGANIC_LIMITED`, one early order at a time                                                                   |
| Paid advertising    | HOLD; no campaign or spend is authorized                                                                          |
| Discounts           | `FIRST15` is expired and must not be advertised                                                                   |
| Other platforms     | Do not add AutoDS or another paid fulfillment subscription now                                                    |
| Other markets       | Mexico, Spain, LATAM, and additional languages are later phases, not current scope                                |

## Release and rollback controls

- Read-only catalog preflight: `npm run organic-release-check`.
- Do not rerun the catalog apply command unless the approved catalog state is
  deliberately changing.
- Catalog rollback: `node scripts/manage-organic-release.mjs --rollback`. It
  returns the four cohort products that began as Draft to Draft, keeps the five
  products that entered the current cohort as Active, and never reactivates the
  29 rejected products.
- The nearest usable code rollback is commit `031b259` / Oxygen asset `4183152`.
  It predates the final ATC feedback fix, so a forward hotfix is preferred.
- Do not use interim commit `eec6873` / asset `4183190` as a rollback target.
- For a future code release, deploy only a clean committed and pushed exact SHA
  after tests, lint, launch-safety checks, and a production build pass. Record
  the Shopify CLI exit code, Oxygen asset, client bundle, and a successful
  `puchica.ca` response. Never promote an uncommitted worktree.

## Frozen organic catalog

Only these exact SKUs may be discovered, selected, added to cart, or fulfilled.
Product-level approval never approves every variant on a supplier listing.

| Product page                                   | Exact approved SKU(s)                            | Canada | United States |
| ---------------------------------------------- | ------------------------------------------------ | -----: | ------------: |
| Charcoal 3-Piece Packing Cube Set              | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` |    Yes |            No |
| Black Double-Layer Travel Cable Organizer Case | `14:193#Double Layers`                           |    Yes |           Yes |
| White Luggage ID Tag                           | `14:29#white;5:361386#1pcs`                      |    Yes |           Yes |
| Ten-Hole White Cable Organizer Clips           | `14:771#10 Holes-White`                          |    Yes |           Yes |
| White Semi-Circular Travel Jewelry Case        | `14:29`                                          |    Yes |           Yes |
| Large Blue Handled Clothes Storage Bag         | `14:350852#Large Blue`                           |    Yes |            No |
| Black Hanging Travel Toiletry Organizer        | `14:771#Black`                                   |    Yes |           Yes |
| Black Knitted Luggage Wheel Covers, Set of 4   | `14:193`                                         |    Yes |           Yes |
| Soft Luggage Handle Wrap                       | `14:350686#coffee color`; `14:193#Black`         |    Yes |           Yes |

The storefront has a second fail-closed layer: direct URLs, stale carts, search,
recently viewed, market switching, desktop ATC, and mobile ATC all recheck the
exact market/SKU allowlist. The Coffee Brown/Black selector and both exact cart
lines passed live QA.

## What is proven

### Catalog and fulfillment evidence

- All 10 Canadian SKUs and 8 United States SKUs passed the documented exact
  mapping, stock signal, ordinary cost, margin, copy, imagery, and
  destination-route gates before release.
- Packing cubes are Canada-only: the exact mapped U.S. route was `No Shipping`.
- The Large Blue storage bag is also intentionally Canada-only.
- The nine approved products are the only Active Shopify products; the 29
  rejected legacy products have their approval/route tags removed and remain
  Draft.
- A real supplier order has not yet proven the entire post-purchase automation
  chain. Therefore fulfillment remains controlled and manual for early orders.

### Live storefront

- Canada: 9 product pages / 10 exact SKUs; correct CAD collection, PDP, cart,
  and checkout handoff behavior.
- United States: 7 product pages / 8 exact SKUs; correct USD behavior; both
  Canada-only pages return the controlled 404 and their cart lines are purged
  after a market switch.
- Search and predictive recently viewed do not leak held or wrong-market
  products.
- Handle-wrap Coffee Brown and Black choices expose only the two approved
  variants; the exact add/remove/switch/add sequence passed live QA.
- An expired or error-shaped Storefront cart cookie is now replaced with a new
  usable cart before adding an approved line. A production stale-cookie probe
  and a fresh Chrome customer trace both passed for the cable organizer.
- Core semantics passed: skip link, language, main landmark, one PDP H1,
  canonicals, labelled core controls, useful image alt text, and no observed
  desktop horizontal overflow.
- The bounded 390 x 844 and 768 x 1024 browser-viewport funnel matrix passed;
  the controlled mobile 404 reflows without horizontal overflow and retains a
  focusable main landmark. A physical-device sign-off remains separate.
- The live crawl passes 9/9 Canadian pages, 7/7 U.S. pages, and both intended
  U.S. 404s. Portuguese product pages self-canonicalize to `pt-br`; market-
  blocked product responses carry `X-Robots-Tag: noindex, nofollow` and
  `Cache-Control: no-store, max-age=0`.
- Hydration errors seen only in Codex/Chrome QA are caused by the test tools
  injecting a third child under `<html>`; raw Oxygen HTML is clean.

### Measurement and economics

- **Fresh 2026-08-14 normal-Chrome destination trace:** GA4 Realtime received
  `view_item`, `add_to_cart`, and `begin_checkout`, and displayed the Puchica
  checkout page. QA traffic is not a customer-demand baseline.
- Existing exact-SKU contribution evidence supports organic selling. It does
  not create a blanket paid CAC budget for all nine products.
- `npm run organic-economics` now combines live localized prices with the dated
  exact DSers baseline and fails closed after seven days. Toiletry and cable
  remain the cross-market hero cohort; the jewelry case is the strongest third
  candidate. Every row remains paid-ad `HOLD`.
- Meta dataset/Pixel `1616698610095354` is now selected in business portfolio
  `1567358971667584`, the business contact email is confirmed, the CAPI token
  is stored as a Production secret, and Meta accepted a synthetic non-PII
  server test. The live storefront relay returns `204`, while Events Manager
  shows processed browser `PageView` events. The three pre-purchase events and
  browser/server deduplication still require a normal owner-controlled browser
  trace; controlled QA browsers are intentionally excluded by the storefront's
  bot filter and cannot close that evidence gate.
- Checkout has shown the configured Canadian and U.S. shipping rules in bounded
  tests. The cable and toiletry hero offers passed fresh representative CA/U.S.
  checkout and economics checks on 2026-08-14. A complete nine-product address
  matrix is not required before the one-offer paid-test decision.
- No tax line appeared in the sampled Winnipeg or Seattle checkouts. This is an
  observed configuration result, not a legal conclusion. Do not change tax
  settings or make tax claims until the owner's intended treatment and
  registration obligations are documented.

## Current work lanes

### Lane 1: close the no-spend pre-ad evidence gaps

This is the active technical lane.

1. Obtain a short physical-phone/tablet sign-off for the already-passing
   responsive browser matrix: home, collection, selector PDP, cart, market
   switch, and checkout handoff.
2. **Completed 2026-08-14:** keyboard-only navigation, visible focus and
   focus-trap checks, 320 CSS px reflow, heading/label/landmark checks, and the
   focused automated accessibility suite passed across the primary funnel.
3. **GA4 completed 2026-08-14; Meta connection completed 2026-08-15, event
   trace remains:** the normal-Chrome customer path produced GA4 `view_item`,
   `add_to_cart`, and `begin_checkout`. The correct Meta dataset, browser Pixel,
   CAPI token and live relay are connected. Use a normal owner-controlled
   browser to confirm `ViewContent`, `AddToCart`, `InitiateCheckout`, matching
   event IDs, and browser/server deduplication in Events Manager.
4. **Completed 2026-08-10:** crawl all 9 Canadian and 7 U.S. product routes plus
   robots, sitemap, canonicals, hreflang, status, and indexability.
5. **Completed 2026-08-14 for the two hero offers:** representative Canadian
   and U.S. address-to-shipping-rate checkout behavior passed without placing
   an order. Tax presentation remains documented separately and unchanged.

### Lane 2: begin controlled organic learning

This lane can run while Lane 1 is being closed.

1. **Completed 2026-08-10:** replace the dated two-product pack with a prepared
   nine-page organic content pack that does not imply every product ships to
   the U.S.
2. **Completed 2026-08-14:** an eight-post Instagram schedule uses exact media,
   truthful captions and accessible copy. TikTok was removed from the active
   operating plan on 2026-08-17 at the owner's direction; its historical post
   and prepared files are not part of current launch decisions.
3. **Prepared, not published:** an Instagram-safe motion-first master exists for
   the black hanging toiletry organizer. It uses exact approved source
   photography, continuous animation, truthful inclusion/market copy, and no
   fake customer testimonial.
4. **Completed for the first Instagram releases:** the user explicitly approved
   publication. Any additional public post still requires approval.
5. **Active:** the measurement baseline began at the first public-post
   timestamp. Exclude `codex_qa / measurement` traffic.
6. Review qualified sessions, product-view to ATC, ATC to checkout, customer
   questions, and product-specific interest after seven days.
7. **Preview-verified 2026-08-17:** `/instagram` fixes the Instagram profile link
   to a stable first-party redirect with `instagram / organic_social /
   travel_edit_organic_202608 / profile_bio` attribution. Unit tests, the
   production build and a private Oxygen preview passed. Production promotion
   stopped at Shopify's required interactive confirmation, so the existing
   profile link remains unchanged until the owner completes that confirmation
   and separately approves the external Instagram profile edit.
8. **Completed 2026-08-17:** the production-health monitor no longer checks the
   retired TikTok channel. Instagram, storefront, catalog, market, feed and
   sitemap checks remain active.

### Lane 3: first-order fulfillment control

For every early organic order:

1. Pause before supplier payment and reopen the exact DSers product and SKU.
2. Reconfirm stock, ordinary item cost, destination, named shipping method,
   shipping charge, ship-from, ETA, and tracking.
3. Stop the affected product/market if the exact option disappears, stock is
   zero, the route becomes `No Shipping`, tracking disappears, the method or
   ship-from changes outside the approved route, ETA materially exceeds the
   disclosed/approved window, cost materially rises, or mapping is ambiguous.
4. Place and process only one customer order at a time.
5. Log actual supplier charge, dispatch, tracking sync, customer notification,
   delivery, duty/brokerage exception, refund/replacement, and final
   contribution.

This is standard dropshipping through DSers. It does not require pre-buying
inventory or adding AutoDS. It does require an order-time check until the real
automation chain has been observed successfully.

## Paid-test gate

Paid traffic can be proposed only after all of the following are true:

- real-device mobile and WCAG funnel checks pass;
- consent-aware GA4/Meta event receipt and deduplication pass;
- live crawl/indexability and representative shipping-rate checks pass;
- tax/discount presentation is documented and truthful;
- one genuine organic order completes the exact DSers recheck, supplier charge,
  dispatch, tracking sync, customer notification, delivery, duty/brokerage and
  refund/replacement outcome review; its actual delivered contribution remains
  acceptable for the offer under consideration;
- exactly one Meta `Purchase` and one GA4 `purchase` are verified from that
  genuine order with the correct order ID, value, and currency, or an explicit
  manual-reporting fallback is approved before any test;
- at least one exact offer has current landed economics and an explicit CAC
  ceiling with pre-ad contribution margin at least 30% of revenue;
- creative uses the exact product/configuration and contains no unsupported
  sales, review, scarcity, delivery, waterproof, compression, brand, or
  inclusion claims;
- the user approves the offer, budget, duration, and stop rules before spend.

The first paid test will be one offer in one primary market with one bounded
budget. It will not be one simultaneous campaign per product.

Before proposing that test, build a current per-SKU, per-market contribution
sheet for no more than two candidates. Use revenue excluding sales tax, then
deduct item cost, supplier shipping, business-paid duty/brokerage, Shopify/card
fees, refund reserve, and any verified discount. Require pre-ad contribution
margin of at least 30% of revenue. Define the resulting contribution dollars as
`C`: break-even CAC is `C`, and initial target CAC is no more than `0.70 × C`.
The bounded starting framework is a daily budget near target CAC, a seven-day
cap of `7 × target CAC`, pausing an ad at `3 × target CAC` without a purchase,
and stopping the blended test at break-even `C`. Final budget, duration, and
stop rules still require the user's explicit approval.

## Deliberate non-goals

Until the current lanes are complete:

- no niche pivot;
- no new product sourcing or arbitrary tenth page;
- no broad redesign, navigation rebuild, or storewide copy rewrite;
- no Shopify/DSers remapping unless a current exact mapping fails;
- no AutoDS, Zendrop, or other paid-platform subscription;
- no legacy-product reactivation;
- no additional country/language rollout;
- no live discount activation or tax-setting change without a separate review;
- no agent-initiated test order, supplier payment, public post, campaign, or ad
  spend without the required authorization; genuine customer orders may arrive
  and must enter the one-at-a-time fulfillment runbook;
- no synthetic reviews, compare-at pricing, countdowns, unsupported scarcity,
  or supplier-sales claims.

## Decision cadence

### Daily while organic traffic is active

- Check storefront availability, cart/checkout handoff, and any customer
  messages.
- If an order appears, use the first-order fulfillment control before supplier
  payment.
- Record faults and stop only the affected product/market; do not reset the
  whole niche for an isolated issue.

### Weekly

- Refresh exact DSers stock, item cost, and CA/U.S. route evidence for the 10
  approved SKUs.
- Review analytics excluding QA traffic.
- Recalculate actual contribution using current landed costs and any real
  exceptions.
- Decide `KEEP`, `HOLD`, or `STOP` per SKU. Do not treat weak interest as proof
  of a supplier failure or one supplier issue as proof the niche is wrong.

### Expansion decision

After early fulfillment and organic evidence, choose one path:

1. prepare one paid offer around the best proven product; or
2. qualify one coherent tenth travel/organization page through the same exact
   SKU, cost, route, copy, imagery, accessibility, and storefront gates.

Do not do both before the evidence review.

## Immediate next actions

| Priority | Action                                                                                   | Owner        |                     External mutation? |
| -------: | ---------------------------------------------------------------------------------------- | ------------ | -------------------------------------: |
|        1 | Physical-phone/tablet final visual and checkout-handoff sign-off                         | User         |                                     No |
|        2 | Run a normal-browser Meta funnel trace and prove pre-purchase event deduplication        | User + Codex |                      No spend required |
|        3 | Continue read-only production, social-attribution, and first-order monitoring            | Codex        |                                     No |
|        4 | Review qualified organic behavior after the seven-day/100-session evidence window        | Codex        |                                     No |
|        5 | Process the first genuine order through the exact DSers pre-payment and delivery runbook | User + Codex |         Yes, only when an order exists |
|        6 | Verify Purchase events, actual delivered contribution, and propose one capped paid test  | User + Codex | Budget approval required; no spend yet |

Actions 1 and 2 require an owner-controlled physical device or normal browser
because automated QA sessions are deliberately excluded from analytics. The
Meta business and dataset are already connected. Actions 3 and 4 continue
without user intervention. Stop before additional publishing, ad spend,
agent-initiated test orders, real supplier payment, or business/tax setting
changes.

Each of the three pre-ad evidence gates must end in a dated artifact and an
explicit `PASS`: a mobile/accessibility device-and-browser matrix, an analytics
event/deduplication trace, and an SEO crawl/shipping-rate report. A verbal
impression or a partially sampled check does not close a gate.

## Owner compliance watchpoint

Current owner-stated facts are: sole individual operator, not yet a registered
Canadian business, not registered for GST/HST, below the small-supplier
threshold, and receiving Employment Insurance. These facts do not block the
controlled organic launch and are not legal conclusions. As revenue begins,
record gross sales and business income, monitor the GST/HST threshold, and
confirm EI income/reporting and registration obligations against current
CRA/Service Canada guidance or qualified professional advice.

## Control references

- `scripts/manage-organic-release.mjs` — read-only catalog preflight, organic
  release, and rollback.
- `scripts/check-first-order-signal.mjs` — read-only demand signal gate that
  excludes the known test order.
- `scripts/check-organic-economics.mjs` — live localized price and dated exact
  supplier-route economics monitor.
- `app/lib/launch-catalog.js` — exact market/SKU storefront gate.
- `docs/puchica-operating-quality-gates.md` — product, media, commercial, and
  WCAG principles derived from the user's workflow documents.
- `docs/recovery-evidence/organic-release-control-plane-2026-08-10.md` — exact
  release architecture.
- `docs/recovery-evidence/organic-release-execution-2026-08-10.md` — release
  execution record for catalog facts. Its original deployment SHA/asset block
  is superseded by `fe1c7e8` / asset `4183654` in this file.
- `docs/recovery-evidence/mobile-wcag-primary-funnel-2026-08-10.md` — bounded
  responsive and WCAG funnel evidence plus remaining physical-device gaps.
- `docs/recovery-evidence/live-analytics-dedup-gate-2026-08-10.md` — current
  measurement evidence and the controlled-browser suppression boundary.
- `docs/recovery-evidence/live-seo-indexability-gate-2026-08-10.md` — complete
  live catalog, locale, canonical, and market-404 crawl evidence.
- `docs/recovery-evidence/dsers-mapped-catalog-remediation-2026-08-10.md` —
  current exact catalog remediation evidence.
- `docs/recovery-evidence/frozen-catalog-fulfillment-gate-2026-08-09.md` —
  detailed original-product DSers evidence and order-time watchpoints.
- `docs/recovery-evidence/launch-analytics-verification-2026-08-09.md` — GA4 and
  Meta measurement boundary.
- `docs/recovery-evidence/organic-economics-ranking-2026-08-14.md` — current
  nine-product organic contribution ranking and paid-ad hold boundary.
- `docs/recovery-evidence/normal-browser-cart-checkout-trace-2026-08-14.md` —
  stale-cart repair, fresh customer-path proof, GA4 receipt, and current Meta
  boundary.
