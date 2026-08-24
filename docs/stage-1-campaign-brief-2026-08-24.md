# Stage 1 campaign brief — funnel smoke test

**Budget:** CA$200 · **Window:** 5–7 consecutive days · **Market:** Canada only

Read `docs/traffic-test-measurement-plan-2026-08-24.md` first. This brief is the
execution detail; the plan is the decision rule. **The purpose is to prove the
machine runs, not to judge the offer.** A zero-order result at this budget is
not evidence against the product.

Generate destination URLs with `npm run campaign-links`. It validates every
destination against the same gate the storefront applies and refuses to emit a
link for anything retired, held, or out of market.

## The hero: Black Travel Tech Case — CA$34.99

Chosen on three grounds, in order:

1. **Highest contribution in the catalog** — CA$23.09, ahead of the packing
   cubes at CA$15.76.
2. **Zero customs exposure.** Declared supplier value CA$13.20 sits under both
   the CAD$20 duty and CAD$40 tax thresholds, so no CBSA assessment, no carrier
   handling fee, and no surprise payment at the door. The packing cubes declare
   CA$20.22 and the Carry-On Kit CA$43.34 — both can be assessed. Do not open a
   paid test on an offer that can hand a first-time customer a bill.
3. **Single mapped SKU.** DSers fulfils it without manual intervention, unlike
   the Kit's three-order split, which your own runbook still calls unrehearsed.

**Shipping honesty:** CA$34.99 is below the CA$50 free-shipping threshold, so
checkout adds CA$5. Say so on the ad and the page. Unexpected shipping is a
leading cause of cart abandonment, and hiding it would corrupt the very metric
this test exists to read.

**The pairing path:** tech case (CA$34.99) + cable case (CA$19.99) = CA$54.98,
which clears free shipping. As one order that contributes **CA$28.35** against
CA$23.09 for the tech case alone — a **CA$5.26 lift**, not the doubling that
adding the two solo contributions would suggest, because the pair forfeits the
CA$5 shipping the single order collects. Real, modest, and already built: the
pairs-with rail surfaces it. Let it work and record add-to-cart on the pair
separately. Note that even CA$28.35 is still short of a CA$42 CPA, so this is
an efficiency gain, not a route to funding paid acquisition.

## Creative constraints — read before writing a word

Puchica has **zero sales and zero reviews**. That is not a marketing
inconvenience, it is a hard boundary. The following are all unavailable, and
using them would breach the operating gates:

- No social proof of any kind — no "loved by", no customer counts, no ratings.
- No bestseller, trending, popular, or frequently-reordered framing.
- No scarcity, countdowns, or invented stock pressure.
- No compare-at or "was CA$X" pricing that never existed.
- No delivery promise beyond the disclosed window. Actual route is 8–14 days
  tracked; the ad must not imply faster.
- No claim about materials, capacity, or compatibility not already verified in
  the product copy.
- Forbidden strings are enforced in `check-launch-readiness.mjs` — among them
  "ships within 24 hours", "free shipping across Canada", "returns are always
  free".

**What is left is the product doing its job on camera.** That is genuinely
enough for a smoke test, and it is the honest starting point for a brand with
no history.

## The three creatives

One campaign, one ad set, broad Canada 25–55, no interest stacking. Three
variants is the ceiling: at ~87 expected sessions, more would guarantee that
none reaches a readable sample.

### A — `a-problem-loose-cables`
The bag-dump. Empty a tote onto a table: tangled charger, two cables, a power
bank, earbuds loose in the pile. Then the same items seated in the case, lid
closing flat. No voiceover needed; the cut does the argument.
**Hook (first 2s):** the tangle, in motion, before any product is visible.

### B — `b-demo-what-fits`
Straight capability demo, one continuous take. Load the case item by item,
naming each: charger, two cables, power bank, earbuds. End on the closed case
beside a passport for scale.
**Hook:** start mid-load, already half full — no intro, no logo.

### C — `c-pair-free-shipping`
The carry-on pair: tech case and cable case side by side, packed, then both
slotted into a personal-item bag. This is also the honest route to free
shipping, so the copy can say "two cases, CA$54.98, shipping included" without
inventing anything.
**Hook:** both cases closing in sequence.

**Format:** 9:16 vertical, 8–15 seconds, shot on a phone. Text overlay only for
the price and the shipping fact. No stock footage — you do not have usage
rights cleared, and supplier imagery is already the weakest asset in the store.

**If you cannot shoot:** run A and B as static carousels from the three verified
exact-product images. A weaker test that ships beats a video test that waits
three weeks.

## Traffic hygiene — mandatory before spend

Historic data is unreadable because paid, organic, owner and bot traffic all
landed in the same bucket. Do not repeat it.

- [ ] **Own-IP exclusion** set in Shopify admin. Do not open the live store from
      the ad-account device for the duration.
- [ ] **Bot filtering confirmed on.** Any single-day desktop spike with zero
      engagement gets quarantined *before* analysis, not after the fact.
- [ ] **UTMs on every destination URL**, generated by `npm run campaign-links`
      and pasted verbatim. Do not hand-edit them.
- [ ] **Reporting window fixed in advance.** No budget, audience or creative
      edits inside it — every mid-flight change resets learning and forfeits the
      only clean sample you are paying for.
- [ ] **`PUBLIC_CUSTOM_META_ENABLED` verified `false`.** Enabling it
      double-counts Purchase and halves reported CPA.
- [ ] **Native channels confirmed connected** in Shopify admin (Facebook &
      Instagram, Google). No script can verify a third-party channel.

Run `npm run measurement-readiness` to re-check the automatable ones.

## Daily run sheet

Record these each day. They take five minutes and they are the deliverable.

| Field | Source |
| --- | --- |
| Spend, impressions, clicks, CTR, CPC | Meta Ads Manager |
| Sessions, add-to-carts, checkouts reached, orders | Shopify, filtered to `utm_campaign=stage1-funnel-smoke` |
| Orders for the same window | Shopify order list, unfiltered |
| Per-creative sessions and ATC | Filter by `utm_content` |

**The gap between Meta's reported conversions and Shopify's own order count is
the single most valuable number this test produces.** It is your measurement
error, and every later decision inherits it.

## Reading the result

Decision rules are pre-registered in the measurement plan so they cannot be
rewritten afterwards. In short:

| Observation | Action |
| --- | --- |
| 0 ATC on ≥80 sessions | **Stop.** Funnel is broken, not unpopular — 0.1% chance under a healthy funnel |
| ≥1 ATC, 0 orders | **Expected.** Says nothing about CPA. Do not conclude the offer failed |
| CPC > CA$3.00 | Creative or audience weak — fix before any budget increase |
| CTR < 0.6% | Ad is not earning attention. Creative problem, not offer problem |
| Meta and Shopify disagree on orders | **Stop.** Fix attribution before spending again |

## After Stage 1

If the funnel is healthy, **do not scale this offer.** The acquisition gate
shows the tech case short by CA$25.84 against a CA$42 benchmark CPA; more
traffic cannot close an arithmetic gap. A healthy Stage 1 means the machine
works and the *offer* is the remaining problem — which is the business
question, and it is answered by changing what Puchica sells, not by buying more
clicks.

Re-run `npm run acquisition-gate` against any new offer before Stage 2.
