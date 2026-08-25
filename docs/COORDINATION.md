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

## Current assignment — organic relaunch (single session)

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
