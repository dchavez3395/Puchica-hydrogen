# Post-2026 model adjustment — 2026-09-01

Source: seller-summit video transcript supplied by Daniel, 2026-09-01.

## What the video says is broken

Four events killed the 2019 model, and three of them are already encoded in
this repo rather than merely read about:

| Event | Where it already shows up here |
| --- | --- |
| De minimis exemption removed May 2 2025; ~54% landed-cost increase | `us-duty-impact.mjs`, `worstCaseDutyContributionUsd`, route-scoped US suspension |
| ePacket postal subsidy phased out | the $7.76 supplier shipping that forced $89 → $99 |
| Temu/Shein own the factories and undercut any reseller | the 170 US-local scan: all commodities at consumer retail, Amazon wins on Prime |
| Prime trained 2-day delivery expectations | the ~18-day transit now disclosed on both listings |

## What the video says the fix is

The core claim is a reframe, not a tactic: **dropshipping was only ever a
testing tool.** Use it to validate demand before committing capital, then build
a real business around whatever validates. Phase one is research; phase two is
private label. "The ones who fail start and stay with dropshipping."

Three steps:

1. **Change where the product ships from.** US warehouse, 3-5 day delivery.
   Margins are tighter than 2018 overseas sourcing; reviews are far better.
2. **Treat every product as a vote, not a business.** Do not scale the first
   thing that converts. Screen on two signals only: low return rate and real
   repeat-purchase behaviour.
3. **Stop acting like a dropshipper once something wins.** Private label it,
   custom packaging, own photography, email list, a returns process that treats
   the customer as someone you want back.

Distribution: TikTok, $64B in 2025, and the winners are not running ads. They
show up as the person behind the product.

Case study: a three-year dropshipper mined three years of order data, kept the
single product with the highest repeat rate and lowest return rate, dropped
everything else, rebuilt on US inventory and real branding. Margin 15% → 40%+,
return rate more than halved.

## Where Puchica actually stands against that

**Step 1 — already done.** The US-local sourcing work of 2026-09-01 is exactly
this step. No adjustment needed.

**Step 2 — not runnable.** The store has **2 orders and 1 customer**, verified
today. Return rate and repeat purchase cannot be measured from that. The case
study's seller had three years of data to mine; Puchica has none. This is the
single biggest gap between the prescription and the position.

**Step 3 — blocked on capital and on filming.** Private label means MOQs,
factory sourcing and packaging, none of which is budgeted. And the channel the
video names as most rewarding — TikTok organic — is built on the founder
appearing on camera, which is a documented standing constraint.

## The adjustment

**Reclassify the current catalogue. It is a measurement instrument, not a
store.** Its only job is to produce two numbers as cheaply as possible: a real
CPA, and a real return rate. It is not a brand and should not be described or
resourced as one.

Consequences of taking that seriously:

- The watch collection stays, because it is the only US-local vein found that
  can absorb a $19-58 CPA at all ($45-127 contribution per order). It is the
  measurement engine.
- **The watch collection can never pass step 2.** A watch roll, a winder and a
  watch box are each bought once. Screened on repeat purchase they score zero
  by construction, not by performance. Any plan that expects them to become the
  brand is a plan that ignores the video's central filter.
- Therefore a **second cohort must be sourced deliberately for repeat
  purchase**, and judged on that rather than on contribution. Consumables,
  refills, replaceables, collectibles-in-a-series.
- Sourcing that second cohort is where Puchica's Central American identity
  finally stops being a liability. Coffee, spice, masa, salsa, seasonal goods
  are inherently repeat, and are exactly the categories Amazon does not
  merchandise to that buyer. The hard limit: AliExpress dropshipping does not
  serve ingestibles well, so this cohort probably needs a different supplier
  route entirely. That is a real cost, not a footnote.

**Assumption I am proceeding on, stated rather than asked:** filming stays off
the table. That means TikTok organic is unavailable and acquisition is paid
indefinitely, which is why contribution per order has to stay high and why the
watch vein is the right first test despite failing the repeat filter.

## Sequence

1. Finish the watch cohort: US shipping read per SKU, evidence tags, offers into
   `APPROVED_CATALOG_OFFERS`, ACTIVE, deploy.
2. Merchant Center feed and free listings. Get the first 100-200 orders as
   cheaply as possible. This is the whole point of phase one.
3. Read CPA and return rate. Only then is step 2 runnable.
4. In parallel, source the repeat-purchase cohort on a non-AliExpress route.
5. Private label only the product that survives step 3. Not before.

## What this changes about how to talk about the business

Stop measuring the current catalogue against "is this a good brand." It is not
supposed to be. Measure it against "did it produce a trustworthy CPA for the
least money." Those are different questions and conflating them is what has
produced repeated rounds of screening without ever shipping.
