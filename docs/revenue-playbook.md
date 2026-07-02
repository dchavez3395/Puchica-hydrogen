# Puchica — Revenue Maximization Playbook

_2026-07-01. Everything we can do on our own end to drive the first sale and
scale. Ordered by impact × feasibility. Tags: **[CODE]** an agent/ollama can do
in the repo · **[CONFIG]** Shopify admin · **[BIZ]** Daniel's decision/action._

---

## The numbers we're working with (last 30 days)
- 9,841 sessions, **0 orders**.
- **93% mobile** (9,286), 7% desktop. → mobile experience is almost everything.
- Traffic: 85% "direct" (likely bots), ~1,375 social — of which **Facebook =
  1,315 sessions with 0 add-to-carts** (dead), homepage landers convert to cart
  at ~12% (healthy).
- Store works end-to-end; payments live (Shop Pay/PayPal/GPay). Median price
  ~$74.
- Already live: `FIRST15` (15% off), free Canada shipping, abandoned-checkout email.

**One-liner:** the store and offer are ready. Sales are gated by (1) traffic
quality and (2) the mobile experience the real visitors land on.

---

## TIER 1 — do these first (highest impact)

### 1. [BIZ] Fix the Facebook traffic — the #1 blocker
1,315 clicks, 0 add-to-carts = junk audience or ad/landing mismatch. In Meta Ads
Manager: check the audience (kill broad "boost" targeting), confirm the pixel
fires, and point ads at the **homepage** (converts) not deep product pages.
Don't spend another dollar scaling until a test set actually adds to cart.

### 2. [CODE] Mobile performance pass — affects 93% of visitors
The client bundle ships `three` + `@react-three/fiber` + `@react-three/drei`
(drei alone ~1.6 MB) + `lenis`. On mobile (esp. the FB in-app browser) this
tanks LCP and causes pre-engagement bounce.
- Lazy-load / dynamically import the 3D + heavy scroll libs so they're not on the
  critical path; gate them behind `client-only` and viewport/interaction.
- Confirm the hero LCP image is prioritized and not blocked by JS.
- Target: mobile Lighthouse LCP < 2.5s. Measure before/after on the deployed
  preview. This is likely the single biggest CRO win in the repo.

### 3. [CONFIG] Reviews on product pages (Judge.me is installed)
Social proof is the biggest trust lever for an unknown brand. Confirm Judge.me
reviews are imported and rendering on PDPs (the `JudgemeReviews` component
exists). Seed reviews if the catalog has none. No reviews = no trust = no first
sale from cold traffic.

### 4. [CONFIG] Google Merchant Center — free product listings
The Google & YouTube channel is connected. Get the product feed approved so
products show in Google's free Shopping listings — free, high-intent traffic
that (unlike the FB traffic) actually wants to buy. Fix feed errors first
(there's a `google-shopping-feed-audit` in the repo history).

---

## TIER 2 — conversion optimization (squeeze the traffic you have)

### 5. [CODE] Email/SMS capture with the FIRST15 hook
A `newsletter` route exists. Add a (non-annoying, mobile-friendly) email capture
that gives FIRST15 in exchange for the address. You're getting ~1,300+ real
sessions/mo — capture them so you can remarket even if they don't buy today.

### 6. [CODE] Make the offer impossible to miss
Surface FIRST15 + free-Canada-shipping on the PDP near the buy box and in the
cart drawer (not just the announcement bar). A visible "15% off your first order
— code FIRST15" by the Add-to-Cart button lifts conversion.

### 7. [CODE] Urgency / scarcity on PDPs
Low-stock nudges ("Only N left") and a subtle FIRST15 time-frame create action.
Keep it honest (pull real inventory).

### 8. [CONFIG] Check inventory/availability
Confirm featured products show as in-stock and buyable (dropship via DSers — make
sure availability syncs; an out-of-stock hero kills the promo).

---

## TIER 3 — traffic expansion (after 1 & 2)

### 9. [BIZ] Organic short-form video
Your winning product type is visual/impulse (galaxy projector, etc. — see
`first-sale-launch-kit.md`). Post TikToks/Reels of products transforming a space,
CTA to homepage + FIRST15. Cheapest real-human traffic that exists.
_(Note: Higgsfield/shorts tools are available in this workspace if you want help
generating product videos.)_

### 10. [BIZ] One paid test, done right
If testing paid again: one channel, tight audience, creative that matches the
landing page, sent to the homepage, small budget, watch add-to-cart (not clicks).

### 11. [CODE] Deploy the i18n/hreflang work
It's committed-pending. Long-term SEO for FR/ES/PT markets. Plus the remaining
sitemap hreflang alternates (see `i18n-url-locales-status.md`). Slow burn, real.

---

## TIER 4 — measurement & hygiene (do alongside)

### 12. [CONFIG] Verify conversion tracking fires
There were many `probe-pixel` scripts in history → someone fought the pixel. If
the Meta/GA/Shopify pixels aren't firing purchase/ATC events, ads can't optimize
and you're flying blind. Verify events in the browser + Meta Events Manager.

### 13. [CONFIG] Filter bot traffic
85% "direct" is almost certainly bots inflating denominators. Enable Shopify/
Cloudflare bot protection so your real conversion rate is visible.

---

## Instructions for the continuing agent (ollama), in order

> **Before touching anything:** read `docs/HANDOFF-2026-07-01.md`. Git is locked
> in the authoring sandbox — hand Daniel diffs/commands, don't push. Shell reads
> of edited files are STALE — trust the Read tool + `npm run build`.

1. **Verify current deployed state** — confirm what's actually on `origin/main`
   and live (a prior agent pushed then reverted commits; state may be messy).
   `git log --oneline -10`, `git status`, and diff against `f4610ce`.
2. **[CODE] Mobile perf pass (Tier 1.2)** — biggest code win. Lazy-load
   three.js/drei/lenis; verify with mobile Lighthouse.
3. **[CODE] Product JSON-LD gallery images** — exact patch in `STOREFRONT-AUDIT.md §2`.
4. **[CODE] Offer visibility + email capture (Tier 2.5, 2.6)**.
5. **[CODE] Sitemap hreflang alternates**, then help Daniel deploy the i18n work.
6. **Leave [CONFIG]/[BIZ] items for Daniel** — reviews, Merchant Center, Ads
   Manager, pixel, bot filtering. Surface them; don't attempt account settings
   blind.

## Effort/impact cheat sheet
| Lever | Impact | Effort | Owner |
| --- | --- | --- | --- |
| Fix FB targeting | 🔥🔥🔥 | low | Daniel |
| Mobile perf | 🔥🔥🔥 | med | ollama |
| Reviews live | 🔥🔥 | low | Daniel |
| Google free listings | 🔥🔥 | med | Daniel |
| Email capture | 🔥🔥 | med | ollama |
| Offer visibility | 🔥 | low | ollama |
| Pixel verify | 🔥🔥 | low | Daniel |
