# Analytics ownership: who sends which event, and why

Read this before touching `MetaPixel.jsx`, `GoogleAnalytics4.jsx`,
`api.meta-event.jsx`, or any pixel setting in the Shopify admin.

## The one fact that matters most

**Shopify's `web-pixels-manager` does not load on a Hydrogen/Oxygen
storefront.** It loads on the Online Store publication. Every Shopify sales
channel that ships tracking through it — Facebook & Instagram, Google &
YouTube, TikTok — therefore covers `checkout.puchica.ca` and **nothing on
`puchica.ca`**.

This is the single most expensive misunderstanding in this project's history.
"The Facebook & Instagram channel is installed" reads, in every admin screen,
exactly like "we have tracking." On Hydrogen it means *we have checkout
tracking*. The storefront half of the funnel — the part that tells Meta what
people looked at and added to a cart — reaches Meta only through code we own
in this repo.

If you remember one thing: **channel installed ≠ storefront tracked.**

## Ownership split

| Event | Sent by | Where |
|---|---|---|
| PageView | `MetaPixel.jsx` (+ Shopify on checkout) | storefront + checkout |
| ViewContent | `MetaPixel.jsx` | storefront only |
| AddToCart | `MetaPixel.jsx` | storefront only |
| **InitiateCheckout** | **Shopify checkout integration** | checkout only |
| **Purchase** | **Shopify checkout integration** | checkout only |

`MetaPixel.jsx` deliberately does **not** subscribe to
`custom_checkout_started`, and `check-launch-readiness.mjs` fails the build if
it ever does again. `GoogleAnalytics4.jsx` has followed the same rule for its
own checkout events for longer; Meta now matches it.

The reason is dedupe. Shopify's checkout emits InitiateCheckout with its own
`event_id`. A storefront copy carries a different one, so Meta cannot merge
them and the count roughly doubles. For a store with real purchase volume that
is cosmetic. For this one it is not: with almost no purchases, campaigns cannot
optimize on Purchase (Meta needs roughly 50 conversions per week to leave the
learning phase), so they have to optimize on AddToCart or InitiateCheckout —
and a doubled InitiateCheckout corrupts the exact signal the spend buys
against.

`api.meta-event.jsx` still allow-lists `InitiateCheckout` and `Purchase`. That
allowlist is a validation ceiling on what the relay endpoint will accept, not a
statement of what we send. Leave it alone; narrowing it buys nothing and would
break a future deliberate use.

## Configuration that must stay true

| Setting | Value | Where |
|---|---|---|
| `PUBLIC_CUSTOM_META_ENABLED` | `true` (Production) | Oxygen env vars |
| `PUBLIC_FACEBOOK_PIXEL_ID` | the **same** pixel the Facebook & Instagram channel uses | Oxygen env vars |
| `META_CAPI_ACCESS_TOKEN` | a token generated **for that same pixel** | Oxygen env vars |

### The trap in changing the pixel ID

Meta's Conversions API access tokens are **pixel-scoped**. `api.meta-event.jsx`
POSTs to `/{pixelId}/events` carrying `META_CAPI_ACCESS_TOKEN`, and on a
non-2xx response it **returns 204 and logs nothing** unless `DEBUG_META` is
set:

```js
if (!metaResponse.ok) {
  if (context?.env?.DEBUG_META) { /* ...only place it is ever surfaced... */ }
  return new Response(null, {status: 204});
}
```

So changing `PUBLIC_FACEBOOK_PIXEL_ID` without regenerating
`META_CAPI_ACCESS_TOKEN` kills every server-side event silently, while the
browser side keeps working and every dashboard looks healthy. That is the same
silent-failure shape described below. **Always change the two together.**

Oxygen only picks up env var changes on a new deployment. Edit, save, redeploy.

## How to verify — the only check that counts

Admin screens and repo state both lie about this. The authoritative check is
Meta Events Manager → the dataset → **Test events**, browsing the live site:

1. Load a product page. Expect `PageView` and `ViewContent`.
2. Add to cart. Expect `AddToCart`.
3. Each should show connection **"Browser • Server"**, not one alone.
   Browser-only means CAPI is broken (usually the token). Server-only means
   `fbq` never installed.
4. Proceed to checkout. Expect `InitiateCheckout` **once**, attributed to
   `checkout.puchica.ca`.

Also worth a glance in the dataset overview: the **Websites** breakdown. If
`checkout.puchica.ca` has events and `puchica.ca` has approximately none, the
storefront is not reporting — regardless of what any channel says.

## What went wrong, 2026-06 → 2026-08

Recorded because the failure was invisible from every surface a person would
normally check, and it will be tempting to re-create.

There were two Meta datasets:

| | `996669459615534` "Puchica's pixel" | `1616698610095354` "Puchica Storefront" |
|---|---|---|
| Created | in use from 2026-06-18 | **2026-08-15** |
| Connected catalog | yes | no |
| Websites | checkout.puchica.ca (120 ev/28d), puchica.ca (2) | puchica.ca |
| Jun 18 – Jul 31 PageView | **51** | did not exist |
| Jun 18 – Jul 31 ViewContent | **0** | did not exist |
| Jun 18 – Jul 31 AddToCart | **0** | did not exist |

Shopify recorded roughly 14,174 sessions across June and July. Meta received
51 PageViews and zero storefront ViewContent or AddToCart, because
`web-pixels-manager` was never on the Hydrogen storefront and the custom bridge
was not yet sending. A Sales campaign optimized against that dataset had no
conversion signal to learn from and delivered to whoever was cheapest to reach.

**Correction, added 2026-08-25 after checking Shopify session data.** An earlier
version of this section implied those 14,174 sessions were traffic to the
current travel catalog. They were not, and the distinction matters enough to
state plainly:

- All six travel products were created and published **2026-08-09 → 2026-08-22**
  (`createdAt` / `publishedAt`, Admin API). The June–July campaigns ran against
  the previous general-dropshipping catalog — sweaters, pet bottles, light
  projectors, golf mirrors — which is also what every abandoned checkout before
  August contains.
- The traffic was two discrete floods, not a campaign period: week of 06-15 =
  8,748 sessions, week of 06-29 = 3,903. Together 87% of the total. Every other
  week ran 100–700 sessions.
- Those flood weeks converted at 0.2–0.8% add-to-cart. Every non-flood week ran
  **9–19%**. A broken storefront depresses conversion uniformly; this is two
  injections of traffic with no purchase intent sitting on top of an otherwise
  ordinary baseline.
- Of the flood, `referrer_source` splits 10,793 **direct** and 1,819 **social**.
  The social sessions — the only ones Shopify attributes to the ads — produced
  **zero** add-to-carts across 1,819 visits. Some or all of the direct flood is
  probably the same campaign arriving without a referrer (Meta in-app browsers
  strip it when no UTM is set), but that is inference, not measurement.
- By device: mobile 12,743 sessions → 18 add-to-carts (0.14%); desktop 1,425 →
  117 (8.2%). A 59× gap. Real mobile traffic underperforms desktop by roughly
  40%, not 59×.

So the honest summary of June–July is **not** "this catalog converted badly." It
is "a different catalog received two floods of traffic that showed no purchase
intent, while Meta had no signal to optimize against." The current catalog has
existed for roughly two weeks and has taken on the order of **300 sessions**,
most of them internal testing. It has never been meaningfully tested, and there
is no conversion baseline for it — a fact worth holding onto before anyone reads
a performance claim about this store, including elsewhere in this document.

Then, on 2026-08-15, a *second* pixel was created and
`PUBLIC_FACEBOOK_PIXEL_ID` was pointed at it. From that day the storefront
reported into a dataset with no history, no catalog, and no checkout events,
while checkout kept reporting into the original — one funnel split across two
drawers, which Meta cannot join.

Three things made this survive so long:

1. **Every dashboard looked fine.** The channel showed installed, the pixel ID
   was present in the deployed payload, `fbq` was defined in a warm browser.
2. **The failure was in the gap between two systems**, so neither system
   reported an error.
3. **Checking the wrong dataset produced a confident all-clear.** Measuring
   today's storefront against today's pixel showed events flowing, which says
   nothing about what the campaign's pixel received in June.

The lesson for future debugging: when checking whether tracking worked, check
**the dataset the campaign optimized toward, over the campaign's date range**.
Anything else answers a different question.

## Separately: the consent race in `MetaPixel.jsx`

Hydrogen's `canTrack` starts as a function returning `false` and is swapped for
the real one once the Customer Privacy API loads. The install effect lists
`canTrack` as a dependency but opens with an `installed` guard, so every re-run
is a no-op and the subscriptions keep calling the mount-time function forever.
Lose that race once and the pixel never installs for that page view — and
because `fbq` loads lazily *inside* `track()`, no Facebook script appears at
all.

Fixed by mirroring `canTrack` into a ref (`canTrackRef`). Pinned by
`tests/meta-pixel-consent.test.js`, which fails if a direct `canTrack()` call
returns to the guarded effect.

Note this store has **no consent gate**: `currentVisitorConsent()` returns
empty strings while `analyticsProcessingAllowed()` is `true` and
`shouldShowBanner()` is `false`. So the false→true transition is driven purely
by script-load timing, not by a user accepting a banner. On a warm cache the
race is won every time, which is why this reproduces poorly on a developer
machine and is most likely to bite a cold-cache mobile visitor — i.e. an ad
click.

This was real but it is **not** what cost June and July. The dataset split was.
