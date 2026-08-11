# Puchica current operating scope

- **Status date:** 2026-08-10
- **Binding storefront commit:** `fe1c7e89872bacbb40de1ceafdad5560ff7d764f`
- **Production:** `https://puchica.ca` / Oxygen asset `4183654`
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

| Area | Current truth |
|---|---|
| Storefront | Shopify Hydrogen on Oxygen at `puchica.ca` |
| Repository | `codex/catalog-continuation-2026-08-10`; production code commit is `fe1c7e8` |
| Production artifact | Oxygen asset `4183654`; client bundle `entry.client-CUoq0yXM.js`; deployment description `fe1c7e8-preserve-routed-error-directives` |
| Fulfillment stack | Shopify + DSers + exact AliExpress supplier mappings |
| Catalog | 9 Active product pages; 29 rejected legacy products quarantined as Draft |
| Canada | 10 exact approved SKUs across 9 pages |
| United States | 8 exact approved SKUs across 7 pages |
| Market exclusions | Packing cubes and Large Blue storage bag are Canada-only |
| Publications | Every approved product is published to Online Store and Puchica Storefront |
| Organic selling | `GO_ORGANIC_LIMITED`, one early order at a time |
| Paid advertising | HOLD; no campaign or spend is authorized |
| Discounts | `FIRST15` is expired and must not be advertised |
| Other platforms | Do not add AutoDS or another paid fulfillment subscription now |
| Other markets | Mexico, Spain, LATAM, and additional languages are later phases, not current scope |

## Release and rollback controls

- Read-only catalog preflight: `npm run organic-release-check`.
- Do not rerun the catalog apply command unless the approved catalog state is
  deliberately changing.
- Catalog rollback: `node scripts/manage-organic-release.mjs --rollback`. It
  returns the seven newly released products to Draft, keeps the two earlier
  exact-gated products Active, and never reactivates the 29 rejected products.
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

| Product page | Exact approved SKU(s) | Canada | United States |
|---|---|---:|---:|
| Charcoal 3-Piece Packing Cube Set | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | Yes | No |
| Black Double-Layer Travel Cable Organizer Case | `14:193#Double Layers` | Yes | Yes |
| White Luggage ID Tag | `14:29#white;5:361386#1pcs` | Yes | Yes |
| Ten-Hole White Cable Organizer Clips | `14:771#10 Holes-White` | Yes | Yes |
| White Semi-Circular Travel Jewelry Case | `14:29` | Yes | Yes |
| Large Blue Handled Clothes Storage Bag | `14:350852#Large Blue` | Yes | No |
| Black Hanging Travel Toiletry Organizer | `14:771#Black` | Yes | Yes |
| Black Knitted Luggage Wheel Covers, Set of 4 | `14:193` | Yes | Yes |
| Soft Luggage Handle Wrap | `14:350686#coffee color`; `14:193#Black` | Yes | Yes |

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

- GA4 received `view_item`, `add_to_cart`, and `begin_checkout` in the bounded
  production test. QA traffic is not a customer-demand baseline.
- Existing exact-SKU contribution evidence supports organic selling. It does
  not create a blanket paid CAC budget for all nine products.
- Meta Pixel and Conversions API are connected, but a fresh normal-customer
  event receipt and browser/server deduplication trace is not yet proven well
  enough for paid traffic. The controlled QA browsers intentionally suppress
  custom analytics when `navigator.webdriver` is true, so their absence is not
  evidence of a customer-session failure or a pass.
- Checkout has shown the configured Canadian and U.S. shipping rules in bounded
  tests. A complete product/destination address matrix has not been run.
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
2. Complete the remaining keyboard-only, visible-focus/focus-trap, 200% resize, 320 CSS px
   reflow, touch-target, contrast, and automated accessibility checks on the
   primary funnel.
3. Trace consent-aware GA4 and Meta `view_item`/`ViewContent`, `add_to_cart`, and
   `begin_checkout`/`InitiateCheckout` events in both markets. Confirm event IDs,
   duplicate counts, and browser/server deduplication in a normal,
   non-automated customer browser.
4. **Completed 2026-08-10:** crawl all 9 Canadian and 7 U.S. product routes plus
   robots, sitemap, canonicals, hreflang, status, and indexability.
5. Confirm representative Canadian and U.S. address-to-shipping-rate checkout
   behavior without placing an order. Document tax presentation separately.

### Lane 2: begin controlled organic learning

This lane can run while Lane 1 is being closed.

1. **Completed 2026-08-10:** replace the dated two-product pack with a prepared
   nine-page organic content pack that does not imply every product ships to
   the U.S.
2. Prepare a seven-day no-spend content calendar with exact product media,
   truthful captions, accessibility alt text, and stable UTM values.
3. Obtain explicit user approval before publishing to any external social
   account. Publishing is not implied by this scope document.
4. Start the measurement baseline at the first public-post timestamp and exclude
   `codex_qa / measurement` traffic.
5. Review qualified sessions, product-view to ATC, ATC to checkout, customer
   questions, and product-specific interest after seven days.

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

| Priority | Action | Owner | External mutation? |
|---:|---|---|---:|
| 1 | Physical-device sign-off + remaining keyboard/zoom/automated WCAG checks | User + Codex | No |
| 2 | Normal-browser GA4/Meta consent and deduplication trace | User + Codex | No spend; diagnostic events only |
| 3 | Representative CA/U.S. address-to-shipping-rate checkout checks | User + Codex | No order/payment |
| 4 | Review the prepared nine-page organic content pack | User + Codex | No, preparation only |
| 5 | Review and approve external organic publishing | User + Codex | Yes, approval required |
| 6 | Process the first real order through the controlled runbook | User + Codex | Yes, only when an order exists |

No user intervention is expected for Actions 1 through 4 unless an authenticated
service asks for login or a true physical-device sign-off cannot be reproduced
remotely. Stop before publishing, ad spend, agent-initiated test orders, real
supplier payment, or business/tax setting changes.

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
