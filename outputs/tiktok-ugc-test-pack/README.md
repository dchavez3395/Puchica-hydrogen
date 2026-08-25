# Puchica TikTok / UGC organic test pack

Status: **CREATIVE READY — NOT PUBLISHED — NO AD SPEND**

> **Corrected 2026-08-25.** `final/luggage-tag-organic-test-11s.mp4` is
> **retired** — `white-luggage-id-tag` is in `RETIRED_CATALOG_HANDLES` and the
> storefront refuses to sell it; do not publish that video. The United States
> is commercially suspended, so "Available in Canada and the United States" in
> the captions below is corrected to "Available in Canada." Links now carry
> the canonical relaunch campaign; regenerate with
> `node scripts/build-campaign-links.mjs --organic`.

This pack contains four silent, 10.95-second, 1080 × 1920 organic-video tests.
It uses one clearly fictional AI brand presenter and exact approved
Shopify product photography. It does not claim that the presenter bought,
tested, received, or recommends the products as a customer.

## Final videos

- `final/cable-organizer-organic-test-11s.mp4`
- `final/cable-organizer-offer-clarity-organic-test-11s.mp4`
- `final/packing-cubes-organic-test-11s.mp4` — Canada only
- `final/luggage-tag-organic-test-11s.mp4` — **RETIRED, do not publish** (product no longer sold)

The videos are silent by design. At publication, add music from TikTok's
Commercial Music Library or other audio for which Puchica has commercial-use
rights. Do not add a fake testimonial voiceover.

## Motion-quality upgrade

The four-card assets remain usable as controlled copy tests, but they are no
longer the preferred visual standard. The motion-first cable master at
`../motion-first-cable/final/cable-organizer-motion-first-v1-12s.mp4` uses the
same exact approved black product photography with continuous product, text,
camera, and graphic animation. It contains no fake demonstration or customer
claim and remains unpublished until the first post's 24-hour checkpoint.

## Required TikTok publication controls

1. Turn on TikTok's AI-generated-content label because the host is realistic
   synthetic media.
2. Turn on the commercial-content disclosure for Puchica's own brand. TikTok
   should display `Promotional content`.
3. Use only Commercial Music Library or independently licensed audio.
4. Publish the packing-cubes video to a Canadian audience only.
5. Do not boost, use Spark Ads, or start paid promotion during this test.
6. Use the matching UTM link and record the live URL and baseline sessions.

Profile attribution path after production verification:
`https://puchica.ca/tiktok`. The route redirects to the cable-organizer PDP
with fixed TikTok organic UTM values while preserving platform click IDs.

## Product-integrity rules

- Product pixels are copied from the exact approved launch-kit source images.
- They are only uniformly scaled inside white cards; no merchandise is
  generated, recoloured, reshaped, or retouched.
- The AI-generated host does not hold or touch a sellable product.
- The `AI PRESENTER · PUCHICA` chip remains visible in every frame.

## Organic test captions

### Cable organizer

> Loose cables and small adapters are easier to find when they share one case.
> This black zippered organizer has a double-layer layout and is sold empty;
> electronics are not included. Available in Canada.
> Shipping is shown at checkout. #TravelOrganization #CableOrganizer #Puchica

Link:
`https://puchica.ca/products/travel-cable-organizer-case?utm_source=tiktok&utm_medium=organic_social&utm_campaign=travel_edit_organic_202608&utm_content=ugc_cable_case_v1`

### Cable organizer — offer-clarity alternative

> What actually arrives: one empty black double-layer cable organizer,
> approximately 19 × 11 × 5.5 cm. Cables and electronics are not included.
> Available in Canada. Shipping is shown at checkout.
> #TravelOrganization #CableOrganizer #Puchica

Link:
`https://puchica.ca/products/travel-cable-organizer-case?utm_source=tiktok&utm_medium=organic_social&utm_campaign=organic_relaunch_2026_08&utm_content=d5_ugc_cable_offer_clarity_v2`

### Packing cubes — Canada only

> One suitcase, three separate zones. This small, medium and large set uses
> standard zippered organizers; they are not vacuum bags or a mechanical
> compression system. Currently available for Canadian delivery. Shipping is
> shown at checkout. #PackingCubes #TravelOrganization #PuchicaCanada

Link:
`https://puchica.ca/products/3-piece-packing-cube-set?utm_source=tiktok&utm_medium=organic_social&utm_campaign=organic_relaunch_2026_08&utm_content=d2_ugc_packing_cubes_v1`

### Luggage tag — RETIRED, do not publish (product no longer sold; caption kept for the record only)

> The five-second check before your bag leaves: make sure your ID tag is
> attached and your contact details are current. This white luggage ID tag is
> available in Canada and the United States. Shipping is shown at checkout.
> #TravelChecklist #LuggageTag #Puchica

Link:
`https://puchica.ca/collections/all?utm_source=tiktok&utm_medium=organic_social&utm_campaign=travel_edit_organic_202608&utm_content=ugc_luggage_tag_v1`

## Measurement order

Publish one video first. Check after 2 hours and 24 hours: views, average watch
time, completion rate, profile visits, link clicks, Shopify attributed
sessions, product views, carts, checkouts, and orders. Use the next concept only
after recording the previous baseline. Do not infer demand from views alone.

## ImageGen source

Built-in ImageGen created only `source-media/puchica-synthetic-host-v1.png`.
The final prompt was:

> Use case: ads-marketing. Asset type: recurring synthetic brand presenter for
> 9:16 TikTok and Instagram Reels. Create one clearly fictional adult Puchica
> brand host in a candid creator-style travel-prep scene: a warm, confident
> woman in her late twenties wearing a charcoal crew-neck top and light neutral
> trousers, standing waist-up beside an open carry-on on a tidy bed, looking at
> the camera with a natural “let me show you” gesture. Use a modest bright
> apartment bedroom, soft window light, attainable rather than luxury styling,
> realistic smartphone creator photography, and clean negative space on the
> right and upper third. Do not include, invent, or approximate any sellable
> product. No logo, text, watermark, celebrity resemblance, distorted hands,
> fake product claims, product packaging, or artificial influencer glamour.

Run `python scripts/build-tiktok-ugc-test-pack.py` to rebuild the deterministic
frames and videos.
