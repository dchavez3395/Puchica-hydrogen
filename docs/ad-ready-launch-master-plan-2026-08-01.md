# Puchica ad-ready launch master plan — 2026-08-01

## Decision and current status

This is the authoritative execution plan for reaching the first controlled paid
advertising test. It supersedes broad-catalog, drawer-tray-first, and
traffic-campaign plans written before the current supplier-route evidence.

Puchica remains a Canadian-owned, North American storefront. The website may
serve Canada and the United States, but paid campaigns launch one verified
market and one verified offer at a time.

### Current launch decision

- First proof market: **United States**.
- Lead offer: **Red 5-Piece Compression Packing Cube Set**.
- Exact option: **`5PCS Set Red`**.
- Shopify variant: **`49961853026554`**.
- Automation owner: **DSers only**.
- Current state: **`GO_LIMITED_TEST_READY`** — operationally qualified for a
  bounded test, but spend is not authorized until the owner approves the exact
  cap at activation time.
- Current route evidence: AliExpress Selection Standard, US$1.99, estimated
  6-day delivery at the U.S. country level, ship-from China. Tracking remains
  an explicit first-order checkpoint rather than a pre-launch claim.
- Failed former hero: the exact 24-piece drawer-tray option returned
  `No Shipping`; it remains **`HOLD_ROUTE / NO_GO_QUOTE`** and must not appear
  in paid creative or a paid landing path.

### Why the cubes lead

- Clear visual before/after demonstration.
- Specific travel-organization problem rather than a generic product pitch.
- Five-piece system supports an understandable value story.
- Observed Shopify inventory was 989 at the last catalog read.
- Observed Admin price amount of 71.45 provides more possible acquisition room
  than the lower-priced supporting items, subject to currency and cost proof.

### What is already working

- The storefront is focused on practical organization rather than a random
  general catalog.
- Canada/U.S. market selection and buyer-country context exist in the Hydrogen
  storefront.
- The shipping page uses checkout-confirmed delivery language.
- Storefront-side GA4 code exists for the pre-checkout funnel.
- Storefront-side Meta Pixel code exists, although a local Meta Pixel ID is not
  currently configured and production still requires verification.
- Product, cart, checkout-safety, localization, and market unit tests pass.
- The production Hydrogen build passes.

### What is approved now, and what is not

The exact red five-piece set may proceed to a **limited-test activation review**
without a U.S. sample address. That exception is intentionally narrow:

- United States only; one exact Shopify variant and one DSers/AliExpress route.
- Meta Sales campaign optimized for Purchase.
- US$17.65 maximum daily spend and US$100 maximum total spend.
- Manual first-order monitoring and immediate pause conditions.
- No scaling and no additional products, variants, markets, or suppliers.

Paid spend still remains zero until deployment, production analytics, creative
QA, a fresh supplier/economics recheck, and explicit owner approval of the
exact budget are complete. See
`docs/us-packing-cubes-limited-test-control-2026-08-01.md` for the activation
contract.

The following remain **scale gates**, not limited-test prerequisites:

1. A controlled Shopify → DSers → supplier → tracking → delivery order passes.
2. Purchase attribution is reliable in production.
3. At least five delivered orders provide usable economics and service data.
4. Actual contribution margin remains at or above 30%.
5. Product mismatch, defect, refund, and complaint rate remains below 10%.

Shopify order #1001's refund/reconciliation is a housekeeping item and does not
block the exact controlled test. No redesign, app subscription, or automation
subscription can substitute for the activation and scale gates.

## Operating principles

### One offer, one owner, one proof market

- Every sellable variant has exactly one automation owner: `DSers`, `AutoDS`,
  or `MANUAL_HOLD`.
- The cube SKU remains DSers-owned through the proof cycle.
- Do not buy AutoDS for this sprint and do not connect the same SKU to two
  automation systems.
- Do not launch Canada and the U.S. together merely because the storefront can
  display both markets. Each country needs its own quotes, checkout proof,
  economics, and controlled delivery.

### Evidence before claims

- A supplier listing is not product proof.
- A country-level shipping panel is not address-level route proof.
- A successful GraphQL mutation is not visible-storefront proof.
- A configured analytics component is not production event proof.
- An add-to-cart is not a sale, and one sale is not scale proof.
- Unknown cost fields remain blank and fail the gate; never convert unknown to
  zero.

### Accessibility is a release gate

The WCAG 2.2 AA workbook remains the controlling review tracker. Every paid
landing path must receive content, design, development, keyboard, mobile,
reflow, contrast, focus, semantics, and screen-reader checks before launch.

### Product optimization runs manually on the hero first

The product-optimization workflow applies after commercial approval:

1. Scope the exact approved product and option.
2. Run one product first in manual mode.
3. Generate lifestyle media from the clearest accurate reference.
4. Human-review product geometry, quantity, color, and included parts.
5. Attach approved media and move it to featured position.
6. Query and visually verify the featured image on the storefront.
7. Only then consider a wider approved batch.

Generated media may add context but may not invent dimensions, parts,
materials, performance, compression percentage, or included quantities.

## Agency structure and accountability

One launch lead owns the final go/no-go decision. Specialists can prepare
evidence, but they do not independently authorize spend or orders.

| Workstream | Accountable owner | Primary outputs |
| --- | --- | --- |
| Launch control | Launch lead | Gate status, decisions, blocker log, spend authorization |
| Finance/economics | Finance lead | Landed-cost rows, contribution, target and break-even CAC |
| Sourcing/DSers | Operations lead | Exact mapping, quotes, supplier evidence, stock, fulfillment proof |
| Product QA | Product lead | Sample checklist, defects, measurements, accepted claims |
| CRO/copy | CRO lead | Dedicated offer page, message match, FAQs, mobile purchase path |
| Creative | Creative lead | Sample-faithful video/stills, hook matrix, captioned exports |
| Analytics | Analytics lead | Event QA, UTMs, attribution, daily launch report |
| Accessibility | Accessibility lead | WCAG 2.2 AA review and issue closure |
| Paid media | Media buyer | Campaign build, pacing, diagnostics, kill/scale actions |
| Customer care | CX lead | Support macros, delivery/return answers, issue and refund log |

The launch lead maintains one status for every gate:

- `NOT_STARTED`
- `IN_PROGRESS`
- `PASS`
- `FAIL`
- `BLOCKED_USER`
- `BLOCKED_EXTERNAL`

## Phase 0 — Control, reconciliation, and document cleanup

**Target duration:** one working day once the relevant accounts are available.
**Paid spend:** zero.
**Owner:** launch lead + operations/finance.

### Agency tasks

1. Reconcile Shopify order #1001 as non-blocking housekeeping.
   - Confirm whether a supplier order or card charge was ever created.
   - Confirm no duplicate exists in any DSers order state.
   - Record Shopify payment, cancellation, fulfillment, notification, and
     refund disposition.
   - The user decides whether to authorize a refund; the agency does not infer
     that authorization.
2. Freeze paid campaigns and AutoDS purchasing.
3. Confirm `5PCS Set Red` remains DSers-owned and mapped to one supplier option.
4. Keep drawer trays on `HOLD_ROUTE` across launch surfaces and planning docs.
5. Mark the old Facebook Traffic plan and July creative package as superseded.
6. Set up one launch-control log with owner, evidence link, date, gate, status,
   blocker, and next action.
7. In Shopify Admin, verify the United States Market is active and remove
   overlapping or contradictory U.S. shipping rates. A historical checkout
   audit exposed Canada and the United Kingdom but did not prove a usable U.S.
   destination.

### Exit gate

- Any #1001 supplier liability is documented; unresolved refund administration
  does not block the exact limited test.
- No duplicate or automatic supplier order is waiting.
- The cube option has one automation owner.
- Every active agency member uses this plan as the launch authority.

## Phase 1 — Exact route, checkout, and unit economics

**Target duration:** one to three working days.
**Paid spend:** zero.
**Owner:** sourcing + finance.

### Exact evidence to capture for the full route gate

For `5PCS Set Red`, capture:

- Shopify product and variant IDs;
- customer-facing option name and supplier option name;
- DSers mapping screenshot;
- supplier name, listing URL/product ID, score, ordinary item price, and stock;
- mapped supplier SKU and ship-from location;
- tracked route to ZIP 10001;
- tracked route to ZIP 90001;
- shipping service, cost, tracking availability, dispatch estimate, and
  delivery minimum/maximum for each destination;
- Puchica-paid duties, brokerage, import charges, automation charges, handling,
  and packaging;
- quote timestamp, currency, FX source, and FX rate;
- actual no-payment U.S. Shopify checkout merchandise price and currency;
- actual active promotion, including FIRST15 if it can apply;
- Shopify Payments percentage and fixed fee;
- documented return/refund reserve; and
- current Shopify and supplier inventory.

Use ordinary pricing, not a new-customer or expiring supplier promotion.

### Economics formulas

Use one currency in each row.

```text
R = checkout merchandise price × (1 - promotion rate)
F = (R × payment percentage fee) + fixed payment fee
L = item cost + supplier shipping + duties/brokerage/import charges
    + automation/order charge + handling + packaging
Q = return/refund reserve
C = R - F - L - Q
pre-ad contribution margin = C / R
break-even CAC = C
initial target CAC = 0.70 × C
```

Do not count customer sales tax as revenue. Exclude customer-paid shipping from
the base gate until its net retained amount is proven.

### Exit gate: `GO_SAMPLE` / full `GO_PAID_TEST`

All must pass:

- exact Shopify-to-DSers mapping;
- tracked, usable quotes for both ZIPs;
- all required cost fields complete;
- supplier and Shopify inventory each at least 25;
- worse-ZIP contribution margin at least 30%;
- current checkout price, currency, promotion, and route agree;
- production checkout accepts both U.S. test destinations with one clear rate
  strategy;
- content and images show the exact five-piece red option; and
- no unresolved IP, safety, material, compatibility, or claim risk.

If the cubes fail, preserve the evidence and quote in this order:

1. Gray Travel Cable Organizer Pouch.
2. White Small Wheeled Under-Sink Organizer Bin, after refreshing its thin
   reported inventory of 26.
3. A newly sourced organization product.

Do not revive the failed drawer-tray supplier route.

For `GO_LIMITED_TEST`, the validated country-level record in
`docs/us-packing-cubes-limited-test-evidence-2026-08-01.json` replaces the
two-ZIP and sample prerequisites only. Its tighter US$100 cap, manual first-order
handling, freshness check, and pause controls are mandatory.

## Phase 2 — Optional sample and physical QA for scaling

**Target duration:** supplier transit plus two QA days.
**Paid spend:** zero.
**Owner:** operations + product QA + creative.

### Authorization boundary

Before purchase, present the user with the exact option, supplier, recipient,
tracked method, item charge, shipping, tax/duty, card-currency total, and
maximum authorized charge. The user approves and submits the transaction.

If a sample becomes practical, use a consenting recipient in a supported
destination. Do not substitute another color/configuration. Absence of a U.S.
recipient does not block `GO_LIMITED_TEST`; it does block claiming sample-tested
performance and remains an input to unrestricted scaling.

### Sample acceptance

- Exactly five pieces arrive.
- Every dimension is within the greater of 2 cm or 5% of the verified listing.
- The red color and included pieces match the page.
- Seams, mesh/fabric, handles, zipper tracks, pulls, and compression hardware
  have no critical defect.
- Every zipper completes 50 empty and 25 loaded cycles.
- A repeatable clothing load is measured before and after compression.
- The set stays compressed for 24 hours and then passes reinspection.
- Packaging is customer-acceptable and contains no misleading supplier insert
  or unexpected brand.
- Tracking works from first scan through delivery.
- Delivery is no later than the quoted maximum plus two days.
- Actual landed charge is no more than 5% above the approved quote.

### Creative capture during QA

Record original vertical footage of:

1. the empty suitcase;
2. all five pieces and their intended roles;
3. packing by category;
4. closing/compressing the set;
5. the completed suitcase;
6. finding one category without unpacking everything; and
7. zipper, seam, handle, and material close-ups.

Do not claim “50% more space,” “waterproof,” “TSA approved,” “airline
approved,” or a specific compression percentage unless the test directly
supports the exact wording.

### Exit gate

Set `SAMPLE_PASS` only when no critical product, delivery, tracking, packaging,
substitution, or cost-variance failure exists.

## Phase 3 — Offer and paid-traffic landing path

**Target duration:** complete before activation; refine after delivered-order evidence.
**Paid spend:** zero.
**Owner:** CRO + copy + creative + frontend.

### Offer positioning

Primary promise:

> Pack by category. Find what you need without unpacking everything.

Start with one exact five-piece offer. Do not stack FIRST15 automatically unless
the discounted worse-ZIP economics still clear 30%.

Possible later offers, each requiring separate economics:

- Travel Reset Kit: cube set + validated cable pouch.
- Two cube sets with a controlled couple/family discount.
- A validated cable organizer as a cart add-on, not the first ad hero.

### Dedicated page sequence

The ad must land on an exact-offer route, not the homepage or a generic
collection.

1. Opening exact-product media and the same promise as the ad.
2. Exact title, option, price, currency, stock state, and add-to-cart.
3. Exact-product 8–15 second demonstration; supplier media must be identified
   internally and cannot imply Puchica performed physical testing.
4. Three proof-led benefits.
5. Exact included pieces and dimensions.
6. “Measure before ordering” guidance where relevant.
7. What each piece is best used for.
8. Only evidenced material/care information; add sample findings later if a
   sample is completed.
9. Delivery availability and estimate shown at checkout.
10. Returns summary linked to the full policy.
11. Visible contact/support path.
12. Product-specific FAQ.
13. Sticky mobile add-to-cart after the main purchase control leaves view.

Avoid unrelated products above the first CTA, fake scarcity, fake reviews,
supplier watermarks, mismatched colors/configurations, hidden delivery terms,
carousel-heavy hero behavior, or claims copied from the supplier without proof.

Hide unavailable supplier-style options from the launch experience. For the
lead product, shoppers should not encounter twelve disabled colors/configurations
when only the approved red five-piece option can be purchased. Suppress the
reviews section until genuine review content exists.

### CRO acceptance

- Ad, hero, product, price, currency, option, and CTA match.
- The customer can understand what arrives, its dimensions, its price, and how
  delivery is determined before paying.
- Add-to-cart, cart, market selection, discount, and checkout handoff work.
- Purchase path passes on real browsers at 375 px and 390 px.
- No unavailable default option, dead CTA, broken image, or visible layout shift.

### Accessibility acceptance

- One logical H1 and meaningful landmark/heading order.
- Informative media has accurate alt text; decorative media has empty alt.
- All controls work with keyboard and visible, unobscured focus.
- No keyboard trap in navigation, market selection, gallery, cart, or sticky CTA.
- Names, roles, states, errors, and status changes are programmatic.
- Text/UI contrast passes; meaning does not rely on color alone.
- Touch targets meet at least 24 × 24 CSS px; shared primary controls target
  48 px where practical.
- 200% resize and increased text spacing remain usable.
- 400% zoom / 320 CSS px reflows without horizontal page scrolling.
- Mobile landscape, reduced motion, and screen-reader spot checks pass.

## Phase 4 — Measurement and attribution proof

**Target duration:** one to two working days; Purchase proof may require the
first controlled customer order.
**Paid spend:** zero.
**Owner:** analytics + frontend + media buyer.

### Required event sequence

Verify in production, not only locally:

1. `PageView`
2. `ViewContent` with exact product ID, value, and currency
3. `AddToCart` exactly once per action
4. `InitiateCheckout` exactly once per checkout
5. `Purchase` exactly once with order value and currency

Also verify:

- Meta domain verification;
- Pixel ID in the production environment;
- Pixel/Conversions API event deduplication;
- GA4 Measurement ID in production;
- source/medium/campaign persistence through Shopify checkout;
- UTMs on every campaign and creative;
- test/internal orders excluded from decision reporting; and
- consent/privacy behavior appropriate to the active markets.

Use Shopify variant IDs consistently across `ViewContent`, `AddToCart`, and
checkout item payloads so funnel events can match the same catalog item.

Meta recommends using Pixel with Conversions API for more reliable measurement:
https://www.facebook.com/business/help/AboutConversionsAPI

### UTM standard

```text
utm_source=meta
utm_medium=paid_social
utm_campaign=us_packing_cubes_sales_t01
utm_content={angle}_{hook}_{format}_{version}
utm_term=broad
```

### Daily launch report

Report by date, market, device, product, campaign, ad set, and creative:

- spend;
- impressions and reach;
- outbound clicks and CTR;
- landing-page views and cost;
- view content;
- add-to-cart count/rate;
- checkout count/rate;
- purchases, revenue, and conversion rate;
- target CAC, actual CAC, and break-even CAC;
- contribution after ad spend;
- refunds, defects, delivered orders, and late deliveries; and
- event-quality or attribution anomalies.

### Exit gate

Before limited activation, the three storefront events must appear once with
correct values. The Shopify-hosted Purchase path must either be verified or the
documented manual Shopify-order reporting fallback accepted for this capped
test. Any missing/duplicate Purchase after the first order is a hard stop.

## Phase 5 — Controlled Shopify-to-DSers fulfillment

**Target duration:** supplier transit.
**Paid spend:** zero.
**Owner:** operations + user approval checkpoints.

Treat the first genuine customer order as the controlled fulfillment order.
Recheck economics before placing its supplier order and keep auto-pay disabled.

Verify:

- correct Shopify order and exact variant;
- DSers receives it within 60 minutes;
- no duplicate is created;
- no supplier charge happens automatically;
- the user separately approves the supplier charge ceiling;
- the exact option and tracked service remain correct;
- actual supplier charge is within quote plus 5%;
- tracking syncs to Shopify within 24 hours of supplier issuance;
- exactly one fulfillment and notification are created;
- customer tracking resolves to the correct package;
- the delivered product passes the physical checks; and
- actual pre-ad contribution remains at least 30%.

### Exit gate

`FULFILLMENT_GATE_PASS` is mandatory before scaling beyond the limited test.
Any first-order failure pauses the limited test immediately.

One pass does not authorize DSers auto-order or auto-pay. Consider further
automation only after at least five clean delivered customer orders.

## Phase 6 — Organic creative screening

**Target duration:** run alongside the limited test as exact-product content
becomes available.
**Paid spend:** zero.
**Owner:** creative + organic social.

Create at least six hooks across three angles:

### Angle A — suitcase reset

Show the messy-to-organized transformation in the first second.

### Angle B — find things faster

Demonstrate retrieving one category without emptying the suitcase.

### Angle C — the five-piece system

Show all five pieces and one clear role for each.

Creative rules:

- Exact red five-piece product appears in the first second.
- Demonstration comes before brand story.
- Use one promise per creative.
- Produce a captioned 9:16 master with safe 4:5 and 1:1 crops.
- Primary tests run 8–20 seconds.
- CTA and opening frame match the dedicated landing page.
- No unsupported performance, urgency, scarcity, review, or delivery claim.

Publish organically on Instagram Reels, Facebook Reels, and TikTok. Use early
hold, completion, saves, comments, and qualified product-page visits only to
remove obviously weak creative; organic engagement is not purchase proof.

Select three distinct paid candidates.

### Creative production tool policy

Use the exact supplier media as the product-accuracy reference. Codex image
generation and Antigravity/Nano Banana Pro are the default still-image tools.
CreateUGC may be evaluated later for one exact-product UGC-style video
prototype, but enrollment, card authorization, generation credits, and renewal
require owner approval. Do not buy both CreateUGC and Higgsfield for the first
test. See `docs/creative-production-stack-and-ugc-test-plan-2026-08-01.md`.

AI-generated avatars may present observable product features, but they may not
pose as genuine customers, claim personal ownership/use, or fabricate a review,
delivery experience, or product result.

## Phase 7 — Initial paid test

**First paid channel:** Meta only.
**Objective:** Sales.
**Conversion event:** Purchase.
**Market:** United States only.
**Owner:** media buyer + launch lead.

Meta describes the Sales objective as the objective for finding people likely
to purchase on a website:
https://www.facebook.com/business/ads/ad-objectives/sales

Do not use the old Traffic campaign plan. It optimizes for a cheaper visit, not
the verified business outcome. Do not split the initial budget among Meta,
Google, and TikTok.

### Campaign structure

```text
Campaign: US | Packing Cubes | Sales | Test 01
Destination: Website
Optimization: Purchase
Geography: United States
Audience: Broad adults; exclude purchasers
Placements: Advantage placements
Ad sets: 1
Ads: 3
Landing page: Exact five-piece cube offer
```

Ads:

1. Before/after suitcase transformation.
2. Find one item without unpacking.
3. Exact five-piece system demonstration.

Do not create a separate retargeting ad set at launch; the initial pool is too
small to justify fragmenting budget.

### Budget authorization

Budget comes from verified contribution, not an arbitrary daily amount.

```text
target CAC = 0.70 × verified pre-ad contribution C
daily test budget ≈ target CAC
initial seven-day cap = 7 × target CAC
```

The launch lead presents the calculated daily budget and seven-day maximum to
the user. The user authorizes the spend ceiling before activation.

If the business cannot fund a concentrated seven-day test, continue organic
creative work rather than dividing a smaller amount across channels.

## Phase 8 — Diagnose, pause, and scale

### Hard technical stop

Pause immediately for:

- wrong market or currency;
- price/offer mismatch;
- unavailable variant or supplier stock below 25;
- missing route or changed supplier mapping;
- broken checkout;
- missing or duplicate Purchase event;
- landing-page/ad mismatch;
- margin below 30%; or
- new safety, IP, product, or delivery risk.

### Creative diagnostic

After approximately 1,000 impressions per ad, pause an ad with outbound CTR
below 1% or landing-page-view cost above twice the campaign median unless it is
producing meaningful downstream actions. Replace one variable at a time: hook,
opening shot, or promise.

### Landing-page diagnostic

After 100 qualified offer-page sessions:

- add-to-cart below 4% → `PAUSE_CREATIVE/CRO`;
- inspect message match, media, offer clarity, price, mobile UX, trust, and
  product evidence before resuming.

### Funnel diagnostic

After at least 20 add-to-carts:

- checkout initiation below 40% of carts → `PAUSE_FUNNEL`;
- inspect cart total, shipping surprise, discount failure, checkout errors,
  payment availability, and market mismatch.

### Purchase and economics diagnostic

- Pause an ad after it spends 3 × target CAC without a purchase.
- Stop the test when blended CAC reaches break-even contribution `C` after the
  authorized budget is consumed.
- Count refunds, defects, and failed deliveries in the result.

### Scale gate

Scale only when:

- at least five paid orders are delivered and accepted;
- defect plus refund rate is below 10%;
- blended CAC is no higher than `0.70 × C`;
- actual cost and tracking remain inside tolerance; and
- inventory and route remain stable.

Increase budget by no more than about 20% every 48 hours while all gates remain
green.

## Phase 9 — Channel and market expansion

### Google

Set up Merchant Center and resolve product-feed, price, currency, availability,
shipping, and return-policy issues. Begin with eligible free listings rather
than paid Performance Max:
https://support.google.com/merchants/answer/13889434

Paid Google waits until the product feed is clean, conversion values are
verified, Meta has produced an interpretable landing-page baseline, and a
separate test budget exists.

### TikTok

Use TikTok organically first. Paid TikTok waits until original sample videos
produce promising audience response, full-funnel TikTok events are verified,
and a separate test budget exists.

### Canada

The brand and storefront remain Canadian/North American. Canada becomes the
second paid market only after the winning exact SKU receives:

- a Manitoba quote;
- an Ontario quote;
- CAD checkout verification;
- Canadian duties/tax and payment economics;
- a separate 30% worse-route contribution result;
- one controlled Canadian fulfillment; and
- Canada-specific creative/landing checks where price or delivery differs.

Do not imply that U.S. supplier evidence proves Canadian availability.

## Exact next 72-hour agency queue

### Operations/finance

1. Close the evidence gap on #1001.
2. Capture actual U.S. checkout currency, price, discount, and payment fee.
3. Complete `5PCS Set Red` mapping and supplier identity evidence.
4. Complete tracked quote evidence for 10001 and 90001.
5. Fill every cost field and calculate the worse-ZIP margin.

### CRO/frontend

1. Reserve a dedicated cube-offer route and define its content schema.
2. Audit the existing cube PDP at 375 px and 390 px.
3. List missing facts/media that depend on the sample.
4. Prepare the sticky mobile CTA and product-specific FAQ implementation.
5. Preserve checkout-first delivery language and market/currency consistency.

### Analytics

1. Confirm Meta Pixel ID and GA4 ID in production.
2. Map every funnel event and its required payload.
3. Define event deduplication and test-order exclusion.
4. Create the UTM naming sheet and daily report schema.
5. Prepare a controlled purchase-event test checklist.

### Creative/copy

1. Draft six hooks without unsupported claims.
2. Create the shot list and sample-QA capture plan.
3. Draft exact five-piece page structure, dimensions module, and FAQs with
   evidence placeholders.
4. Do not publish supplier-derived performance claims before sample proof.

### Accessibility

1. Create the paid-path task list from the WCAG 2.2 AA workbook.
2. Assign content, design, and development owners.
3. Run baseline keyboard, focus, semantics, contrast, mobile, 320 px reflow,
   and screen-reader checks.
4. Block launch on unresolved A/AA failures affecting the paid path.

## Final `GO_LIMITED_TEST` activation checklist

- [x] Exact DSers mapping and one automation owner.
- [x] Country-level supplier route and ordinary item/shipping cost captured.
- [x] Payment fees, reserve, target CAC, and break-even CAC calculated.
- [x] Pre-ad contribution exceeds 30% at the current US$52 price.
- [x] Dedicated exact-offer campaign page passes automated and local route checks.
- [x] Meta and GA4 identifiers are configured locally.
- [ ] Storefront changes deployed and campaign URL verified in production.
- [ ] ViewContent, AddToCart, and InitiateCheckout verified once in production.
- [ ] Purchase verified or manual Shopify-order reporting fallback accepted.
- [ ] WCAG 2.2 AA paid-path checks completed without a blocking issue.
- [ ] Three exact-product creatives approved with matching UTMs.
- [ ] Supplier cost, route, availability, storefront price, and margin refreshed.
- [ ] The owner explicitly authorizes no more than US$17.65/day and US$100 total.

Only when every item is checked may the campaign be activated. This approval
does not authorize scaling.

## `GO_PAID_TEST` / scaling checklist

- [ ] Tracked route evidence is complete for representative destinations.
- [ ] A sample or delivered-order evidence validates product/claim accuracy.
- [ ] PageView through Purchase is reliable without a manual reporting fallback.
- [ ] Controlled Shopify-to-DSers fulfillment passed.
- [ ] At least five paid orders were delivered.
- [ ] Actual delivered-order contribution margin remains at least 30%.
- [ ] Product mismatch, defect, refund, and complaint rate remains below 10%.
- [ ] A new spend ceiling is explicitly authorized by the owner.

Only when every scale item is checked may the launch lead set `GO_PAID_TEST`
and recommend increasing spend.
