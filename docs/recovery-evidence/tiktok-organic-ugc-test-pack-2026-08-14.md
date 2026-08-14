# TikTok organic UGC test pack — 2026-08-14

## Result

**PUBLICATION PASS — CABLE ORGANIZER LIVE — NO SPEND**

Four controlled 10.97-second vertical organic tests now exist: two materially
different concepts for the black double-layer cable organizer, plus one each
for the charcoal three-piece packing-cube set and white luggage ID tag. The
first cable-organizer test is public; the other three remain prepared and
unpublished. This adds a TikTok organic lane without changing the
storefront, placing an order, paying a supplier, buying avatar credits, or
starting ads.

## Integrity boundary

- The recurring host is a fictional adult created with built-in ImageGen.
- Every frame visibly identifies her as `AI PRESENTER · PUCHICA`.
- She is a brand presenter, not a portrayed buyer, reviewer, tester, or customer.
- The host does not hold or touch merchandise.
- Product pixels come from the exact approved organic-launch source media and
  are only uniformly scaled into white cards by the deterministic build script.
- No delivery, review, discount, scarcity, waterproof, compression, bestseller,
  or personal-experience claim was added.
- The packing-cubes asset remains Canada only.

## Deliverables

- `outputs/tiktok-ugc-test-pack/final/cable-organizer-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/final/cable-organizer-offer-clarity-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/final/packing-cubes-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/final/luggage-tag-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/README.md` — captions, UTM links, publication
  controls, product-integrity rules, measurement order, and the exact ImageGen
  prompt.
- `scripts/build-tiktok-ugc-test-pack.py` — deterministic frame/video rebuild.

## Technical verification

All four videos were rebuilt from source on 2026-08-14 and verified as:

- 1080 × 1920 vertical H.264;
- 30 frames per second;
- 10.97 seconds;
- zero audio streams;
- fast-start MP4 output;
- approximately 1.4–1.6 MB each.

`python -m py_compile scripts/build-tiktok-ugc-test-pack.py` passed and
`git diff --check` reported no whitespace errors. Representative frames were
visually inspected for legibility, safe composition, exact product imagery,
AI-presenter disclosure, market availability, and claim boundaries.

The independent production storefront check also remained healthy after asset
creation: `npm run production-health` passed **35/35**. The check was read-only
and did not mutate a cart, checkout, order, payment, or supplier state.

## Publication controls

At publication time:

1. Enable TikTok's AI-generated-content label.
2. Enable the commercial-content disclosure for Puchica's own brand so the post
   is identified as promotional content.
3. Add only TikTok Commercial Music Library or independently licensed audio.
4. Publish one concept first and capture 2-hour and 24-hour metrics before
   releasing the next concept.
5. Keep boosts, Spark Ads, and all other paid distribution off.

Publishing remains an explicit external action. Preparation of this pack does
not authorize upload or scheduling.

## Cable-organizer publication execution

At 2026-08-14 16:09 CDT, the owner explicitly instructed `Post now`. TikTok
Studio accepted the cable-organizer video on `@puchica_canada` and returned
`Video published` with video ID `7673997227706109202`:

`https://www.tiktok.com/@puchica_canada/video/7673997227706109202`

Publication controls at submission were:

- audience selected as `Everyone`;
- high-quality upload enabled;
- own-brand commercial-content disclosure enabled (`Your brand`);
- AI-generated-content label enabled;
- music copyright check: `No issues found`;
- Content Check Lite: `No issues found`;
- no paid sound, boost, Promote, Spark Ads, or ad spend.

TikTok then placed the submitted post into `Content under review` and displayed
the privacy state as temporarily disabled `Only me`. A refresh roughly 20
seconds later showed the same review state. Therefore the upload is accepted
but public availability is **not yet confirmed**. Do not count impressions or
start the 2-hour measurement window until Studio changes the post to
`Everyone` and the public video URL resolves.

The existing `puchica-no-spend-operating-check` heartbeat was updated to watch
this exact TikTok video for public release or review failure and then start the
2-hour/24-hour measurement windows from the verified public-release time. It is
explicitly prohibited from publishing additional content or spending money.

## Public-release verification

At 2026-08-14 16:14 CDT, a fresh TikTok Studio read showed the cable-organizer
post with privacy `Everyone`, no `Content under review` marker, creation time
`Aug 14, 4:08 PM`, and baseline counts of 0 views, 0 likes, and 0 comments. The
exact public URL resolved and visibly rendered the correct cable-organizer
creative. The live page also visibly displayed both `Promotional content` and
`Creator labeled as AI-generated`.

This 16:14 CDT verification is the measurement baseline. The first useful
checks are approximately 18:14 CDT on 2026-08-14 and 16:14 CDT on 2026-08-15.
Do not release the second TikTok concept before the first 2-hour checkpoint is
recorded.

## Early profile-path correction

Before the two-hour checkpoint, TikTok Studio reported 2 views, 1 like, and 0
comments. The like was visibly active while signed in as the Puchica brand
account, so it is classified as owner activity rather than demand.

The profile had no website field available and its legacy bio did not show the
store domain. The bio was changed to `Travel organizers for Canada + U.S. Shop
puchica.ca 🇨🇦`. Three unrelated legacy pins were removed so the current cable
organizer is the first chronological profile post. TikTok desktop refused to
pin the commercial-content post and stated that commercial-content videos can
only be edited in the TikTok mobile app. No video was deleted or republished.

At 17:07 CDT, 53 minutes after the verified public baseline, Studio showed 20
views, 2 total likes, and 0 comments. One like is the known Puchica-account
like; the additional like has not produced a profile/session/order signal and
is not yet treated as demand. Shopify still showed no social-attributed session,
completed checkout, real order, or sale.

Because TikTok exposes no website field for this profile, visitors typing the
plain bio domain would be classified as direct traffic. A memorable
`puchica.ca/tiktok` redirect was therefore prepared to preserve TikTok organic
UTM attribution and land on the cable-organizer PDP. The profile bio must not
be changed to the new path until the route is deployed and verified live.
