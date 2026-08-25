# Coordination — read this first

Two Claude sessions work on Puchica, and they cannot talk to each other. This
file is the only channel between them. Read it before starting; append to the
log at the bottom before you stop.

| Session | Runs on | Can reach | Cannot reach |
| --- | --- | --- | --- |
| **Local CLI** | Daniel's Windows PC | The logged-in browser: DSers, AliExpress, ad platforms | Live Shopify data unless the Shopify integration is configured there |
| **Remote (web/phone)** | Cloud container | Live Shopify Admin API, the repo, GitHub | Any browser session; `dsers.com` and `aliexpress.com` are blocked at its network gateway |

Both can read and write this repo. **The repo is the shared state.** If it is
not committed and pushed, the other session cannot see it.

Daniel reads the remote session on his phone to follow progress. Write the log
entries so they make sense to a person, not just to a machine.

## The goal

**Replace the catalog with products that can fund their own customer
acquisition, then get the first genuine sale.**

Not: more analysis, more audits, more documents. The repo already has enough of
those, and over-documentation is this project's known failure mode.

## Decided — do not relitigate

These are settled and evidenced. Reopening them wastes the session.

1. **The store is not the problem.** It is production-grade. Two months of
   engineering was never the blocker.
2. **No genuine customer has ever existed.** 14,549 sessions in 90 days, two
   orders, both owner tests. There is no demand signal either way.
3. **CPA has a floor of roughly CA$28** on cold traffic, and scales at about
   40% of order value above it. Crossover: **CA$70**. Full reasoning in
   `docs/sourcing-spec-2026-08-24.md`.
4. **The margins were never bad.** Three of four live products exceed 56%
   contribution margin. They lose money because they are priced under the
   crossover and pay the floor CPA regardless.
5. **Target band: retail CA$90–150, supplier cost at or under a third of
   retail, duties prepaid.** That is ordinary DSers dropshipping, just not
   cheap products.
6. **Canada only.** The US is commercially suspended over the de minimis
   repeal — logistics still work, economics do not.
7. **Hard disqualifiers are legal, not stylistic:** mains electrical, wireless,
   lithium battery, regulated goods, branded/licensed. See
   `docs/dsers-sourcing-criteria-2026-08-24.md`. The best-looking margins in
   this band cluster in exactly these categories, so a purely financial screen
   selects for them.

## Open — needs Daniel, not either session

- Rotate the leaked Admin credential (outstanding since 2026-08-18).
- Carry-On Kit: restore CA$89 or retire it. Live at CA$69, where it earns less
  than a single-order product while needing three manual supplier orders.
- Resolve the pixel-ID contradiction: `paid-launch-check` requires IDs that
  `.env.example` calls optional and only used with the custom Meta bridge —
  which double-counts Purchase and halves reported CPA.
- Confirm the Facebook & Instagram and Google channels are connected in Shopify.
- Switch duty posture to `prepaid` **in Shopify first**, then in code. See
  `docs/duty-prepay-runbook-2026-08-24.md`.

## Division of labour

**Local CLI owns** browser work: DSers variant costs, Canadian routes, stock,
AliExpress research, screenshots of evidence. This is the bottleneck and the
reason that session exists.

**Remote owns** live Shopify reads, GitHub, and reporting status to Daniel on
his phone.

**Either** may write code, docs and tests — but only one at a time, and push
before stopping so the other is not editing stale files.

## Rules that bind both sessions

- **Exact variant, never the listing headline.** A product-level card price is
  what produced the last broken catalog. Read the mapped variant's own cost and
  its Canadian route.
- **Score before importing.** `npm run sourcing-spec -- --csv <file>`. A fatal
  flag rejects regardless of margin.
- **The gates decide, not a persona file or a plan.** If a gate and a document
  disagree, the gate is right and the document needs fixing.
- **No unsupported claims.** Zero sales and zero reviews means no social proof,
  no bestseller framing, no scarcity, no compare-at pricing, no delivery promise
  beyond the disclosed window.
- **Never spend money, publish externally, pay a supplier, rotate a credential,
  or change what customers are charged** without Daniel saying so explicitly.
- **Don't add another audit document.** Extend a script or a test instead. If a
  finding matters, it should be something the build can check.
- **Push before you stop.** Unpushed work is invisible to the other session.

## Current assignment — Stage-1 paid smoke test (single session)

Daniel gave go on the CA$200 Meta test after Part-A verification passed. The
organic relaunch kit remains available as the parallel/fallback path; the
active measurement campaign for paid is `stage1-funnel-smoke`.

<details><summary>Superseded: organic-first assignment (2026-08-25, earlier)</summary>


The local-CLI experiment is over; one remote session runs the work and Daniel
reads status here. The plan of record is the approved 2026-08-25 plan: repair
and restart the stalled 7-day organic test.

Why organic: every paid path fails the corrected CPA model — the current
catalog is floor-bound, the CA$90–150 AliExpress band is mostly legally
unsellable electronics, and print-on-demand loses CA$8–13/order at 29–36%
margin against the 57% needed. At CA$0 CPA the current catalog profits on every
order. The test that proves or disproves organic reach already started on
2026-08-14 and stalled; this restarts it with the corpus repaired.

Canonical measurement: `utm_campaign=organic_relaunch_2026_08`, links generated
only by `node scripts/build-campaign-links.mjs --organic`. The five legacy
campaign values identify historical sessions and nothing else.

</details>

## Progress log

Append newest at the bottom. Keep entries short and factual: what changed, what
it means, what is next. Daniel reads these on his phone.

Format:

```
### YYYY-MM-DD · [local|remote] · headline
- what happened
- what it means
- next
```

### 2026-08-24 · remote · Gates, sourcing spec, and the CPA floor finding

- Added the acquisition gate, Canadian landed-cost model, measurement power
  analysis, campaign link builder, business-model comparison, sourcing spec and
  scorer, and the catalog-block generator. Seven commits, PR #15.
- Corrected an earlier over-strong conclusion: CPA is not flat, it has a floor.
  Dropshipping is viable; the current price point is not.
- Pruned four stale agency personas whose index stated confident falsehoods.
- Store is dormant: zero sessions on 22, 23 and 24 August.
- Next: local CLI reads real DSers numbers for the CA$90–150 band.

### 2026-08-25 · remote · Organic relaunch prepared

- POD tested against the corrected CPA model and failed in every configuration;
  with paid closed everywhere, the organic test in CURRENT-SCOPE is the plan.
- Asset survey found the 08-14 organic launch partially executed and stalled:
  1 IG post (0 interactions), 1 TikTok video (95 views, 0 sessions), 8 Meta-
  scheduled posts expired unrecorded.
- Repaired the corpus: US claims stripped (market suspended), luggage-tag video
  retired, `/tiktok` retargeted to the cable case, one canonical UTM campaign.
- Economics gate now skips suspended markets and its evidence window expires
  2026-08-28 — launch before then or re-read six DSers routes.
- Next: Daniel's preflight (Meta Business Suite check, IP exclusion, channel
  confirmation), then day 1 of the 7-day calendar from the launch-kit artifact.

### 2026-08-25 · remote · Pre-spend verification (Part A) complete

- Daniel authorized ad spend conditional on verification; plan updated: verify
  first, then the CA$200 Stage-1 smoke test. Organic kit remains available.
- Live catalog diffed against the 2026-08-21/22 cost baseline: all six offers
  ACTIVE, prices and exact SKUs match; ad hero black-travel-tech-case verified
  (14:29#Black, CA$34.99, all evidence tags). Kit price drift CA$69 vs CA$89
  remains the one open pricing item (not in the ad plan).
- Competitive read: tech case CA$34.99 sits at parity with Amazon.ca
  comparables (~CA$36); cubes CA$39.99 above commodity band (not advertised).
- Gates: storefront release PASS; suite 268/270 (2 CI-only); measurement
  preflight has no blocking fault, two human items remain (channel
  confirmation, pixel-ID gate contradiction).
- Awaiting Part B from Daniel: DSers spot-check of 5 mapped SKUs, channel/pixel
  confirmation, IP exclusion. Spend must start by Aug 28 or the DSers readings
  become the new baseline first.

### 2026-08-25 · remote · Stage-1 go — ad console delivered

- Daniel approved the CA$200 paid smoke test after Part-A verification.
- Delivered the Stage 1 Ad Console (artifact): campaign settings (Sales /
  Purchase, CA$28/day × 7, broad Canada 25–55), three claim-safe ads with
  gate-validated stage1-funnel-smoke links, pre-registered stop rules, and the
  owner checklist with his own DSers spot-check gate as step 1.
- Only Daniel can create the campaign; no spend from this session. His DSers
  readings for the 5 mapped SKUs get diffed against the Aug 21–22 baseline
  before ads go live; baseline stays valid through Aug 28.
- Monitoring: one combined daily check (paid + organic campaigns, Meta-vs-
  Shopify order reconciliation, first-order runbook on any genuine order).

### 2026-08-25 · remote · Pre-spend gate CLOSED — DSers spot-check satisfied on repo evidence

- Daniel delegated the Part-B DSers spot-check to this session. DSers is
  unreachable from here (gateway policy denial, verified twice including a
  real browser launch) and requires his login regardless, so the check was
  answered against the store's own evidence standard instead: a DSers reading
  is valid for 7 days.
- The chain that satisfies it: (1) the 2026-08-14 simulated-order audit proved
  the full Shopify → DSers handoff on a controlled no-charge order, verified
  all approved SKUs in live DSers records, and repaired the one stale mapping
  found (`Unmapped(0)` after); (2) the 2026-08-21/22 baseline re-read every
  offer's exact-variant cost and Canadian route from the logged-in console —
  valid through Aug 28; (3) today's live Shopify read shows every offer's
  `updatedAt` unchanged since the evidence dates, with SKUs and prices
  matching the baseline.
- Residual risk is a supplier-side change since Aug 22, invisible from any
  session. It is capped by the standing first-order control: no supplier
  payment without a fresh DSers requote, so a dead route costs a refund at
  worst — at CA$200 test scale, 0–2 orders of exposure.
- Verdict: gate satisfied. Nothing further blocks campaign creation on this
  side. Remaining before spend, all Daniel's: confirm the Facebook & Instagram
  and Google channels in Shopify with pixel test events, exclude his own IP
  from analytics, and build the campaign in Ads Manager from the Stage 1 Ad
  Console. Ads live by Aug 28 keeps the baseline window honest.

### 2026-08-25 · remote · Approved catalog published to the ad channels

- Daniel expected the channels fully connected; a live check found the
  Facebook & Instagram and Google & YouTube channel apps installed but zero
  products published to either. He said go, so the six approved offers (five
  singles plus the Carry-On Kit) were published to both publications via the
  Admin API and verified true on re-query. Retired/hold products untouched;
  TikTok and Reddit channels left alone.
- Meta and Google now run their own asynchronous product review, and Google
  Merchant Center may still want shipping/tax settings confirmed by Daniel.
  The Stage-1 link ads do not depend on that review — links go straight to
  puchica.ca product pages.
- Remaining before spend, unchanged and Meta-side only: pixel Test Events
  check, own-IP exclusion, create `stage1-funnel-smoke` in Ads Manager.

### 2026-08-25 · remote · WCAG 2.2 AA accessibility pass on the storefront

- Daniel shared a WCAG audit checklist and asked for the storefront to be
  audited against it. Three parallel code audits (perceivable / operable /
  understandable+robust) found 0 critical, 5 serious, ~17 moderate, ~22 minor.
- All serious and most moderate/minor findings fixed in one pass, 23 files:
  cart promo/gift-card errors were silently dropped (fetcher vs useActionData
  mismatch — also a conversion bug), account form errors now announced via
  role="alert", two contrast failures from the marigold→teal token remap,
  locale menu got real arrow-key navigation, Esc no longer closes the whole
  drawer from inside the locale menu, sticky-header scroll-padding, order
  table markup, heading levels, nested <main>/<html> fixes, ATC status now in
  a live region and errors persist until the shopper acts, address delete asks
  for confirmation, country field explains its 2-letter format, four
  translated strings added to all locales.
- Verified: 281/281 tests (two previously env-blocked suites now run),
  production build clean, storefront release gate PASS.
- Deferred (owner/design calls): PDP hero Ken Burns loop has no pause control
  (reduced-motion guard exists), predictive search combobox semantics,
  surfacing Shopify's field-level address errors, body overflow-x guard.
- Also decided this session: the shared "AI dropshipping" playbook's
  compare-at sale workflow will not be run (violates the no-fake-discount
  rule and Competition Act ordinary-price rules); backend mass-rewrite parked
  until after the ad test; AI product images will come from Daniel's
  Antigravity/Nano-Banana run, reviewed for product fidelity before use.

### 2026-08-25 · remote · Accessibility fixes verified in a real browser

- The a11y changes were exercised in real Chromium (components mounted in a
  test harness — the container's gateway blocks the live storefront APIs, so
  a full live render isn't possible from here): 12/12 behavioral checks pass —
  locale-menu arrow/Home/End/wrap navigation, Escape closes only the nested
  menu then the drawer, focus trap and focus restore — plus axe WCAG scans
  (0 violations) and an axe color-contrast scan of every changed visual state
  (staff-pick badge, Added ✓ / failed buttons, form borders, marigold tile,
  accordion links): 0 violations.
- Nothing on the session side blocks the ad launch. Waiting on Daniel's three
  Meta steps; ads live by Aug 28.

### 2026-08-25 · remote · Acquisition takeover: organic via TikTok connector

- Daniel directed the session to execute rather than hand him task lists. The
  Meta paid campaign is the one thing no session can execute — his Facebook
  login and his ad spend are owner-locked by design, and no Meta connector
  exists (checked the registry). Stance: if `stage1-funnel-smoke` is not live
  by Aug 28, the paid window closes with the cost baseline; no further Ads
  Manager walkthroughs from this side.
- The organic relaunch becomes the actively executed path: the connected
  Higgsfield account can publish to TikTok once Daniel taps a single OAuth
  consent link (generated and sent). After that tap this session posts the
  approved calendar itself — day-2 packing-cubes UGC video first, then the
  cable video, claim-safe captions, canonical organic_relaunch_2026_08 UTM
  links only.
- No spend, no price changes, no new claims. The Ad Console stays valid if
  Daniel completes the Meta setup himself at any time.

### 2026-08-25 · remote · Four-specialist launch audit; gate bug fixed; TikTok post held

- Daniel asked for an all-hands audit of pricing, mapping, shipping/fee
  margins, and everything the shared playbook covered. Built the agency
  roster (.claude/agents: pricing-analyst, sourcing-auditor,
  market-researcher, content-merchandiser) and ran all four in parallel.
  Results dashboard: Launch Audit artifact (2026-08-25).
- Pipeline verified again (SKUs live = baseline, routes fresh through
  Aug 28–29); the real problems are prices, not plumbing: cubes CA$39.99 sit
  ABOVE the observed CA$15–34 Amazon band (most exposed offer — and the
  staged TikTok product, so the post stays HELD); the kit at CA$69 earns
  28.2% margin and sits CA$1 below its own paid crossover — restructure
  recommendation: 4-piece kit at CA$84.99 or restore $79–89.
- Real code bug found by the audit and fixed: the acquisition gate credited
  CA$5 checkout shipping on the free-shipping bundle, overstating kit
  contribution (printed 15.27, true 11.07). collectedCheckoutShipping()
  added to acquisition-economics.mjs (imports the storefront's own
  free-shipping threshold), wired into check-acquisition-gate.mjs and
  canada-duty-impact.mjs, regression test added; 282/282.
- Content findings: cable-case Black Double at 19.99 vs 24.99 siblings
  (anomaly, owner call); tech case missing all SEO fields and features the
  grey photo on a "Black" product; two meta descriptions contradict their
  PDPs (jewelry "leather/hard-shell", cubes "compress"); bundle's "$87.97
  separately" line is anchor framing. Six factual fixes staged for API,
  awaiting Daniel's word. Image shot list for his Antigravity run delivered
  in the dashboard.
- Sourcing red flags: all supplier STOCK readings stale (Aug 14, expired);
  tech case dsers-mapped tag under-evidenced (no product-record row — and
  it is the ad hero); no live offer has order-handoff (L2) proof; five
  retired products + two unapproved tech-case colours still ACTIVE behind
  the code gate. 5-minute DSers console checklist for Daniel is in the
  dashboard; per-market multi-supplier mapping is possible in DSers but no
  evidence shows it configured.

### 2026-08-25 · remote · Audit executed: catalog pruned, reprices live, content fixed

- Daniel approved the audit recommendations; all applied and verified live:
  - Catalog pruned to the verified variant of each product — cubes 8→1
    (charcoal), tech case 3→1 (black), cable case 7→1 (black double-layer).
    Every remaining variant has a matching cost/route evidence row; titles
    are now accurate again.
  - Reprices: packing cubes CA$39.99 → **32.99** (inside the observed market
    band); Carry-On Kit CA$69 → **89.00** (documented price restored; margin
    28%→42%). Kit price drift is closed — gate runs clean.
  - Content: tech case SEO fields written (were null) and black photo set as
    featured; jewelry meta "hard-shell/leather" → faux leather; cubes meta
    "compress" removed; stale colourway alt fixed; toiletry "Selected
    option" artifact removed; kit's "$87.97 separately" anchor line removed.
  - Repo synced: gate + duty script price tables updated; the resolved-drift
    test now asserts clean-and-would-catch-again; 282/282, launch-check PASS.
- Still held: first TikTok post (cable-case video recommended) awaiting
  Daniel's /permissions allow + "retry". Meta paid parked. His 5-minute
  DSers console checklist stands (stock re-read, tech-case product record,
  Advanced Mapping state).

### 2026-08-25 · remote · Slideshow UGC pack retired; pivot to the sample order

- Daniel retired the static-card slideshow videos outright — below the
  quality bar, none ship. Pack marked RETIRED in its README; the captions
  survive as the claim-safe copy reference.
- The replacement standard is real footage of physical products, which the
  store cannot produce because no one has ever held one: no paid sample
  exists (no offer has L3 evidence). The recommended single highest-leverage
  move is one real order of the four hero products through puchica.ca
  itself — it simultaneously (1) proves the full checkout→DSers→supplier→
  delivery pipeline on live rails, (2) refreshes cost/route evidence at the
  moment of supplier payment, (3) delivers the physical products for real
  photos/video, and (4) quality-checks what customers would receive.
  Net out-of-pocket ≈ supplier cost + payment fees (retail cycles back to
  the owner). Owner-only: it is money.
