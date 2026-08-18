# Puchica current operating scope

- **Status date:** 2026-08-18
- **Production:** `https://puchica.ca`
- **Source of truth:** GitHub `main`; Shopify Oxygen deploys through
  `.github/workflows/deploy.yml`
- **Decision:** simplify and validate; do not shut down, broaden the catalog,
  or spend on ads yet

## Read this first

This is the canonical starting point for Puchica work. It supersedes old
product counts, broad-catalog plans, sample requirements, supplier assumptions,
and manual-deployment instructions in dated files. When evidence conflicts,
use this order:

1. Customer safety, legal truthfulness, and current platform state.
2. Exact product/SKU/market gates in `app/lib/launch-catalog.js`.
3. A fresh DSers destination quote for the exact mapped variant.
4. This file and the first-order runbook.
5. Older audits and plans as historical context only.

No supplier sales count, old quote, product-level mapping, or attractive image
overrides the exact SKU and destination gate.

## Business decision

Puchica should be **simplified, not shut down**. The store and checkout work.
There is not enough genuine traffic to conclude that customers rejected the
offer: the last 30 days showed 785 sessions, but 752 were direct and only three
were attributable social visits. Large zero-engagement desktop spikes indicate
that much of the total was owner testing or automated traffic.

The current experiment is a focused travel-organizer store with three exact
products and no paid acquisition. Its job is to obtain attributable qualified
visits and learn where the funnel stops: product view, cart, checkout, or order.

## Exact launch catalog

| Product | Exact approved SKU | Canada | United States |
| --- | --- | :---: | :---: |
| Charcoal 3-Piece Packing Cube Set | `14:1052#S3007 Black;5:200004186#3PCS L M S Set` | Yes | No |
| White Semi-Circular Travel Jewelry Case | `14:29` | Yes | Yes |
| Black Hanging Travel Toiletry Organizer | `14:771#Black` | No | Yes |

Six former launch products are explicitly retired in code. Four other risky or
unverified products are under operational hold. Neither group may reappear via
Shopify cache, search, recently viewed, feeds, stale carts, or direct URLs.

Market-limited approved products keep an informational, indexable page outside
their selling country, but have no desktop or mobile purchase control there.
Collections, feeds, carts, checkout, and order review remain market-specific.

## Current DSers truth

Verified on 2026-08-18 in the logged-in DSers account:

| Exact offer | Destination | Current tracked route |
| --- | --- | --- |
| Black toiletry organizer | United States | US$2.16; 8–13 days |
| White jewelry case | Canada and United States | US$1.99; 9–14 days |
| Charcoal packing cubes | Canada | US$1.99; 8–14 days |

The toiletry organizer reports **No Shipping** to Canada. Packing cubes are
Canada-only. Route eligibility can change without warning, so every genuine
order must be requoted before supplier payment.

### Why fulfillment stalled

The previous process treated a working DSers mapping and an earlier quote as
permanent proof. They are not. DSers can remain mapped while the exact
AliExpress variant loses a destination route, changes cost, or changes ETA.
The solution is a small exact-SKU catalog plus order-time requoting—not more
mapping work, another automation subscription, or blind trust in sales counts.

## What is proven

- Shopify payment and hosted checkout work; the owner's paid test order is not
  genuine demand and does not need operational attention.
- Canada sells packing cubes and the jewelry case. The United States sells the
  jewelry case and toiletry organizer.
- Exact variants survive cart creation, market switching, checkout handoff,
  feeds, and monitoring without exposing other supplier variants.
- Policy pages align with market currency, destination-specific shipping, a
  30-day delivery-based return-request window, and actual support.
- All three products are indexed or submitted to Google from a valid live test.
  The sitemap advertises exactly these three products.
- The toiletry organizer uses all three verified exact-product images. The
  multi-variant packing-cube gallery remains locked to the charcoal image.
- Tests, release gate, build, deployment, and live health run in order before a
  GitHub `main` deployment is accepted.

## What is not proven

- No genuine customer sale has been identified.
- A real supplier payment, dispatch, tracking sync, delivery, and after-sales
  outcome have not completed end to end.
- There is not enough attributable traffic to judge conversion reliably.
- Search Console has insufficient field Core Web Vitals data, and the local
  trace profiler is not configured.
- Meta browser/server event receipt and deduplication have not been reverified
  in the correct dataset.

## One-person operating model

One person can run this model with ChatGPT **only at this scope**:

- three exact offers;
- one active customer order at a time during the learning phase;
- a fresh DSers route/cost/ETA/tracking check before supplier payment;
- factual content built from approved exact-product media;
- one daily operations block and one weekly evidence review;
- no new products until the first-sale loop is understood.

ChatGPT can audit, prepare content, monitor the storefront, inspect orders,
maintain code, and guide fulfillment. It cannot take responsibility for paying
the supplier, resolving fraud, accepting legal/tax treatment, or publishing and
spending externally without the owner's authorization.

Samples are not required for the first organic traffic test. They become useful
only if original hands-on creative or a quality claim is needed, or if real
orders expose uncertainty supplier evidence cannot resolve.

## First genuine order control

Before paying DSers:

1. Confirm the Shopify order is genuine, paid, unfulfilled, and not flagged for
   unresolved fraud review.
2. Match every line to the exact handle, SKU, quantity, and approved market.
3. Reopen the mapped DSers variant and re-quote the exact destination.
4. Confirm stock, item cost, shipping cost, ship-from, named tracked method,
   ETA, and expected contribution.
5. Stop if mapping is ambiguous, the route disappears, tracking disappears,
   cost materially rises, or ETA exceeds the disclosed checkout expectation.
6. Only the owner authorizes supplier payment. Then verify dispatch, tracking
   sync, customer notification, delivery, and any exception.

## Acquisition experiment

The seven-day organic experiment uses the jewelry case as the cross-market
hero, packing cubes as the Canadian secondary product, and unique UTM links for
every post. Do not promote the U.S.-only toiletry organizer from Canada-branded
accounts during this first week.

Review the funnel in order: attributable landing sessions, product views, add
to cart, checkout starts, and genuine orders. Diagnose the first stage with a
meaningful drop. No social post, discount, campaign, or ad spend is authorized
by this file.

## Release controls

Pushing a reviewed commit to `main` starts the production workflow. It must:

1. install locked dependencies;
2. pass the full automated suite;
3. pass the storefront release gate;
4. complete a production build;
5. deploy the exact commit to Oxygen;
6. pass live health checks for market cohorts, retired and held URLs, the
   Canadian feed, and the three-product sitemap.

If the live check fails, the workflow fails even if Oxygen accepted the upload.
Investigate and forward-fix; do not bypass the gate or deploy an uncommitted
tree. Manual CLI production deployment is an emergency fallback.

## Security action requiring the owner

A legacy helper committed an Admin-token-shaped credential to the public Git
history. The file has been removed from `main`, and tests now reject recognizable
Shopify secret formats, but history retains old blobs. The owner must revoke or
rotate that credential in Shopify. Do not copy it or attempt to reuse it.

## Immediate priorities

1. Complete the seven-day attributable organic traffic test using the prepared
   exact-media plan; publishing remains owner-authorized.
2. Continue read-only storefront and genuine-order monitoring.
3. Rotate the historical Shopify Admin credential.
4. If a genuine order arrives, execute the one-at-a-time DSers pre-payment and
   delivery runbook.
5. Review funnel evidence after seven days or 100 attributable landing
   sessions, whichever comes later.
6. Only then decide whether to keep the offer, change the offer/page, qualify a
   replacement supplier, or stop the experiment.

## Non-goals

- no broad catalog restoration or arbitrary new product sourcing;
- no AutoDS, Zendrop, or another paid fulfillment subscription;
- no synthetic reviews, unsupported claims, fake scarcity, or invented GTINs;
- no paid ads before a separate economics/measurement approval;
- no supplier payment, refund, discount activation, tax-setting change,
  credential rotation, or public post without the required owner decision.
