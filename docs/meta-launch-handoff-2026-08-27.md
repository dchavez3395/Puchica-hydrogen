# Meta CA$200 launch — handoff prompt for the local Claude session

Written 2026-08-27. Daniel runs Claude Code on his own PC (where Chrome with
the Claude extension is logged into Meta Ads Manager) and pastes the prompt
below verbatim. The cloud session cannot reach facebook.com; the local
session can drive the logged-in browser while Daniel watches.

Source of truth for the copy and URLs: the Stage 1 Ad Console artifact and
`docs/stage-1-campaign-brief-2026-08-24.md`. The links were generated and
gate-validated by `npm run campaign-links`.

---

## The prompt (paste everything between the rules into the local session)

You are operating my logged-in Chrome via the extension, with me watching.
Build — but do not publish — one Meta ad campaign in Ads Manager exactly to
this spec. This is a CA$200 smoke test whose goal is data (CTR, CPC,
add-to-cart rate), not profit.

HARD RAILS — these override anything else you may infer:

- Build everything, then STOP at the final Publish step and ask me to
  confirm out loud before you (or I) click Publish.
- Never exceed CA$28/day. Do not add ads, audiences, placements, or
  campaigns beyond this spec. Do not enable Advantage+ catalog/creative
  enhancements that rewrite copy or generate imagery.
- Use only the ad copy given below, verbatim. No scarcity ("only X left"),
  no social proof, no discounts or compare-at prices, no US-availability
  claims, no "made in El Salvador". If a field forces a change, stop and
  ask me.
- Creative: only the product's own photos from my Shopify Admin
  (Products → Black Travel Tech Case → Media). Single image or a 2–3 image
  carousel per ad. No stock footage, no AI-generated imagery.
- After launch, no mid-flight edits for the 7 days. If Ads Manager shows an
  account restriction or payment problem, stop and tell me.

CAMPAIGN (one campaign, one ad set, three ads):

- Campaign name: stage1-funnel-smoke
- Objective: Sales. Conversion event: Purchase (the Shopify pixel).
- Budget: CA$28/day, daily budget. Schedule: 7 consecutive days, fixed
  start today, fixed end — set both dates.
- Audience: Canada only · ages 25–55 · all genders · NO interest targeting
  (deliberately broad).
- Placements: Advantage+ (the default). Attribution: 7-day click / 1-day
  view (the default).

AD A — name: a-problem-loose-cables

- Primary text: Chargers, cables, and a power bank — one case instead of a
  loose tangle at the bottom of your bag. Double-layer layout: small items
  under elastic loops on top, bulkier gear below. Sold empty; electronics
  not included. CA$34.99 + CA$5 shipping, shown at checkout. Ships tracked
  to Canada.
- Headline: One case for the tech tangle
- Destination URL:
  https://puchica.ca/products/black-travel-tech-case?utm_source=meta&utm_medium=paid_social&utm_campaign=stage1-funnel-smoke&utm_content=a-problem-loose-cables&utm_term=broad-ca-25-55

AD B — name: b-demo-what-fits

- Primary text: What fits: a wall charger, two cables, a power bank,
  earbuds — each with its own spot. Double-layer zip case with elastic
  loops and mesh pockets. Sold empty; electronics not included. CA$34.99 +
  CA$5 shipping at checkout. Ships tracked to Canada.
- Headline: Every cable in its place
- Destination URL:
  https://puchica.ca/products/black-travel-tech-case?utm_source=meta&utm_medium=paid_social&utm_campaign=stage1-funnel-smoke&utm_content=b-demo-what-fits&utm_term=broad-ca-25-55

AD C — name: c-pair-free-shipping

- Primary text: Tech case CA$34.99 + cable case CA$19.99 = CA$54.98 — and
  orders over CA$50 ship free in Canada. Two zip cases for chargers, cables
  and small gear. Both sold empty; electronics not included. Tracked
  shipping.
- Headline: The carry-on tech pair — ships free
- Destination URL:
  https://puchica.ca/products/black-travel-tech-case?utm_source=meta&utm_medium=paid_social&utm_campaign=stage1-funnel-smoke&utm_content=c-pair-free-shipping&utm_term=broad-ca-25-55

PRE-FLIGHT (check before building; tell me what you find):

- Ad account has a valid payment method and no restrictions.
- Events Manager shows the pixel receiving events from puchica.ca.
- Remind me not to browse puchica.ca from this device during the test.

STOP RULES (pre-registered for the week; do not renegotiate mid-flight):

- 0 add-to-carts on 80+ sessions → stop the campaign; the funnel is broken.
- Meta's reported orders ≠ Shopify's orders → stop; measurement fault.
- CPC over CA$3.00 → let the week finish; no budget increase.
- 1+ add-to-cart with 0 orders → expected at this budget; do nothing.
- A genuine order arrives → tell me BEFORE anything is done in DSers; the
  supplier route gets a fresh requote before any supplier payment.

When the campaign is fully built and in review-ready state, stop, summarize
what you set, and wait for my go to publish.

---

## What the cloud session does once ads are live

- Daily (23:42 UTC monitor): sessions + funnel filtered to
  `stage1-funnel-smoke`, Meta vs Shopify reconciliation, short readout.
- On any order: flag Daniel immediately; first-order runbook — fresh DSers
  requote before the supplier is paid.
- Day 7: full readout — real CTR, CPC, cost per session, ATC rate, and the
  verdict on whether any paid path can work at these economics.

Cost-baseline note: the DSers readings behind CA$34.99 pricing are valid
through Aug 28. If launch slips past that, re-read the DSers routes (needs
Daniel's logged-in console) before spending.
