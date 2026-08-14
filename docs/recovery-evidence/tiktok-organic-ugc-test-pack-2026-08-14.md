# TikTok organic UGC test pack — 2026-08-14

## Result

**CREATIVE PASS — PREPARED ONLY — NOT PUBLISHED — NO SPEND**

Three controlled 10.97-second vertical organic tests now exist for the black
double-layer cable organizer, charcoal three-piece packing-cube set, and white
luggage ID tag. This adds a TikTok-ready creative lane without changing the
storefront, placing an order, paying a supplier, buying avatar credits,
publishing content, or starting ads.

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
- `outputs/tiktok-ugc-test-pack/final/packing-cubes-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/final/luggage-tag-organic-test-11s.mp4`
- `outputs/tiktok-ugc-test-pack/README.md` — captions, UTM links, publication
  controls, product-integrity rules, measurement order, and the exact ImageGen
  prompt.
- `scripts/build-tiktok-ugc-test-pack.py` — deterministic frame/video rebuild.

## Technical verification

All three videos were rebuilt from source on 2026-08-14 and verified as:

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
