# Traffic test measurement plan — 2026-08-24

Run `npm run measurement-readiness` before committing any spend. This document
is the decision rule; the script is the arithmetic.

## Correction to earlier advice

An earlier recommendation in this project was to spend CA$150–300 to "get a
real CPA." **That was wrong on the statistics.** CA$200 cannot produce a CPA,
and acting as though it can is how a test produces a confident wrong answer.

At the Canadian Meta benchmark (CA$19.64 CPM) CA$200 buys roughly 10,200
impressions. At a 1.0% CTR that is ~102 clicks and ~87 sessions. If the offer
converts at a healthy 1.5%:

- expected orders: **1.3**
- probability of observing **zero** orders anyway: **27%**

A result of zero orders would be entirely consistent with a perfectly healthy
funnel. Reading it as "customers reject the offer" would be a conclusion the
data cannot support — and it is exactly the conclusion a discouraged operator
reaches.

### What a measured CPA actually costs

Roughly 43 conversions are needed to pin a CPA to ±30% at 95% confidence:

| True CVR | Sessions needed | Budget |
| ---: | ---: | ---: |
| 1.0% | 4,268 | ~CA$9,900 |
| 1.5% | 2,846 | ~CA$6,600 |
| 2.0% | 2,134 | ~CA$4,900 |

That is the honest price of the number. **Do not spend it on the current
catalog** — the acquisition gate already shows no offer can fund a CA$42 CPA,
so a precise measurement would only tell you precisely how much you are losing.

## What CA$200 *can* answer

The upper funnel has a sample roughly 100× larger than the purchase funnel, so
a small budget measures it well.

| Question | Answerable at CA$200? |
| --- | --- |
| Purchase CPA | **No** — 27% chance of zero orders under a healthy CVR |
| Does the funnel work at all? | **Yes** — expect ~7 add-to-carts, 0.1% chance of zero |
| Cost per click / CTR | **Yes** — ~102 clicks is ample |
| Do analytics events fire correctly? | **Yes** — one session is enough |
| Does the landing page hold attention? | **Yes** — bounce and dwell |

The CA$200 test is a **smoke test, not a verdict.** Its job is to prove the
machine runs, and to expose measurement faults while they are still cheap.

## Stage 0 — preflight, free

Run `npm run measurement-readiness`. Do not spend until every item resolves.

### Blocking

- **`PUBLIC_CUSTOM_META_ENABLED` must stay `false`.** The custom bridge emits
  browser events with no shared event ID, so Shopify's server-side Purchase and
  the bridge's browser Purchase cannot be deduplicated. Meta then counts one
  sale twice and **reported CPA reads at roughly half its true value** — the
  single most expensive way for this store to be wrong, because it says *scale*
  when the truth is *stop*.

### Needs a human answer

- **Gate contradiction.** `check-launch-readiness.mjs` hard-requires
  `PUBLIC_FACEBOOK_PIXEL_ID` and `PUBLIC_GA4_MEASUREMENT_ID`, but `.env.example`
  documents both as optional and used only when the custom bridge is enabled.
  Satisfying the gate literally means enabling the bridge that breaks
  deduplication. Decide which is authoritative and change the other. Until then
  paid-launch-check cannot be read as a green light.
- **Native channels.** With both storefront bridges off, all event data comes
  from Shopify's own Facebook & Instagram and Google integrations. Confirm in
  Shopify admin that they are connected and receiving events. No script here can
  verify a third-party channel; this one is genuinely manual.
- **Traffic hygiene.** Historic data is contaminated — 14,549 sessions produced
  two orders, both owner tests, with cart events landing on QA dates. Confirm:
  unique UTMs on every destination URL; own-IP exclusion and no browsing the
  live store from the ad-account device; a fixed reporting window with no
  mid-flight edits; bot filtering on, with zero-engagement desktop spikes
  quarantined *before* analysis rather than after.

## Stage 1 — CA$200 smoke test

**Question:** does the funnel work end to end, and is measurement trustworthy?

**Setup.** One campaign, one ad set, one audience — broad Canada, 25–55. Two or
three creatives at most. Destination: the single best-converting offer page, not
the homepage and not a collection. Run 5–7 consecutive days; do not edit inside
the window. A shorter window with the same money is fine; a longer one is not,
because staleness starts competing with signal.

### Pre-registered decision rules

Written before spending so they cannot be rationalised afterwards.

| Observation | Reading | Action |
| --- | --- | --- |
| 0 add-to-carts on ≥80 sessions | Funnel is broken, not unpopular. 0.1% chance under a healthy funnel | Stop. Debug the PDP, the cart, and the market gate before any further spend |
| ≥1 ATC, 0 orders | Expected. Says nothing about CPA either way | Do **not** conclude the offer failed. Proceed to the CPA question only if the offer changes |
| CPC > CA$3.00 | Creative or audience is weak, or the market is expensive | Fix creative before any budget increase |
| CTR < 0.6% | The ad is not earning attention | Creative problem, not an offer problem |
| Analytics disagree with Shopify orders | Measurement fault | Stop. Fix attribution first — every later number inherits this error |
| Purchase events double-count | Deduplication fault | Stop immediately. Verify `PUBLIC_CUSTOM_META_ENABLED=false` |

**The one rule that matters most:** a zero-order outcome at this budget is
**not** evidence against the offer. If you take one thing from this document,
take that.

### What to record

Cost, impressions, clicks, CTR, CPC, sessions, add-to-carts, checkout starts,
orders, and — separately — Shopify's own order count for the same window. The
gap between the platform's number and Shopify's number is the measurement
error, and it is the most valuable figure the test produces.

## Stage 2 — only after the offer changes

Do not run this on the current catalog. The acquisition gate shows every offer
short by CA$25.84–32.12 against a CA$42 benchmark; more traffic cannot close an
arithmetic gap. Stage 2 becomes worthwhile only once an offer exists whose
contribution could plausibly fund a CPA — which per the business review means
roughly CA$70–110 AOV at 55–65% margin.

At that point re-run `npm run acquisition-gate` first. If it still fails, the
offer is not ready and no budget will fix it.

## Why this staging

The temptation with a small budget is to ask the big question anyway and treat
whatever comes back as an answer. That produces the worst outcome available:
a number that feels like evidence, is not, and gets used to justify either
quitting a viable business or scaling a losing one.

Ask the question the money can answer. The CA$200 buys certainty about the
machine. The offer question costs more, and should be asked only about an offer
worth the price.

## Files

| Path | Role |
| --- | --- |
| `scripts/check-measurement-readiness.mjs` | Preflight audit plus power analysis; `--budget N` to model any spend |
| `tests/measurement-readiness.test.js` | 12 tests over the projection maths and the audit rules |
| `scripts/check-acquisition-gate.mjs` | Whether an offer can fund a CPA at all — run first |
