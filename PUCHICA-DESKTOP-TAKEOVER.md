# Puchica complete desktop takeover

## Purpose

This is the single starting document for continuing Puchica in a new desktop
session. It consolidates the business context, storefront work, operational
decisions, sourcing history, evidence boundaries, unresolved launch gates and
the latest change in direction. Read this before taking any action.

The immediate objective is not more visual polish. It is to identify a small,
profitable, fulfilment-safe assortment and reach an evidence-backed launch
decision without wasting money.

## Executive status

- Brand/store: Puchica, `https://puchica.ca`
- Shopify store handle: `puchica-2`
- Storefront: custom Shopify Hydrogen / React Router application
- Business owner: Daniel, operating individually in Canada; Puchica is not yet
  incorporated or registered as a separate business.
- Current commercial status: **not launch-ready for paid acquisition**
- Paid advertising: **PAID_HOLD; no spend is authorized**
- Product approval count: **0 commercially approved launch products**
- Current bottleneck: exact product/supplier economics and fulfilment evidence,
  not storefront design
- Latest strategic decision: stop trying to rescue the packing-cube mapping and
  run a hard commercial reset. Return only three genuinely viable products,
  selected from no more than ten candidates.

## Non-negotiable operating boundaries

- Do not activate, unpause or spend on advertising without a new explicit owner
  approval of the exact campaign, market and cap.
- Do not import, remap, order, subscribe, contact a supplier, enable auto-pay or
  submit supplier payment without explicit approval.
- Do not use the owner's former postal code `R2P 2X1` as a delivery address. The
  owner no longer lives there. It may not be used for an order or represented as
  a current address.
- The owner has no U.S. test-delivery address. Absence of a test order does not
  have to be disclosed to customers, but unsupported sample-tested claims are
  prohibited.
- DSers remains the sole currently selected automation platform. Do not buy
  AutoDS, add another automation owner or map one SKU to competing automation
  systems during the current reset.
- Keep DSers auto-pay off. The first genuine order must be reviewed before any
  supplier payment.
- Preserve user work and untracked evidence files. Never reset, clean or delete
  the working tree to make it look tidy.
- Do not expose credentials, tokens, `.env` contents, private addresses or
  payment data in documentation or commits.
- Do not invent costs. Unknown cost, shipping, duty, brokerage or return fields
  fail the gate; unknown never equals zero.
- Do not use welcome/new-buyer supplier prices for margin planning.

## Business and market decisions

- Puchica is a Canadian-owned small-space organization brand.
- The brand should feel focused, useful, calm and human rather than like a broad
  generic dropshipping catalog.
- The desired long-term market is North America, with Spanish-language expansion
  to Mexico, Spain and other LATAM markets later.
- The storefront can support Canada and the United States, but product approval
  must be destination-specific. A U.S. route does not prove Canada.
- Canada is active in Shopify, but paid promotion remains held until supplier
  routes and economics pass.
- The most recent assortment concept was a five-product carry-on/travel reset:
  compression cubes, hanging toiletry organizer, shoe/laundry separation set,
  electronics pouch and passport/document organizer.
- That concept is now provisional rather than controlling. Packing cubes are no
  longer the paid-ad hero because the supplier mapping failed and the category
  is highly commoditized at the proposed price.
- The new commercial screen should favor products with one clear sellable
  variant, a strong visual problem/solution demonstration, ordinary landed cost
  below roughly 30-35% of retail, tracked U.S. and Canadian shipping around ten
  days where realistically available, and no electrical, medical or high-risk
  safety claims.
- Evaluate at most ten candidates. Deliver exactly three passing products with
  exact supplier URLs, exact variants, ordinary costs, both-market routes,
  realistic retail prices, contribution margins, delivery evidence, return
  constraints and key risks.
- If DSers/AliExpress cannot produce three passing products, state clearly that
  the supplier model is the bottleneck and recommend a different operating
  model. Do not start another marketplace-app trial loop.

## Business/legal context to preserve

- The owner is an individual, not a registered Canadian business at present.
- The owner is on EI but had not received EI payments at the time this was
  discussed. Do not make legal, tax or EI representations from memory; obtain
  current official guidance when an actual registration, revenue or reporting
  decision becomes material.
- Business registration may occur after launch, but the desktop continuation
  should distinguish store testing from actual commercial activity and keep
  clean revenue/expense records from the first transaction.
- Customer duty decision: customers pay applicable duties, brokerage and other
  destination charges not collected at checkout.
- Refused-delivery and return-to-sender cost/refund treatment remains an owner
  decision and must be resolved before transaction-ready status.
- Return model approved: customer pays approved change-of-mind return shipping;
  Puchica pays or reimburses approved return shipping for a confirmed damaged,
  defective or incorrect item when a return is required. Customers must contact
  Puchica first and receive the approved destination/method.
- Never publish the owner's home address as the return address.
- Privacy official/title and public contact details still require confirmation.

## Repository map and current state

### Storefront repository

- Path: `C:/Users/dchav/Desktop/Puchica-hydrogen`
- Branch: `codex/launch-review-2026-08-01`
- Current tracked HEAD after the preservation pass: `05e8b89`
  (`chore: preserve local launch evidence and design artifacts`)
- Complete takeover document commit: `26f7cae`
  (`docs: add complete desktop takeover handoff`)
- Recent major implementation commit: `52b8a55`
  (`feat: prepare North America storefront for launch review`)
- The repository contains many intentional untracked screenshots, evidence files,
  generated images, quote controls and work artifacts. Preserve them.
- No tracked modifications were shown at handoff time; the working tree is dirty
  because of the intentional untracked evidence/assets.

### Reconciliation and control repository

- Path: `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01`
- Branch: `codex/desktop-handoff-2026-08-02`
- Current HEAD: `225c437` (`Sequence packing cube replacement review`)
- Immediately preceding decisions:
  - `4cdd59f` rejected the mismatched packing-cube supplier mapping
  - `68031f5` recorded the exact supplier proof hold
  - `4883ec8` recorded the U.S.-first five-product architecture
- This repository contains the most complete operating, sourcing, policy,
  economics, launch and evidence controls.

### Remote preservation state

- Hydrogen implementation/evidence branch:
  `origin/codex/launch-review-2026-08-01`
- Draft implementation/evidence PR:
  `https://github.com/dchavez3395/Puchica-hydrogen/pull/2`
- Reconciliation/control backup branch:
  `origin/codex/desktop-handoff-2026-08-02`
- Draft reconciliation/control PR:
  `https://github.com/dchavez3395/Puchica-hydrogen/pull/3`
- The temporary `.tmp-radiant-theme` export and Python bytecode caches remain
  locally available but intentionally ignored because the GitHub repository is
  public and those files are reproducible working material rather than project
  evidence.

## Storefront work completed

The live/local storefront received a broad design and conversion pass:

- Homepage redesigned into a focused organization storefront with stronger
  hierarchy, lifestyle imagery, narrower assortment messaging and consistent
  content rails.
- Content widths were aligned more closely with the header/footer rails.
- About page fully reworked with clearer brand story, Canadian ownership,
  product-selection rationale, useful-surprise name story and need-based paths.
- Sitewide copy was tightened to remove generic or robotic phrasing.
- Navigation was simplified to avoid duplicating New Arrivals in the main nav
  and Shop menu; the Shop menu became need-based rather than department-heavy.
- Search suggestions and stale recently viewed content were cleaned up.
- Product cards, category grids, collection headings, sort controls and result
  labels were normalized.
- Product pages were redesigned with a tighter purchase panel, clearer gallery,
  trust indicators, structured description content, accessible accordion cue,
  corrected detail-list padding and less excessive horizontal/vertical space.
- Homepage product blocks were reorganized to avoid awkward full-width add-to-
  cart buttons and empty New Arrivals behavior.
- Locale/currency controls were refined for North American display; avoid a
  redundant presentation such as `CA · CAD · EN` when country and currency
  repeat the same meaning without helping the customer.
- North American cart/checkout safety, currency rendering, localization,
  market-aware checkout handling, SEO feeds/sitemaps and policy rendering were
  strengthened.
- Judge.me was deactivated/removed as a paid dependency; do not reintroduce a
  paid review app without an evidence-based need.

## Accessibility baseline

- WCAG 2.2 AA is a release gate, not optional polish.
- Implemented reviews included visible focus, control size/state, accordion
  affordance, non-color-only meaning, heading structure, product detail lists,
  responsive behavior and copy clarity.
- Still required before a paid path is approved:
  - keyboard pass through navigation, search, product media, cart and checkout
  - screen-reader pass for names, roles, states, errors and status updates
  - text/UI contrast verification
  - mobile landscape and 375/390 px paid-path checks
  - reduced-motion behavior
  - meaningful alt text and captions/transcripts for final creative

## Analytics and advertising state

- GA4 pre-purchase proof: production `view_item`, `add_to_cart`, checkout and
  page-view behavior was recorded as passing.
- Analytics ownership was separated to avoid duplicate native/custom events.
- GA4 Purchase remains unproved for a real transaction.
- Meta remains on hold: fresh Test Events, Purchase, deduplication/CAPI quality,
  value/currency, consent and UTM persistence are not fully proved.
- Do not use the old Traffic-campaign strategy. Any future paid test should be a
  Meta Sales campaign only after product, economics, checkout, policy,
  accessibility and measurement gates pass.
- Previously discussed ceiling was one campaign, one ad set, up to three
  creatives, US$14/day and US$100 total. This is historical planning only and is
  **not authorized spend**.
- CreateUGC.ai may be considered for low-cost UGC production; Higgsfield was also
  discussed. Image generation is available through Codex and Antigravity/Nano
  Banana Pro. Do not buy multiple creative subscriptions for the first test.
- Never fabricate reviews, testimonials, customer use or personal ownership.

## Policies and trust state

- Refund policy: reviewed, published and live-verified; 30-day self-serve window
  aligned. Maintain contact-first, case-specific return instructions.
- Shipping policy: reviewed wording was published and the unsupported “no
  surprise fees” claim was removed. Customers are told they may owe duties,
  brokerage and destination charges.
- Shipping policy still needs evidence-supported delivery ranges/methods and a
  refused-delivery rule.
- Privacy policy: converted away from the raw automated-template dependence, but
  still needs a designated privacy official/contact, final disclosure review and
  production safeguard verification.
- Secure Shopify checkout wording may be used; avoid claiming shipping speeds,
  inventory scarcity, waterproofing, compression percentages, TSA approval or
  other supplier-derived performance facts without evidence.

## Shopify, markets and fulfilment

- Canada market status was recorded active; paid advertising is held.
- U.S. market/checkout exists, but current product-level two-ZIP supplier proof
  is incomplete.
- DSers app/store context used during sourcing: `appId=159831080`.
- DSers is currently the automation owner; auto-pay is not approved.
- Shopify-to-DSers order placement is expected to sync paid orders to Awaiting
  order, then tracking/fulfilment back after supplier payment and shipment.
- This expected workflow is not a substitute for controlled first-order proof.
- Shopify test order/refund housekeeping is secondary to commercial readiness.

## Sourcing history and conclusions

The project has already screened many catalog products and routes. Do not repeat
the same work without reading the controls.

- Multiple older products failed on Canadian shipping cost, missing routes,
  thin post-discount contribution, risk/claims or weak supplier evidence.
- Drawer organizer variants repeatedly failed route or margin gates.
- Shopify Collective audit: complete, no approved product.
- DropCommerce audit: complete, no approved product; do not start a paid plan.
- Syncee audit: complete, no approved product.
- Spocket: explicitly rejected for the current cycle.
- AutoDS: discussed but not adopted. Adding another AliExpress automation layer
  does not solve weak supplier economics or variant integrity.
- Packing-cube mapped product:
  - Shopify variant id: `49961853026554`
  - DSers product id: `2083036447075794944`
  - AliExpress item id: `1005008568050448`
  - Intended exact option: `5PCS Set Red`
  - Live owner screenshots showed `3PCS Set Red`, not the mapped five-piece set.
  - Final disposition: `REJECT_CURRENT_SUPPLIER_MAPPING`.
  - Do not advertise, order, import or remap that listing.
- DSers Supplier Optimizer produced two historical packing-cube replacement
  leads, but neither proved exact contents. The strongest displayed row was
  US$11.22-13.04 plus US$1.99 shipping, seven days, 194 displayed sales and
  ratings around 4.7-4.8. This is evidence history only, not approval.
- After the failed manual screenshot loop, the latest expert decision is to stop
  treating packing cubes as the paid-ad hero and conduct the ten-candidate,
  three-pass commercial reset described above.

## Product approval gate

Every launch product must have all of the following:

1. One canonical Shopify product/variant and clean customer-facing option.
2. One exact supplier product, exact raw variant/SKU and ordinary price.
3. Adequate supplier history, ratings, stock and no silent substitution.
4. Current tracked routes to representative U.S. and Canadian destinations.
5. Item cost, supplier shipping, duty/tariff/brokerage, automation, handling,
   packaging and reserve costs.
6. Clear importer/customer-charge treatment.
7. Supplier return window, return country/address process and responsibility for
   damage, loss, wrong item and change of mind.
8. Exact contents, dimensions, weight, materials, care and limitations.
9. Neutral/approved packaging and usable image rights.
10. Current materially equivalent competitor benchmarks.
11. At least 30% pre-ad contribution at the worse approved destination after
    ordinary promotion/fees/reserve.
12. Evidence-safe copy with no unsupported performance or scarcity claims.
13. Explicit dated `GO`, `HOLD` or `REJECT` disposition.

## Current launch blockers

1. Zero approved products and no approved three-product assortment.
2. No complete exact-SKU landed-cost model for a launch product.
3. No fully proved U.S. and Canadian supplier routes for an approved product.
4. Seller/privacy disclosures and refused-delivery rule incomplete.
5. Final keyboard/screen-reader/mobile accessibility QA incomplete.
6. GA4/Meta Purchase, Meta Test Events/CAPI, consent and UTM proof incomplete.
7. No approved exact-product creative set.
8. No explicit paid-spend authorization.

## Next execution sequence

The desktop continuation should follow this order:

1. Freeze nonessential design work and advertising.
2. Build a candidate list of no more than ten products using the commercial
   criteria in this handoff.
3. Fail candidates early on variant ambiguity, welcome-only pricing, weak
   supplier history, missing Canada/U.S. route, unsafe claims or obvious margin
   failure.
4. Fully validate only the survivors. Return three products with exact evidence
   and an honest recommended assortment.
5. If fewer than three pass, stop and issue a supplier-model decision instead of
   opening another app trial or asking the owner to inspect ambiguous listings.
6. Only after three pass: update Shopify/DSers mappings, product content,
   collection/navigation and pricing with explicit owner approval.
7. Run policy, accessibility, checkout, analytics and first-order SOP gates.
8. Present a final launch dossier and request a separate explicit decision on
   paid spend.

## Owner intervention still required later

- Confirm public legal/operator contact details and privacy official/title.
- Decide refused-delivery/return-to-sender cost and refund treatment.
- Confirm actual Shopify Payments fee and recurring business/app costs.
- Approve any live product import/remap/order/subscription.
- Approve final launch market(s), campaign, budget and spend cap.

No owner intervention is required for read-only candidate research, code review,
local tests, evidence organization, copy drafts or economics preparation.

## Authoritative files to read next

Read these in priority order:

1. `C:/Users/dchav/Desktop/Puchica-hydrogen/PUCHICA-DESKTOP-TAKEOVER.md`
2. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/pre-ad-execution-control-2026-08-02.md`
3. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/us-first-five-product-launch-plan-2026-08-02.md`
4. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/sourcing-pivot-decision-2026-08-02.md`
5. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/launch-readiness-checklist.md`
6. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/design-system-wcag-baseline.md`
7. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/analytics-deployment-closure-2026-08-02.md`
8. `C:/Users/dchav/Desktop/Puchica-reconcile-2026-08-01/docs/canada-market-activation-control-2026-08-01.md`
9. `C:/Users/dchav/Desktop/Puchica-hydrogen/README.md`
10. `C:/Users/dchav/Desktop/Puchica-hydrogen/package.json`

Many older launch and hero-product documents are historical and conflict with
newer conclusions. When they conflict, this handoff and the latest Git history
control. Preserve older files as evidence; do not silently rewrite history.

## Desktop restart checklist

1. Open both repository paths above.
2. Run `git status --short`, `git branch --show-current` and `git log -10
   --oneline` in each repository.
3. Do not reset or delete untracked files.
4. Read the authoritative files in order.
5. Confirm that `PAID_HOLD` remains in force.
6. Confirm current Shopify/DSers state before treating any old screenshot or
   quote as current.
7. Continue with the commercial product reset—not more general site polish.

## Suggested first prompt on desktop

> Read `C:/Users/dchav/Desktop/Puchica-hydrogen/PUCHICA-DESKTOP-TAKEOVER.md`
> completely, then inspect both repositories and continue the Puchica commercial
> reset. Preserve all existing and untracked work. Paid ads, imports, remaps,
> orders, subscriptions, supplier contact and auto-pay remain unauthorized.
> Evaluate no more than ten candidates and return only three products that pass
> exact variant, ordinary price, U.S./Canada route, supplier-quality and landed-
> margin gates. If three cannot pass, make an explicit supplier-model decision
> instead of continuing marketplace or screenshot loops.
